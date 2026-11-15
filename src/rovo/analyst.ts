import { createHash } from 'node:crypto';
import { z } from 'zod';
import type { AssertionResult, Dataset, DrillResult, Gap, Snapshot, TraceEntry } from '../contracts';
import { runDrill } from '../graph/engine';
import { stable } from '../graph/core';
import { scenarioSchema, interventionSchema, validateDataset } from '../schemas/dataset';
import { rehearsalRevisionInput } from './revision';
import {suggestActions} from '../services/actions';

const identifier = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,99}$/);
export const analystRequestSchema = z.object({
  projectKey: z.string().regex(/^[A-Z][A-Z0-9_]{1,49}$/),
  snapshotId: z.string().regex(/^[A-Za-z0-9_-]{1,100}$/),
  expectedRevision: z.string().regex(/^[a-f0-9]{64}$/),
  view: z.enum(['summary', 'shipments', 'evidence', 'assertions', 'simulation']),
  entityId: identifier.optional(),
  assertionId: z.enum(['ingredient-origin', 'shipment-destination', 'warehouse-owner', 'quarantine-evidence', 'shipment-lot']).optional(),
  offset: z.number().int().min(0).max(2000).default(0),
  // Forge supplies this payload field in some contexts. It never establishes authority.
  context: z.unknown().optional(),
  // Rovo may attach this opaque envelope field. Do not inspect, log, return or
  // use it for authorization; only the trusted function principal is accepted.
  contextToken: z.unknown().optional(),
}).strict();
export type AnalystRequest = z.infer<typeof analystRequestSchema>;
export interface AnalystIdentity { accountId?: string; installationId: string; environmentId: string }
export interface ReadStore { get<T>(key: string): Promise<T | undefined> }
export interface ProjectAccess {
  project(selector: string): Promise<{id: string; key: string}>;
  canBrowse(projectKey: string): Promise<boolean>;
}
export type AnalystErrorCode = 'INVALID_INPUT' | 'AUTH_REQUIRED' | 'ACCESS_DENIED' | 'SCOPE_UNAVAILABLE' | 'NOT_FOUND' | 'EXPIRED' | 'REVISION_MISMATCH' | 'SAVED_RESULT_MISMATCH' | 'DEPENDENCY_UNAVAILABLE' | 'RESULT_TOO_LARGE';
export class AnalystError extends Error {
  constructor(public code: AnalystErrorCode, message: string, public validation?: {invalidFields: string[]; unexpectedFieldCount: number}) { super(message); }
}
const MAX_INPUT_BYTES = 8_000;
export const MAX_ANALYST_BYTES = 32_000;
export const ANALYST_PAGE_SIZE = 5;
const revisionOf = (snapshot: Snapshot) => createHash('sha256').update(rehearsalRevisionInput(snapshot)).digest('hex');
export { revisionOf as rehearsalRevision };
const snapshotSchema = z.object({
  id: z.string(), createdAt: z.string().datetime({offset: true}),
  result: z.object({scenario: scenarioSchema, interventions: z.array(interventionSchema).max(30)}).passthrough(),
  dataset: z.unknown(),
}).passthrough();
const limitList = <T>(values: T[], limit: number) => ({items: values.slice(0, limit), total: values.length, truncated: values.length > limit});
const pageOf = <T>(values: T[], offset: number) => {
  const items = values.slice(offset, offset + ANALYST_PAGE_SIZE);
  return {items, returnedCount: items.length, total: values.length, truncated: items.length < values.length, offset, nextOffset: offset + ANALYST_PAGE_SIZE < values.length ? offset + ANALYST_PAGE_SIZE : null};
};
const gapEvidence = (gap: Gap) => ({id: gap.id, code: gap.code, message: gap.message.slice(0, 500), recordIds: limitList(gap.recordIds, 12), evidenceIds: limitList(gap.evidence, 12)});
const assertionSummary = (a: AssertionResult) => ({id: a.id, title: a.title, status: a.status, checked: a.checked, passed: a.passed, counterexampleCount: a.counterexamples.length});

