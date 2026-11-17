# LotZero — owner promotion checklist

**Development 2.11.0 is deployed; production remains gated.** Source `7993c31` passed the isolated build, full lint and development deployment. See [current native verification and limits](docs/CRITIC_PASS_DEVELOPMENT_2026-11-16.md). Actual native downloads passed on 2.9.0; the 2.11 repeat was interrupted. The owner performs any production promotion and public edits. No install/tunnel/sharing/public change occurred.

## Review the isolated candidate

The prepared source directory is:

`/Users/himanshujha/Documents/Codex/2026-10-28/files-pasted-by-the-user-master/outputs/lotzero-clarity-2026-11-17/lotzero`

Review its sibling `source-export.json` and the candidate manifest before running commands. The working app manifest preserves historical MCP development declarations and **must not be promoted wholesale**. The judge package must contain exactly:

- Existing app identity `f2443992-e1df-4ee4-b6ee-50abce811c9b`.
- `jira:projectPage` / `index.handler`, existing read-only `rovo:agent`, one `lotzero-read-saved-rehearsal` **GET** action / `rovo.handler`.
- Scopes `read:jira-work`, `write:jira-work`, `storage:app`; no new external permission, MCP module/action/function or Marketplace privacy registration.
- The revised `config/judge-agent-prompt.md`, selected by the exporter. Same agent, no second provider or write tool.

Do not run the edition-selection/registration helper or change sharing/distribution. The frozen package includes documentation written before its rollout; use the current receipt linked above for deployed state. Its version is established by Forge, not by the exporter.

## Gates before hosting

- [x] Existing Forge authentication and full Forge lint passed for development on 15 and 16 November. Keep tokens out of source/chat and rerun lint before a later rollout; SDK validation remains a separate check.
- [ ] Review/remediate the refreshed dependency audit or record an explicit owner risk decision: six moderate production advisories, 43 total including five critical tooling entries. No forced update was performed.
- [ ] Review hosted privacy reporting/erasure, imported/free-text requests and operational recovery. The separate development privacy worker does not establish hosted compliance.
- [ ] Read current deployed/install versions and app identity; historical 2.5.0 production / 2.7.0 development records are not current readback. Record a backup and reviewed recovery route preserving receipts and uncertain claims.
- [ ] Identify a permitted synthetic-data test site/project and ordinary/denied users. New installation access, real Task writes and model prompts retain their specific approval boundaries.

## Local commands in the reviewed package

```sh
cd /Users/himanshujha/Documents/Codex/2026-10-28/files-pasted-by-the-user-master/outputs/lotzero-clarity-2026-11-17/lotzero
npm ci
npm run typecheck
npm test
npm run build
npx playwright test --config playwright.first-gap.config.ts
npm run forge -- lint
```

Use Node 22.23.4. Dependencies are excluded from the export. Local package verification may reuse the ignored matching-lock dependency symlink; it is not a clean installation. Do not copy credentials or use bypass flags. The browser transport disables real Jira writes/Rovo; its success does not complete native checks.

## Development rehearsal — approved rollout completed

The owner approved development-only rollout and native verification. The ten-critic repairs deployed as 2.10.0, followed by the native-width and wording correction as **2.11.0**. The existing installation updated without an install command. The latest native check kept the first shipment/path/inspector together and reopened the saved case at the same revision. No new Jira write or Rovo prompt was used. The retained 2.9.0 Rovo replay is historical model evidence; see the current receipt for exact boundaries. For a later explicitly approved development rollout, use the reviewed candidate directory:

```sh
npm run forge -- whoami
npm run forge -- deploy list -e development
npm run forge -- install list -e development
npm run forge -- deploy -e development
```

If an existing test installation requires an approved upgrade, review its consent and scopes, then:

```sh
npm run forge -- install --upgrade -e development --site one-atlas-obka.atlassian.net --product jira
```

No production command, bypass, new scope, paid plan or access grant is implied. An unexpected consent/scope/major-version change requires review.

## Native re-check on the matching build

Leave unchecked until observed. Record site/project, role, build, result and receipt.

- [ ] Empty Home has one **Run Northstar sample (synthetic)** action. One activation lands on Rehearsal with destination FAIL, SHIP-002 selected, the four-record path and inspector visible. Check ordinary and denied users as permitted; seeding/import/deletion still require project administration.
- [ ] Finding selection changes evidence; inspecting BATCH-101 keeps the SHIP-002 path anchored. Map, table, search, keyboard, mobile/iframe widths, light/dark host themes and reduced motion remain usable.
- [ ] Rehearse suggests WH-NORTH but applies nothing until Add. EV-DRILL is a real supplied reference; SHIP-002 is only hypothetically potentially preventable. SHIP-001 stays historical.
- [ ] Save/reload/reopen retains exact inputs/revision and presents the full prioritised proposal/receipt queue. Modified/imported records are preserved; repeated entry does not create another saved case.
- [ ] Nothing is preselected. With separate issue-write authority only, review exact content/project/type and approve one Task; verify one issue and receipt. Recheck the same action without duplicating it. Uncertain outcomes require reconciliation, never cleared claims or replacement issues.
- [ ] With separate prompt allowance only, open the existing analyst for the three applicable saved questions. Inspect the full saved revision, tool trace and direct, citation-first answer using [the answer rubric](evals/rovo/ANSWER_REVIEW.md). No claim of actual model quality follows from local contract tests. Rovo-off leaves the on-page evidence usable.
- [ ] Export JSON/Markdown/CSV and a compatible correction comparison. Check actual native download/clipboard behaviour. Verify no cross-project/site access merely by knowing a snapshot ID.

## Production — exact commands for the owner, not executed

Only after the above gates and the owner's production decision, from the **same reviewed judge-only directory**:

```sh
npm run typecheck
npm test
npm run build
npm run forge -- lint
npm run forge -- deploy list -e production
npm run forge -- install list -e production
npm run forge -- deploy -e production
```

An unchanged-scope update may not require installation upgrades. If required and personally approved after reviewing displayed consent, the owner can run:

```sh
npm run forge -- install --upgrade -e production --site one-atlas-obka.atlassian.net --product jira
npm run forge -- install --upgrade -e production --site lotzero-judge-verify.atlassian.net --product jira
```

CLI option syntax was checked with installed `--help`; none of these production commands was executed. Record the actual returned Forge version, installed readback and core save/reopen/receipt checks. A code rollback does not reverse Jira writes or erase uncertain outcomes.

Only then review [the Devpost draft](DEVPOST_UPDATE.md), [shot list](VIDEO_SHOTLIST.md) and [submission recheck](SUBMISSION_RECHECK.md). Capture and later Cardboard editing require their own authority; generated narration remains Deepgram only. Keep the existing page/demo unchanged until the owner chooses a public update.
