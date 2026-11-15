# LotZero: Codegeist audit and delivery plan

Checked **5 November 2026**. This is a source-discovery, requirements and planning pass. The intended reader is the owner preparing the existing submitted product for judges. The outcome is a dependable installation, a complete recall-rehearsal journey and a clear demonstration. Acceptance for this pass: identify the code and live-source relationship, check official requirements, separate demonstrated capabilities from gaps, schedule the remaining work and prepare a Cardboard edit brief. No application code, Git repository, recording, deployment or public content was created or changed.

**Product-direction update, 6 November:** the owner now prioritizes a free-first Jira Marketplace product, install-and-go onboarding and 3–5 real pilot teams. The [Marketplace product plan](MARKETPLACE_PRODUCT_PLAN.md) supersedes this audit's recommendation to defer Marketplace work solely because of bonus selection. The rules, dated evidence, existing submission and public-action approval boundaries below remain intact; no bonus selection has changed.

## Code found before creating this report

| Surface | Finding | Evidence and limits |
|---|---|---|
| Forge application | `outputs/lotzero` in the existing `files-pasted-by-the-user-master` workspace. Contains 22 backend TypeScript files, React UI, manifest, fixtures, tests, documentation and prior media. | [Manifest](../manifest.yml), [package scripts](../package.json), [engine](../src/graph/engine.ts), [Jira integration](../src/integrations/jira.ts), [Rovo reader](../src/rovo.ts), [MCP wrapper](../src/mcp.ts). |
| Landing page and browser edition | Sibling `outputs/lotzero-site`. The browser app is built from the Forge app's React/TypeScript source with a different transport. | [Landing source](../../lotzero-site/index.html), [browser build command](../package.json), [Vite mode](../vite.config.ts). All **13 live public assets** returned HTTP 200 and matched local SHA-256 hashes in this audit. |
| Hosting | Existing Vercel project **lotzero-recall**, project `prj_IKSgmURZFr0PCBH7RjZz2YErQBP1`; production deployment `dpl_2dGfRjUfHwnetbxBEnN5DcvYhbBS` is READY. | Vercel project/deployment readback. Its returned metadata contains no Git source or commit; it does not establish a GitHub origin. Public [landing](https://lotzero-recall.vercel.app/) and [workspace](https://lotzero-recall.vercel.app/app/) also loaded in the browser. |
| Local Git | The app and workspace are **not in a Git worktree**. | `git rev-parse --show-toplevel` returned no repository. No remote name is invented. |
| GitHub | **No LotZero repository identified** under `himanshu748`. | Connected search found none; the first inventory page returned 100 repositories and the second failed in transport. Existing authenticated `gh` completed a **161-repository** inventory. No relevant name/description match; owner-scoped `LotZero` code search returned zero. This does not exclude unindexed content, another branch, another owner or a differently described repository. |
| Other local folders | The bounded search found this same app, without a second candidate. | Inspected 953 candidate locations: Codex date/task/`outputs/lotzero`, plus immediate children of Documents/ChatGPT, Desktop and Downloads. A broad recursive search was stopped; this is not an exhaustive disk search. |
| Existing submission | Live project **1518613**, published at [devpost.com/software/lotzero](https://devpost.com/software/lotzero), with Codegeist `submitted_at` present. | Fresh Devpost `get_project` read, not just a local draft. The API reads the editable project, not a frozen judging snapshot. It does not expose the saved custom answers. |
| Existing video | Public project points to [the Jira + Rovo demo](https://www.youtube.com/watch?v=KNKdnH8N6kw). Local master and captions exist. | [Master](../demo/rovo-update/lotzero-production-rovo-walkthrough.mp4) is **172.670 seconds**, H.264/AAC, 1920×1440 by fresh `ffprobe`; [SRT](../demo/rovo-update/captions.srt) exists. No new playback certification or recording is claimed. |

The full application path is `/Users/himanshujha/Documents/Codex/2026-10-28/files-pasted-by-the-user-master/outputs/lotzero`. The confirmed frontend source is its `../lotzero-site` sibling. **Preserve these; do not scaffold a replacement.** A new private remote or source commit can be proposed separately, with a scoped secret/privacy review and the owner's explicit permission. A public repository is not a core requirement in the current rules/form.

## Current official requirements

Read live through the Devpost connector on 5 November: overview, rules, judging criteria, dates, submission fields, announcements and the existing project. No announcements were returned. [Official rules](https://codegeist2026.devpost.com/rules) and [event requirements](https://codegeist2026.devpost.com/#challenge-requirements) remain authoritative; recheck them before any final edit.

- **Deadline:** 22 December 2026, 20:00 UTC = **23 December 2026, 01:30 IST**. Plan to finish on 22 December. The connector's configured start is 16:15 UTC on 27 October, whereas the formal rules say 09:00 Pacific, or 16:00 UTC. This start-time discrepancy does not affect the owner's recorded 28 October start; the cutoff agrees.
- **Core technology:** Forge plus at least one named Atlassian product/capability: Jira, Confluence, Jira Service Management, Bitbucket, Teamwork Graph or Rovo. LotZero uses Forge, Jira and Rovo.
- **Access:** a judge-installable Forge app, installation link and sufficient configuration/testing instructions. A browser-only rehearsal or private tenant URL is insufficient on its own.
- **Video:** working product footage, publicly visible on YouTube, under five minutes. Judges need not watch beyond three minutes. Use English, or supply English translations of the video, description and instructions.
- **Submission:** explain the product and required technology; select the category and applicable bonus; complete Devpost's form. Maintain ownership and third-party usage rights. Existing projects must satisfy the rules' permitted Forge-update conditions.
- **Listing:** Marketplace publication is optional for the core entry. Its bonus needs an actual listing URL or Marketplace review-ticket URL; a partner profile, deployed app or private draft does not meet that gate.

### Judging: five equal priorities

The current connector returns a five-point scale and **20% each** for these criteria. The formal rules first screen theme/technology viability, then score the five criteria. The following actions are our interpretation of how to improve the demonstrated product, not additional event requirements.

| Criterion | LotZero's evidence | Highest-value remaining action |
|---|---|---|
| Technological implementation | Deterministic engine; Forge KVS and Jira; approved issue receipts; production Rovo; native development MCP. | Rehearse a judge's fresh installation on the final candidate, including an unavailable-Rovo fallback. Keep permission and revision failures visible. |
| Design | Public landing/workspace; source-scoped search; selected paths; mobile, keyboard and reduced-motion coverage. | Resolve the release gap: current web/development UI versus older judge production. Inspect the exact final Forge build before proposing a production rollout. |
| Potential impact | Specific food-manufacturing quality-team workflow and synthetic counterexamples. | Get a small amount of real practitioner feedback if available through the owner. Report observations honestly; no customer savings or adoption claims exist. |
| Innovation/idea | Executable evidence assertions, preserved UNKNOWN, historical-aware simulations and corrected-record reruns. | Show one broken destination becoming a concrete investigation and a reproducible rerun. Differentiate this mechanism from ordinary mock recalls and CAPA boards. |
| Presentation | Existing 2:53 public Jira + Rovo demonstration and captions. | Create a coherent 2:45 cut around one quality manager's task, showing the actual release and relevant bonus. See the [Cardboard plan](DEMO_PLAN_CARDBOARD.md). |

### Bonus choices

The formal MCP requirement is:

> All Eligible Submissions that’s a Forge app that exposes tools via the Atlassian MCP server using the rovo:mcp module.

The current form exposes **one optional bonus selection**, and the rules permit at most one Grand Prize plus one Bonus Prize per submission. Last recorded native form selection is **Best Agents**; this audit did not reread saved custom answers. Do not change that selection based on a development-only tool.

| Bonus | Current evidence | Recommendation |
|---|---|---|
| Best Agents | Existing production `rovo:agent` and GET reader; retained native verification and public video. | **Primary bonus path.** Recheck on the final candidate with specifically approved prompt usage. |
| Atlassian MCP | Native `rovo:mcp` read verified in development 2.7.0. Production guard disables it; external-client OAuth fails. | Optional stretch only. Time-box investigation; require a reviewed rollout, access/privacy decisions and judge-testable evidence before changing the bonus claim. |
| Teamwork Graph | No ingestion or API consumption implemented. The material-flow graph is LotZero's own graph. | Defer: no demonstrated need justifies another integration in this lower-priority project. |
| Marketplace | Listing copy/assets and private draft are recorded; no review-ticket/listing evidence. | Defer unless the owner elects this bonus over Agents. Do not mistake the published partner profile for a submitted app listing. |

### Submission fields to preserve and verify

The live host schema has **22 custom fields, 18 required**. The project also has the normal name, tagline, product write-up, video, technology and media/link presentation; inspect the actual editor for its current constraints before updating it. This audit reads the field schema, not the current saved custom answers. Earlier form-completion evidence is linked below.

| ID | Field | Current schema obligation |
|---|---|---|
| 29385 | Submitter type | Required: Individual / Team / Organization |
| 29386 | Country of residence | Required; preserve the owner's actual country |
| 29387 | Canadian province | Required; form instructs `N/A` if not applicable |
| 29388 | Organization name | Required; form instructs `N/A` if not applicable |
| 29390 | Project start date | Required; retain the truthful start date |
| 29389 | New or existing before 27 October | Required: New / Existing |
| 29391 | What existed and what changed | Optional in schema; answer if prior work applies |
| 29392 | Judge installation URL | Required |
| 29393 | Testing instructions / necessary credentials | Optional field; formal rules still require sufficient setup instructions. Never expose a personal API token |
| 29394 | Developer Console App ID | Required |
| 29395 | Main technology explanation | Required; describe each actual Atlassian capability |
| 29396 | Main category | Required, single choice |
| 29397 | Why this track | Required |
| 29398 | Bonus prize | Optional, single choice |
| 29399 | Marketplace listing/review URL | Optional; necessary evidence if claiming that bonus |
| 29447 | Personal Forge experience | Required; preserve the owner's account of it |
| 29448 | AI tools used | Required; keep accurate, including assistance/narration actually used |
| 29449 | Skills gained | Required survey |
| 29450 | Future Forge/Atlassian use | Required survey |
| 29451 | Age affirmation | Required personal affirmation |
| 29452 | Eligible jurisdiction affirmation | Required personal affirmation |
| 29453 | Promotion-entity employment exclusion | Required personal affirmation |

The connector marks a video required, and a general website and ZIP upload not required. It does not list a source-repository field. Keep the existing app ID, eligibility/survey answers and submitted state intact; changes need owner approval. A public project page and a submitted entry are separate states; the fresh project read confirms both publication and an existing submission timestamp, not eligibility adjudication or all current custom answers.

## Gap checklist, in priority order

**P0** protects eligibility and a working judge path. **P1** improves scored quality. **P2** is optional stretch. Checked means the named evidence exists; it does not certify everything about that system.

| Priority / status | What exists | Missing or unverified | Observable acceptance / evidence |
|---|---|---|---|
| P0 — source located | Local app and byte-matched public build. | No Git worktree or identified remote; independent source recovery not established. | Owner-approved source preservation/remote decision, without credentials, private evidence dumps or unintended public visibility. [Discovery receipt](../evidence/codegeist-audit-2026-11-05.json). |
| P0 — core implemented | Trace → assertions → hypothetical control → saved report → explicit Jira action review. | Final release-specific judge rehearsal still needed. | Install on a permitted clean test site, load synthetic data, reproduce **3 lots / 4 shipments / 9 gaps / 12 unresolved**, save/reload/export and follow the documented fallback. [Installation guide](INSTALLATION.md), [second-site receipt](../evidence/judge-second-site-verification.json). |
| P0 — install evidence exists | Existing public sharing link and earlier independent-site install. | Fresh check against the chosen final release; private verification site expires **26 January 2027**, before the recorded end of judging on 3 February. | Judge uses their own site through the sharing link; no dependency on our temporary tenant or secret owner login. No fresh install was run in this audit. |
| P0 — release mismatch | Public UI and development 2.7.0 are verified in retained receipts; production remains 2.5.0. | Production lacks the latest UI/MCP candidate. | Decide the exact release, test it in development, inspect native Forge, prepare rollback and request approval for the concrete production change. No promotion now. |
| P0 — tests recorded | **154 unit/integration + 13 browser tests**, types/build/Forge lint passed. | Suites were not rerun in this audit; denied-user and adversarial tenant checks remain unverified live. | Re-run affected checks after implementation changes; use an authorized second account for the real denial case. All seven MCP-owned source/doc files currently match the verified receipt. [Receipt](../evidence/mcp-2026-11-05/verification.json). |
| P0 — submission exists | Live Devpost project, submission timestamp, installation/story/video evidence. | Fresh native read of saved custom fields and final content consistency. | Before approved updates, check all five form steps, installation/app ID, correct category/bonus, AI disclosure and public links; read back persisted results. [Earlier release/entry receipt](../../ui-evidence/trace-2026-11-04/release-receipt.json). |
| P0 — operations | Existing Forge login works for the read-only deployment inventory. | Replacement credential is recorded to expire **12 November**; future session access is not guaranteed. | Refresh through the normal authorized account flow when needed. No token in source, artifacts or chat. |
| P1 — design implemented | Selected path, scoped search, map fit, seven-screen accessibility, mobile and reduced-motion tests. | Latest polish is not yet available in judge production. | Verify final Forge desktop/mobile rendering, keyboard focus, permissions/loading/error states and no confusing browser-versus-Forge claims. [UI evidence](DESIGN_REVIEW_2026-11-04.md). |
| P1 — impact case partial | Specific audience and workflow; no unsupported traction claims. | No recorded practitioner study or measured operational benefit. | Prepare a 15-minute task test; owner may arrange up to two suitable reviewers. Record actual friction and evidence comprehension. No outreach or customer-data import is authorized here. |
| P1 — differentiation implemented | Historical shipments persist; UNKNOWN remains unknown; corrected-fixture comparisons exist. | Final native comparison footage and concise, current positioning need a check. | Show one evidence correction and saved rerun, with unchanged scenario inputs. Avoid first/only or competitor-inferiority claims. [Existing analysis](COMPETITIVE_ANALYSIS.md), [comparison tests](../tests/e2e/journey.spec.ts). |
| P1 — demo exists | 2:53 video, captions, native captures and Deepgram narration. | Fresh coherent release-specific Cardboard cut; Cardboard tool access. | Follow the [2:45 plan](DEMO_PLAN_CARDBOARD.md). All export/playback/caption checks pass locally before seeking publication approval. |
| P1 — docs drift identified | Current README/MCP guide describe restored authentication and 2.7.0. | Older design-report recovery text still describes the expired-token block and can mislead. | Reconcile operational guidance against the final release without rewriting dated historical receipts. Older production commands are not authorization to run them. |
| P2 — native MCP works in development | Exact SHIP-002 tool read, saved revision/path, unchanged report and Jira count. | Hosted wrong-revision test unrun; third-party OAuth returns `invalid_request`; no production rollout. | Keep development label. Any extra model turns need a fresh allowance; the two-prompt allowance is used. [MCP guide](MCP_BONUS.md). |
| P2 — Marketplace preparation only | Assets/copy/private draft and published partner profile recorded. | No review ticket/listing, plus remaining privacy/security/operator decisions. | Actual accepted review submission or published listing URL if this bonus is chosen. No listing action in this plan. [Package](../marketplace-package/README.md). |
| P2 — Teamwork Graph absent | No claim or unused API integration. | No substantive graph ingestion/consumption. | Deliberately defer; do not label the local lineage graph Teamwork Graph. |

## Milestones through the cutoff

**Capacity proposal:** this week, finish this audit and preserve the current baseline; no feature sprint. From 9 November, reserve at most two focused 60–90 minute blocks per week after the other three projects. Dates below are targets, not scheduled automation or authorization to perform their gated actions. Drop P2 work before it threatens P0/P1.

| Target | Work and judged outcome | Exit criterion |
|---|---|---|
| **5–8 Nov** | Discovery, requirements and scope lock. | This report, evidence and demo plan complete; live assets/submission preserved. Source remote decision recorded for later approval. |
| **9–15 Nov** | Protect the judge journey and release identity. | Credential continuity checked; owner-approved source preservation; exact candidate installed/tested in development; clean install and missing-Rovo fallback documented. Repair blocking failures first. |
| **16–22 Nov** | Design and impact. | One full native task walkthrough and any owner-arranged reviewer feedback. Fix the most consequential usability issue; verify keyboard/mobile/reduced motion. No broad redesign. |
| **23–29 Nov** | Differentiation and bonus decision. | Broken-evidence → saved correction/rerun demonstrated. Keep Agents unless an alternative has stronger judge-testable evidence. Cap MCP OAuth investigation at **one 90-minute block**, excluding separately approved prompts; defer if unresolved. No Teamwork Graph or Marketplace expansion by default. |
| **30 Nov–6 Dec** | Freeze the candidate and prepare a reviewable release. | Affected tests/types/build/lint pass; real permission/revision/data-preservation checks; installation, privacy, source and rollback notes consistent. Obtain approval before any production change. If approval is absent, retain the existing production release and scope the demo to it. |
| **7–13 Dec** | Capture/edit, **only after the owner says to start recording**. | Official Cardboard CLI/MCP connected, account/export limits reviewed, synthetic capture set and local first cut with captions. No new model prompts, TTS, uploads or public replacement inferred from this planning pass. |
| **14–20 Dec** | Final presentation and judge test. | Locally reviewed 2:45 export, corrected captions, cold-viewer task clarity, version-consistent claims, usable links and installation instructions. Prepare exact public/video/form changes for approval. |
| **21 Dec, 18:00 IST** | Internal completion target. | Approved public assets and any approved Devpost update read back; submission receipt retained. If approval has not arrived, keep the already-submitted entry intact and report the pending choice. |
| **22 Dec, by 18:00 IST** | Buffer and final check. | Recheck official cutoff, video visibility/captions, install destination and persisted submission fields. No speculative last-minute feature work. |
| **23 Dec, 01:30 IST** | Official cutoff. | All authorized submission changes already completed and verified. Never rely on daytime 23 December. |

The recommendation is **finish the Forge judge experience and improve its demonstrated value; keep Best Agents as the primary bonus**. MCP remains useful development work, but it need not become this week's priority. No winning odds, Marketplace approval or swag entitlement is implied.

## What this audit actually verified

Fresh: local source existence and receipt hashes; Git/worktree discovery; 161-repository inventory and owner code search; Vercel project/deployment metadata; 13 anonymous public asset hashes; public landing/workspace loading; read-only Forge deployment list; current Devpost rules/schema/criteria/dates/project; existing local master duration and caption file; absence of accessible Cardboard tooling.

Retained evidence, reread rather than rerun: 154 tests, 13 browser cases, lint/build results, native Jira/Rovo/MCP behavior, prior install and custom-form checks. No new full product test, YouTube playback test, private Marketplace-portal inspection, denied-user account test or fresh installation was performed. No public state changed.

Detailed machine-readable boundary: [audit receipt](../evidence/codegeist-audit-2026-11-05.json). Cardboard capabilities and plan limits come from its official [Mac page](https://www.cardboard.ai/desktop), [plugin page](https://www.cardboard.ai/mcp) and [changelog](https://www.cardboard.ai/changelog); actual installed tool schemas must be checked later. This guide is a helper; if it conflicts with the official Devpost rules or website, those prevail.
