import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
const mocks = vi.hoisted(() => ({context: vi.fn(), request: vi.fn(), get: vi.fn(), set: vi.fn(), remove: vi.fn(), query: vi.fn()}));
vi.mock('@forge/api', () => ({default: {asApp: () => ({requestAtlassian: mocks.request})}, getAppContext: mocks.context, route: (strings: TemplateStringsArray) => strings.join('')}));
vi.mock('@forge/kvs', () => ({kvs: {get: mocks.get, set: mocks.set, delete: mocks.remove, query: mocks.query}, MetadataField: {CREATED_AT: 'CREATED_AT', EXPIRE_TIME: 'EXPIRE_TIME'}, WhereConditions: {beginsWith: (text: string) => text}}));
import {handler, withPrivacyMutationLock, cyclePeriodMs, reportAccounts, privacyPort, MARKETPLACE_APP_ID} from '../../src/privacy';
import {DEFAULT_CYCLE_MS, PRIVACY_LOCK, PrivacyFailure} from '../../src/privacy/lifecycle';

const response = (body: unknown, status = 200, headers: Record<string, string> = {}) => ({status, json: async () => body, headers: {get: (name: string) => headers[name] ?? null}});
beforeEach(() => {
  vi.resetAllMocks(); vi.stubEnv('LOTZERO_PRIVACY_ENABLED', 'false');
  mocks.context.mockReturnValue({appAri: {appId: MARKETPLACE_APP_ID}, environmentType: 'DEVELOPMENT', installationAri: {installationId: 'install'}, environmentAri: {environmentId: 'environment'}});
  mocks.request.mockResolvedValue(response(undefined, 204)); mocks.set.mockResolvedValue(undefined); mocks.remove.mockResolvedValue(undefined);
});
afterEach(() => {vi.unstubAllEnvs(); vi.useRealTimers(); vi.restoreAllMocks();});

