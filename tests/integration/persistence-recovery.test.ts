import {beforeEach, describe, expect, it, vi} from 'vitest';
import {Application, type ActorContext} from '../../src/services/application';
import type {Store} from '../../src/storage/port';
import {JiraError, type JiraGateway} from '../../src/integrations/port';
import {DEFAULT_ASSERTIONS, type JiraAction, type Scenario, type Snapshot} from '../../src/contracts';
import {runDrill} from '../../src/graph/engine';
import {syntheticDataset} from '../../fixtures/synthetic/dataset';

class MemoryStore implements Store {
  rows = new Map<string, unknown>();
  async get<T>(key: string) { return structuredClone(this.rows.get(key)) as T | undefined; }
  async set(key: string, value: unknown) { this.rows.set(key, structuredClone(value)); }
  async claim(key: string, value: unknown) { if (this.rows.has(key)) return false; this.rows.set(key, structuredClone(value)); return true; }
  async delete(key: string) { this.rows.delete(key); }
  async list<T>(prefix: string) { return [...this.rows].filter(([key]) => key.startsWith(prefix)).map(([key, value]) => ({key, value: structuredClone(value) as T})); }
  async deletePrefix(prefix: string, except?: string[]) { for (const key of this.rows.keys()) if (key.startsWith(prefix) && !except?.includes(key)) this.rows.delete(key); }
}
const prefix = 'p:10001:';
const context: ActorContext = {accountId: 'tester', extension: {project: {id: '10001'}}};
const scenario: Scenario = {sourceLotId: 'ING-A19', hazard: 'allergen', at: '2026-10-28T09:00:00Z', assertions: DEFAULT_ASSERTIONS};
const saveRequest = () => ({scenario, interventions: [], expectedFingerprint: runDrill(syntheticDataset, scenario).fingerprint, requestId: 'reviewed-rehearsal-1'});
let store: MemoryStore, jira: JiraGateway, app: Application;
beforeEach(async () => {
  store = new MemoryStore(); let nextId = 0;
  jira = {
    project: vi.fn(async id => ({id, key: 'LZ', name: 'Test project'})), permission: vi.fn(async () => true),
    projects: vi.fn(async () => []), issueTypes: vi.fn(async () => []), validateIssueType: vi.fn(async () => {}),
    create: vi.fn(async () => ({key: 'LZ-1', url: 'https://test.atlassian.net/browse/LZ-1'})),
    comment: vi.fn(async () => ({ id: "c-1" })),
    verifyIssue: vi.fn(async key => ({key, url: `https://test.atlassian.net/browse/${key}`})),
  };
  app = new Application(store, jira, () => '2026-10-28T10:00:00Z', () => `generated-${++nextId}`);
  await app.seed(context);
});
async function approval() {
  const snapshot = await app.saveDrill(context, saveRequest());
  const actions = await app.previewActions(context, {snapshotId: snapshot.id});
  return {snapshotId: snapshot.id, projectKey: 'LZ', issueTypeId: '10000', actionIds: [actions[0].id], approved: true};
}
function failWriteOnce(matches: (key: string, value: unknown) => boolean, afterCommit = false) {
  const set = store.set.bind(store); let pending = true;
  vi.spyOn(store, 'set').mockImplementation(async (key, value) => {
    if (pending && matches(key, value)) {
      pending = false;
      if (afterCommit) await set(key, value);
      throw new Error('storage response lost');
    }
    await set(key, value);
  });
}

