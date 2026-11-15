# LotZero

**Rehearse the recall. Find the gaps before they matter.**

A TypeScript recall-rehearsal engine and Atlassian Forge application for food-manufacturing quality teams. Trace ingredient lots, inspect evidence-backed assertions, rehearse hypothetical controls, save reproducible reports and explicitly approve Jira follow-up work.

## Local judge candidate — 15 November 2026

The approved local implementation adds a safe repeatable Northstar sample, a three-step guide, run-derived findings/action summary, explicit timing limits and 21 Rovo evidence-contract evaluations. `--judge-release` prepares one isolated manifest with the existing Jira page and read-only analyst; it excludes optional MCP and Marketplace privacy registration. This candidate is **not deployed**. Production, the live browser preview/demo and the submitted entry remain unchanged by this work.

See [local verification](docs/JUDGED_RELEASE_VERIFICATION.md), [the release comparison](docs/JUDGED_RELEASE_DIFF.md), [owner release checks](RELEASE_CHECK.md), [impact](IMPACT.md) and [submission draft](DEVPOST_UPDATE.md). Both source trees pass 247 tests and the local browser suite passes 16 cases; builds and manifest SDK validation pass. Full Forge CLI lint is blocked by expired login. The dependency audit and native/privacy acceptance remain release gates. The dated deployment and public-entry records below describe earlier releases.

