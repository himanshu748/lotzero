import {beforeEach, afterEach, describe, expect, it, vi} from 'vitest';
import {readFileSync} from 'node:fs';
import {parse} from 'yaml';
const mocks = vi.hoisted(() => ({jira: vi.fn(), get: vi.fn(), set: vi.fn(), remove: vi.fn(), appContext: vi.fn()}));
vi.mock('@forge/api', () => ({default: {asUser: () => ({requestJira: mocks.jira})}, route: (parts: TemplateStringsArray, ...values: unknown[]) => parts.reduce((out, part, i) => out + part + (values[i] ?? ''), ''), getAppContext: mocks.appContext}));
vi.mock('@forge/kvs', () => ({kvs: {get: mocks.get, set: mocks.set, delete: mocks.remove}}));
import {handler} from '../../src/rovo';
import {runDrill} from '../../src/graph/engine';
import {rehearsalRevision} from '../../src/rovo/analyst';
import {syntheticDataset} from '../../fixtures/synthetic/dataset';
import {DEFAULT_ASSERTIONS, type Snapshot} from '../../src/contracts';
let snapshot: Snapshot;
beforeEach(() => {
  vi.clearAllMocks();
  snapshot = {id: 'handler-saved', createdAt: new Date().toISOString(), initiator: 'private-user', dataset: syntheticDataset, result: runDrill(syntheticDataset, {sourceLotId: 'ING-A19', hazard: 'contamination', at: '2026-10-28T09:00:00Z', assertions: DEFAULT_ASSERTIONS}), actions: []};
  mocks.appContext.mockReturnValue({appVersion: '2.4.0', environmentType: 'DEVELOPMENT', installationAri: {installationId: 'trusted-installation'}, environmentAri: {environmentId: 'trusted-environment'}});
  mocks.get.mockImplementation(async key => key.endsWith('snapshot:handler-saved') ? structuredClone(snapshot) : key.endsWith(':dataset') ? structuredClone(syntheticDataset) : undefined);
  mocks.jira.mockImplementation(async path => ({ok: true, status: 200, json: async () => path.includes('mypermissions') ? {permissions: {BROWSE_PROJECTS: {havePermission: true}}} : {id: '10001', key: 'LZR'}}));
});
afterEach(() => vi.useRealTimers());
const payload = () => ({projectKey: 'LZR', snapshotId: snapshot.id, expectedRevision: rehearsalRevision(snapshot), view: 'summary'});
describe('hosted Rovo entry point boundary (mocked platform)', () => {
  it('uses only GET Jira operations and KVS reads, without granting the action mutation routes', async () => {
    const response = await handler(payload(), {principal: {accountId: 'signed-in-user'}}) as any;
    expect(response.ok).toBe(true);
    expect(response.runtime).toEqual({appVersion: '2.4.0', environmentType: 'DEVELOPMENT'});
    expect(mocks.jira).toHaveBeenCalledTimes(2);
    expect(mocks.jira.mock.calls.every(([, options]) => options.method === 'GET')).toBe(true);
    expect(mocks.jira.mock.calls.some(([path]) => path === '/rest/api/3/issue')).toBe(false);
    expect(mocks.set).not.toHaveBeenCalled(); expect(mocks.remove).not.toHaveBeenCalled();
  });
  it('ignores payload impersonation and requires the authenticated function context', async () => {
    const response = await handler({...payload(), context: {principal: {accountId: 'admin'}, accountId: 'admin', cloudId: 'other'}}, {}) as any;
    expect(response.ok).toBe(false); expect(response.error.code).toBe('AUTH_REQUIRED');
    expect(mocks.jira).not.toHaveBeenCalled(); expect(mocks.get).not.toHaveBeenCalled();
  });
  it('accepts opaque Rovo envelope metadata without using or returning it', async () => {
    const input = {...payload(), contextToken: 'private-opaque-platform-value', context: {accountId: 'impersonated', cloudId: 'other-site'}, futureEnvelopeMetadata: {secret: 'private-future-value'}};
    const response = await handler(input, {principal: {accountId: 'signed-in-user'}}) as any;
    expect(response.ok).toBe(true);
    expect(JSON.stringify(response)).not.toContain('private-opaque');
    expect(JSON.stringify(response)).not.toContain('impersonated');
    expect(JSON.stringify(response)).not.toContain('private-future');
    const denied = await handler(input, {}) as any;
    expect(denied.error.code).toBe('AUTH_REQUIRED');
    expect(mocks.set).not.toHaveBeenCalled(); expect(mocks.remove).not.toHaveBeenCalled();
  });
  it('refuses malformed or missing principals even if untrusted input contains an identity', async () => {
    for (const context of [{}, {principal: {}}, {principal: {accountId: ''}}, {principal: {accountId: '  '}}]) {
      const response = await handler({...payload(), context: {principal: {accountId: 'admin'}}}, context) as any;
      expect(response.error.code).toBe('AUTH_REQUIRED');
    }
    expect(mocks.jira).not.toHaveBeenCalled(); expect(mocks.get).not.toHaveBeenCalled();
  });
  it('returns bounded validation diagnostics without disclosing arbitrary fields or values', async () => {
    const response = await handler({...payload(), offset: null, 'private-arbitrary-field': 'private-sensitive-value'}, {principal: {accountId: 'user'}}) as any;
    expect(response.error.code).toBe('INVALID_INPUT');
    expect(response.error.validation).toEqual({invalidFields: ['offset'], unexpectedFieldCount: 0});
    expect(response.runtime).toEqual({appVersion: '2.4.0', environmentType: 'DEVELOPMENT'});
    expect(JSON.stringify(response)).not.toContain('private-');
    expect(mocks.get).not.toHaveBeenCalled();
  });
  it('rejects identity and write selectors instead of treating them as transport metadata', async () => {
    for (const extra of [{accountId: 'admin'}, {site: 'other'}, {approved: true}, {dataset: {}}, {interventions: []}]) {
      const response = await handler({...payload(), ...extra}, {principal: {accountId: 'user'}}) as any;
      expect(response.error.code).toBe('INVALID_INPUT');
    }
    expect(mocks.get).not.toHaveBeenCalled(); expect(mocks.jira).not.toHaveBeenCalled();
  });
  it('keeps the raw envelope size bound even when metadata is projected out', async () => {
    const response = await handler({...payload(), futureEnvelopeMetadata: 'private'.repeat(1500)}, {principal: {accountId: 'user'}}) as any;
    expect(response.error.code).toBe('INVALID_INPUT');
    expect(mocks.get).not.toHaveBeenCalled(); expect(mocks.jira).not.toHaveBeenCalled();
  });
  it('refuses missing platform installation context', async () => {
    mocks.appContext.mockImplementation(() => {throw new Error('private platform details');});
    const response = await handler(payload(), {principal: {accountId: 'user'}}) as any;
    expect(response.error.code).toBe('SCOPE_UNAVAILABLE');
    expect(JSON.stringify(response)).not.toContain('private platform');
  });
  it('fails closed on Jira access denial before any snapshot read', async () => {
    mocks.jira.mockResolvedValue({ok: false, status: 403});
    const response = await handler(payload(), {principal: {accountId: 'user'}}) as any;
    expect(response.error.code).toBe('ACCESS_DENIED'); expect(mocks.get).not.toHaveBeenCalled();
  });
  it('bounds connector waits and returns an honest read-only failure', async () => {
    vi.useFakeTimers(); mocks.jira.mockReturnValue(new Promise(() => {}));
    const pending = handler(payload(), {principal: {accountId: 'user'}});
    await vi.advanceTimersByTimeAsync(10_001);
    const response = await pending as any;
    expect(response.error.code).toBe('DEPENDENCY_UNAVAILABLE'); expect(response.readOnly).toBe(true);
    expect(mocks.set).not.toHaveBeenCalled();
  });
  it('keeps the existing agent on its original GET action and retains existing scopes', () => {
    const manifest = parse(readFileSync('manifest.yml', 'utf8'));
    const agent = manifest.modules['rovo:agent'];
    expect(agent).toHaveLength(1); expect(agent[0].actions).toEqual(['lotzero-read-saved-rehearsal']);
    const hasMcp = Boolean(manifest.modules['rovo:mcp']);
    expect(manifest.modules.action).toHaveLength(hasMcp ? 2 : 1);
    const original = manifest.modules.action.find((x: any) => x.key === 'lotzero-read-saved-rehearsal');
    expect(original.actionVerb).toBe('GET');
    expect(original.function).toBe('recall-analyst');
    expect(manifest.modules.function.find((x: any) => x.key === 'recall-analyst').handler).toBe('rovo.handler');
    const privacy = manifest.modules.scheduledTrigger?.find((x: any) => x.key === 'lotzero-privacy-development');
    expect(manifest.permissions.scopes).toEqual(['read:jira-work', 'write:jira-work', 'storage:app', ...(privacy ? ['report:personal-data'] : [])]);
    if (privacy) {
      expect(manifest.app.id).toBe('ari:cloud:ecosystem::app/38723408-eeba-4e64-8a81-903027d16f7c');
      expect(privacy).toEqual({key: 'lotzero-privacy-development', function: 'privacy-cycle', interval: 'hour'});
      expect(manifest.modules.function.find((x: any) => x.key === 'privacy-cycle')).toEqual({key: 'privacy-cycle', handler: 'privacy.handler', timeoutSeconds: 120});
    }
    if (hasMcp) {
    expect(manifest.modules['rovo:mcp']).toEqual([{key: 'lotzero-rehearsal-mcp', name: 'LotZero rehearsal evidence', tools: ['lotzero-mcp-read-rehearsal']}]);
    const mcp = manifest.modules.action.find((x: any) => x.key === 'lotzero-mcp-read-rehearsal');
    expect(mcp.actionVerb).toBe('GET');
    expect(mcp.function).toBe('mcp-rehearsal');
    expect(mcp.inputs).toMatchObject(Object.fromEntries(Object.entries(original.inputs).map(([key, value]: [string, any]) => [key, {type: value.type, required: value.required}])));
    expect(Object.keys(mcp.inputs)).toEqual(Object.keys(original.inputs));
    expect(manifest.modules.function.find((x: any) => x.key === 'mcp-rehearsal').handler).toBe('mcp.handler');
    } else {
      expect(Object.keys(manifest.modules).sort()).toEqual(['action', 'function', 'jira:projectPage', 'rovo:agent']);
      expect(manifest.modules.function.map((item: any) => item.key).sort()).toEqual(['recall-analyst', 'resolver']);
      expect(manifest.permissions.scopes).toEqual(['read:jira-work', 'write:jira-work', 'storage:app']);
      expect(agent[0].prompt).toContain('Timing not measured');
    }
    const source = readFileSync('src/rovo.ts', 'utf8');
    expect(source).not.toMatch(/from ['"].*(?:services\/application|integrations\/jira|storage\/forge|\.\/index)['"]/);
  });
});
