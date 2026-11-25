# LotZero Rovo release handoff

Updated 31 October 2026 IST. **Judge production 2.5.0 and the new public 2:53 Jira + Rovo demo are verified.** The user subsequently requested the existing Devpost entry update. Its story, released video, testing/technology/AI-use answers and Best Agents selection are now saved and verified; it remains Submitted, with all 5/5 steps complete.

## Reviewable candidate

- Source content SHA-256: `09a23d6b356e1dd18123fea739df548507a201b04cf3f1092dc3acf7765fa764` ([manifest](../evidence/rovo-2026-10-30/source-manifest.json)). No Git repository/commit is claimed.
- Judge app: `f2443992-e1df-4ee4-b6ee-50abce811c9b`. Development **2.6.0** on LZR; staging **2.4.0** on KAN. Same source, existing three scopes, no external runtime hosts. The owner subsequently approved exact-source judge promotion: production **2.5.0** deployed at `2026-10-30T17:59:02.635Z`. Marketplace production was not deployed by this pass.
- New nonproduction installation IDs: development `70c01ef1-e6ac-4079-887b-68d5ec9a90f3`; staging `2bbd1898-3965-4f9b-aa43-0b90130dbcaf`. Protected production installation IDs remain present and up to date.
- 119 unit/integration tests, nine browser cases, strict types/build and Forge lint pass. Production dependency audit: zero findings after a targeted ProseMirror patch. Existing engine/application/Jira source remains unchanged.
- Final hosted questions: prompt 6 returned all four shipment paths, exact revision, 4/4 items and no truncation. Prompt 7 returned destination **FAIL**, 4 checked/3 passed, SHIP-002/EV-MASTER; origin **UNKNOWN**, 5 checked/2 passed, FG-102/FG-201/FG-404, all EV-MASTER. Exact raw tool outputs and native answers are in [the evidence folder](../evidence/rovo-2026-10-30/).
- The saved quarantine's WH-NORTH/EV-DRILL control and historical/potentially-preventable outcomes were also returned by a real simulation-view call in prompt 5. Earlier failures are retained, not represented as successful verification.
- The full saved snapshot was reloaded after all seven owner-approved prompts. Canonical content hash stayed `d9f0e54bdb812e2e731963d462b619feba0fab2611489d31fd3d7000647acb72`; scenario/interventions unchanged; zero action receipts. Jira refresh still shows only the original LZR-1 (1 of 1). [After-seven receipt](../evidence/rovo-2026-10-30/native-after-seven.json).
- Independent staging began empty, saved its own distinct snapshot `a2a90b04-3433-4224-ba28-b2bb83bf992f`, and reloaded it on the latest version with zero Jira receipts. Its earlier bridge attempt could not open Rovo and showed the useful fallback. No entitlement/AI terms were activated. This is basic separation under the same owner, not adversarial tenant/user isolation proof.

## Limits and release gates

