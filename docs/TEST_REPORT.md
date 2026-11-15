# Verification report — 30 October 2026

The application is deployed to Forge and exercised on two independent Jira sites with synthetic data. Live provider proof and mocked failure coverage are recorded separately. No real recall, shipment hold or customer notification was executed.

## Automated checks

| Check | Last verified result | Evidence |
|---|---|---|
| Strict TypeScript and production build | PASS, including the view/copy export fallback | [build log](../evidence/build-2026-10-29.log) |
| Engine | 41 PASS | [unit/integration results](../evidence/unit-integration-results-2026-10-29.json) |
| Application service, mocked Store/Jira | 21 PASS | Same result, including guarded receipt checks that refuse missing receipts |
| Jira adapter, mocked Forge API | 11 PASS | Same result |
| Browser suite | 9 PASS, 42.1s, including export-fallback revision | [browser results](../evidence/browser-results.json) |
| Synthetic ground truth | 4/4 expected shipments, zero extra/missing IDs, 9 gaps | [benchmark](../evidence/benchmark.json) |
| Production dependency audit | 0 reported vulnerabilities at the recorded lockfile revision | [audit receipt](../evidence/dependency-audit.json) |
| Forge lint/deploy | PASS: judge 2.4.0 and Marketplace 2.2.0 | [Judge log](../evidence/forge-judge-deploy-2026-10-30.log), [Marketplace log](../evidence/forge-marketplace-deploy-2026-10-30.log) |
| Landing browser suite | 2 PASS, 7.7s | [Landing results](../../lotzero-site/evidence/browser-results.json) |
| Published landing assets | Anonymous HTTP 200; four assets byte-equal to tested local files | [Public readback](../../lotzero-site/evidence/public-readback.json) |

The harmless third-party PURE-comment annotation warnings do not prevent bundling. The build took longer under heavy local resource contention; these build times are not application latency measurements. Audit scope excludes development dependencies and is not a security certification.

## What the tests cover

Engine cases cover forward/backward evidence paths, split/merge, compatible quantities, duplicate/cyclic/broken relationships, bounded malicious imports, formula injection, explicit uncertainty, timezones, conservative quarantine capacity and reproducible comparisons/exports.

Application-service tests cover authentication/project/admin checks, immutable snapshots/audit, stale fingerprints, approval/payload tampering, concurrent/repeated actions, definite versus uncertain Jira failures, reconciliation, stale locks, partial reset and existing-receipt guards. Jira-adapter tests cover pagination, permission/create-screen preflight, ADF/marker payloads and HTTP failure classification. These failures use mocks, not a second live Jira identity.

## Native Jira verification

Observed on the real production judge installation in private project LZR at one-atlas-obka.atlassian.net:

1. Clean app installation and synthetic onboarding: 37 records, 43 relationships.
2. Dataset persisted after reload; ING-A19 at the fixed 28 October 2026 09:00Z scenario produced 3 associated products, 4 shipments, 9 gaps and 12 unresolved records.
3. SHIP-002 evidence path inspected. WH-NORTH quarantine with EV-DRILL identified SHIP-002 as potentially preventable while retaining historical SHIP-001.
4. Snapshot fc3171c3-c41a-4e6f-a886-57639b2413f2 saved in Forge KVS and reopened after reload.
5. Exactly one approved Task, LZR-1, created for SHIP-002's missing destination. Opened the actual issue through Forge router and inspected its evidence/marker.
6. Guarded same-action retry returned the original LZR-1 receipt. An independent Jira search for its approval marker showed exactly 1 of 1.
7. Judge distribution saved as Sharing with anyone; provider/contact/privacy and personal-data Yes verified. Actual installation link opened the correct app, scopes and site chooser.

See [native receipt](../evidence/live-acceptance-2026-10-29.json) and PNGs in [UI evidence](../../ui-evidence/). Native automatic file download was not captured. The visible view/select export control was exercised for the actual saved snapshot: JSON 35,501 characters, Markdown 7,359 and CSV 3,981. A later OS-paste check used native Copy export, Command-V into TextEdit and exact AX-value comparisons: JSON 35,501, Markdown 7,359 and CSV 4,010 characters all matched. The CSV differs from the earlier 3,981-character archive only by CRLF versus LF line endings; normalized contents match. The browser clipboard API remained empty; the [native clipboard receipt](../evidence/native-clipboard-2026-10-30.json) records the independent OS check. [JSON](../evidence/live-forge-drill.json), [Markdown](../evidence/live-forge-drill.md) and [CSV](../evidence/live-forge-findings.csv) preserve the observed export text. Automatic native downloads, actual TTL expiry, adversarial cross-tenant isolation and a second user's denied access remain untested.

