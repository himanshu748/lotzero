# Devpost submission — submitted Codegeist entry

Event: [Codegeist 2026](https://codegeist2026.devpost.com/) · [Rules](https://codegeist2026.devpost.com/rules)

Field inventory refreshed for Devpost event **31572** on **30 October 2026** via authenticated tools. Deadline: **23 December 2026 at 01:30 IST** (22 December, 20:00 UTC).

The [LotZero entry](https://devpost.com/software/lotzero) is **Submitted** to Codegeist 2026: project **1518613**, submission **1273039**, at **21:05 IST on 30 October 2026** (`2026-10-30T11:35:24.218-04:00`). Devpost returned **Submitted**, and the public project page shows **SUBMITTED TO** Codegeist and **Edit hackathon submission**. The owner approved final submission and the required declarations/rules/terms. See the [submission receipt](../evidence/devpost-submission-receipt.json).

The submitted narrative is the [product-story write-up](../devpost-final-writeup.md), not the historical engineering-oriented draft below. The entry includes the [2:55 public Deepgram walkthrough](https://youtu.be/nsw-z9XYY1g), exact tested judge-install URL, three native Jira screenshots and a banner thumbnail. Its main category is **Apps for Specialized Industries**. Marketplace bonus fields were omitted because no actual Marketplace review ticket or listing exists. The [interactive marketing page](https://lotzero-recall.vercel.app/) is public; a new support guide and footer links currently exist only in local source.

## Project title and pitch

**LotZero**

**Rehearse the recall. Find the gaps before they matter.**

LotZero is a recall-readiness rehearsal tool for food-manufacturing quality teams. It treats traceability records as something a team can test: select an ingredient lot, follow documented downstream associations, inspect failed or unknown assertions, and review evidence-backed Jira follow-up tasks.

## Historical story draft — retained planning context

The following draft predates the owner's request for a product story. It is preserved as planning context and is **not the current public narrative**; use [devpost-final-writeup.md](../devpost-final-writeup.md).

### Inspiration

A mock recall is only as convincing as the records and decisions supporting it. A task board can track an investigation, but the team still needs to reason about ingredient genealogy, split batches, missing destinations and past shipments. We wanted that reasoning to be repeatable and inspectable.

### What it does

The installed Forge demonstration follows synthetic lot ING-A19 to 3 product lots, 4 shipments, 9 evidence gaps and 12 unresolved records. It exposes record-level counterexamples and lets a user explore hypothetical controls. Quarantining WH-NORTH with EV-DRILL preserves historical SHIP-001 and marks SHIP-002 as potentially preventable. Saved drill `fc3171c3-c41a-4e6f-a886-57639b2413f2` survives reload. Explicit approval created the SHIP-002 missing-destination Task [LZR-1](https://one-atlas-obka.atlassian.net/browse/LZR-1), whose returned Forge link opened the actual issue. A guarded same-action retry returned the original LZR-1 receipt and independent Jira marker search showed 1 of 1. Native JSON/Markdown/CSV export text and exact clipboard contents are verified. A fresh installation through the public judge link began empty, reproduced the synthetic result and reopened its own saved snapshot without the original LZR-1 receipt; no Jira issue was created there. These are synthetic-data observations, not a real recall or customer-validation claim.

### How it is built

LotZero runs as an Atlassian Forge Jira project-page Custom UI, using TypeScript/React, a pure deterministic graph/scenario engine, validated record boundaries, Forge-hosted KVS and Forge-supported Jira APIs. The core has no dependency on an AI provider. Production judge 2.4.0 and Marketplace 2.2.0, native save/reload and the LZR-1 receipt are separate from the local 73 unit/integration, 9 application browser and 2 landing-page browser test results.

### Challenges and decisions

Incomplete genealogy cannot be treated as proof that a lot is unaffected. Split/merge paths must not count shipments twice. Units must remain compatible. Historical exposure and hypothetical future controls must remain distinct. Jira retries need an auditable outcome, especially after a partial failure. These are the behaviors to demonstrate and test.

### What is distinctive

Recall rehearsal, CAPA and traceability already exist in established products. LotZero's focus is the combination of executable ingredient-to-shipment assertions, explicit uncertainty and counterexamples, reproducible versions, time-aware simulated controls and human-approved Jira follow-up in one narrow workflow. We do not claim global novelty.

### What we learned / next steps

Live deployment exposed a TypeScript emit configuration issue that a local no-emit typecheck did not reveal; the Forge build configuration was corrected and the app deployed. Native Jira review also motivated defaulting to the originating permitted project with zero actions preselected. The owner should add their own learning before submission. Customer workflow studies, manufacturing-system integrations and domain validation remain future work. This is not regulatory certification, product-safety advice or an operational recall system.

## Exact custom-field inventory and submitted values

This preserves the original field inventory while recording the actual answers sent. The [final payload](../evidence/devpost-submission-payload.json) is the exact machine-readable field record; prior draft notes remain historical preparation.

| ID | Field | Required | Submitted value / preparation context |
|---|---|---|---|
| 29385 | Submitter Type | Yes | **Individual**, explicitly confirmed by the owner. |
| 29386 | Submitter Country of Residence | Yes | **India**, explicitly confirmed by the owner. |
| 29387 | Canadian province, if applicable | Yes | **N/A**; owner confirmed India. |
| 29388 | Organization Name | Yes | **N/A**; owner confirmed Individual. |
| 29390 | Project start date | Yes | **2026-10-28**; new work after 27 October personally confirmed. |
| 29389 | New or existing before 27 October 2026 | Yes | **New**, personally confirmed by the owner. |
| 29391 | Earlier work and changes, if existing | No | Omitted; owner confirmed New. |
| 29392 | Judge installation URL | Yes | Submitted the exact enabled URL in [`evidence/judge-installation-url.txt`](../evidence/judge-installation-url.txt); [link and test scope](INSTALLATION.md). |
| 29393 | Testing instructions/credentials | No | Submitted explicit synthetic onboarding, fixed clock, evidence, intervention, optional approved Jira Task, save/reload and export-fallback instructions. Exact text is in the payload; no credentials required. |
| 29394 | App ID from Developer Console | Yes | `f2443992-e1df-4ee4-b6ee-50abce811c9b` |
| 29395 | Main technology requirement explanation | Yes | Submitted the Forge/Jira implementation explanation in the payload; the technical notes below preserve the evidence boundary. |
| 29396 | Category | Yes | Apps for Specialized Industries. |
| 29397 | Why this track | Yes | “Food-manufacturing quality teams need to rehearse ingredient-lot incidents across production transformations and shipments. LotZero tests traceability evidence and converts observed gaps into reviewed follow-up work in Jira.” |
| 29398 | Bonus prize | No | **Omitted**; no Marketplace bonus claimed. |
| 29399 | Marketplace bonus URL | No | **Omitted**; no real listing or submitted review-ticket URL exists. |
| 29447 | Forge experience | Yes | Submitted evidence-backed Forge experience: typed boundary, KVS persistence, CLI emit configuration repair, native project defaults and separate distribution identities. Owner approved final submission; exact text is in the payload. |
| 29448 | AI tools used | Yes | Submitted disclosure of OpenAI Codex assistance, Deepgram Aura-2 Thalia demo narration and interrupted Local Codex generation followed by local authoring/manual import. No AI dependency claimed for the product engine. |
| 29449 | Skills/knowledge gained | Yes | **Significantly**, personally selected by the owner. |
| 29450 | Likelihood of future Forge/Atlassian use | Yes | **Very likely**, personally selected by the owner. |
| 29451 | Age declaration | Yes | **True**, personally affirmed by the owner before submission. |
| 29452 | Eligible jurisdiction declaration | Yes | **True**, personally affirmed by the owner before submission. |
| 29453 | Employee/representative/agent declaration | Yes | **True**, personally affirmed by the owner before submission. |

The current form also requires the standard project information and video. Connector deliverables: video required; standalone website and ZIP not required. The official event specifies a public YouTube video under five minutes. Use the [verified public video](https://youtu.be/nsw-z9XYY1g), 174.788 seconds (2:55), with Deepgram Aura-2 Thalia narration and captions. It shows edited actual native Jira captures and discloses synthetic narration. Anonymous metadata and real public playback are recorded in the [metadata](../evidence/youtube-public-metadata.json) and [playback receipts](../evidence/youtube-public-playback.json). The old private Samantha draft is superseded and must not be used as the submission URL.

## Technology preparation notes and evidence boundary

“LotZero runs on Atlassian Forge as a Jira project-page application. Its Custom UI invokes Forge resolvers, which validate requests and persist drill records in Forge-hosted storage. A deterministic TypeScript engine evaluates synthetic or imported lot relationships and readiness assertions. The integration reads permitted Jira project metadata and creates explicitly approved, simulated-drill follow-up issues with supporting evidence. Returned issue keys are stored for traceability and retry handling.”

Production native storage/save/reload and one explicitly approved issue are verified. Guarded receipt retry returned the original issue key and an independent marker search showed one issue. Native text exports and exact OS-paste clipboard contents are verified; automatic native downloads are not. The public sharing-link onboarding path passed on an independent site. This is basic data-separation evidence under one owner account; permission-denial/cross-user, adversarial tenant isolation and provider expiry/deletion tests remain separate. Reconcile the latest engineering report before use.

## Judge testing instructions — preparation notes

1. As administrator, use the actual judge-edition sharing link in `INSTALLATION.md` and install on your own Jira test site. Its exact sharing-link installation and onboarding passed on the independent lotzero-judge-verify.atlassian.net site; see the [receipt](../evidence/judge-second-site-verification.json). The original private verification site expires 26 January 2027 and is not the sole judging-access route.
2. Open a permitted Jira project, then LotZero. Load the clearly labeled synthetic dataset.
3. Start a drill with ING-A19 and the documented fixture scenario clock/hazard.
4. Inspect a downstream lot and shipment evidence chain. Open a failed or unknown readiness assertion and its supporting records.
5. Simulate a warehouse quarantine/future hold. Confirm historically shipped records remain.
6. Preview proposed response issues. The originating permitted project defaults with no actions selected. Choose Task and the SHIP-002 destination suggestion, explicitly approve, then inspect the actual returned Jira issue link. This one-Task flow was exercised in LZR; do not create operational recall tasks.
7. Export the drill report. Confirm its dataset version, source lot, uncertainty and approved issue keys match the UI.
8. Rerun against a corrected dataset version where supported and inspect the regression comparison.

Do not include untested steps in final instructions. The app uses synthetic information; no real customer notices or shipment holds should occur. Jira follow-up issues persist independently and should be managed in the judge's test project.

## Submission evidence

| Evidence | Status |
|---|---|
| Actual judge app ID and production version | Registered/deployed `f2443992-e1df-4ee4-b6ee-50abce811c9b`, production 2.4.0; separate Marketplace production 2.2.0 |
| Judge installation link | Actual signed public sharing-link install and all 12 onboarding/trace/save/reload steps passed on the independent KAN site; [receipt](../evidence/judge-second-site-verification.json) |
| Live Jira integration receipt | Private [LZR-1](https://one-atlas-obka.atlassian.net/browse/LZR-1), SHIP-002 missing destination, saved drill above; native router opened actual issue |
| Tests and benchmarks | 73 unit/integration, 9 app browser and 2 landing browser tests pass; strict production build pass; see actual receipts and benchmark scope |
| Public website | [lotzero-recall.vercel.app](https://lotzero-recall.vercel.app/), published and verified; not a substitute for video |
| Public YouTube URL and duration | [Published native walkthrough](https://youtu.be/nsw-z9XYY1g), 174.788 seconds (2:55), Deepgram Aura-2 Thalia narration only. Anonymous metadata and real playback with captions verified; [receipt](../evidence/youtube-public-playback.json). |
| Marketplace listing/review-ticket URL | Missing; [validated draft package](../marketplace-package/README.md) prepared, not submitted |
| Owner eligibility/rules agreement | Personally affirmed age, eligible jurisdiction and nonemployee declarations, Codegeist rules and Devpost terms; final submission approved |
| Final submitted Devpost URL/receipt | [LotZero](https://devpost.com/software/lotzero), submission **1273039**, **Submitted** at **21:05 IST on 30 October 2026**; [receipt](../evidence/devpost-submission-receipt.json) |

## Rubric evidence map

| Criterion | Evidence to show |
|---|---|
| Implementation — 20% | Real Forge entry point, persistent drill, authorized Jira issue, deterministic fixtures and error handling |
| Design — 20% | Complete task flow, meaningful unknown/error states, readable evidence and accessible alternatives |
| Potential impact — 20% | Specific quality-team workflow and observable record gaps; no invented savings/customer validation |
| Innovation — 20% | Executable lot-graph assertions, counterexamples and version comparison; bounded competitor comparison |
| Presentation — 20% | A real end-to-end demonstration before three minutes, public video, working judge access |

## Current scope

The main Codegeist entry is submitted. Marketplace portal draft **106576423** exists under vendor **613592504** for the separate production 2.2.0 app, but no review submission or public listing exists. Personal-data storage is Yes; the Personal Data Reporting API confirmation is explicitly unchecked pending resolution. These are separate from the main entry and do not establish the Marketplace bonus. No new application code, tests or Forge deployment were included in this documentation/submission update.