describe('privacy adapter and strict development gate (mocked Forge transport)', () => {
  it.each([undefined, '', 'false', 'TRUE', ' true '])('does no work without the exact server flag (%s)', async flag => {
    vi.stubEnv('LOTZERO_PRIVACY_ENABLED', flag);
    expect(await handler()).toEqual({enabled: false}); expect(mocks.context).not.toHaveBeenCalled(); expect(mocks.get).not.toHaveBeenCalled(); expect(mocks.request).not.toHaveBeenCalled();
    const work = vi.fn(async () => 42); expect(await withPrivacyMutationLock(work)).toBe(42); expect(mocks.set).not.toHaveBeenCalled();
  });
  it.each(['PRODUCTION', 'STAGING', undefined])('does not operate outside development (%s)', async environmentType => {
    vi.stubEnv('LOTZERO_PRIVACY_ENABLED', 'true'); mocks.context.mockReturnValue({...mocks.context(), environmentType});
    expect(await handler()).toEqual({enabled: false}); expect(mocks.get).not.toHaveBeenCalled(); expect(mocks.set).not.toHaveBeenCalled();
  });
  it('does not operate on the judge identity or an unverified installation', async () => {
    vi.stubEnv('LOTZERO_PRIVACY_ENABLED', 'true'); mocks.context.mockReturnValue({appAri: {appId: 'f2443992-e1df-4ee4-b6ee-50abce811c9b'}, environmentType: 'DEVELOPMENT'});
    expect(await handler()).toEqual({enabled: false}); expect(mocks.set).not.toHaveBeenCalled();
  });
  it('sanitizes unavailable context and provider failures at the entry point', async () => {
    vi.stubEnv('LOTZERO_PRIVACY_ENABLED', 'true'); mocks.context.mockImplementation(() => {throw new Error('private-value');});
    await expect(handler()).rejects.toThrow('LotZero privacy: OPERATION_FAILED');
  });
  it('shares one barrier with user mutations and does not release a lock it failed to acquire', async () => {
    vi.stubEnv('LOTZERO_PRIVACY_ENABLED', 'true');
    mocks.set.mockRejectedValueOnce(new Error('exists')); mocks.get.mockResolvedValueOnce({at: '2026-11-06T00:00:00Z'});
    const work = vi.fn(); await expect(withPrivacyMutationLock(work)).rejects.toThrow('No changes were made');
    expect(work).not.toHaveBeenCalled(); expect(mocks.remove).not.toHaveBeenCalled();
    mocks.set.mockResolvedValue(undefined); expect(await withPrivacyMutationLock(async () => 'done')).toBe('done');
    expect(mocks.remove).toHaveBeenCalledWith(PRIVACY_LOCK);
  });
  it('uses only the app-reporting endpoint with no API key or Jira write', async () => {
    const accounts = [{accountId: 'account-a', updatedAt: '2026-11-01T00:00:00Z'}];
    expect(await reportAccounts(accounts)).toMatchObject({updates: [], cycleMs: DEFAULT_CYCLE_MS});
    const [url, options] = mocks.request.mock.calls[0]; expect(url).toBe('/app/report-accounts');
    expect(options.method).toBe('POST'); expect(JSON.parse(options.body)).toEqual({accounts}); expect(options.headers).toEqual({'content-type': 'application/json'});
  });
  it('preserves known erasure instructions even if cycle units need live contract review', async () => {
    mocks.request.mockResolvedValue(response({accounts: [{accountId: 'account-a', status: 'closed'}]}, 200, {'Cycle-Period': 'unknown-unit'}));
    expect(await reportAccounts([{accountId: 'account-a', updatedAt: '2026-11-01T00:00:00Z'}])).toMatchObject({cycleNeedsReview: true, updates: [{accountId: 'account-a', status: 'closed'}]});
  });
  it('reads a supported cycle and rate-limit delay without a tight retry loop', async () => {
    expect(cyclePeriodMs(null)).toBe(DEFAULT_CYCLE_MS); expect(cyclePeriodMs('P2DT3H4M5S')).toBe(183845000);
    expect(() => cyclePeriodMs('604800')).toThrow('UNSUPPORTED_CYCLE_PERIOD'); expect(() => cyclePeriodMs('P0D')).toThrow();
    mocks.request.mockResolvedValue(response(undefined, 429, {'Retry-After': '120'}));
    await expect(reportAccounts([{accountId: 'account-a', updatedAt: '2026-11-01T00:00:00Z'}])).rejects.toMatchObject({code: 'RATE_LIMITED', retryAfterMs: 120000});
    expect(mocks.request).toHaveBeenCalledTimes(1);
  });
  it('rejects malformed provider bodies and excessive batches', async () => {
    mocks.request.mockResolvedValue(response({unexpected: 'private-body'}));
    await expect(reportAccounts([{accountId: 'account-a', updatedAt: '2026-11-01T00:00:00Z'}])).rejects.toThrow('INVALID_PROVIDER_RESPONSE');
    await expect(reportAccounts([])).rejects.toThrow('INVALID_BATCH'); expect(mocks.request).toHaveBeenCalledTimes(1);
  });
  it('does not guess an earlier retry time for a missing or unsupported rate-limit header', async () => {
    const cases: Record<string, string>[] = [{}, {'Retry-After': 'not-a-delay'}, {'Retry-After': '999999999999999999999'}];
    for (const headers of cases) {
      mocks.request.mockResolvedValue(response(undefined, 429, headers));
      await expect(reportAccounts([{accountId: 'account-a', updatedAt: '2026-11-01T00:00:00Z'}])).rejects.toThrow('RETRY_AFTER_REVIEW_REQUIRED');
    }
  });
  it('preserves expiry to the remaining whole second instead of restarting retention', async () => {
    vi.useFakeTimers(); vi.setSystemTime('2026-11-06T09:00:00Z');
    const value = {actor: 'account-a', at: '2026-11-01T00:00:00Z'}; const expires = '2026-11-06T09:02:00Z';
    mocks.get.mockResolvedValue({key: 'p:1:audit:a', value, expireTime: expires});
    await privacyPort.replace({key: 'p:1:audit:a', value, expireTime: expires}, {...value, actor: '[erased]'});
    expect(mocks.set).toHaveBeenCalledWith('p:1:audit:a', {...value, actor: '[erased]'}, {ttl: {unit: 'SECONDS', value: 120}});
  });
  it('does not remove or refresh the expiry of non-expiring retry markers', async () => {
    const value = {actor: 'account-a', marker: 'preserve'}; mocks.get.mockResolvedValue({key: 'p:1:claim:a', value});
    await privacyPort.replace({key: 'p:1:claim:a', value}, {...value, actor: '[erased]'});
    expect(mocks.set).toHaveBeenCalledWith('p:1:claim:a', {...value, actor: '[erased]'}); expect(mocks.remove).not.toHaveBeenCalled();
  });
  it('rejects changed records and missing expiry metadata', async () => {
    mocks.get.mockResolvedValue({value: {actor: 'someone-else'}});
    await expect(privacyPort.replace({key: 'p:1:audit:a', value: {actor: 'account-a'}}, {actor: '[erased]'})).rejects.toThrow('RECORD_CHANGED');
    mocks.get.mockResolvedValue({value: {actor: 'account-a'}});
    await expect(privacyPort.replace({key: 'p:1:audit:a', value: {actor: 'account-a'}, expireTime: '2026-11-07T00:00:00Z'}, {})).rejects.toThrow('EXPIRY_UNAVAILABLE');
    expect(mocks.set).not.toHaveBeenCalled();
  });
  it('does not overwrite storage if lock acquisition fails for an unknown reason', async () => {
    mocks.set.mockRejectedValue(new Error('storage unavailable')); mocks.get.mockResolvedValue(undefined);
    await expect(privacyPort.exclusive(async () => 1)).rejects.toThrow(); expect(mocks.remove).not.toHaveBeenCalled();
  });
  it('runs the enabled scheduled entry point against a verified empty development installation', async () => {
    vi.stubEnv('LOTZERO_PRIVACY_ENABLED', 'true');
    const query = {where: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis(), getMany: vi.fn(async () => ({results: []}))};
    mocks.query.mockReturnValue(query);
    expect(await handler()).toEqual({enabled: true, status: 'idle', reportedAccounts: 0, redactedRecords: 0});
    expect(mocks.request).not.toHaveBeenCalled(); expect(mocks.remove).toHaveBeenCalledWith(PRIVACY_LOCK);
  });
  it('paginates the complete project inventory with expiry metadata', async () => {
    const getMany = vi.fn().mockResolvedValueOnce({results: [{key: 'p:1:audit:a', value: {actor: 'a'}, expireTime: '2026-12-01T00:00:00Z'}], nextCursor: 'next'})
      .mockResolvedValueOnce({results: [{key: 'p:2:audit:b', value: {actor: 'b'}}]});
    const cursor = vi.fn().mockReturnThis();
    mocks.query.mockImplementation(() => ({where: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis(), cursor, getMany}));
    expect(await privacyPort.records()).toHaveLength(2);
    expect(mocks.query).toHaveBeenCalledWith({metadataFields: ['CREATED_AT', 'EXPIRE_TIME']});
    expect(cursor).toHaveBeenCalledWith('next'); expect(mocks.request).not.toHaveBeenCalled();
  });
  it('rejects repeated inventory cursors and excessive records without reporting', async () => {
    const getMany = vi.fn(async () => ({results: [], nextCursor: 'repeated'}));
    mocks.query.mockImplementation(() => ({where: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis(), cursor: vi.fn().mockReturnThis(), getMany}));
    await expect(privacyPort.records()).rejects.toThrow('INVENTORY_LIMIT');
    getMany.mockResolvedValue({results: Array.from({length: 2001}, () => ({})) as never[], nextCursor: 'last'});
    await expect(privacyPort.records()).rejects.toThrow('INVENTORY_LIMIT'); expect(mocks.request).not.toHaveBeenCalled();
  });
  it('removes an already expired actor record rather than extending its retention', async () => {
    vi.useFakeTimers(); vi.setSystemTime('2026-11-06T09:00:00Z');
    const value = {actor: 'account-a'}; mocks.get.mockResolvedValue({value, expireTime: '2026-11-06T08:59:59Z'});
    await privacyPort.replace({key: 'p:1:audit:a', value}, {actor: '[erased]'});
    expect(mocks.remove).toHaveBeenCalledWith('p:1:audit:a'); expect(mocks.set).not.toHaveBeenCalled();
  });
  it('bounds inventory bytes as well as record count before reporting', async () => {
    const getMany = vi.fn(async () => ({results: [{key: 'p:1:dataset', value: 'x'.repeat(8 * 1024 * 1024)}]}));
    mocks.query.mockImplementation(() => ({where: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis(), getMany}));
    await expect(privacyPort.records()).rejects.toThrow('INVENTORY_LIMIT'); expect(mocks.request).not.toHaveBeenCalled();
  });
});
