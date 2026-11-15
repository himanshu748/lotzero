import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {readFileSync} from 'node:fs';

const mocks = vi.hoisted(() => ({jira: vi.fn(), get: vi.fn(), set: vi.fn(), remove: vi.fn(), asApp: vi.fn(), appContext: vi.fn()}));
vi.mock('@forge/api', () => ({default: {asUser: () => ({requestJira: mocks.jira}), asApp: mocks.asApp}, route: (parts: TemplateStringsArray, ...values: unknown[]) => parts.reduce((out, part, i) => out + part + (values[i] ?? ''), ''), getAppContext: mocks.appContext}));
vi.mock('@forge/kvs', () => ({kvs: {get: mocks.get, set: mocks.set, delete: mocks.remove}}));

import {handler} from '../../src/mcp';
import {handler as rovoHandler} from '../../src/rovo';
import {runDrill} from '../../src/graph/engine';
import {rehearsalRevision, MAX_ANALYST_BYTES} from '../../src/rovo/analyst';
import {syntheticDataset} from '../../fixtures/synthetic/dataset';
import {DEFAULT_ASSERTIONS, type Snapshot} from '../../src/contracts';

let snapshot: Snapshot;
const caller = {principal: {accountId: 'signed-in-user'}};
const payload = () => ({projectKey: 'LZR', snapshotId: snapshot.id, expectedRevision: rehearsalRevision(snapshot), view: 'summary'});

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('LOTZERO_MCP_ENABLED', 'true');
  snapshot = {id: 'mcp-saved', createdAt: new Date().toISOString(), initiator: 'private-initiator', dataset: structuredClone(syntheticDataset), result: runDrill(syntheticDataset, {sourceLotId: 'ING-A19', hazard: 'contamination', at: '2026-10-28T09:00:00Z', assertions: DEFAULT_ASSERTIONS}), actions: []};
  mocks.appContext.mockReturnValue({appVersion: 'development-test', environmentType: 'DEVELOPMENT', installationAri: {installationId: 'trusted-installation'}, environmentAri: {environmentId: 'trusted-environment'}});
  mocks.get.mockImplementation(async key => key === 'p:10001:snapshot:mcp-saved' ? structuredClone(snapshot) : key === 'p:10001:dataset' ? structuredClone(syntheticDataset) : undefined);
  mocks.jira.mockImplementation(async path => ({ok: true, status: 200, json: async () => path.includes('mypermissions') ? {permissions: {BROWSE_PROJECTS: {havePermission: true}}} : {id: '10001', key: 'LZR'}}));
});
afterEach(() => {
  // Every case, including enabled success and dependency failures, is read-only.
  expect(mocks.set).not.toHaveBeenCalled();
  expect(mocks.remove).not.toHaveBeenCalled();
  expect(mocks.asApp).not.toHaveBeenCalled();
  expect(mocks.jira.mock.calls.every(([, options]) => options.method === 'GET')).toBe(true);
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe('MCP function boundary (mocked Forge transport, not hosted discovery)', () => {
  it.each([undefined, '', 'false', '1', 'TRUE', ' true '])('is disabled unless the exact server flag is true (%s)', async flag => {
    vi.stubEnv('LOTZERO_MCP_ENABLED', flag);
    const response = await handler({...payload(), LOTZERO_MCP_ENABLED: 'true', environmentType: 'DEVELOPMENT'}, caller);
    expect(response).toMatchObject({ok: false, readOnly: true, error: {code: 'FEATURE_DISABLED'}});
    expect(mocks.appContext).not.toHaveBeenCalled();
    expect(mocks.jira).not.toHaveBeenCalled(); expect(mocks.get).not.toHaveBeenCalled();
  });
  it.each(['PRODUCTION', 'STAGING', undefined])('fails closed outside development even when the flag is true (%s)', async environmentType => {
    mocks.appContext.mockReturnValue({environmentType});
    expect(await handler(payload(), caller)).toMatchObject({ok: false, error: {code: 'FEATURE_DISABLED'}});
    expect(mocks.jira).not.toHaveBeenCalled(); expect(mocks.get).not.toHaveBeenCalled();
  });
  it('returns a safe error if the platform cannot establish its environment', async () => {
    mocks.appContext.mockImplementation(() => {throw new Error('private-platform-secret');});
    const response = await handler(payload(), caller);
    expect(response).toMatchObject({ok: false, error: {code: 'SCOPE_UNAVAILABLE'}});
    expect(JSON.stringify(response)).not.toContain('private-');
    expect(mocks.jira).not.toHaveBeenCalled(); expect(mocks.get).not.toHaveBeenCalled();
  });
  it('returns exactly the existing saved-reader result and leaves the snapshot unchanged', async () => {
    const before = structuredClone(snapshot);
    const response = await handler(payload(), caller) as any;
    expect(response).toEqual(await rovoHandler(payload(), caller));
    expect(response.ok).toBe(true);
    expect(response.runtime.environmentType).toBe('DEVELOPMENT');
    expect(response.data.evidence).toMatchObject({productLotCount: 3, shipmentCount: 4, evidenceGapCount: 9, unresolvedRecordCount: 12});
    expect(response.data.snapshot.revision).toBe(payload().expectedRevision);
    expect(snapshot).toEqual(before);
    expect(JSON.stringify(response)).not.toContain('private-initiator');
  });
  it.each(['summary', 'shipments', 'evidence', 'assertions', 'simulation'])('reads the existing %s view with bounded output', async view => {
    const response = await handler({...payload(), view}, caller) as any;
    expect(response.ok).toBe(true);
    expect(response.data.readOnly).toBe(true);
    expect(response.data.view).toBe(view);
    expect(Buffer.byteLength(JSON.stringify(response.data), 'utf8')).toBeLessThanOrEqual(MAX_ANALYST_BYTES);
    expect(mocks.get.mock.calls.every(([key]) => key.startsWith('p:10001:'))).toBe(true);
  });
  it('preserves FAIL and UNKNOWN with their exact full-population counts', async () => {
    for (const [assertionId, status, passed, checked, count] of [
      ['shipment-destination', 'FAIL', 3, 4, 1],
      ['ingredient-origin', 'UNKNOWN', 2, 5, 3],
    ] as const) {
      const response = await handler({...payload(), view: 'assertions', assertionId}, caller) as any;
      expect(response.ok).toBe(true);
      expect(response.data.evidence[0]).toMatchObject({id: assertionId, status, passed, checked, counterexampleCount: count, counterexamples: {total: count, returnedCount: count}});
    }
  });
  it('returns only the selected shipment path and paginates evidence without inventing totals', async () => {
    const shipment = await handler({...payload(), view: 'shipments', entityId: 'SHIP-002'}, caller) as any;
    expect(shipment.ok).toBe(true);
    expect(shipment.data.evidence).toMatchObject({total: 1, returnedCount: 1, nextOffset: null});
    expect(shipment.data.evidence.items[0]).toMatchObject({id: 'SHIP-002', path: {nodeIds: {items: expect.arrayContaining(['ING-A19', 'SHIP-002'])}}});
    const first = await handler({...payload(), view: 'evidence'}, caller) as any;
    const next = await handler({...payload(), view: 'evidence', offset: first.data.evidence.nextOffset}, caller) as any;
    expect(first.data.evidence).toMatchObject({returnedCount: 5, total: 9, nextOffset: 5});
    expect(next.data.evidence).toMatchObject({returnedCount: 4, total: 9, nextOffset: null});
    expect(new Set([...first.data.evidence.items, ...next.data.evidence.items].map(x => x.id)).size).toBe(9);
  });
  it('rejects untrusted identity in the payload when the principal is absent', async () => {
    const response = await handler({...payload(), context: {principal: {accountId: 'admin'}}, contextToken: 'private-token'}, {}) as any;
    expect(response.error.code).toBe('AUTH_REQUIRED');
    expect(mocks.jira).not.toHaveBeenCalled(); expect(mocks.get).not.toHaveBeenCalled();
    expect(JSON.stringify(response)).not.toContain('private-token');
  });
  it.each([{}, {principal: {}}, {principal: {accountId: ''}}, {principal: {accountId: '  '}}])('requires a nonempty trusted principal (%j)', async context => {
    expect(await handler(payload(), context)).toMatchObject({ok: false, error: {code: 'AUTH_REQUIRED'}});
    expect(mocks.jira).not.toHaveBeenCalled(); expect(mocks.get).not.toHaveBeenCalled();
  });
  it('requires an installation context before reading Jira or storage', async () => {
    mocks.appContext.mockReturnValue({environmentType: 'DEVELOPMENT', installationAri: {}, environmentAri: {}});
    expect(await handler(payload(), caller)).toMatchObject({ok: false, error: {code: 'SCOPE_UNAVAILABLE'}});
    expect(mocks.jira).not.toHaveBeenCalled(); expect(mocks.get).not.toHaveBeenCalled();
  });
  it.each([401, 403, 404])('does not read snapshots after Jira denies access (%s)', async status => {
    mocks.jira.mockResolvedValue({ok: false, status});
    expect(await handler(payload(), caller)).toMatchObject({ok: false, error: {code: 'ACCESS_DENIED'}});
    expect(mocks.get).not.toHaveBeenCalled();
  });
  it('checks Browse Projects permission before reading any snapshot', async () => {
    mocks.jira.mockImplementation(async path => ({ok: true, status: 200, json: async () => path.includes('mypermissions') ? {permissions: {BROWSE_PROJECTS: {havePermission: false}}} : {id: '10001', key: 'LZR'}}));
    expect(await handler(payload(), caller)).toMatchObject({ok: false, error: {code: 'ACCESS_DENIED'}});
    expect(mocks.get).not.toHaveBeenCalled();
  });
  it('does not use a different project returned by the connector', async () => {
    mocks.jira.mockResolvedValue({ok: true, status: 200, json: async () => ({id: '10002', key: 'OTHER'})});
    expect(await handler(payload(), caller)).toMatchObject({ok: false, error: {code: 'ACCESS_DENIED'}});
    expect(mocks.get).not.toHaveBeenCalled();
  });
  it('refuses a stale revision without disclosing saved evidence', async () => {
    const response = await handler({...payload(), expectedRevision: '0'.repeat(64)}, caller);
    expect(response).toMatchObject({ok: false, error: {code: 'REVISION_MISMATCH'}});
    expect(response).not.toHaveProperty('data');
  });
  it('returns NOT_FOUND for an absent snapshot instead of selecting another one', async () => {
    const response = await handler({...payload(), snapshotId: 'other-saved'}, caller);
    expect(response).toMatchObject({ok: false, error: {code: 'NOT_FOUND'}});
    expect(mocks.get.mock.calls.map(([key]) => key)).toEqual(['p:10001:resetting', 'p:10001:snapshot:other-saved']);
  });
  it('rejects write and identity selectors and invalid views before any data read', async () => {
    for (const extra of [{accountId: 'admin'}, {site: 'other'}, {approved: true}, {interventions: []}, {asApp: true}, {view: 'createIssue'}, {offset: 2001}]) {
      expect(await handler({...payload(), ...extra}, caller)).toMatchObject({ok: false, error: {code: 'INVALID_INPUT'}});
    }
    expect(mocks.jira).not.toHaveBeenCalled(); expect(mocks.get).not.toHaveBeenCalled();
  });
  it('keeps the original Rovo reader available when the MCP flag is disabled', async () => {
    vi.stubEnv('LOTZERO_MCP_ENABLED', 'false');
    expect(await handler(payload(), caller)).toMatchObject({ok: false, error: {code: 'FEATURE_DISABLED'}});
    expect(await rovoHandler(payload(), caller)).toMatchObject({ok: true});
  });
  it('bounds a stalled dependency without falling back to app permissions', async () => {
    vi.useFakeTimers(); mocks.jira.mockReturnValue(new Promise(() => {}));
    const pending = handler(payload(), caller);
    await vi.advanceTimersByTimeAsync(10_001);
    expect(await pending).toMatchObject({ok: false, readOnly: true, error: {code: 'DEPENDENCY_UNAVAILABLE'}});
  });
  it('has no mutation, resolver, external-server or credential adapter imports', () => {
    const source = readFileSync('src/mcp.ts', 'utf8');
    expect(source).not.toMatch(/from ['"].*(?:services\/application|integrations\/jira|storage\/forge|\.\/index|node:http|express)['"]/);
    expect(source).not.toMatch(/asApp|requestJira|kvs\.|console\./);
  });
});
