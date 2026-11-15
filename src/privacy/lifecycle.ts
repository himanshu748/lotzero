import {z} from 'zod';

export const PRIVACY_LOCK = 'privacy:operation-lock';
export const PRIVACY_STATE = 'privacy:reporting-state';
export const DEFAULT_CYCLE_MS = 7 * 24 * 60 * 60 * 1000;
export const ERASED_ACTOR = '[erased]';
export const MAX_REDACTIONS_PER_RUN = 50;
const accountId = z.string().regex(/^[A-Za-z0-9:-]{1,128}$/).refine(value => value !== 'unknown');
const iso = z.string().datetime({offset: true});
const update = z.object({accountId, status: z.enum(['closed', 'updated'])}).strict();
const stateSchema = z.object({
  version: z.literal(1),
  accounts: z.array(z.object({accountId, oldestAt: iso, nextReportAt: iso}).strict()).max(500),
  pending: z.array(update).max(90),
  blockedUntil: iso.optional(),
  pauseReason: z.enum(['CYCLE_PERIOD_REVIEW_REQUIRED', 'REPORT_REVIEW_REQUIRED']).optional(),
}).strict();
export type ReportingState = z.infer<typeof stateSchema>;
export type AccountUpdate = z.infer<typeof update>;
export interface PrivacyRecord {key: string; value: unknown; createdAt?: number; expireTime?: string}
export interface AccountReport {accountId: string; updatedAt: string}
export interface PrivacyPort {
  exclusive<T>(work: () => Promise<T>): Promise<T>;
  records(): Promise<PrivacyRecord[]>;
  state(): Promise<unknown>;
  save(state: ReportingState): Promise<void>;
  replace(record: PrivacyRecord, value: unknown): Promise<void>;
  report(accounts: AccountReport[]): Promise<{updates: AccountUpdate[]; cycleMs: number; cycleNeedsReview?: boolean}>;
}
export class PrivacyFailure extends Error {
  constructor(readonly code: string, readonly retryAfterMs?: number) {super(`LotZero privacy: ${code}`);}
}

function object(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
}
function actorField(record: PrivacyRecord): 'actor' | 'initiator' | undefined {
  if (/^p:\d+:(?:mutation-lock|recovery-lock)$/.test(record.key)) throw new PrivacyFailure('PROJECT_UPDATE_PENDING');
  if (/^p:\d+:snapshot:/.test(record.key)) return 'initiator';
  if (/^p:\d+:(?:audit|claim):/.test(record.key)) return 'actor';
  const row = object(record.value);
  if (row && ('actor' in row || 'initiator' in row || 'accountId' in row)) throw new PrivacyFailure('UNCLASSIFIED_PERSONAL_DATA');
  return undefined;
}

/** Only app-owned actor metadata is automated; imported free text has no reliable account mapping. */
export function accountInventory(records: PrivacyRecord[], now: number): AccountReport[] {
  const found = new Map<string, number>();
  for (const record of records) {
    const field = actorField(record);
    if (!field) continue;
    const value = object(record.value);
    if (!value || !(field in value)) throw new PrivacyFailure('INVALID_ACTOR_RECORD');
    const id = value[field];
    if (id === ERASED_ACTOR || id === 'unknown') continue;
    if (!accountId.safeParse(id).success) throw new PrivacyFailure('INVALID_ACTOR_RECORD');
    const stamp = field === 'initiator' ? value.createdAt : value.at;
    const parsed = typeof stamp === 'string' ? Date.parse(stamp) : record.createdAt;
    // Missing/invalid legacy age is conservatively old, never invented as a fresh retrieval.
    const age = typeof parsed === 'number' && Number.isFinite(parsed) && parsed <= now ? parsed : 0;
    found.set(id as string, Math.min(found.get(id as string) ?? Infinity, age));
  }
  return [...found].sort(([a], [b]) => a.localeCompare(b)).map(([id, age]) => ({accountId: id, updatedAt: new Date(age).toISOString()}));
}

/** Redaction retains result inputs, issue receipts, claim markers and uncertain outcomes. */
export function redactActor(record: PrivacyRecord, ids: ReadonlySet<string>): unknown | undefined {
  const field = actorField(record);
  const row = object(record.value);
  if (!field || !row || typeof row[field] !== 'string' || !ids.has(row[field] as string)) return undefined;
  return {...row, [field]: ERASED_ACTOR};
}

export class PrivacyLifecycle {
  constructor(private port: PrivacyPort, private now: () => number = Date.now) {}

  run() {return this.port.exclusive(() => this.runLocked());}

  private async applyPending(state: ReportingState, records: PrivacyRecord[], budget = MAX_REDACTIONS_PER_RUN) {
    if (!state.pending.length) return {changed: 0, complete: true};
    const ids = new Set(state.pending.map(item => item.accountId));
    let changed = 0;
    for (const row of records) {
      const value = redactActor(row, ids);
      if (value !== undefined) {
        if (changed === budget) {
          await this.port.save(state);
          return {changed, complete: false};
        }
        await this.port.replace(row, value); changed++;
      }
    }
    // Checkpoint only after every replacement; interrupted erasure resumes without re-reporting.
    state.pending = [];
    state.accounts = state.accounts.filter(item => !ids.has(item.accountId));
    await this.port.save(state);
    return {changed, complete: true};
  }