describe('idempotent rehearsal saves (in-memory storage faults)', () => {
  it.each([false, true])('repairs a missing save audit without another snapshot; audit committed=%s', async afterCommit => {
    failWriteOnce(key => key.includes(':audit:save:'), afterCommit);
    await expect(app.saveDrill(context, saveRequest())).rejects.toThrow('storage response lost');
    const before = (await store.list<Snapshot>(`${prefix}snapshot:`))[0].value;
    const recovered = await app.saveDrill(context, saveRequest());
    expect(recovered).toEqual(before);
    expect(await store.list(`${prefix}snapshot:`)).toHaveLength(1);
    expect((await app.bootstrap(context)).audit.filter(entry => entry.event.startsWith('Saved drill'))).toHaveLength(1);
  });
  it.each([false, true])('retries a failed snapshot write with the same request identity; committed=%s', async afterCommit => {
    failWriteOnce(key => key.includes(':snapshot:'), afterCommit);
    await expect(app.saveDrill(context, saveRequest())).rejects.toThrow('storage response lost');
    const saved = await app.saveDrill(context, saveRequest());
    expect((await app.bootstrap(context)).snapshots.map(item => item.id)).toEqual([saved.id]);
  });
  it('returns one saved snapshot after the client loses a successful response', async () => {
    const first = await app.saveDrill(context, saveRequest()); // response is deliberately not consumed by the retrying caller
    const bytes = JSON.stringify([...store.rows]);
    expect(await app.saveDrill(context, saveRequest())).toEqual(first);
    expect(JSON.stringify([...store.rows])).toBe(bytes);
  });
  it('recovers before dataset/cap checks, preserving the saved revision and current receipts', async () => {
    const saved = await app.saveDrill(context, saveRequest());
    const action = (await app.previewActions(context, {snapshotId: saved.id}))[0];
    await store.set(`${prefix}receipt:${saved.id}:${action.id}`, {...action, status: 'created', issueKey: 'LZ-1'});
    for (let i = 0; i < 24; i++) await store.set(`${prefix}snapshot:other-${i}`, {...saved, id: `other-${i}`});
    await store.set(`${prefix}dataset`, {...syntheticDataset, name: 'Changed after the save'});
    const recovered = await app.saveDrill(context, saveRequest());
    expect(recovered.dataset).toEqual(saved.dataset);
    expect(recovered.actions[0].issueKey).toBe('LZ-1');
    expect(await store.list(`${prefix}snapshot:`)).toHaveLength(25);
  });
  it('rejects reusing a save request for different content but allows a distinct intentional save', async () => {
    const first = await app.saveDrill(context, saveRequest());
    await expect(app.saveDrill(context, {...saveRequest(), scenario: {...scenario, hazard: 'mislabeling'}})).rejects.toThrow('different rehearsal');
    const second = await app.saveDrill(context, {...saveRequest(), requestId: 'another-intentional-save'});
    expect(first.id).not.toBe(second.id);
    const {requestId: _, ...legacyRequest} = saveRequest();
    await expect(app.saveDrill(context, legacyRequest)).resolves.toMatchObject({initiator: 'tester'});
    expect(await store.list(`${prefix}snapshot:`)).toHaveLength(3);
  });
  it('scopes request identity to the authenticated actor', async () => {
    const first = await app.saveDrill(context, saveRequest());
    const second = await app.saveDrill({...context, accountId: 'another-member'}, saveRequest());
    expect(second.id).not.toBe(first.id);
    expect(second.initiator).toBe('another-member');
  });
});

