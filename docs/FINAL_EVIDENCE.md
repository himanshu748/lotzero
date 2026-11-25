# LotZero final engineering report

Updated 4 November 2026. **Forge application deployed and exercised with synthetic data; marketing page, native walkthrough and Codegeist entry published.** Devpost returned **Submitted** for submission **1273039** at **21:05 IST on 30 October 2026**, and the public page shows **SUBMITTED TO** Codegeist. The original delivery checklist has **58/60 evidenced checkpoints**. Native automatic downloads and Marketplace review submission remain open. The 4 November public web redesign is released; its separate native Forge UI rollout awaits renewed CLI authentication.

Public marketing page: [lotzero-recall.vercel.app](https://lotzero-recall.vercel.app/). Judge installation: use the exact enabled link in [INSTALLATION.md](INSTALLATION.md) or [the saved URL](../evidence/judge-installation-url.txt). The private verification site is not a public demo and expires **26 January 2027**.

## Implemented product

- Strict TypeScript/runtime schemas and bounded JSON/CSV import. The synthetic dataset has 12 ingredient lots, 37 nodes and 43 relationships, including split/merge/repackaging, historical and scheduled movement, missing destinations, ambiguous references, broken genealogy and duplicates.
- Deterministic forward/backward tracing with supporting paths, evidence references, confirmed/potential/unknown states and conservative treatment of missing information. Shared warehouses do not spread associations to unrelated lots.
- Five configurable PASS/FAIL/UNKNOWN assertions with denominators and record-backed counterexamples. No arbitrary composite readiness score or product-safety certification.
- Time-aware hypothetical quarantine/hold, owner assignment and investigation proposals. Compatible evidenced stock/quantity limits apply; historical shipments remain in the impact.
- Seven functional screens, interactive graph and record-table fallback, evidence inspector, snapshots, corrected-record comparisons, Markdown/JSON/CSV reports and a view/select/copy export fallback.
- Forge resolver authorization, verified project context, Browse/Administer/Create checks, Jira requests as the signed-in user, server-generated suggestions, explicit approval, bounded bundles, durable claims/receipts and uncertain-outcome reconciliation.
- Research, PRD/design, threat model, installation/recovery instructions, privacy policy, Marketplace/Devpost drafts and a validated Marketplace asset package. A published 2:55 walkthrough uses edited native Jira captures and Deepgram narration with disclosure, captions and chapters. The product-story Codegeist entry is actually submitted; the separate Marketplace app is not submitted for review.

## Verified releases

| Item | Actual result |
|---|---|
| Developer Space | LotZero — `18159bee-5fcb-492f-ac1e-63ebe97c5b16`; owner-approved Marketplace Partner Agreement/Admin upgrade/public profile executed; vendor **613592504**, authenticated management access verified ([receipt](../evidence/marketplace-partner-publication.json)) |
| Judge app | `f2443992-e1df-4ee4-b6ee-50abce811c9b`, production **2.4.0**; [deployment log](../evidence/forge-judge-deploy-2026-10-30.log) |
| Judge production environment | `b639eccf-3101-495c-a417-1cbaed8198f1` |
| Marketplace app | `38723408-eeba-4e64-8a81-903027d16f7c`, production **2.2.0**; [deployment log](../evidence/forge-marketplace-deploy-2026-10-30.log) |
| Native installations | `one-atlas-obka.atlassian.net`, private project `LZR`; public sharing-link installation on `lotzero-judge-verify.atlassian.net`, project `KAN` |
| Judge distribution | Sharing with anyone possessing the link; Jira selected; personal-data declaration **Yes** |
| Provider/support | Himanshu Jha / LotZero — jhahimanshu653@gmail.com |
| Privacy | [Owner-approved public policy](https://gist.github.com/himanshu748/5fdad6ed1e6daf7f159c39f6ddcfbb58), read back against the approved file |
| Marketing release | [Public landing page](https://lotzero-recall.vercel.app/), Vercel project `prj_IKSgmURZFr0PCBH7RjZz2YErQBP1`, deployment `dpl_G7sMW9WuNfiGL8EV57QEZDkuxzkz` |
| Native walkthrough | [Public YouTube video](https://youtu.be/nsw-z9XYY1g), 174.788 seconds (2:55), Deepgram Aura-2 Thalia narration; anonymous metadata and public playback verified |
| Codegeist submission | [LotZero](https://devpost.com/software/lotzero), project **1518613**, submission **1273039**, **Submitted**; API receipt and public-page **SUBMITTED TO** readback verified ([receipt](../evidence/devpost-submission-receipt.json)) |

The owner approved Forge registration terms and possible usage invoices after the earlier registration stop. No payment card was added. Both registered identities share product source; the active manifest selects the judge edition. Marketplace deployment does not submit or publish its listing. The landing page was separately approved for publication; no paid add-on, plan change or domain purchase was requested.

## Automated verification

| Check | Result | Receipt |
|---|---|---|
| Strict TypeScript and production build | PASS, including export fallback | [Build log](../evidence/build-2026-10-29.log) |
| Engine | 41 PASS | [Unit/integration results](../evidence/unit-integration-results-2026-10-29.json) |
| Application service, mocked Store/Jira | 21 PASS | Same receipt |
| Jira adapter, mocked Forge API | 11 PASS | Same receipt |
| Application browser suite | 9 PASS, 42.1s | [Browser results](../evidence/browser-results.json) |
| Marketing browser suite | 2 PASS, 7.7s | [Landing results](../../lotzero-site/evidence/browser-results.json) |
| Automated accessibility | Zero axe violations detected in the tested app screens and landing states | Browser receipts; not certification |
| Production dependency audit | Zero reported vulnerabilities at the recorded lockfile revision; development tooling excluded | [Audit](../evidence/dependency-audit.json) |
| Synthetic ground truth | Exactly 4/4 expected shipment IDs, zero extra/missing IDs, 9 gaps | [Benchmark](../evidence/benchmark.json) |

The application suite covers desktop/mobile, keyboard/reduced motion, graph/table/evidence, simulation, persistence/comparison, downloads, copy fallback, malformed imports, confirmed reset and stale saves. Failure-path service/adapter tests use mocks. Native provider behavior is listed separately below. Resource-related interrupted runs were not counted as passes; the subsequent completed browser receipts above are the reported results.

## Native Jira proof

The first clean installation loaded the labelled synthetic fixture through Forge. Its 37 records and 43 relationships persisted across reload. At the fixed `2026-10-28T09:00:00Z` scenario, ING-A19 produced **3 associated product lots, 4 shipments, 9 evidence gaps and 12 unresolved records**. SHIP-002's evidence chain was inspected. A hypothetical WH-NORTH quarantine with EV-DRILL identified SHIP-002 as potentially preventable while retaining historical SHIP-001.

Snapshot **`fc3171c3-c41a-4e6f-a886-57639b2413f2`**, fingerprint **`34cafdaf`**, was saved in Forge KVS and reopened after reload. The owner approved exactly one Task for SHIP-002's missing destination. [LZR-1](https://one-atlas-obka.atlassian.net/browse/LZR-1) was created and opened through the returned Forge issue control. The guarded same-action retry returned the original LZR-1 receipt; a separate Jira search for marker `lotzero-355b81d3b772d6554ef5f0d4` showed **1 of 1**.

Native export text was read from the visible report control for the actual saved snapshot: [JSON](../evidence/live-forge-drill.json) (35,501 characters), [Markdown](../evidence/live-forge-drill.md) (7,359) and [CSV](../evidence/live-forge-findings.csv) (3,981). JSON includes the four shipment IDs and LZR-1 receipt; Markdown includes the receipt and CSV includes SHIP-002. The browser clipboard API returned empty, so the native control was independently checked through OS Command-V into TextEdit. Exact comparisons passed for JSON (35,501 characters), Markdown (7,359) and CSV (4,010 with CRLF line endings; the earlier LF text archive has 3,981, equal after newline normalization); see the [native clipboard receipt](../evidence/native-clipboard-2026-10-30.json). **Native clipboard contents are verified; automatic native file downloads remain unverified.** Local Chromium download and clipboard tests pass.

The exact signed public judge link was used to install on the owner-approved free site **lotzero-judge-verify.atlassian.net**, project **KAN — My Kanban Space**. All 12 recorded steps passed: initial empty dataset/zero snapshots; 37 records and 43 relationships after seeding; fixed ING-A19 result 3/4/9/12; evidence/unknown inspection; and WH-NORTH + EV-DRILL preserving SHIP-001 while making SHIP-002 potentially preventable. Snapshot **`1f060486-bd0d-44b0-8d6c-50d5bc112544`**, fingerprint **`34cafdaf`**, reopened after reload. Parsed JSON values matched, with only object-key ordering different. No Jira issue was created and the original LZR-1 receipt was absent. Forge CLI confirmed installation **`60f67d2f-620f-4737-81f6-c0f077536bbc`**, up-to-date major version 2. See the [second-site receipt](../evidence/judge-second-site-verification.json).

This is basic data-separation evidence under one owner account. Actual TTL expiry, adversarial tenant isolation, native reset/recovery and a second user's denied access remain untested. See [native receipt](../evidence/live-acceptance-2026-10-29.json), [test scope](TEST_REPORT.md) and [screenshots](../../ui-evidence/).

## Marketing page proof and provenance

The landing page provides a labelled synthetic trace exhibit with selectable shipments, Trace/Evidence gaps/Rehearse a hold modes, quarantine toggle and reset. It retains historical impact and unresolved evidence. Its install controls use the actual judge link; privacy/support are the approved public contacts. Responsive navigation, FAQ, skip-link focus, keyboard activation, 44px shipment targets, reduced motion and body overflow were tested at 1440×1000, 390×844 and a 360px breakpoint.

Anonymous HTTPS requests returned **200** for all four published assets, byte-for-byte equal to the tested local files: [public readback](../../lotzero-site/evidence/public-readback.json). A separate browser check exercised the published mobile menu and quarantine interaction without horizontal overflow. The sample is an illustrative branch, not a live inventory integration or the full Forge engine.

Open Design collected the confirmed brief. Its generation service restarted and produced no deliverable. The page was then authored locally and imported as the manual artifact `lotzero-landing.html` in project `lotzero-interactive-recall-rehearsal-landing-5aaa`. **Do not describe it as Open Design-generated.** The preferred motion-design guidance informed the implementation. [Site source](../../lotzero-site/) and [UI evidence](../../ui-evidence/) are separate from the Forge package.

## Performance and limits

Local synthetic measurements on Node v22.23.4 / Darwin arm64: fixture traversal median **3.895 ms**, p95 **15.149 ms**; full drill median **10.112 ms**, p95 **18.269 ms**; 300-node chain traversal median **14.979 ms**, p95 **36.489 ms**. These exclude Forge/Jira network and persistence overhead and are not customer improvement claims. See [BENCHMARKS.md](BENCHMARKS.md).

CSV import uses explicit `record_type,json`, not arbitrary ERP mapping. Stock is assumed remaining at the scenario clock; partial-shipment prevention, yield/mass balance, hazard dose and physical inventory validation are unsupported. Imports and snapshots are bounded. Additional required Jira issue fields need configured defaults. Approved cross-project issue content follows the target project's access and automation rules.

Unknown Jira writes retain claims. An administrator may reconcile a matching issue by its verified marker; no automatic absence-proof or claim release exists. Provider retention/deletion properties and imported real-world records require review before production use. Accessibility tests are not assistive-technology or regulatory certification.

## Submitted Codegeist entry and Marketplace preparation

The [Marketplace package](../marketplace-package/README.md) has a validated [listing draft](../marketplace-package/listing-draft.json), eight PNGs at the required sizes, and native-capture [provenance](../marketplace-package/asset-provenance.json). [Validation](../marketplace-package/validation.json) covers copy limits and image dimensions. The Marketplace app has not been submitted for review. Portal draft **106576423** exists for production **2.2.0**; its sharing configuration declares personal-data storage **Yes**. The Personal Data Reporting API confirmation remains explicitly unchecked, with implementation/applicability unresolved. The owner-approved Marketplace Partner Agreement, Admin upgrade and public partner profile are executed, and authenticated management access is verified for vendor 613592504. Exact app-listing/pricing approval, remaining end-user/legal declarations and portal questionnaires remain pending.

The owner approved the actual Codegeist entry and personally affirmed the age, eligible-jurisdiction and employee declarations, Codegeist rules and Devpost terms. Submitted values are **Individual**, **India**, new work begun **28 October 2026**, skills gained **Significantly**, future Forge use **Very likely**. The public narrative is the Devpost product story, accompanied by the exact tested judge-install URL, public demo, three native Jira screenshots and a banner thumbnail. Fields for the Marketplace bonus and its URL were omitted because there is no review ticket or public app listing. [Submission receipt](../evidence/devpost-submission-receipt.json).

The [public native Jira walkthrough](https://youtu.be/nsw-z9XYY1g) is **174.788 seconds (2:55)**. It uses edited actual native captures, an added pointer, Deepgram **Aura-2 Thalia only** narration, subtitles and chapters; it is not a continuous screen recording. Narration used 10 Deepgram requests/2,782 characters, then local pitch-preserving tempo adjustment at 1.09×. No local system voice is used in the published version. Full local audio/video decode passed; the [recording receipt](../demo/recording-receipt.json) tracks production.

The owner approved public upload. YouTube displayed **Video published** and initial checks **No issues found**. English (US) subtitles and the actual poster were uploaded, synthetic/AI content was labelled Yes, and paid promotion, subscriber notifications and remix permission were disabled. [Anonymous cookie-less oEmbed](../evidence/youtube-public-metadata.json) returned HTTP 200 with the correct title/channel; the superseded private control returned 403. In a privacy-enhanced embed with a real HTTP Referer, the public video played to 53 seconds with a matching script caption, while the same-context private control required sign-in; [playback receipt](../evidence/youtube-public-playback.json), [playback screenshot](../../ui-evidence/youtube-deepgram-public-playback.png) and [published screen](../../ui-evidence/youtube-deepgram-published.png). This verifies public playback, not a full independent viewing audit. The old Samantha draft `5S6dUHnLbpU` remains private and superseded.

## Remaining delivery gates

**53 and 58 remain unchecked** from the 60-point delivery checklist, which is not on this branch: automatic native file download proof and actual Marketplace review submission. Checkpoint 60 passed with the owner-approved Codegeist submission and API/public-page readback. The Marketplace Partner Agreement and public profile are approved and executed. Exact app-listing/pricing approval, outstanding end-user/legal decisions, privacy-reporting resolution and portal completion remain Marketplace gates. No Marketplace review ticket or public app listing exists; the bonus requirement is not met.

Source and release integrity are tracked in the [source manifest](../evidence/source-manifest.json), [source scan](../evidence/source-scan.json) and [delivery status](../evidence/delivery-status.json). No application source change, Forge deployment, commit or push was performed for this submission update. The landing-page regression suite passed again (2 tests,9.2seconds), and the new [support guide](https://lotzero-recall.vercel.app/support.html) and demo/footer links were deployed to the existing approved Vercel project. Five public assets returned HTTP200 and matched local bytes; [support publication receipt](../../lotzero-site/evidence/support-publication.json). The published marketing page, privacy policy and public walkthrough are explicitly approved publications; they do not publish private Jira project records.


## 30 October 2026 — approved production Rovo addition

Judge production **2.5.0** adds the read-only Recall rehearsal analyst. Exact tested source content SHA-256 is `09a23d6b356e1dd18123fea739df548507a201b04cf3f1092dc3acf7765fa764`. The candidate passed 119 unit/integration tests, nine browser cases, strict build/types, Forge lint and a clean production dependency audit. Two native production questions returned four shipment paths, destination FAIL 3/4 and origin UNKNOWN 2/5 with exact counterexamples. Full saved scenario/interventions and the original LZR-1 receipt remained unchanged after reload; Jira still shows one issue. The independent production installation also reloaded its own prior snapshot with zero issue receipts. See the [analyst verification](ROVO_ANALYST.md), [release handoff](ROVO_RELEASE_HANDOFF.md) and [production after-state](../evidence/rovo-2026-10-30/production-after.json).

The revised optional-Rovo processing/retention policy was personally approved, published at the existing public URL and anonymously matched to approved bytes. Marketplace was not redeployed. The original public demo and submitted Devpost entry are preserved. A new owner-approved [2:53 Jira + Rovo demo](https://youtu.be/KNKdnH8N6kw) is now public, with actual public playback and manual English captions verified. The later user-requested Devpost update is now verified; see the 31 October update below. No new Jira issues, terms acceptance, paid plan, card, credits purchase or source publication occurred during this addition.

## Public Rovo demo and landing update — 30–31 October 2026

The owner-approved [Jira + Rovo demo](https://youtu.be/KNKdnH8N6kw), titled **LotZero: Rehearse a Recall with Jira + Rovo | Codegeist 2026**, is public on Himanshu Jha's channel `UCMe9HOY01O4CSSaM3JIE4Hg`. Its source is 172.671 seconds, 1920×1440 at 60 fps. It uses edited native captures: retained core footage from judge 2.4.0 with unchanged engine, and new Rovo footage from verified production 2.5.0. Synthetic data, synthetic narration and editing are disclosed. One new 489-character Deepgram Aura-2 Thalia request narrates the Rovo chapter; all retained narration was matched to prior Deepgram receipts. No system voice or other TTS provider was used. The original public video remains live.

Publication settings: public, not made for kids, no paid promotion, Standard YouTube license, English language, synthetic-content disclosure Yes. The uploaded manual English SRT was separately published, then explicitly selected over the auto-generated track in the public player. Actual playback advanced to the Rovo chapter at 1:50 with its matching caption visible. Playback was muted for this check; this is not a full listening audit. Anonymous metadata confirms the title/channel; the public description shows the Deepgram, synthetic-record and production-version disclosures and approved landing/privacy links. [Playback receipt](../evidence/rovo-2026-10-30/youtube-public-playback.json), [description receipt](../evidence/rovo-2026-10-30/youtube-public-description.json), [recording receipt](../demo/rovo-update/recording-receipt.json), [native screenshot](../../ui-evidence/rovo-2026-10-30/youtube-public-rovo-captions.png).

The approved existing [landing page](https://lotzero-recall.vercel.app/) and [support page](https://lotzero-recall.vercel.app/support.html) now link to that new video. Only the two demo links and walkthrough label changed. Deployment `dpl_5r3gtMdw8zTSzkEym1Gpb3N4sETq` is READY in the existing production project. Both landing browser tests passed in 9.3 seconds, covering interactive sample behavior, keyboard access, mobile, reduced motion and automated accessibility. Five public assets returned HTTP 200 and matched local bytes. A native click on the support-page walkthrough reached the correct public video. [Landing receipt](../../lotzero-site/evidence/rovo-demo-2026-10-31/public-readback.json).

No Devpost fields or bonus selections were changed by this pass. The [submission handoff](ROVO_RELEASE_HANDOFF.md) provides the released video and product-story copy to the separate submission owner. Marketplace remains an unsubmitted review draft. No new issues, paid changes, credit purchase, card, commit or push accompanied publication.

## 31 October 2026 IST — existing Devpost entry updated

The user explicitly requested the pending entry update. Existing project **1518613 / lotzero** was updated to version **4**. The public page shows the Rovo product-story section, eight semantic story headings, the `atlassian-rovo` technology tag and embedded new demo **KNKdnH8N6kw**. The existing Codegeist submission **1273039** remains **Submitted**; Devpost preserved its original submission timestamp rather than creating a new entry. Native form readback shows **5/5 steps done**, **Apps for Specialized Industries**, and **Best Agents - Rovo/Assignable agents**. Testing instructions, technology explanation and AI-use disclosure now cover the deployed read-only analyst, tenant prerequisite and new demo. Earlier personal eligibility/survey answers, installation URL, photos and landing link were retained. No Marketplace bonus URL was supplied.

API `get_project` returns rendered plain description text, omitting Markdown heading prefixes; normalized text matches the submitted payload exactly. Native public rendering independently confirms the headings, Rovo section, video and added technology tag. The source app, judge deployment and original public video were not changed for this entry update. No new agreement, issue, charge, source-code publication, commit or push occurred. [Update receipt](../evidence/devpost-rovo-update-2026-10-31/receipt.json), [native entry readback](../evidence/devpost-rovo-update-2026-10-31/native-entry-readback.json), [public screenshot](../../ui-evidence/rovo-2026-10-30/devpost-rovo-updated.png).

## 4 November 2026 IST — interactive web release and entry refresh

The [landing page](https://lotzero-recall.vercel.app/) and [browser workspace](https://lotzero-recall.vercel.app/app/) now provide the redesigned interactive journey. The web release passed 119 unit/integration and 16 browser cases, followed by a 5-case landing rerun; the actual published sample, evidence inspection, hypothetical hold and report save/reload were exercised. A design report, not kept on this branch, distinguishes this released browser experience from the Forge UI candidate, whose native deployment remains blocked by expired CLI authentication.

Devpost project **1518613** is now version **5**. Its product story adds a guided browser rehearsal and a direct workspace link. Two clearly captioned web screenshots were appended to the three existing native Jira captures. Both new images loaded in the public gallery, and the story link opened the live application with its sample action available. The API's rendered text matches the prepared copy after Markdown normalization.

Submission **1273039** remains **Submitted**, **5/5 steps done**, with the original submission timestamp, installation URL, native testing instructions, technology explanation, AI disclosure, video, Specialized Industries category and Best Agents selection preserved. No new Forge deployment, Jira issue, Rovo prompt, narration, terms acceptance, commit or push accompanied this entry refresh. [Update receipt](../evidence/devpost-web-update-2026-11-04/receipt.json), [native field readback](../evidence/devpost-web-update-2026-11-04/additional-info-readback.json), [public story screenshot](../evidence/devpost-web-update-2026-11-04/public-story.png).

## 4 November 2026 IST — trace workbench refinement

The browser workspace now supports source-scoped record search, highlighted paths, map fitting and an anchored **Selected path** view. Mobile users can move directly to the selected evidence heading. Existing low-contrast entrance fades and navigation color transitions were repaired while retaining brief movement and reduced-motion behavior. All **119 unit/integration tests, 13 workspace browser cases and five landing cases** pass. The initial 11-pass / 2-fail accessibility result is preserved beside the passing report. No test assertions were relaxed.

Production **dpl_2dGfRjUfHwnetbxBEnN5DcvYhbBS** is READY; all 13 public assets match tested local bytes. Native public desktop and mobile journeys verified search, the stable supporting path, saved-rehearsal reopening and evidence focus. The current source fingerprint is **aa71d7e431d47cc8370f1c00116ec740d61b8e06d8341d18c3ad09254f1a6008**. Backend sources, scopes and dependency manifests are unchanged.

Devpost version **6** includes the improved guided path and a sixth gallery image: a clearly labelled browser capture. Submission **1273039** remains **Submitted**, **5/5 complete**, with the original installation URL, native testing instructions, Specialized Industries and Best Agents selections preserved. The Jira-hosted UI candidate still requires personal CLI credential renewal; this refinement did not deploy Forge, create Jira issues, send Rovo prompts, generate narration, accept terms, change plans, commit or push. [Release receipt](../../ui-evidence/trace-2026-11-04/release-receipt.json), [public interface](../../ui-evidence/trace-2026-11-04/public-selected-path.png), [mobile evidence](../../ui-evidence/trace-2026-11-04/public-mobile-evidence.png).
