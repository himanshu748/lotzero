import {describe, it, expect, vi} from 'vitest';
import {Application} from '../../src/services/application';
import type {Store} from '../../src/storage/port';
import type {JiraGateway} from '../../src/integrations/port';
import {PrivacyFailure, PrivacyLifecycle, accountInventory, redactActor, ERASED_ACTOR, DEFAULT_CYCLE_MS, type PrivacyPort, type PrivacyRecord, type ReportingState} from '../../src/privacy/lifecycle';

const initialTime = Date.parse('2026-11-06T09:00:00Z');
function record(key: string, value: unknown): PrivacyRecord {return {key, value};}
function setup(rows: PrivacyRecord[]) {
  let time = initialTime;
  let checkpoint: ReportingState | undefined;
  let locked = false;
  const port: PrivacyPort = {
    exclusive: async work => {if (locked) throw new PrivacyFailure('OPERATION_IN_PROGRESS'); locked = true; try {return await work();} finally {locked = false;}},
    records: vi.fn(async () => structuredClone(rows)),
    state: vi.fn(async () => structuredClone(checkpoint)),
    save: vi.fn(async value => {checkpoint = structuredClone(value);}),
    replace: vi.fn(async (row, value) => {rows.find(item => item.key === row.key)!.value = structuredClone(value);}),
    report: vi.fn(async () => ({updates: [], cycleMs: DEFAULT_CYCLE_MS})),
  };
  return {rows, port, service: new PrivacyLifecycle(port, () => time), advance: (ms: number) => {time += ms;}, state: () => checkpoint};
}
const actors = () => [
  record('p:10001:snapshot:s1', {initiator: 'account-a', createdAt: '2026-11-01T09:00:00Z', dataset: {owner: 'account-a'}, result: {path: ['ING-A19', 'SHIP-002'], status: 'UNKNOWN'}, actions: [{issueKey: 'LZR-1'}]}),
  record('p:10001:audit:event', {actor: 'account-a', at: '2026-10-30T09:00:00Z', event: 'Saved rehearsal'}),
  record('p:10001:claim:s1:a1', {actor: 'account-a', at: '2026-11-02T09:00:00Z', marker: 'keep-marker', project: 'LZR', type: '10001'}),
  record('p:10001:receipt:s1:a1', {status: 'uncertain', issueKey: 'LZR-1', error: 'Do not recreate', marker: 'keep-marker'}),
  record('p:20002:audit:event', {actor: 'account-b', at: '2026-11-03T09:00:00Z', event: 'Loaded dataset'}),
];

