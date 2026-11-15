# LotZero judge release — owner checklist

**Local candidate only, 15 November 2026. No deploy/install/tunnel, flag change or public update is authorized or performed by this file.** Historical records say judge production 2.5.0 and development 2.7.0; their current hosted versions must be read before a rollout. Local results are in [the verification handoff](docs/JUDGED_RELEASE_VERIFICATION.md).

## 1. Review the frozen artifact

The planned package is `outputs/lotzero-judge-release-2026-11-15/`, created using the source exporter's `--judge-release` mode. Review its `source-export.json` hashes and candidate manifest. Its existing app identity must be `f2443992-e1df-4ee4-b6ee-50abce811c9b`, with only:

- `jira:projectPage` → `index.handler` resolver and the built Custom UI resource;
- `rovo:agent` Recall rehearsal analyst → the original `lotzero-read-saved-rehearsal` GET action → `rovo.handler`;
- scopes `read:jira-work`, `write:jira-work`, `storage:app`.

There must be no `rovo:mcp`, MCP action/function, scheduled privacy function, `report:personal-data`, remote or third-party external permission. Keep development research source intact. Do not run the edition-selection helper: the candidate already selects the existing judge identity. Do not register another app.

The original working manifest is deliberately preserved. Running deploy from the original directory would not select this curated manifest. Do not substitute a source hash for a Git commit; no repository/commit was created.

## 2. Resolve release gates before hosting

- [ ] Renew the expired Forge CLI login locally, keeping credentials out of chat/source. Full CLI lint was blocked; SDK validation is not a substitute.
- [ ] Review/remediate the current dependency findings or record an explicit owner risk decision. The audit is unresolved; a passing functional suite is insufficient.
- [ ] Review privacy reporting/erasure and imported-data handling obligations. The separate local privacy worker does not establish hosted compliance. Keep policy and actual installed behavior consistent.
- [ ] Verify current judge app identity, deployment/install versions and scopes using read-only CLI/console views. If the historical baseline changed, redo the comparison.
- [ ] Confirm a permitted test site/project, project administrator, ordinary member and denied user. New access grants, live issue creation and model prompt usage need their applicable approval.
- [ ] Keep all records fictional. Jira itself may apply notifications/automation to a created Task. Do not automatically clear claims, uncertain receipts or locks to force a retry.

No storage migration is intended. The sanitized historical export recomputes locally, but this does not prove a real installed upgrade. Record export/backup and a reviewed reconciliation/recovery route before changing a hosted install. Do not promise that a code rollback reverses storage or Jira writes.

## 3. Local commands

From a reviewed copy of the isolated candidate's `lotzero` directory, use Node 22.23.4 and install from its unchanged lockfile if dependencies are absent:

```sh
npm ci
npm run typecheck
npm test
npm run build
npm run forge -- lint
```

Local verification reused the earlier clean-installed matching-lock dependency tree; a new clean install is not claimed. The source-export receipt excludes dependencies and compiled output. The candidate's documented browser quickstart is `npm run dev`; it uses localStorage and disables real Jira writes. Do not run the original `build:web` against the live site's source merely to test the candidate.

## 4. Owner-run development rehearsal — not executed

After the above gates and specific development rollout/access approval, from the frozen candidate directory:

```sh
npm run forge -- whoami
npm run forge -- deploy list -e development
npm run forge -- install list -e development
npm run forge -- deploy -e development
```

Record the version returned by Forge and verify the manifest/scopes before any installation upgrade. To upgrade the existing approved test installation, only if that upgrade is approved:

```sh
npm run forge -- install --upgrade -e development --site one-atlas-obka.atlassian.net --product jira
```

Do not bypass lint, scope prompts, new access consent or terms. If the candidate requires an unexpected major-version/scope approval, stop for review. No included-credit or free-tier usage is assumed unlimited.

## 5. Fresh-install acceptance script