describe('recoverable preparation and conservative Jira dispatch (mocked gateway)', () => {
  it.each(['receipt', 'approval audit'] as const)('recovers a %s write failure before calling Jira', async stage => {
    const request = await approval();
    failWriteOnce((key, value) => stage === 'receipt' ? key.includes(':receipt:') : key.includes(':audit:') && (value as {event: string}).event.startsWith('Approved '));
    await expect(app.createActions(context, request)).rejects.toThrow('storage response lost');
    expect(jira.create).not.toHaveBeenCalled();
    expect(await store.get(`${prefix}claim:${request.snapshotId}:${request.actionIds[0]}`)).toMatchObject({phase: 'preparing'});
    const preview = await app.previewActions(context, {snapshotId: request.snapshotId});
    expect(preview[0].status).not.toBe('uncertain');
    const deletion = vi.spyOn(store, 'delete');
    expect((await app.createActions(context, request))[0].status).toBe('created');
    expect(jira.create).toHaveBeenCalledTimes(1);
    expect(deletion.mock.calls.some(([key]) => key.includes(':claim:'))).toBe(false);
  });
  it('recovers when the preparatory uncertain receipt committed but its response was lost', async () => {
    const request = await approval();
    failWriteOnce(key => key.includes(':receipt:'), true);
    await expect(app.createActions(context, request)).rejects.toThrow('storage response lost');
    expect(jira.create).not.toHaveBeenCalled();
    expect((await app.bootstrap(context)).snapshots[0].actions[0]).toMatchObject({status: 'failed', error: expect.stringContaining('not contacted')});
    await app.createActions(context, request);
    expect(jira.create).toHaveBeenCalledTimes(1);
  });
  it('permits deletion of definitely unsent preparation without requiring an impossible Jira reconciliation', async () => {
    const request = await approval();
    failWriteOnce(key => key.includes(':audit:'));
    await expect(app.createActions(context, request)).rejects.toThrow('storage response lost');
    await app.deleteData(context, {confirmation: 'DELETE'});
    expect(store.rows.size).toBe(0);
    expect(jira.create).not.toHaveBeenCalled();
  });
  it('retains the originally approved target during preparation recovery', async () => {
    const request = await approval();
    failWriteOnce(key => key.includes(':receipt:'));
    await expect(app.createActions(context, request)).rejects.toThrow();
    await expect(app.createActions(context, {...request, projectKey: 'OTHER'})).rejects.toThrow('original Jira project');
    expect(jira.create).not.toHaveBeenCalled();
  });
  it('does not let a concurrent invocation resume or delete a claim still owned by the active project mutation', async () => {
    const request = await approval();
    const set = store.set.bind(store);
    let release!: () => void, entered!: () => void;
    const paused = new Promise<void>(resolve => { release = resolve; });
    const reached = new Promise<void>(resolve => { entered = resolve; });
    vi.spyOn(store, 'set').mockImplementation(async (key, value) => {
      if (key.includes(':receipt:') && (value as JiraAction).status === 'uncertain') { entered(); await paused; }
      await set(key, value);
    });
    const first = app.createActions(context, request);
    await reached;
    const before = structuredClone([...store.rows]);
    await expect(app.createActions(context, request)).rejects.toThrow('project update is in progress');
    expect([...store.rows]).toEqual(before);
    expect(jira.create).not.toHaveBeenCalled();
    release();
    expect((await first)[0].status).toBe('created');
    expect(jira.create).toHaveBeenCalledTimes(1);
  });
  it.each([false, true])('handles a dispatch-marker storage failure conservatively according to committed state=%s', async afterCommit => {
    const request = await approval();
    failWriteOnce((key, value) => key.includes(':claim:') && (value as {phase: string}).phase === 'dispatching', afterCommit);
    await expect(app.createActions(context, request)).rejects.toThrow('storage response lost');
    expect(jira.create).not.toHaveBeenCalled();
    const retried = await app.createActions(context, request);
    expect(retried[0].status).toBe(afterCommit ? 'uncertain' : 'created');
    expect(jira.create).toHaveBeenCalledTimes(afterCommit ? 0 : 1);
  });
  it.each(['lost Jira response', 'lost created receipt', 'lost completion audit'])('never repeats POST after %s', async fault => {
    const request = await approval();
    if (fault === 'lost Jira response') vi.mocked(jira.create).mockRejectedValueOnce(new JiraError('timeout'));
    else failWriteOnce((key, value) => fault === 'lost created receipt'
      ? key.includes(':receipt:') && (value as JiraAction).status === 'created'
      : key.includes(':audit:') && (value as {event: string}).event.endsWith(': created'));
    await app.createActions(context, request).catch(() => undefined);
    const retried = await app.createActions(context, request);
    expect(retried[0].status).toBe(fault === 'lost completion audit' ? 'created' : 'uncertain');
    expect(jira.create).toHaveBeenCalledTimes(1);
  });
  it('retains the meaning of an old claim with no phase, including a missing receipt', async () => {
    const request = await approval();
    await store.set(`${prefix}claim:${request.snapshotId}:${request.actionIds[0]}`, {actor: 'old', marker: 'legacy-marker', project: 'LZ', type: '10000'});
    expect((await app.createActions(context, request))[0]).toMatchObject({status: 'uncertain', error: expect.stringContaining('legacy-marker')});
    expect(jira.create).not.toHaveBeenCalled();
    await expect(app.deleteData(context, {confirmation: 'DELETE'})).rejects.toThrow('reconciled');
  });
});