describe('development privacy lifecycle with in-memory storage/provider', () => {
  it('deduplicates actors across projects and reports the oldest stored age', () => {
    const rows = [...actors(), record('p:20002:audit:older', {actor: 'account-a', at: '2026-10-28T09:00:00Z'})];
    expect(accountInventory(rows, initialTime)).toEqual([{accountId: 'account-a', updatedAt: '2026-10-28T09:00:00.000Z'}, {accountId: 'account-b', updatedAt: '2026-11-03T09:00:00.000Z'}]);
  });
  it('does not invent fresh age for legacy data or report unknown/erased IDs', () => {
    const rows = [record('p:1:claim:a', {actor: 'account-a'}), record('p:1:audit:b', {actor: 'unknown'}), record('p:1:audit:c', {actor: ERASED_ACTOR})];
    expect(accountInventory(rows, initialTime)).toEqual([{accountId: 'account-a', updatedAt: '1970-01-01T00:00:00.000Z'}]);
    expect(accountInventory([record('p:1:claim:a', {actor: 'account-a', at: '2099-01-01T00:00:00Z'})], initialTime)[0].updatedAt).toBe('1970-01-01T00:00:00.000Z');
  });
  it.each(['mutation-lock', 'recovery-lock'])('blocks an unfinished project %s before disclosure or erasure', async name => {
    const s = setup([...actors(), record(`p:10001:${name}`, {actor: 'account-a'})]);
    await expect(s.service.run()).rejects.toThrow('PROJECT_UPDATE_PENDING');
    expect(s.port.report).not.toHaveBeenCalled(); expect(s.port.replace).not.toHaveBeenCalled();
  });
  it('rejects unclassified actor data and invalid account IDs without partial work', async () => {
    for (const row of [record('p:1:future-record', {accountId: 'account-a'}), record('p:1:audit:bad', {actor: 'private@example.invalid'})]) {
      const s = setup([row]); await expect(s.service.run()).rejects.toThrow('LotZero privacy:');
      expect(s.port.report).not.toHaveBeenCalled(); expect(s.port.replace).not.toHaveBeenCalled();
    }
  });
  it.each(['closed', 'updated'] as const)('redacts %s actor metadata while preserving receipts, uncertainty and input evidence', async status => {
    const s = setup(actors()); const before = structuredClone(s.rows);
    vi.mocked(s.port.report).mockResolvedValue({updates: [{accountId: 'account-a', status}], cycleMs: DEFAULT_CYCLE_MS});
    expect(await s.service.run()).toMatchObject({status: 'processed', reportedAccounts: 2, redactedRecords: 3});
    expect(s.rows[0].value).toEqual({...before[0].value as object, initiator: ERASED_ACTOR});
    expect(s.rows[1].value).toEqual({...before[1].value as object, actor: ERASED_ACTOR});
    expect(s.rows[2].value).toEqual({...before[2].value as object, actor: ERASED_ACTOR});
    expect(s.rows[3]).toEqual(before[3]); expect(s.rows[4]).toEqual(before[4]);
    expect(s.state()?.pending).toEqual([]); expect(s.state()?.accounts.map(item => item.accountId)).toEqual(['account-b']);
    // Imported labels/free text are explicitly outside this account-metadata automation.
    expect((s.rows[0].value as any).dataset.owner).toBe('account-a');
  });
  it('does not mutate unrelated data or the input object during redaction', () => {
    const row = actors()[0]; const before = structuredClone(row);
    expect(redactActor(row, new Set(['other']))).toBeUndefined();
    expect(redactActor(row, new Set(['account-a']))).toMatchObject({initiator: ERASED_ACTOR});
    expect(row).toEqual(before);
  });
  it('does not report again before the returned cycle, then reports the true oldest age', async () => {
    const s = setup(actors()); vi.mocked(s.port.report).mockResolvedValue({updates: [], cycleMs: 2 * 86400000});
    await s.service.run(); s.advance(2 * 86400000 - 1); expect((await s.service.run()).status).toBe('idle');
    expect(s.port.report).toHaveBeenCalledTimes(1); s.advance(1); await s.service.run();
    expect(s.port.report).toHaveBeenCalledTimes(2);
    expect(vi.mocked(s.port.report).mock.calls[1][0][0].updatedAt).toBe('2026-10-30T09:00:00.000Z');
  });
  it('bounds each batch to 90 and continues remaining accounts next invocation', async () => {
    const s = setup(Array.from({length: 95}, (_, i) => record(`p:1:audit:${i}`, {actor: `account-${i}`, at: '2026-11-01T00:00:00Z'})));
    expect((await s.service.run()).reportedAccounts).toBe(90);
    expect((await s.service.run()).reportedAccounts).toBe(5);
    const ids = vi.mocked(s.port.report).mock.calls.flatMap(([batch]) => batch.map(item => item.accountId));
    expect(new Set(ids).size).toBe(95);
  });
  it('rejects an account inventory too large for the bounded checkpoint before reporting', async () => {
    const s = setup(Array.from({length: 501}, (_, i) => record(`p:1:audit:${i}`, {actor: `account-${i}`, at: '2026-11-01T00:00:00Z'})));
    await expect(s.service.run()).rejects.toThrow('ACCOUNT_LIMIT'); expect(s.port.save).not.toHaveBeenCalled(); expect(s.port.report).not.toHaveBeenCalled();
  });
  it('prunes reporting metadata when the application no longer stores the actor', async () => {
    const s = setup(actors()); await s.service.run(); s.rows.splice(0); await s.service.run();
    expect(s.state()?.accounts).toEqual([]); expect(s.port.report).toHaveBeenCalledTimes(1);
  });
  it('resumes a durable partial erasure without another provider call', async () => {
    const s = setup(actors()); vi.mocked(s.port.report).mockResolvedValue({updates: [{accountId: 'account-a', status: 'closed'}], cycleMs: DEFAULT_CYCLE_MS});
    const replace = s.port.replace; let attempts = 0;
    s.port.replace = vi.fn(async (row, value) => {if (++attempts === 2) throw new Error('storage interrupted'); return replace(row, value);});
    await expect(s.service.run()).rejects.toThrow('storage interrupted');
    expect(s.state()?.pending).toEqual([{accountId: 'account-a', status: 'closed'}]);
    expect((await s.service.run()).redactedRecords).toBe(2);
    expect(s.port.report).toHaveBeenCalledTimes(1); expect(s.state()?.pending).toEqual([]);
  });
  it('requires the attempt checkpoint before sending a report', async () => {
    const s = setup(actors()); vi.mocked(s.port.save).mockRejectedValue(new Error('storage interrupted'));
    await expect(s.service.run()).rejects.toThrow(); expect(s.port.report).not.toHaveBeenCalled();
  });
  it('bounds erasure work and resumes later invocations without repeating the report', async () => {
    const s = setup(Array.from({length: 120}, (_, i) => record(`p:1:audit:${i}`, {actor: 'account-a', at: '2026-11-01T00:00:00Z', event: `preserve-${i}`})));
    vi.mocked(s.port.report).mockResolvedValue({updates: [{accountId: 'account-a', status: 'closed'}], cycleMs: DEFAULT_CYCLE_MS});
    expect(await s.service.run()).toEqual({status: 'erasing', reportedAccounts: 1, redactedRecords: 50});
    expect(s.state()?.pending).toHaveLength(1);
    expect(await s.service.run()).toEqual({status: 'erasing', reportedAccounts: 0, redactedRecords: 50});
    expect(await s.service.run()).toMatchObject({status: 'idle', reportedAccounts: 0, redactedRecords: 20});
    expect(s.port.report).toHaveBeenCalledTimes(1); expect(s.state()?.pending).toEqual([]);
    expect(s.rows.every(row => (row.value as any).actor === ERASED_ACTOR && (row.value as any).event.startsWith('preserve-'))).toBe(true);
  });
  it('shares the redaction budget between resumed work and a new account batch', async () => {
    const s = setup(Array.from({length: 70}, (_, i) => record(`p:1:audit:a${i}`, {actor: 'account-a', at: '2026-11-01T00:00:00Z'})));
    vi.mocked(s.port.report).mockImplementation(async accounts => ({updates: accounts.map(item => ({accountId: item.accountId, status: 'closed'})), cycleMs: DEFAULT_CYCLE_MS}));
    expect((await s.service.run()).redactedRecords).toBe(50);
    s.rows.push(...Array.from({length: 60}, (_, i) => record(`p:1:audit:c${i}`, {actor: 'account-c', at: '2026-11-02T00:00:00Z'})));
    expect((await s.service.run()).redactedRecords).toBe(50);
    expect((await s.service.run()).redactedRecords).toBe(30);
    expect(s.port.report).toHaveBeenCalledTimes(2);
  });
  it('reserves a failed/lost report and persists an explicit review pause', async () => {
    const s = setup(actors()); vi.mocked(s.port.report).mockRejectedValue(new Error('private-provider-body'));
    await expect(s.service.run()).rejects.toThrow('REPORT_FAILED_RESERVED_CYCLE');
    await expect(s.service.run()).rejects.toThrow('REPORT_REVIEW_REQUIRED');
    expect(s.port.report).toHaveBeenCalledTimes(1); expect(s.port.replace).not.toHaveBeenCalled();
  });
  it('honors a persisted rate-limit delay without immediate retries', async () => {
    const s = setup(actors()); vi.mocked(s.port.report).mockRejectedValueOnce(new PrivacyFailure('RATE_LIMITED', 120000));
    expect((await s.service.run()).status).toBe('rate-limited');
    expect((await s.service.run()).status).toBe('rate-limited'); expect(s.port.report).toHaveBeenCalledTimes(1);
    s.advance(120000); expect((await s.service.run()).status).toBe('processed');
  });
  it('finishes known erasures before pausing on an unknown cycle header', async () => {
    const s = setup(actors()); vi.mocked(s.port.report).mockResolvedValue({updates: [{accountId: 'account-a', status: 'closed'}], cycleMs: DEFAULT_CYCLE_MS, cycleNeedsReview: true});
    await expect(s.service.run()).rejects.toThrow('CYCLE_PERIOD_REVIEW_REQUIRED');
    expect((s.rows[0].value as any).initiator).toBe(ERASED_ACTOR);
    await expect(s.service.run()).rejects.toThrow('CYCLE_PERIOD_REVIEW_REQUIRED'); expect(s.port.report).toHaveBeenCalledTimes(1);
  });
  it.each([
    {updates: [{accountId: 'unrequested', status: 'closed'}]},
    {updates: [{accountId: 'account-a', status: 'closed'}, {accountId: 'account-a', status: 'updated'}]},
    {updates: [{accountId: 'account-a', status: 'unexpected'}]},
  ])('rejects invalid provider instructions before erasure (%j)', async ({updates}) => {
    const s = setup(actors()); vi.mocked(s.port.report).mockResolvedValue({updates: updates as any, cycleMs: DEFAULT_CYCLE_MS});
    await expect(s.service.run()).rejects.toThrow('INVALID_REPORT_RESPONSE'); expect(s.port.replace).not.toHaveBeenCalled();
  });
  it('uses the shared operation barrier for every application mutation including lock recovery', async () => {
    const runner = vi.fn(async () => {throw new PrivacyFailure('OPERATION_IN_PROGRESS');});
    const store = {} as Store; const jira = {project: vi.fn(async () => ({id: '1', key: 'LZR'})), permission: vi.fn(async () => true)} as unknown as JiraGateway;
    const app = new Application(store, jira, undefined, undefined, runner);
    const context = {accountId: 'account-a', extension: {project: {id: '1'}}};
    for (const work of [() => app.seed(context), () => app.importDataset(context, {}), () => app.saveDrill(context, {}), () => app.createActions(context, {}), () => app.deleteData(context, {}), () => app.reconcileAction(context, {}), () => app.recoverProjectLock(context, {confirmation: 'RECOVER'})]) {
      await expect(work()).rejects.toThrow('OPERATION_IN_PROGRESS');
    }
    expect(runner).toHaveBeenCalledTimes(7);
  });
  it('does not let an unauthenticated or denied user acquire the privacy barrier', async () => {
    const runner = vi.fn(async work => work());
    const jira = {project: vi.fn(async () => ({id: '1', key: 'LZR'})), permission: vi.fn(async () => false)} as unknown as JiraGateway;
    const app = new Application({} as Store, jira, undefined, undefined, runner);
    await expect(app.seed({})).rejects.toThrow('Authenticated');
    await expect(app.seed({accountId: 'account-a', extension: {project: {id: '1'}}})).rejects.toThrow('access denied');
    expect(runner).not.toHaveBeenCalled();
  });
});
