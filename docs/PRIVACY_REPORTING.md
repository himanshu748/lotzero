# Account-metadata privacy development candidate

Implemented locally **6 November 2026**. This is a development-only candidate for the existing Marketplace app. It has not called Atlassian's reporting API, changed hosted records, been deployed, or satisfied the Marketplace acknowledgment. The current judge manifest and its three scopes remain unchanged.

The clean source install also identified unresolved [dependency advisories](DEPENDENCY_REVIEW_2026-11-06.md). Functional verification does not remove that release gate.

## What it does

The worker inventories app-owned `initiator` fields in saved snapshots and `actor` fields in audit/approval claims across projects in the current Forge installation. It deduplicates account IDs and reports the oldest stored age, with one batch of at most 90 accounts per invocation. It excludes `unknown` and already-erased IDs. Missing or invalid legacy age is conservatively reported as the Unix epoch rather than pretending the data is new.

The transport uses Forge's authenticated `asApp().requestAtlassian` to POST `/app/report-accounts`, the same endpoint used by the installed Privacy API helper. Direct transport is deliberate: the helper discards response headers, whereas this worker must inspect `Cycle-Period` and `Retry-After`. No personal API key, third-party service or Jira write is used.

Both `closed` and `updated` responses erase the cached actor identifier by replacing it with `[erased]`. Erasure does not delete the rehearsal result, dataset/scenario, Jira issue keys, approval marker or uncertain receipt. The original content revision of a rehearsal is based on its inputs, not the actor attribution. A privacy redaction does change the complete saved-record bytes; do not describe the complete snapshot hash as unchanged after this operation.

**Imported/free-text personal data is outside this automatic mapping.** The worker cannot infer that an ERP contact name belongs to an Atlassian account. A reviewed support/request process and handling of such data are still required before customer adoption or the Marketplace declaration. This is not a blanket compliance or complete erasure claim. Existing Jira copies, downloads and Rovo chat retention remain separate boundaries.

## Guards, concurrency and recovery

The exact server variable `LOTZERO_PRIVACY_ENABLED=true`, trusted Marketplace app ID `38723408-eeba-4e64-8a81-903027d16f7c`, verified installation/environment and **DEVELOPMENT** runtime are all required. Production, staging, the judge identity, missing context and other flag values cannot start the worker. A payload cannot opt in. A future production policy change requires a separate review, tests and owner approval.

When enabled, user mutations and the worker share an installation-wide fail-if-exists operation lock. Reads stay available; writes report a busy error during a cycle. The worker refuses to proceed around abandoned project mutation/recovery locks. Default-off behavior adds no privacy storage/API call to the current judge flow. Existing project locks and per-action claims remain independently enforced.

Before a report, a durable checkpoint reserves the default seven-day cycle. A lost response is not automatically repeated. The returned account updates are journaled before erasure, so an interrupted partial redaction resumes without sending the report again. Successfully erased actors are removed from the reporting checkpoint. Metadata for actors no longer present in app records is pruned.

The default cycle is seven days. The candidate parses fixed ISO 8601 durations in `Cycle-Period`; numeric/unknown units are **not guessed**. Known erasure instructions are applied, then reporting pauses for contract review. Failed/malformed reports also persist a review pause. A 429 persists a supported `Retry-After` (seconds or HTTP date), and the next hourly invocation does not retry before it expires. A missing, unsupported or excessive delay pauses reporting for review rather than guessing an earlier retry. There are no in-invocation HTTP retries. The reporting request has a ten-second abort deadline.

Redaction re-reads each record and rejects concurrent changes. Existing TTL is preserved to the remaining whole second; it is never reset to another 90 days. Already-expired records are removed. Non-expiring claims remain non-expiring. If expiry metadata is unavailable, the worker refuses the replacement. A fresh live KVS metadata/TTL check remains required.

Bounds: at most **2,000 project records / 8 MiB of inventory**, **500 distinct accounts**, 90 reported accounts and **50 redactions per invocation**, with a bounded checkpoint. A larger erasure remains journaled and resumes in later hourly invocations, without re-reporting. Do not call an `erasing` result complete. Overflow or repeated pagination cursors fails explicitly before reporting. This is sized for development/pilot verification, not an unbounded multi-tenant deployment. Scheduled hourly timing may add provider scheduling delay; verify actual cadence and limits before production.

There is deliberately no automatic stale-lock deletion. An invocation killed by the platform can leave the global operation lock. An operator must verify termination and reconcile the durable report journal before a reviewed recovery. Do not clear locks/checkpoints or reserve times to force a retry. Live interruption/recovery behavior, operational alerts and an owner-approved recovery route remain release gates.

## Prepare the isolated candidate

From the original app directory, choose new, nonexistent output paths:

```sh
node scripts/prepare-source.mjs --output ../lotzero-repository-candidate
node scripts/prepare-source.mjs --output ../lotzero-privacy-development-candidate --privacy-development
```

The first export retains the judge manifest. The second writes a manifest **only in the new candidate** with the existing Marketplace identity, one hourly `privacy.handler` scheduled function and new `report:personal-data` scope. It does not change the original manifest, register an app, initialize Git, deploy, install, publish or copy local credentials. Both exports include a file/hash receipt and a narrower known-pattern credential scan. Historical evidence, local edition IDs, compiled bundles and media masters are excluded.

In the isolated candidate's `lotzero` directory:

```sh
npm ci
npm run typecheck
npm test
npm run build
npm run forge -- lint
```

An authorized later development rollout would separately need review of the exact manifest, account-data use, new scope and synthetic test data. No deploy/install/flag commands are authorized merely by these instructions. Do not enable the feature until its app identity, environment and recovery plan are verified. Do not register another Marketplace app.

## Local evidence and live gates

Regression coverage exercises oldest-age inventory, account deduplication, batch bounds, due times, durable partial erasure, rate limiting, malformed or unrequested provider instructions, TTL preservation, retry-marker preservation, feature/environment guards and the shared mutation barrier. These use mocked Forge transport and in-memory records. They do not prove hosted reporting, real erasure, provider headers, scheduled cadence or cross-user authorization.

Before the Marketplace acknowledgment: approve a development rollout/new access grant, verify the official test-account provider behavior and actual headers/TTL semantics, run permitted interruption cases, finish imported-data request handling and recovery, review production activation and published privacy text, and retain actual receipts. No public policy or listing answer has been changed by this implementation.

Primary contracts: [Forge Privacy API](https://developer.atlassian.com/platform/forge/runtime-reference/privacy-api/), [Forge user privacy guide](https://developer.atlassian.com/platform/forge/user-privacy-guidelines/), [scheduled trigger behavior](https://developer.atlassian.com/platform/forge/manifest-reference/modules/scheduled-trigger/) and [trusted app context](https://developer.atlassian.com/platform/forge/runtime-reference/app-context-api/).