export class RecallAnalyst {
  constructor(private readonly store: ReadStore, private readonly access: ProjectAccess, private readonly now: () => number = Date.now) {}

  async read(payload: unknown, identity: AnalystIdentity) {
    if (!identity.accountId) throw new AnalystError('AUTH_REQUIRED', 'An authenticated Jira user is required.');
    if (!identity.installationId || !identity.environmentId) throw new AnalystError('SCOPE_UNAVAILABLE', 'The Forge installation context is unavailable. Open LotZero in Jira.');
    let parsed: ReturnType<typeof analystRequestSchema.safeParse>;
    try {
      if (Buffer.byteLength(JSON.stringify(payload) ?? '', 'utf8') > MAX_INPUT_BYTES) throw new Error();
      parsed = analystRequestSchema.safeParse(payload);
    } catch { throw new AnalystError('INVALID_INPUT', 'Use the saved report handoff and bounded evidence inputs.'); }
    if (!parsed.success) {
      const knownFields = new Set(Object.keys(analystRequestSchema.shape));
      // Report only canonical schema field names/counts, never supplied values,
      // arbitrary key names, tokens or the original validation exception.
      const invalidFields = [...new Set(parsed.error.issues.map(issue => typeof issue.path[0] === 'string' && knownFields.has(issue.path[0]) ? issue.path[0] : 'envelope'))].slice(0, 10);
      const unexpectedFieldCount = parsed.error.issues.reduce((count, issue) => count + (issue.code === 'unrecognized_keys' ? issue.keys.length : 0), 0);
      throw new AnalystError('INVALID_INPUT', 'Provide the exact project, saved snapshot, 64-character revision and supported evidence view.', {invalidFields, unexpectedFieldCount});
    }
    const request = parsed.data;
    if (request.assertionId && request.view !== 'assertions' && request.view !== 'evidence') throw new AnalystError('INVALID_INPUT', 'Use the assertions or evidence view when selecting an assertion.');
    if (request.entityId && request.view === 'summary') throw new AnalystError('INVALID_INPUT', 'The summary covers the full saved scenario. Use a supported evidence view to select a record.');
    // The selector is untrusted. Forge asUser project lookup and Browse checks authorize it.
    const project = await this.access.project(request.projectKey);
    if (!/^\d{1,30}$/.test(project.id) || project.key !== request.projectKey || !await this.access.canBrowse(project.key)) {
      throw new AnalystError('ACCESS_DENIED', 'The requested Jira project is not accessible.');
    }
    const prefix = `p:${project.id}:`;
    if (await this.store.get(`${prefix}resetting`)) throw new AnalystError('NOT_FOUND', 'Project data is being reset. Reopen the report after reset finishes.');
    const raw = await this.store.get<Snapshot>(`${prefix}snapshot:${request.snapshotId}`);
    if (!raw) throw new AnalystError('NOT_FOUND', 'No saved rehearsal was found in this permitted project and installation.');
    let snapshot: Snapshot;
    let result: DrillResult;
    try {
      if (Buffer.byteLength(JSON.stringify(raw), 'utf8') > 230_000) throw new Error();
      snapshotSchema.parse(raw);
      if (raw.id !== request.snapshotId) throw new Error();
      const dataset = validateDataset(raw.dataset);
      snapshot = {...raw, dataset};
      result = runDrill(dataset, raw.result.scenario, raw.result.interventions);
      if (stable(result) !== stable(raw.result)) throw new Error();
    } catch { throw new AnalystError('SAVED_RESULT_MISMATCH', 'The saved inputs and deterministic result do not agree. Reopen or rerun the rehearsal in LotZero.'); }
    const savedAt = Date.parse(snapshot.createdAt);
    if (savedAt > this.now() + 60_000 || this.now() - savedAt >= 90 * 86_400_000) throw new AnalystError('EXPIRED', 'This saved rehearsal is outside the supported retention window. Open a current saved report.');
    const revision = revisionOf(snapshot);
    if (revision !== request.expectedRevision) throw new AnalystError('REVISION_MISMATCH', 'The saved revision differs from the handoff. Reopen the saved report and copy a fresh handoff.');
    if (request.entityId && !snapshot.dataset.nodes.some(n => n.id === request.entityId) && !snapshot.dataset.edges.some(e => e.id === request.entityId) && !result.gaps.some(g => g.recordIds.includes(request.entityId!))) throw new AnalystError('INVALID_INPUT', 'The requested record or reference is not in this saved rehearsal.');
    if (request.assertionId && !result.assertions.some(a => a.id === request.assertionId)) throw new AnalystError('INVALID_INPUT', 'That assertion was not configured in this saved rehearsal.');

    const current = await this.store.get<Dataset>(`${prefix}dataset`);
    const response = {
      kind: 'lotzero-saved-rehearsal-evidence', readOnly: true,
      project: {id: project.id, key: project.key},
      snapshot: {id: snapshot.id, savedAt: snapshot.createdAt, revision, datasetVersion: snapshot.dataset.version, datasetFingerprint: result.fingerprint, scenario: result.scenario},
      datasetLabelledSynthetic: snapshot.dataset.synthetic,
      analysisScope: 'Explicit saved inputs; no current dataset or scenario is changed',
      currentDatasetDiffers: current ? stable(current) !== stable(snapshot.dataset) : null,
      view: request.view,
      selection: {entityId: request.entityId ?? null, assertionId: request.assertionId ?? null, offset: request.offset},
      assertionPopulationScope: 'Full saved scenario; evidence filters do not change assertion populations',
      assertions: result.assertions.map(assertionSummary),
      evidence: this.evidence(snapshot.dataset, result, request),
      provenance: {origin: 'Recomputed with the same runDrill engine as the LotZero report', evidenceReferenceType: 'IDs into the saved dataset; source text and personal fields are withheld', installationBoundary: 'Forge storage partition and server-authorized Jira project'},
      limitations: ['Fictional recall rehearsal / simulation only; not a product-safety or regulatory decision.', 'Missing evidence remains UNKNOWN. Association does not establish contamination.', 'Pages and path segments may be truncated; use nextOffset or an exact entity/assertion ID.', 'Synthetic is an imported dataset label, not verification that its contents contain no personal data.'],
      followUp: 'Use LotZero Jira action review to inspect exact content, select and explicitly approve follow-up Tasks. This read-only action cannot create issues, change scenarios, quarantine stock or send messages.',
    };
    if (Buffer.byteLength(JSON.stringify(response), 'utf8') > MAX_ANALYST_BYTES) throw new AnalystError('RESULT_TOO_LARGE', 'Narrow the request to one record or assertion in the saved report.');
    return response;
  }