1. **PASS — Production rollout:** owner approved and production 2.5.0 is deployed, preserving Marketplace. Existing installations stayed up to date without further access grants. The original judge link is retained.
2. **PASS — AI disclosure:** owner-approved revised policy is public and anonymously matches the updated canonical file; [receipt](../evidence/rovo-2026-10-30/privacy-publication.json). Optional Rovo processes selected identifiers and sanitized summaries; imported IDs/questions can still be sensitive. Rovo chats have separate platform retention.
3. **PASS with stated limits — Judge access:** both additional owner-approved production prompts succeeded on LZR with real production tool output. Independent production core reloaded its own snapshot with zero receipts. That tenant's Rovo was not activated. All seven nonproduction and two production prompt allowances are fully used. No additional Jira issues are authorized. [Production after-state](../evidence/rovo-2026-10-30/production-after.json) confirms unchanged content and original receipt.
4. **PASS — Public demo:** owner-approved [2:53 Jira + Rovo walkthrough](https://youtu.be/KNKdnH8N6kw) is public. Actual public playback and manually published English captions were verified at 1:50. Deepgram Aura-2 Thalia only, real production Rovo captures, synthetic/edited-content disclosure, no paid changes. [Playback receipt](../evidence/rovo-2026-10-30/youtube-public-playback.json). The original video stays live.
5. **PASS — Devpost update:** the user explicitly requested this update. Existing project 1518613 is now version 4, with the released video and product story. Submission 1273039 remains Submitted; the native form shows 5/5 steps complete, Apps for Specialized Industries and Best Agents - Rovo/Assignable agents. Testing, technology and AI-use answers were updated; prior personal answers and judge installation URL were retained. [Update receipt](../evidence/devpost-rovo-update-2026-10-31/receipt.json). No Marketplace bonus is claimed.

The prompt requests at most two tool calls per answer; Rovo did make three in one intermediate answer. Final cases used one and two respectively. This is **not a hard turn/token/credit budget**. Handler input/output, read count and ten-second invocation deadline are bounded. Permission/denial/isolation adversarial tests use mocks; no extra user or denied-project test was authorized. The feature is a synthetic rehearsal assistant, not safety advice, a live recall or certification.

## Product copy prepared for the submission owner

**The public product story is the Devpost entry. The local write-up is not on this branch. The shorter paragraph below is supporting product copy; the user-authorized existing-entry update is now complete.**

> A recall rehearsal should leave a quality manager with clear next steps. LotZero follows an ingredient lot through recorded production and shipment paths, exposes gaps, and tests hypothetical controls. Its read-only Rovo analyst explains the exact saved rehearsal: why SHIP-002 fails the destination check, which branches remain UNKNOWN, and why historical shipments stay in the report. Every answer points back to record and evidence IDs. Follow-up Jira Tasks still require a person to review the exact content and approve them.

Technical paragraph: A Forge `rovo:agent` invokes one GET `action`. The server checks the authenticated Jira user's Browse permission, reads the exact project/installation snapshot, validates its SHA-256 input revision and recomputes the existing deterministic engine. The action exposes no mutation route. Rovo must already be available in the judge's tenant; the core report remains useful without it.

This pass implements no Teamwork Graph API/ingestion, `rovo:mcp`, Marketplace review submission, regulatory certification or customer validation. The [official rules](https://codegeist2026.devpost.com/rules) allow one Grand Prize plus one Bonus Prize for a submission; the sensible target is Specialized Industries plus Best Agents after release, not a claim to win multiple bonus prizes. Winning and participation swag are not guaranteed.

## Released public demo — ready for the submission owner

- **URL:** https://youtu.be/KNKdnH8N6kw
- **Title:** LotZero: Rehearse a Recall with Jira + Rovo | Codegeist 2026
- **Channel:** Himanshu Jha, `UCMe9HOY01O4CSSaM3JIE4Hg`
- **Published:** 30 October 2026, Public; not made for kids; no paid promotion; Standard YouTube license; English manual captions published and verified.
- **Duration:** 172.671 seconds (2:53); Rovo begins at 1:45, before the three-minute judging boundary.
- **Narration:** Deepgram Aura-2 Thalia exclusively. One new 489-character request; retained audio matched prior Deepgram receipts. No card, top-up or provider substitution.
- **Footage:** edited native captures; core from judge 2.4.0 with unchanged engine, new Rovo from verified production 2.5.0. Synthetic data and narration disclosed. Historical approved LZR-1 shown; no extra issue created.
- **Verification:** public native playback advanced to 1:50, matching manual English caption visible; anonymous metadata and expanded public description read back. Playback was muted during verification.
- **Preserved original:** https://youtu.be/nsw-z9XYY1g remains live.
- **Landing/support:** https://lotzero-recall.vercel.app/ now points to this released cut; five public assets match local bytes and the native support link reaches the correct video.

| Chapter | Product moment |
|---|---|
| 00:00 | Rehearse: the quality team's question |
| 00:17 | Define the synthetic scenario |
| 00:34 | Trace the ingredient to shipments |
| 00:52 | Inspect the missing destination |
| 01:08 | Test evidence-backed assertions |
| 01:25 | Rehearse a control; preserve historical impact |
| 01:45 | Explain with real production Rovo |
| 02:17 | Review follow-up work |
| 02:36 | Act: the existing approved Jira Task |

[Recording receipt](../demo/rovo-update/recording-receipt.json), [public metadata](../evidence/rovo-2026-10-30/youtube-public-metadata.json), [public playback](../evidence/rovo-2026-10-30/youtube-public-playback.json), [description](../evidence/rovo-2026-10-30/youtube-public-description.json), [landing publication](../../lotzero-site/evidence/rovo-demo-2026-10-31/public-readback.json).
