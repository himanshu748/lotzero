import {getAppContext} from '@forge/api';
import {kvs} from '@forge/kvs';
import {RecallAnalyst, safeAnalystRead, type AnalystIdentity} from './rovo/analyst';
import {analystProjectAccess} from './rovo/jira-read';

const analyst = new RecallAnalyst({get: key => kvs.get(key)}, analystProjectAccess);
const inputNames = new Set(['projectKey', 'snapshotId', 'expectedRevision', 'view', 'entityId', 'assertionId', 'offset']);
const reservedNames = new Set(['accountId', 'userId', 'principal', 'site', 'siteUrl', 'cloudId', 'tenantId', 'installationId', 'environmentId', 'projectId', 'approved', 'approval', 'action', 'createIssue', 'interventions', 'dataset', 'scenario', 'write', 'mutate', 'asApp', '__proto__', 'constructor', 'prototype']);

/** The transport envelope can evolve independently of manifest action inputs. */
function actionInputs(payload: unknown): unknown {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return payload;
  try {
    // Preserve the raw-envelope bound and strict rejection of identity/write
    // selectors. The service returns a safe validation error for these inputs.
    if (Buffer.byteLength(JSON.stringify(payload), 'utf8') > 8_000 || Object.keys(payload).some(key => reservedNames.has(key))) return payload;
    // Unknown transport metadata, including opaque tokens, is never forwarded
    // to the evidence service, authorization, storage keys or agent response.
    return Object.fromEntries(Object.entries(payload).filter(([key]) => inputNames.has(key)));
  } catch { return payload; }
}

/** Separate action entry point: no resolver, Application or mutation adapter imports. */
export async function handler(payload: unknown, context: {principal?: {accountId?: string}}) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const app = getAppContext();
    // Forge's function context carries the authenticated caller in principal.
    // Never substitute an account identifier from the model-controlled payload.
    const accountId = context?.principal?.accountId;
    const identity: AnalystIdentity = {accountId: typeof accountId === 'string' && accountId.trim() ? accountId : undefined, installationId: app.installationAri.installationId, environmentId: app.environmentAri.environmentId};
    const result = await Promise.race([
      safeAnalystRead(analyst, actionInputs(payload), identity),
      new Promise<Awaited<ReturnType<typeof safeAnalystRead>>>(resolve => { timer = setTimeout(() => resolve({ok: false, readOnly: true, error: {code: 'DEPENDENCY_UNAVAILABLE', message: 'The read-only evidence request timed out. No records were changed; retry from the saved report.'}}), 10_000); }),
    ]);
    return {...result, runtime: {appVersion: app.appVersion, environmentType: app.environmentType}};
  } catch {
    return {ok: false, readOnly: true, error: {code: 'SCOPE_UNAVAILABLE', message: 'A verified Forge installation context is required. Open the saved report in Jira.'}};
  } finally { if (timer) clearTimeout(timer); }
}
