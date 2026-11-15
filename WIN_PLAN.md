# LotZero judged-release improvement plan

**Prepared 15 November 2026. Status: local implementation delivered; full Forge lint and hosted release gates remain open. No deployment or public change authorized.**

Audience: a plant quality lead rehearsing a traceability incident, and a judge installing LotZero on an unfamiliar Jira site. Outcome: one coherent Forge release that makes its first finding quickly, explains FAIL versus UNKNOWN with evidence, saves a reproducible rehearsal, and creates a Jira task only after deliberate approval.

This document responds to the proposed work in `LOTZERO_BEST_PROMPT.md`. The attachment is planning input, not authorization for its later deployment, commit or instruction-file operations. The initial step wrote this plan only. The user subsequently approved local implementation while preserving production and the live demo. See the local verification handoff for implementation status; no hosted action is included.

## Rules and success criteria

Rechecked the [official rules](https://codegeist2026.devpost.com/rules) and [event page](https://codegeist2026.devpost.com/) on 15 November:

- Deadline: **22 December 2026, noon Pacific / 23 December, 01:30 IST**.
- A Forge app must integrate with an Atlassian product/capability. Judges need an installation link and complete setup instructions; depicted behavior must work in their environment.
- A public YouTube demonstration should run under five minutes and show the actual product. Our proposed cut is 2:30–3:00 with captions.
- The five equal criteria are Technological Implementation, Design, Potential Impact, Innovation/Idea and Presentation. Best Agents permits a Forge `rovo:agent`; LotZero already declares one. This proposal retains Specialized Industries plus Best Agents, with no other bonus claim.
- Submission changes close with the submission period. The owner will review the final form and retain Submitted status before the cutoff.

Acceptance: a fresh project reaches an inspectable sample finding within a **60-second target after opening the installed app**; existing saved inputs and Jira receipts still read correctly; denied users cannot read/write project data; agent explanations identify their exact saved evidence and refuse unsupported claims. Installation time and Rovo availability are separate measurements. None of these proposed targets is already measured by this plan.

## Baseline and corrections to the attachment

| Observed locally | Implication |
|---|---|
| README/evidence record judge production **2.5.0** and development **2.7.0**. These are historical deployment records, not a fresh hosted readback. | Verify environment identities and versions before implementation/deployment. Never infer hosted state from local source. |
| The production source receipt identifies revision `09a23d6b356e1dd18123fea739df548507a201b04cf3f1092dc3acf7765fa764`. All 41 listed paths still exist; nine now differ, including the manifest, UI, application hook and package metadata. | A hash comparison is available; complete original release bytes are not established. Reconstruct an auditable diff before claiming an exact production/development comparison. |
| Current manifest includes MCP, its action/function, the original Rovo action, a Jira project page and the existing three scopes. | Do not promote this directory wholesale. Prepare a separate judge candidate manifest that excludes MCP and Marketplace privacy registration. Preserve development research. |
| React/Vite **Custom UI** is served from `static/lotzero-ui/dist`; `layout: native` is project-page chrome, not UI Kit. | Polish the existing application. Do not migrate frameworks to satisfy the attachment's “UI Kit” wording. See [project-page reference](https://developer.atlassian.com/platform/forge/manifest-reference/modules/jira-project-page/). |
| Sample launch, a report, path inspection, status styling and Rovo handoff already exist. `seedLocked` refuses any existing dataset. | Extend the working journey. Make repeated sample requests harmless without replacing imported or modified data; preserve project-admin requirements. |
| Import limits are 200 KB, 1,000 nodes and 3,000 edges; saved records have a 230 KB guard. | A 5,000+ record stress test must distinguish a core-engine experiment from accepted imports. Keep current limits unless a separately justified capacity change passes. |
| Existing tests already cover denied access, graph cycles, malformed inputs and Jira retries. | Add missing regressions, realistic combinations and live acceptance evidence; do not duplicate tests merely to increase the count. |
| The data does not establish evidence-retrieval duration or a real four-hour recall capability. | Show a blocking evidence chain and “Timing not measured” where appropriate. Do not manufacture a slowest link, deadline prediction or safety conclusion. |
| No Git repository is present here. Two local curated source candidates exist. | Do not initialize Git or commit from the attachment's instruction. Repository creation, visibility, commits and pushes need the user's explicit request. |

The [6 November handoff](docs/PRODUCTIZATION_VERIFICATION_2026-11-06.md) records 208 tests per source tree, 13 browser cases, builds and Forge lint. Its recorded changed-source hashes still match on 15 November. **Tests were not rerun for this plan.** Hosted privacy, new onboarding, denied-user native testing and customer validation remain distinct gaps. The [dependency audit](docs/DEPENDENCY_REVIEW_2026-11-06.md) is also historical: six moderate production advisories, 43 total including five critical tooling package entries; refresh before deciding fixes.

## Proposed changes, in order

Paths below are relative to this app directory. Existing files are extended; new files are named explicitly. Start with a complete source/test/docs inventory and a documented API-to-official-contract map for the paths actually changed. Do not claim that every API or every document has already been audited.

| Change | Criterion | Files expected to change | Main risk and required proof |
|---|---|---|---|
| **0. Establish release baseline and dependency gate.** Compare recoverable production files, current source, scopes/modules and storage contracts. Refresh advisories and propose supported fixes; leave uncertain upgrades separate. | Technological Implementation | New `docs/JUDGED_RELEASE_DIFF.md`; `docs/DEPENDENCY_REVIEW_2026-11-06.md`; `package.json` / lockfile only for justified fixes. | Incomplete baseline or incompatible toolchain. Record missing release bytes; clean-install on supported Node, then types/tests/build/lint. No forced audit fix. |
| **1. One judge candidate.** Create an explicit export mode that removes `rovo:mcp`, its dedicated action/function and all Marketplace-only triggers/scopes from the judge candidate, retaining the original GET analyst. Record the chosen artifact/hash. | Technological Implementation, Presentation | `scripts/prepare-source.mjs`, `tests/integration/source-export.test.ts`, `tests/integration/rovo-handler.test.ts`; new `CHANGELOG.md`, initial `RELEASE_CHECK.md`. Preserve the working `manifest.yml` until candidate review. | Shipping a dormant or unintended surface. Assert the candidate's exact module/scope allowlist, correct existing judge identity and complete handler/resource references; build then full lint. Record Forge's assigned version rather than inventing one from `package.json`. |
| **2. Safe first run.** Label the Northstar sample as synthetic; add a short three-step guide: load/run → inspect a counterexample → save/review follow-up. Make repeat sample loading return existing matching sample state, never overwrite other data or silently reset a rehearsal. | Design, Presentation | `src/services/application.ts`, `src/index.ts` if resolver shape changes; `src/contracts.ts`; `static/lotzero-ui/src/App.tsx`, `client.ts`; `tests/integration/application.test.ts`, `tests/e2e/journey.spec.ts`. | Data loss, duplicate audit/save actions, accidental privilege bypass. Test empty project, double-click/concurrent load, matching sample, imported data, ordinary member and denied user. Measure the 60-second target in native Jira after installation. |
| **3. Complete result and recovery UI.** Consolidate actual lots traced, assertion counts, blocking evidence and open/created/uncertain actions. Keep the first counterexample beside its assertion. Add clear permission, storage, conflict and Rovo fallback actions. | Design, Presentation | `App.tsx`, `components/Primitives.tsx`, `Impact.tsx`, `AnalystHandoff.tsx`; relevant `styles/*.css`; new `src/scenarios/summary.ts` and its unit tests; existing browser specs. | Misleading aggregation or destructive “retry.” Derive counts from the run/receipts; preserve uncertain claims; do not compute “slowest” from record timestamps. Verify desktop/mobile, keyboard, status announcements, contrast, reduced motion and trace labels. |
| **4. Stronger evidence-grounded analyst.** Tighten questions/answers around UNKNOWN, missing evidence, saved interventions and task proposals. Reuse `view=assertions` plus `assertionId`; a second action is unnecessary unless an evaluation exposes a real gap. | Technological Implementation, Innovation/Idea, Best Agents | The judge candidate agent prompt; `src/rovo/analyst.ts`, `src/rovo.ts` only if needed; `components/AnalystHandoff.tsx`; new `evals/rovo/cases.json`, `evals/rovo/README.md`, `tests/integration/rovo-evals.test.ts`; existing analyst tests. | Fluent unsupported answers, wrong revision, injection, partial-page claims. Require assertion/record/evidence IDs, checked populations and explicit limits. Task lists stay read-only drafts; no new write tool. Core evaluations and actual model evaluations must be reported separately. |
| **5. Compatibility, failure and scale evidence.** Add a sanitized old-snapshot fixture, maximum-supported imports and 5,000+ record engine stress/rejection cases. Retain original claims, issue markers and receipts. Prefer no storage migration. | Technological Implementation | New `fixtures/compatibility/production-2.5.0.json` after trustworthy reconstruction; affected application/analyst/engine tests; `scripts/benchmark.ts`, `docs/BENCHMARKS.md`, `docs/ARCHITECTURE.md`, `docs/SECURITY.md`. | A changed result invalidates old saved reports/revisions. Reopen/recompute historical fixtures; test safe failure and retry/reconciliation. Report timing with machine, input counts and repetitions. Oversize input must reject safely; no unsupported capacity claim. |
| **6. Honest impact and entry story.** Describe the quality lead's rehearsal, evidence gaps and approved follow-up. Distinguish Forge installation from the no-account browser preview. Reuse the existing architecture and Cardboard plan. | Potential Impact, Innovation/Idea, Presentation | New `IMPACT.md`, `DEVPOST_UPDATE.md`, `VIDEO_SHOTLIST.md`, `SUBMISSION_RECHECK.md`; update `README.md`, `docs/ARCHITECTURE.md`, `docs/DEMO_PLAN_CARDBOARD.md`. | Invented impact or inconsistent surfaces. Source factual industry claims; qualify weekly rehearsal as a proposed cadence, not a universal rule. Keep unresolved citations out of public-ready copy. No customers, pilots, metrics, certifications or extra bonus claims. |
| **7. Final owner handoff.** Freeze the judge artifact, final fresh-site checklist, recovery notes and exact owner-run promotion instructions. | All five | Final `RELEASE_CHECK.md`, `CHANGELOG.md`, README and release evidence. | Version drift between video, link and build. Require matching manifest/source/build receipt and green acceptance gates; owner performs production promotion and submission edits. |

## Rovo evaluation contract

At least 18 scripted cases: UNKNOWN lots and reasons; SHIP-002 destination failure; one assertion's counterexamples; evidence-backed task proposals; a four-hour question with insufficient timing; saved quarantine versus historical shipments; wrong revision; missing report; expired report; denied project; spoofed identity; write request; injected record instructions; malformed payload; truncated/paginated results; incompatible units; absent Rovo; and changed current data versus immutable saved inputs.

Each case records the fixture/request, expected result IDs or refusal, forbidden claims and allowed tool count. Deterministic evaluations establish retrieval and evidence contracts; they do **not** establish model answer quality. Any later native Rovo trial needs a concrete included-access/prompt allowance. Existing historical prompt approvals are not an unlimited new allowance.

## Validation and rollout gates

After approval, local checks use the repository's supported Node and existing scripts: typecheck, unit/integration tests, Forge-transport build and full Forge lint. Browser checks exercise the same candidate at desktop/mobile sizes, including keyboard and reduced motion. Tests belong to the changed behavior, with old failures separated from regressions.

The eventual fresh-site script covers: current sharing link → scope consent → empty project → sample load/repeat → trace → FAIL/UNKNOWN counterexample → simulation → save/reopen → read-only Rovo question or clear unavailability fallback → exact task preview/approval → one Jira Task and duplicate-free retry → denied-user and cross-project checks. Any live Jira write/new access grant needs the applicable approval; reading a checklist does not grant it.

Development deployment/tunnel steps are **proposed only**, explicitly selecting the existing judge development environment after local gates and a reviewed artifact. No implicit default environment, no check bypass, no new scope without review. After each development increment, run the native sample/save/reopen regression and record actual results. The [Forge deploy reference](https://developer.atlassian.com/platform/forge/cli-reference/deploy/) documents environment selection and independently assigned app versions; final owner commands must be checked against the installed CLI and actual candidate. No production command is executed by this plan.

Freeze these boundaries throughout:

- No production deployment/install, sharing/distribution change, public-site deployment, Marketplace submission, Devpost edit or YouTube change.
- Keep MCP and privacy development work available separately; no MCP, Teamwork Graph or Marketplace bonus claim. No Confluence expansion or extra integration sprint.
- Preserve core use without Rovo. No new external AI service or paid plan. Existing free/included access must be verified, not assumed to guarantee zero cost.
- Review account-data lifecycle obligations before a wider release. The separate development privacy worker is not evidence of hosted compliance; do not make a blanket “no personal data” claim because business records are synthetic.
- No recording now. Later capture the actual owner-promoted production build through browser/computer use, edit in Cardboard, and produce 2:30–3:00 with captions. Verify `cb`/MCP availability before that session. Generated narration is **Deepgram only**, with credentials/credits checked first. Preserve the current public cut.
- Do not edit global/local `AGENTS.md`, create a repository, choose a license or commit from this attachment. The user's current instructions already govern those actions.

## Milestones to the deadline

These are proposed work windows, respecting LotZero's lower priority this week—not promises of completed hosted work.

| Window (IST) | Reviewable outcome |
|---|---|
| **15–20 November** | Plan approval, trustworthy release comparison, dependency decisions and one isolated judge candidate. |
| **21–29 November** | Sample-first journey, recovery states, run-derived summary and rendered accessibility review. |
| **30 November–6 December** | Evidence-grounded analyst cases, compatibility/scale checks and permitted development verification. |
| **7–13 December** | Fresh-site acceptance, frozen release candidate, impact/submission drafts and final owner checklist. |
| **14–18 December** | Owner-controlled production decision; only afterward, separately approved capture/Cardboard edit and caption review. |
| **19–21 December** | Owner rechecks installed behavior, link/video/form consistency and Submitted status; retain buffer before **23 December 01:30 IST**. |

**Authorization update:** local implementation only is approved. Development/production deployment, access grants, recording, commits and public changes remain outside that approval. The owner release checklist preserves the remaining hosted gates.