[Open the browser workspace](https://lotzero-recall.vercel.app/app/) or [explore the interactive landing page](https://lotzero-recall.vercel.app/). Run the sample rehearsal in one click, find a shipment with record search and inspect its **Selected path**. Fit the full map to see the other associations, try a hypothetical control, then save and reopen the report. The browser edition uses localStorage and disables real Jira writes; Jira and Rovo are available through the installed Forge edition.

The redesigned public web experience is deployed and verified as of **4 November 2026**. Judge Forge production remains **2.5.0**, with the verified read-only Rovo analyst; Marketplace remains **2.2.0** and is not review-submitted. On **5 November**, the UI refresh and optional MCP candidate passed Forge lint and deployed to **Judge development 2.7.0**. The native saved-report journey and a real MCP read through an unpublished Rovo Studio verifier passed there. Production promotion still requires owner approval. See the [UI release boundary](docs/DESIGN_REVIEW_2026-11-04.md) and [MCP verification](docs/MCP_BONUS.md).

[Watch the 2:53 Jira + Rovo demo](https://youtu.be/KNKdnH8N6kw). It uses edited native captures, synthetic data and Deepgram Aura-2 Thalia narration, with manual English captions. The [Codegeist entry](https://devpost.com/software/lotzero) now links directly to the interactive workspace and includes its guided sample journey and three labelled web screenshots. Version 6 was read back on 4 November as Submitted with all five steps complete, Specialized Industries and Best Agents selected; [latest release and entry receipt](../ui-evidence/trace-2026-11-04/release-receipt.json).

## Try the Forge edition

[Install LotZero-Judge](https://developer.atlassian.com/console/install/f2443992-e1df-4ee4-b6ee-50abce811c9b?signature=AYABeCHj1xyDGh4AfiSaxSskT%2FUAAAADAAdhd3Mta21zAEthcm46YXdzOmttczp1cy13ZXN0LTI6NzA5NTg3ODM1MjQzOmtleS83MDVlZDY3MC1mNTdjLTQxYjUtOWY5Yi1lM2YyZGNjMTQ2ZTcAuAECAQB4CxqLTo9l4lqXuFjNim1xJM%2Bp%2F3TVP9xHS2BrU5DRRucBXV32g4gUJV52G1pXsnZE3QAAAH4wfAYJKoZIhvcNAQcGoG8wbQIBADBoBgkqhkiG9w0BBwEwHgYJYIZIAWUDBAEuMBEEDKV6sAADMKdtSrzWiQIBEIA74axB1UJGh1OPgRBtBpzU2As6xxCAITs2rxAICvyZf3xOT46J5O%2B%2BuqEHtGXyS6mUIIvBu5YaGJAuVucAB2F3cy1rbXMAS2Fybjphd3M6a21zOmV1LXdlc3QtMTo3MDk1ODc4MzUyNDM6a2V5LzQ2MzBjZTZiLTAwYzMtNGRlMi04NzdiLTYyN2UyMDYwZTVjYwC4AQICAHi9bVMAkme4qVQX1fQHo6ePw3H40A7cGfz7yrmSfBWMXgEDdp0xItlstkI4SFopCqdvAAAAfjB8BgkqhkiG9w0BBwagbzBtAgEAMGgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMtplsX64S7IKbfCKIAgEQgDt%2FSDizjG4YpEMiweej9w3NO5T2Oc7UvB7cw0LBUHFbIXuMZ%2BL3qo0U50BKUBIy82DSnFhDQHpsFBCa1AAHYXdzLWttcwBLYXJuOmF3czprbXM6dXMtZWFzdC0xOjcwOTU4NzgzNTI0MzprZXkvNmMxMjBiYTAtNGNkNS00OTg1LWI4MmUtNDBhMDQ5NTJjYzU3ALgBAgIAeDYASx0XCjkny4iLV6vz%2BKtEGSGT6kdt0QRpkn6D%2FlVEAWA%2Fd5iR%2F8ZpgLRrmYynqnMAAAB%2BMHwGCSqGSIb3DQEHBqBvMG0CAQAwaAYJKoZIhvcNAQcBMB4GCWCGSAFlAwQBLjARBAwQ8YAc3i%2F6Bph5lK0CARCAO7%2FPff%2B813Q30KDsJMkp1N4fitq2Qrh8Ti2jtT7eq0gYG9ssy0BjUeh4m4tzwkyP2wNi%2FWS%2FVmRmqvNkAgAAAAAMAAAQAAAAAAAAAAAAAAAAANZV5P5h3c%2B9wSNcCo2oQGr%2F%2F%2F%2F%2FAAAAAQAAAAAAAAAAAAAAAQAAADIaJlqkiEl%2FKLsNHSB0DRT%2BQ4UVQ9EOAAzXOVwGIpgNqXQoQajSlcCKLK5r6R70FFfgAq2V2ELXMtpU7XTFl6jBjNg%3D&product=jira) on a Jira Cloud test site where you are an administrator. Review the displayed permissions and [published privacy policy](https://gist.github.com/himanshu748/5fdad6ed1e6daf7f159c39f6ddcfbb58), then follow [installation and recovery](docs/INSTALLATION.md).

The existing private verification project is [LZR — LotZero Recall Rehearsals](https://one-atlas-obka.atlassian.net/jira/software/projects/LZR/apps/f2443992-e1df-4ee4-b6ee-50abce811c9b/b639eccf-3101-495c-a417-1cbaed8198f1). Its data is not made public by enabling app installation. The test site expires on **26 January 2027**; judges should install on their own site rather than rely on that site remaining available throughout judging.

The native demonstration follows ING-A19 to **3 product lots, 4 shipments, 9 evidence gaps and 12 unresolved records**. Saved drill `fc3171c3-c41a-4e6f-a886-57639b2413f2` produced the explicitly approved [LZR-1 Task](https://one-atlas-obka.atlassian.net/browse/LZR-1) for SHIP-002's missing destination. This private issue requires project access. The guarded same-action retry returned the original LZR-1 receipt, and a separate Jira marker search showed exactly 1 of 1. Native JSON/Markdown/CSV text exports and exact clipboard contents are verified by OS paste into TextEdit; automatic native downloads remain unverified. See the [clipboard receipt](evidence/native-clipboard-2026-10-30.json).

A fresh installation through that exact public sharing link passed all 12 recorded steps on `lotzero-judge-verify.atlassian.net`, project **KAN — My Kanban Space**. It began with no dataset and zero snapshots, reproduced the synthetic result, saved and reloaded a distinct snapshot, and contained no LZR-1 receipt. No Jira issue was created there. This is a basic separation observation under the same owner account; denied-user and adversarial tenant tests remain unverified. See the [second-site receipt](evidence/judge-second-site-verification.json).

A [validated Marketplace draft package](marketplace-package/README.md) contains listing copy and eight PNG assets. A separate portal draft exists, but it has not been submitted for review. The submitted Codegeist entry uses the [updated product-story write-up](devpost-final-writeup.md), new public Jira + Rovo demo, exact judge-install link, three native Jira screenshots, three clearly captioned web screenshots and a banner thumbnail. It makes no Marketplace bonus claim without a real review ticket or listing. The new 172.671-second Jira + Rovo walkthrough uses edited genuine native captures, exclusively Deepgram Aura-2 Thalia narration, manual English captions and chapters. The description discloses synthetic records and narration, retained core footage from judge 2.4.0 and new production Rovo footage from 2.5.0. See its [public metadata](evidence/rovo-2026-10-30/youtube-public-metadata.json) and [native playback receipt](evidence/rovo-2026-10-30/youtube-public-playback.json). The [original 2:55 public demo](https://youtu.be/nsw-z9XYY1g) stays live; the earlier private system-voice draft remains superseded.

## Ask about a saved rehearsal — production judge

The read-only **Recall rehearsal analyst** is deployed in judge **production 2.5.0** and staging 2.4.0; development is now **2.7.0** with the optional MCP candidate. The approved production rollout passed two native Rovo questions through the saved-report handoff: the exact original snapshot/revision, all four shipment paths, SHIP-002's destination failure (3/4 passed), and ingredient-origin UNKNOWN (2/5 passed) with its three counterexamples. The saved WH-NORTH quarantine preserves historical SHIP-001 and only hypothetically prevents SHIP-002. The reloaded snapshot contents and Jira issue count stayed unchanged.

The existing judge link serves this production release, and the [new public demo](https://youtu.be/KNKdnH8N6kw) shows the verified Rovo feature at 1:45. The independent staging site saved its own rehearsal, but Rovo could not open there; the normal report and evidence workflow remained usable. Rovo availability is a tenant prerequisite, not something this app activates. See [the analyst guide and verification limits](docs/ROVO_ANALYST.md) and [release handoff](docs/ROVO_RELEASE_HANDOFF.md). The revised optional-Rovo privacy disclosure is approved, published and anonymously matched to local bytes. Judge access, public-demo and Devpost-update gates pass. The existing entry remains **Submitted**, with all five form steps complete and the Specialized Industries / Best Agents selections read back from the native form.

## Run the browser rehearsal

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4173 and choose **Run sample rehearsal**. To configure a scenario yourself, load synthetic data, choose **New drill** and keep `ING-A19`. The synthetic clock is `2026-10-28T09:00:00Z`. Inspect the impact and evidence gaps, simulate a warehouse quarantine with `EV-DRILL`, save and export. The browser rehearsal uses localStorage and disables real Jira writes.

To compare corrections: save a baseline; return to readiness, load the corrected fixture, rerun the same source/hazard/time/assertions, save and select the previous baseline in the report. JSON comparison exports include both input snapshots.

## Verify and deploy

### Marketplace privacy and source preparation — local candidate

The 6 November productization increment adds a gated account-metadata privacy worker and a curated source exporter. The worker journals provider instructions, redacts account attribution while retaining Jira retry markers/receipts, and preserves remaining record TTL. It operates only with explicit activation in the Marketplace **development** identity. The current judge manifest/scopes and all live releases remain unchanged. Imported/free-text personal-data requests, hosted verification and operational recovery remain open; the Marketplace acknowledgment is still pending. See [candidate setup and limits](docs/PRIVACY_REPORTING.md) and [dependency findings](docs/DEPENDENCY_REVIEW_2026-11-06.md).

The original app and both exported candidates pass **208 unit/integration tests**. Typechecking, both candidate Forge builds and full Forge lint pass; the unchanged browser journey passes **13 cases**. Anonymous readback matches all 13 checked public assets to the prior release. These checks establish local behavior and unchanged public bytes, not hosted privacy reporting or a new live Jira release. See the [local verification handoff](docs/PRODUCTIZATION_VERIFICATION_2026-11-06.md).

`node scripts/prepare-source.mjs --output NEW-DIRECTORY` creates a source candidate outside the app, with an explicit file/hash receipt and known-pattern credential checks. Add `--privacy-development` to prepare the separate Marketplace manifest with its scheduled worker and reporting scope. It excludes private evidence, local credentials/configuration and media masters; it creates no Git repository and performs no commit, push, registration or deployment. Both source candidates require the stated owner review before external actions.

### Optional MCP tool — verified in development

The source now declares one native `rovo:mcp` tool, **Read saved LotZero rehearsal** (`lotzero-mcp-read-rehearsal`). It reuses the read-only saved-rehearsal engine to return shipment paths, evidence gaps, assertion counterexamples and saved simulations from the exact report IDs and revision. It requires the authenticated user's Jira Browse permission and cannot create issues or alter rehearsals.

The tool is **off by default**. Only `LOTZERO_MCP_ENABLED=true` in Forge's **DEVELOPMENT** runtime enables it; staging and production are blocked even if that variable is set. The original Rovo action remains independent of this flag. No scopes, dependencies, public server or browser UI were added.

As of **5 November 2026**, 154 unit/integration tests (35 new MCP cases), TypeScript, the Forge UI build, local manifest validation and full Forge lint pass. All 13 existing browser rehearsal cases pass, including save/reload, exports, mobile, keyboard and reduced motion. The candidate is deployed as **development 2.7.0**. Native Rovo Studio discovers the development tool, and its raw debug trace confirms one successful SHIP-002 read with the exact saved revision, recorded path, FAIL/UNKNOWN counts and `runtime.environmentType=DEVELOPMENT`. The complete saved snapshot stayed unchanged and Jira still lists only the existing LZR-1 issue.

The external-client path remains blocked: after an owner-approved **Read and Search** consent, Atlassian returned `invalid_request — Incorrect request parameters` before the local callback. No external rehearsal call ran. Two separately approved Studio Test messages were used; the first was an incomplete setup fragment that failed closed, and the second performed the verified read. A hosted wrong-revision test remains unrun; its automated regression passes. The verifier remains unpublished. Production, Marketplace, the public page/video and submitted entry are unchanged.

See [development setup, verification and rollback](docs/MCP_BONUS.md), [paste-ready Devpost draft and 30-second clip script](docs/DEVPOST_MCP_DRAFT.md), and [test evidence](evidence/mcp-2026-11-05/unit-results.json). The draft explicitly describes the present development boundary; it has not been published.

### Existing verification and commands

```sh
npm run typecheck
npm test
npm run test:e2e
npm run benchmark
npm run build
```

The latest 4 November UI update passed **119 unit/integration tests and 18 browser cases**: 13 workspace cases and five landing cases. These cover all seven app screens, keyboard focus, mobile layout, reduced motion, source-scoped search, stable path inspection, responsive fit-map controls, evidence focus, sample guidance and the built workspace entry path. The contrast checks pass during navigation without suppressing motion or delaying assertions. [Current receipts](../ui-evidence/trace-2026-11-04/release-receipt.json).

Both `npm run build` (Forge transport) and `npm run build:web` (public browser transport) passed for the UI refresh. Its initial Forge rollout was blocked by an expired token. Authentication was restored on 5 November, full Forge lint passed, and the UI plus MCP wrapper deployed to development 2.7.0. The UI refresh itself changed no backend or scopes; the separately reviewed MCP addition adds only a native module, GET action and gated wrapper. Judge production remains 2.5.0.

To build and preview the full website locally:

```sh
npm run build:web
python3 -m http.server 4322 --bind 127.0.0.1 --directory ../lotzero-site
```

Open http://127.0.0.1:4322/. The root serves the landing page; `/app/` serves the real browser rehearsal. `build:web` replaces only its generated sibling `lotzero-site/app/` directory. The landing page remains useful without that build; its workspace links require the generated bundle.

Run the UI acceptance suite with `npx playwright test --config=playwright.design.config.ts`. It uses isolated ports 4321 and 4322, and writes dated evidence. The suite checks the local player dialog with a stubbed third-party iframe; it does not certify YouTube playback. Native public workspace verification is recorded separately.

`npm run build` builds the Forge transport. `npm run forge -- <command>` uses the project-local supported Node binary. The package lock fixes dependency resolution. Select the registered judge or Marketplace edition with `node scripts/edition.mjs select judge` or `select marketplace`; both editions share product source and assets. Keep credentials and ignored local configuration out of public packages.

## Product and evidence

- [Requirements](PRD.md), [design](design.md), [architecture](docs/ARCHITECTURE.md), [fixture schema and provenance](fixtures/README.md).
- [60-point delivery checklist](docs/DELIVERY_CHECKLIST.md), [test report](docs/TEST_REPORT.md), [benchmarks](docs/BENCHMARKS.md), [final evidence](docs/FINAL_EVIDENCE.md).
- [Competition and domain research](docs/RESEARCH.md), [competitive analysis](docs/COMPETITIVE_ANALYSIS.md).
- [Threat model](docs/SECURITY.md), [privacy processing inventory](docs/PRIVACY.md), [Marketplace worksheet](docs/MARKETPLACE.md), [Devpost worksheet](docs/DEVPOST_SUBMISSION.md), [demo narration](docs/DEMO_SCRIPT.md).

## Boundaries

This is a rehearsal tool. Associations are recorded lineage, not proof of contamination or safety. Missing evidence remains unknown. Simulations do not contact anyone or change shipments. Quantities are full recorded shipment quantities grouped by compatible units; there is no inferred contamination mass or yield. Synthetic warehouse stock is assumed remaining at scenario time. Imported records need human verification.

CSV import uses explicit `record_type,json` rows, not arbitrary ERP-column mapping. Imports are limited to 200 KB, 1,000 nodes and 3,000 edges; saved snapshots have a smaller practical capacity after results are included. Non-subtask Jira issue types must allow description and labels and have defaults for additional required fields.

Provider: **Himanshu Jha / LotZero**. Support/privacy: **jhahimanshu653@gmail.com**. The Marketplace Partner Agreement, Admin upgrade and public partner profile are owner-approved and executed. Source licensing, end-user terms and remaining app-listing/legal declarations are separate unresolved decisions. No regulatory certification is claimed. The [marketing page](https://lotzero-recall.vercel.app/) is published with anonymous asset readback and public mobile interaction verified. Its [standalone source](../lotzero-site/) uses no runtime library or external inventory service. Open Design generation failed after service restarts; the finished locally authored page was imported as a manual Open Design artifact.