  private evidence(dataset: Dataset, result: DrillResult, request: AnalystRequest): unknown {
    const trace = new Map(result.trace.map(t => [t.nodeId, t]));
    const related = (gap: Gap) => !request.entityId || gap.recordIds.includes(request.entityId);
    const path = (entry: TraceEntry | undefined) => entry ? {certainty: entry.certainty, nodeIds: limitList(entry.path, 20), edgeIds: limitList(entry.edgeIds, 20), evidenceIds: limitList(entry.evidence, 12)} : null;
    const shipment = (id: string) => ({id, path: path(trace.get(id)), movement: result.simulation.historicalShipmentIds.includes(id) ? 'historical-retained' : result.simulation.preventableShipmentIds.includes(id) ? 'potentially-preventable' : 'remaining', findings: limitList(result.gaps.filter(g => g.recordIds.includes(id)).map(gapEvidence), 5)});
    switch (request.view) {
      case 'summary': return {productLotCount: result.affectedProductIds.length, shipmentCount: result.affectedShipmentIds.length, evidenceGapCount: result.gaps.length, unresolvedRecordCount: result.unknownRecordIds.length, assertions: result.assertions.map(assertionSummary), historicalShipmentCount: result.simulation.historicalShipmentIds.length, potentiallyPreventableShipmentCount: result.simulation.preventableShipmentIds.length,
        responseTiming: {status: 'UNKNOWN', label: 'Timing not measured', reason: 'Record timestamps do not measure evidence-retrieval or response duration. A four-hour recall cannot be established.'},
        proposedFollowUp: suggestActions({id: 'proposal', dataset, result}).map(action => ({id: action.id, recordIds: limitList(action.recordIds, 12), evidenceIds: limitList(action.evidence, 12)})),
        proposalScope: 'Read-only proposals derived from saved findings; not approvals, assignments or evidence of issue creation. Review actual content and receipts in Jira action review.'};
      case 'shipments': {
        if (request.entityId && request.entityId !== result.scenario.sourceLotId && !result.affectedShipmentIds.includes(request.entityId)) throw new AnalystError('INVALID_INPUT', 'Use the saved source ingredient or one associated shipment for this view. No alternate scenario is computed.');
        const ids = request.entityId && request.entityId !== result.scenario.sourceLotId ? [request.entityId] : result.affectedShipmentIds;
        return pageOf(ids.map(shipment), request.offset);
      }
      case 'evidence': {
        const assertion = request.assertionId ? result.assertions.find(a => a.id === request.assertionId) : undefined;
        return {...pageOf((assertion ? assertion.counterexamples : result.gaps).filter(related).map(gapEvidence), request.offset), ...(assertion ? {assertion: assertionSummary(assertion), populationScope: 'Full saved assertion; the entity filter only narrows counterexamples'} : {})};
      }
      case 'assertions': {
        const assertions = result.assertions.filter(a => !request.assertionId || a.id === request.assertionId);
        return assertions.map(a => ({...assertionSummary(a), populationScope: 'Full saved assertion; the entity filter only narrows counterexamples', counterexamples: request.assertionId ? pageOf(a.counterexamples.filter(related).map(gapEvidence), request.offset) : {total: a.counterexamples.length, instruction: 'Request this assertionId for its counterexample page.'}}));
      }
      case 'simulation': {
        const controls = result.interventions.filter(i => !request.entityId || i.targetId === request.entityId).map(i => ({id: i.id, type: i.type, targetId: i.targetId, at: i.at, evidenceIds: limitList(i.evidence, 12)}));
        const ids = result.affectedShipmentIds.filter(id => !request.entityId || id === request.entityId || dataset.nodes.some(n => n.id === id && n.warehouseId === request.entityId));
        return {controls: pageOf(controls, request.offset), movements: pageOf(ids.map(shipment), request.offset), countsScope: 'Entire saved scenario; pages are narrowed by entityId when supplied', historicalShipmentCount: result.simulation.historicalShipmentIds.length, potentiallyPreventableShipmentCount: result.simulation.preventableShipmentIds.length, remainingShipmentCount: result.simulation.remainingShipmentIds.length, notes: result.simulation.notes.slice(0, 5).map(x => x.slice(0, 500))};
      }
    }
  }
}

export async function safeAnalystRead(analyst: RecallAnalyst, payload: unknown, identity: AnalystIdentity) {
  try { return {ok: true as const, data: await analyst.read(payload, identity)}; }
  catch (error) {
    const known = error instanceof AnalystError;
    return {ok: false as const, readOnly: true, error: {code: known ? error.code : 'DEPENDENCY_UNAVAILABLE', message: known ? error.message : 'Jira or Forge storage could not be read. No records were changed. Retry from the saved report when access is restored.', ...(known && error.validation ? {validation: error.validation} : {})}};
  }
}