## Fresh public sharing-link installation

All 12 [second-site steps](../evidence/judge-second-site-verification.json) passed on `lotzero-judge-verify.atlassian.net` in `KAN — My Kanban Space`, using the actual signed public judge link and owner-approved free-site terms/app scopes. The new installation began with no dataset and zero snapshots. Seeding produced 37 records/43 relationships; ING-A19 reproduced 3 product lots, 4 shipments, 9 gaps and 12 unresolved records. Evidence inspection and WH-NORTH + EV-DRILL preserved historical SHIP-001 and marked SHIP-002 potentially preventable.

Snapshot `1f060486-bd0d-44b0-8d6c-50d5bc112544` retained fingerprint `34cafdaf` across reload. Parsed JSON values were identical despite key-order differences. The new site had no LZR-1 receipt and no Jira issue was created. Forge CLI confirmed installation `60f67d2f-620f-4737-81f6-c0f077536bbc`, up-to-date major 2. This verifies the sharing-link onboarding path and basic data separation for the owner account; it is not a denied-user or adversarial tenant-isolation test.

## Browser scope

The completed local suite uses Chromium at 1440×1000 and 390×844. It exercises all seven screens, graph/table/evidence, simulation, saved snapshots/comparison, JSON/Markdown/CSV downloads, stale saves, invalid import/reset, keyboard access and reduced motion. Automated axe checks found zero violations across seven screens. This is not assistive-technology certification or coverage of every browser.

Motion uses small full-contrast transforms and explicit pending/completion text; reduced motion removes spatial transitions. The export fallback provides selectable JSON/Markdown/CSV text and a copy control. The completed local Chromium suite verified all three downloads and clipboard contents; CRLF CSV line endings are normalized only for comparison with HTML textarea values. Native text viewing and OS-paste clipboard contents are verified separately; automatic native browser downloads remain unverified.

## Submission artifact checks

The [Marketplace package validation](../marketplace-package/validation.json) reports passing copy limits and eight PNG dimensions: 144×144 logo, 1120×548 banner, three 1840×900 highlights and three 580×330 previews. [Provenance](../marketplace-package/asset-provenance.json) ties screenshots to actual native Jira captures. This is local package validation, not Marketplace submission or approval.

The [public walkthrough](https://youtu.be/nsw-z9XYY1g) is 174.788 seconds (2:55), edited from actual native Jira captures with disclosure. It uses Deepgram Aura-2 Thalia narration only (10 requests, 2,782 characters; local pitch-preserving 1.09× tempo), English (US) subtitles, chapters and the actual poster. Full local audio/video decode passed. No local system voice is used in this final version.

YouTube displayed Video published and initial checks No issues found. The upload has the synthetic/AI label, with no paid promotion, subscriber notifications or remix permission. [Anonymous metadata](../evidence/youtube-public-metadata.json) returned HTTP 200 with the correct title/channel; the old private control returned 403. [Public embed playback](../evidence/youtube-public-playback.json) reached 53 seconds with matching captions, while the same-context private control required sign-in. Public playback and caption observations are verified; a full independent viewing audit was not performed. The earlier private Samantha draft is superseded.

## Marketing-page verification

The separate [public landing page](https://lotzero-recall.vercel.app/) is a labelled illustrative synthetic branch. Two browser tests cover exact judge-install URLs, Trace/Evidence gaps/Rehearse a hold modes, shipment selection, preservation of historical SHIP-001, potentially preventable SHIP-002, unresolved destination evidence, reset, FAQ, skip-link focus, mobile menu/Escape, keyboard activation, touch-target size, reduced motion and body overflow. Desktop is 1440×1000; mobile is 390×844 plus a 360px width check. Axe reported zero violations in the tested states.

Anonymous production asset readback matched all four local files. A real browser also exercised the public mobile menu/quarantine interaction with no overflow. See [landing browser receipt](../../lotzero-site/evidence/browser-results.json), [public readback](../../lotzero-site/evidence/public-readback.json) and [screenshots](../../ui-evidence/).

Open Design generation failed after local service restarts. The locally authored finished page was imported as a manual Open Design artifact; that import is not evidence of successful Open Design generation.