  private async runLocked() {
    const now = this.now();
    const raw = await this.port.state();
    const parsed = stateSchema.safeParse(raw ?? {version: 1, accounts: [], pending: []});
    if (!parsed.success) throw new PrivacyFailure('INVALID_CHECKPOINT');
    const state = parsed.data;
    if (new Set(state.accounts.map(item => item.accountId)).size !== state.accounts.length || new Set(state.pending.map(item => item.accountId)).size !== state.pending.length) throw new PrivacyFailure('INVALID_CHECKPOINT');
    let records = await this.port.records();
    // Validate the complete bounded inventory before reporting or changing any record.
    if (accountInventory(records, now).length > 500) throw new PrivacyFailure('ACCOUNT_LIMIT');
    const resumed = await this.applyPending(state, records);
    let redactedRecords = resumed.changed;
    if (!resumed.complete) return {status: 'erasing' as const, reportedAccounts: 0, redactedRecords};
    if (redactedRecords) records = await this.port.records();
    if (state.pauseReason) throw new PrivacyFailure(state.pauseReason);
    const inventory = accountInventory(records, now);
    const previous = new Map(state.accounts.map(item => [item.accountId, item]));
    state.accounts = inventory.map(item => ({
      accountId: item.accountId,
      oldestAt: new Date(Math.min(Date.parse(item.updatedAt), Date.parse(previous.get(item.accountId)?.oldestAt ?? item.updatedAt))).toISOString(),
      nextReportAt: previous.get(item.accountId)?.nextReportAt ?? new Date(0).toISOString(),
    }));
    if (state.blockedUntil && Date.parse(state.blockedUntil) > now) {
      await this.port.save(state);
      return {status: 'rate-limited' as const, reportedAccounts: 0, redactedRecords};
    }
    delete state.blockedUntil;
    const due = state.accounts.filter(item => Date.parse(item.nextReportAt) <= now)
      .sort((a, b) => Date.parse(a.nextReportAt) - Date.parse(b.nextReportAt) || a.accountId.localeCompare(b.accountId)).slice(0, 90);
    if (!due.length) {
      await this.port.save(state);
      return {status: 'idle' as const, reportedAccounts: 0, redactedRecords};
    }
    // Reserve the default cycle before the POST. A lost response never triggers an immediate duplicate.
    for (const item of due) item.nextReportAt = new Date(now + DEFAULT_CYCLE_MS).toISOString();
    await this.port.save(state);
    let response: Awaited<ReturnType<PrivacyPort['report']>>;
    try {
      response = await this.port.report(due.map(item => ({accountId: item.accountId, updatedAt: item.oldestAt})));
    } catch (error) {
      if (error instanceof PrivacyFailure && error.code === 'RATE_LIMITED' && error.retryAfterMs) {
        const until = new Date(now + error.retryAfterMs).toISOString();
        state.blockedUntil = until;
        for (const item of due) item.nextReportAt = until;
        await this.port.save(state);
        return {status: 'rate-limited' as const, reportedAccounts: 0, redactedRecords};
      }
      state.pauseReason = 'REPORT_REVIEW_REQUIRED';
      await this.port.save(state);
      throw new PrivacyFailure('REPORT_FAILED_RESERVED_CYCLE');
    }
    const updates = z.array(update).max(90).safeParse(response.updates);
    const requested = new Set(due.map(item => item.accountId));
    if (!updates.success || !Number.isSafeInteger(response.cycleMs) || response.cycleMs <= 0 || response.cycleMs > 366 * 86400000 ||
        updates.data.some(item => !requested.has(item.accountId)) || new Set(updates.data.map(item => item.accountId)).size !== updates.data.length) {
      state.pauseReason = 'REPORT_REVIEW_REQUIRED';
      await this.port.save(state);
      throw new PrivacyFailure('INVALID_REPORT_RESPONSE');
    }
    for (const item of due) item.nextReportAt = new Date(now + response.cycleMs).toISOString();
    state.pending = updates.data;
    if (response.cycleNeedsReview) state.pauseReason = 'CYCLE_PERIOD_REVIEW_REQUIRED';
    // Durable response journal precedes erasure. Both 'updated' and 'closed' erase cached actor IDs.
    await this.port.save(state);
    const erased = await this.applyPending(state, records, MAX_REDACTIONS_PER_RUN - redactedRecords);
    redactedRecords += erased.changed;
    if (!erased.complete) return {status: 'erasing' as const, reportedAccounts: due.length, redactedRecords};
    if (state.pauseReason) throw new PrivacyFailure(state.pauseReason);
    return {status: 'processed' as const, reportedAccounts: due.length, redactedRecords};
  }
}
