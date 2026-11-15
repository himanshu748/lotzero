import api, {getAppContext, route} from '@forge/api';
import {kvs, MetadataField, WhereConditions} from '@forge/kvs';
import {isDeepStrictEqual} from 'node:util';
import {forgeStore} from './storage/forge';
import {DEFAULT_CYCLE_MS, PRIVACY_LOCK, PRIVACY_STATE, PrivacyFailure, PrivacyLifecycle, type PrivacyPort, type AccountReport, type AccountUpdate} from './privacy/lifecycle';

export const MARKETPLACE_APP_ID = '38723408-eeba-4e64-8a81-903027d16f7c';

function enabled() {
  if (process.env.LOTZERO_PRIVACY_ENABLED !== 'true') return false;
  const context = getAppContext();
  // This increment has no permission to operate on production data or the judge identity.
  return context.appAri?.appId === MARKETPLACE_APP_ID && context.environmentType === 'DEVELOPMENT' &&
    Boolean(context.installationAri?.installationId && context.environmentAri?.environmentId);
}

async function exclusive<T>(work: () => Promise<T>): Promise<T> {
  let acquired: boolean;
  try {acquired = await forgeStore.claim(PRIVACY_LOCK, {at: new Date().toISOString()});}
  catch {throw new PrivacyFailure('LOCK_UNAVAILABLE');}
  if (!acquired) throw new PrivacyFailure('OPERATION_IN_PROGRESS');
  try {return await work();} finally {await forgeStore.delete(PRIVACY_LOCK);}
}

/** All application mutations use the same lock when the development privacy feature is active. */
export async function withPrivacyMutationLock<T>(work: () => Promise<T>): Promise<T> {
  let active: boolean;
  try {active = enabled();}
  catch {throw new Error('The approved privacy development installation could not be verified. Try again from Jira.');}
  if (!active) return work();
  try {return await exclusive(work);}
  catch (error) {
    if (error instanceof PrivacyFailure && error.code === 'OPERATION_IN_PROGRESS') throw new Error('A privacy update is in progress. No changes were made. Try again shortly.');
    if (error instanceof PrivacyFailure && error.code === 'LOCK_UNAVAILABLE') throw new Error('The privacy update lock is unavailable. No changes were made. Try again shortly.');
    throw error;
  }
}

export function cyclePeriodMs(header: string | null): number {
  if (header === null) return DEFAULT_CYCLE_MS;
  // ISO 8601 fixed durations only. Unknown units are a contract gate, never guessed as seconds/days.
  const match = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(header);
  if (!match || header.endsWith('T')) throw new PrivacyFailure('UNSUPPORTED_CYCLE_PERIOD');
  const value = ((Number(match[1] ?? 0) * 24 + Number(match[2] ?? 0)) * 60 * 60 + Number(match[3] ?? 0) * 60 + Number(match[4] ?? 0)) * 1000;
  if (!Number.isSafeInteger(value) || value <= 0 || value > 366 * 86400000) throw new PrivacyFailure('UNSUPPORTED_CYCLE_PERIOD');
  return value;
}

export async function reportAccounts(accounts: AccountReport[]) {
  if (!accounts.length || accounts.length > 90) throw new PrivacyFailure('INVALID_BATCH');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await api.asApp().requestAtlassian(route`/app/report-accounts`, {
      method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({accounts}), signal: controller.signal,
    });
    if (response.status === 429) {
      const header = response.headers.get('Retry-After');
      const milliseconds = header !== null && /^\d+$/.test(header) ? Number(header) * 1000 :
        header && /^[A-Za-z]{3}, \d{2} [A-Za-z]{3} \d{4} \d{2}:\d{2}:\d{2} GMT$/.test(header) ? Date.parse(header) - Date.now() : NaN;
      if (!Number.isSafeInteger(milliseconds) || milliseconds > 366 * 86400000) throw new PrivacyFailure('RETRY_AFTER_REVIEW_REQUIRED');
      throw new PrivacyFailure('RATE_LIMITED', Math.max(milliseconds, 1000));
    }
    if (response.status !== 200 && response.status !== 204) throw new PrivacyFailure('PROVIDER_REJECTED');
    let cycleMs = DEFAULT_CYCLE_MS;
    let cycleNeedsReview = false;
    try {cycleMs = cyclePeriodMs(response.headers.get('Cycle-Period'));}
    catch {cycleNeedsReview = true;}
    const body: unknown = response.status === 204 ? {accounts: []} : await response.json();
    if (!body || typeof body !== 'object' || !('accounts' in body) || !Array.isArray(body.accounts)) throw new PrivacyFailure('INVALID_PROVIDER_RESPONSE');
    // Service validates account IDs, statuses, uniqueness and membership before any erasure.
    return {updates: body.accounts as AccountUpdate[], cycleMs, cycleNeedsReview};
  } finally {clearTimeout(timer);}
}

export const privacyPort: PrivacyPort = {
  exclusive,
  state: () => kvs.get(PRIVACY_STATE),
  save: state => kvs.set(PRIVACY_STATE, state),
  records: async () => {
    const rows = [];
    let bytes = 0;
    let cursor: string | undefined;
    const cursors = new Set<string>();
    do {
      let query = kvs.query({metadataFields: [MetadataField.CREATED_AT, MetadataField.EXPIRE_TIME]}).where('key', WhereConditions.beginsWith('p:')).limit(100);
      if (cursor) query = query.cursor(cursor);
      const page = await query.getMany<unknown>();
      bytes += Buffer.byteLength(JSON.stringify(page.results), 'utf8');
      if (bytes > 8 * 1024 * 1024) throw new PrivacyFailure('INVENTORY_LIMIT');
      rows.push(...page.results);
      cursor = page.nextCursor;
      if (rows.length > 2000 || (cursor && cursors.has(cursor))) throw new PrivacyFailure('INVENTORY_LIMIT');
      if (cursor) cursors.add(cursor);
    } while (cursor);
    return rows;
  },
  replace: async (record, value) => {
    // Re-read expiry instead of refreshing every redacted snapshot to another 90 days.
    const current = await kvs.get(record.key, {metadataFields: [MetadataField.EXPIRE_TIME]});
    if (!current) return;
    if (!isDeepStrictEqual(current.value, record.value)) throw new PrivacyFailure('RECORD_CHANGED');
    if (record.expireTime && !current.expireTime) throw new PrivacyFailure('EXPIRY_UNAVAILABLE');
    if (current.expireTime) {
      const expires = Date.parse(current.expireTime);
      if (!Number.isFinite(expires)) throw new PrivacyFailure('INVALID_EXPIRY');
      const seconds = Math.floor((expires - Date.now()) / 1000);
      if (seconds < 1) {await kvs.delete(record.key); return;}
      await kvs.set(record.key, value, {ttl: {unit: 'SECONDS', value: seconds}});
    } else {await kvs.set(record.key, value);}
  },
  report: reportAccounts,
};

export async function handler() {
  try {
    if (!enabled()) return {enabled: false};
    return {enabled: true, ...await new PrivacyLifecycle(privacyPort).run()};
  } catch (error) {
    // No raw provider body, account identifier, imported value or checkpoint enters logs.
    throw new Error(error instanceof PrivacyFailure ? error.message : 'LotZero privacy: OPERATION_FAILED');
  }
}