Run against the matching installed build, with explicit permission for the test site/access grants and any Task/model calls. Record date, build, project, role, observed result and receipt for each step.

| Step | Interaction and expected observation |
|---|---|
| Access | Open the exact existing judge sharing link from the submission. Confirm its existing app identity and the three scopes. Do not change sharing settings. An install dialog alone is not a completed install. |
| Empty state | Open LotZero in a new empty test project as project administrator. Dataset/snapshots begin empty; loading and permission failures provide a next action. |
| Sample | Choose **Load Northstar sample recall (synthetic)**. Measure from opening the installed app to inspecting the first finding. The objective is 60 seconds, measured separately from install time. |
| Idempotence | Repeat loading the unchanged sample. Verify no second dataset, audit event or saved report is introduced. Modified/imported data must never be replaced. Concurrent requests may return a safe busy message. |
| Trace/assertions | Follow ING-A19 to the actual product/shipment counts. Inspect SHIP-002's destination FAIL and an origin UNKNOWN with checked populations and counterexample/evidence IDs. No “safe” inference. |
| Control | Rehearse a WH-NORTH quarantine with EV-DRILL at the supplied scenario time. SHIP-001 stays historical; any prevention is hypothetical. No shipment operation occurs. |
| Saved state | Save, reload and reopen the report. Confirm inputs/result/revision, controls and receipts survive. The run-derived summary shows actual statuses, bounded proposals and “Timing not measured.” |
| Rovo | With separately approved included access/prompt allowance, use the saved handoff. Verify exact snapshot/revision, assertion/record/evidence citations, partial-page disclosure and no invented timing or writes. On a tenant without Rovo, use the report fallback. Do not stage a model answer. |
| Approved Task | Only with explicit issue-write permission, review/select exactly one Task, verify target/type/description, then approve. Confirm one resulting issue and receipt. No approval means no POST. |
| Retry/uncertainty | Retry the same saved action and independently check one issue/receipt. A missing/uncertain outcome must stop for reconciliation; do not clear claims or create a replacement. |
| Roles | An ordinary permitted member can read/run/save as allowed, but cannot seed/import/delete without project administration. Denied Browse users cannot inspect data; knowing snapshot IDs is insufficient. Check the same IDs in another project/site do not cross the boundary. |
| UX | At desktop/mobile sizes, use keyboard/focus, read assertion labels without relying on color, inspect the trace table/text alternative and reduce motion. Check error refresh reads state without repeating a write. |

Leave hosted rows unchecked until observed. Local tests, an existing old video and historical owner-account checks do not complete this table.

## 6. Owner production decision — commands for later, not run

After development and fresh-install acceptance, freeze source/configuration and compare hashes again. From the same reviewed candidate directory:

```sh
npm run typecheck
npm test
npm run build
npm run forge -- lint
npm run forge -- deploy list -e production
npm run forge -- install list -e production
npm run forge -- deploy -e production
```

If the install requires an explicitly approved upgrade, the owner can run the corresponding command for each existing site after reviewing its displayed consent:

```sh
npm run forge -- install --upgrade -e production --site one-atlas-obka.atlassian.net --product jira
npm run forge -- install --upgrade -e production --site lotzero-judge-verify.atlassian.net --product jira
```

CLI syntax was checked locally; these commands have **not** been exercised as a deployment/installation. An unchanged-scope minor update may not require an upgrade. Never add bypass flags or presume a successful rollout. Record the actual Forge version, native readback and selected sharing-link install result. Recheck core save/reload and permitted Rovo/Task cases; restore the known previous artifact only through a reviewed rollback, preserving receipts and uncertainty.

Only afterward should the owner approve production capture, Cardboard editing and any public video/form change. Use [the shot list](VIDEO_SHOTLIST.md), [submission draft](DEVPOST_UPDATE.md) and [form recheck](SUBMISSION_RECHECK.md). The existing live app, demo and submitted entry remain untouched by local implementation.
