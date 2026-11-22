# LotZero: current product and execution rules

The user's **The first gap** redesign and `PLAN.md` supersede `LOTZERO_BEST_PROMPT.md`, `WIN_PLAN.md` and the UI/product shape of the earlier 15 November judged-release pass. Preserve those as history and evidence. Follow higher-priority instructions and the user's current authorization.

## Plan and approval

- Read current source, docs, tests and actual screenshots before planning or editing.
- Write the redesign plan, including four-screen storyboard, deletions, ADS decision, affected files, criteria, risks and tests, then stop. Do not implement UI/code in the planning turn.
- Implement only after the user approves the plan. A local-only approval does not authorize deployment/tunnel. Keep authorization exact.

## Product

- LotZero is a Jira project-page Forge **Custom UI** app for a quality manager's mock-recall workflow. Stay Jira-only. No UI Kit rewrite, Confluence, new AI provider, live ERP integration or additional bonus sprint.
- Four primary screens: **Home, Rehearsal, Rehearse, Follow-up**. New drill is a launched form, not a navigation peer.
- Direction: **The first gap**. Empty workspace has one primary **Run Northstar sample (synthetic)** action. One activation loads idempotently and runs ING-A19, selecting shipment-destination FAIL / SHIP-002 with its real selected path and inspector visible.
- Replace the current marketing shell; do not stack new banners, steppers, tours or summary cards on it. Remove the poster/emblem, duplicate starts/metrics and seven-item navigation. Keep one compact case header/status line and one active-case navigation control.
- Findings are FAIL first, then UNKNOWN, with PASS details collapsed. Selected-path target and inspected ancestor are separate states; preserve that interaction and graph keyboard access.
- Keep the Rehearse comparison, prefill only supported controls, and require explicit Add. A WH-NORTH warehouse control uses the existing quarantine semantics; it does not become a new operational hold API. Historical shipments remain in the impact.
- Follow-up groups existing suggestions by assertion with FAIL first. Never renumber action IDs or alter legacy claim/receipt meaning to reorder the display. No prechecked selections; exact project/type/content and explicit approval remain required. Unknown write outcomes require reconciliation.
- The existing Recall rehearsal analyst stays read-only, saved-revision specific and citation-first. Integrate useful questions into Follow-up; the deterministic findings stay usable when Rovo is off. Do not create another agent or a write tool. The one approved exception (owner, 23 November 2026) is the resolver's `postEvidenceComment`: one deterministic, saved-evidence comment per LotZero-created task, posted only after the user ticks approval of the exact text, gated on the task's approval marker and never resent automatically. It is not a Rovo action and adds no scope.

## Design and engineering

- Use supported Custom UI/Atlassian Design System tokens and components, with faithful token-backed equivalents where an exact package cannot meet the existing build/CSP constraints. Verify current primary documentation and package peer/compatibility facts; never guess APIs or bypass policy.
- Replace the olive/cream campaign treatment and Georgia/Times display type with calm ADS surfaces, typography, spacing and semantic lozenges. Verify actual rendered fonts. Keep browser-preview context compact, consequential errors visible, and limitations in one disclosure/footer.
- Split `App.tsx` into real screens, components and hooks. Do not make the current monolith larger or hide it in another oversized shell. Preserve existing contracts, user changes, storage/revision integrity and the deterministic engine.
- Keep PASS/FAIL/UNKNOWN honest. A passing assertion is not product safety. A path is association, not contamination. Do not invent missing records, timing, customers, pilots, metrics, certifications or quotes. Demonstration records remain fictional Northstar and labelled synthetic.
- Verify keyboard, visible focus, non-color labels, contrast, small screens, theme behavior and reduced motion. Use the preferred motion guidance only where helpful; no decorative continuous motion or tour overlay.
- After each approved workstream run relevant unit/integration, type/build and Playwright checks through the real local entry point. Extend the existing Rovo evaluations; distinguish deterministic contract tests from actual model-answer verification. Preserve engine honesty, permission, compatibility and retry tests.

## Release, media and source boundaries

- **Never deploy/install production or change distribution/sharing.** The owner performs production promotion. Provide reviewed commands and a recheck list instead of running them.
- Development deploy/tunnel requires explicit authorization in the plan approval; do not infer it from local-only work. Live Jira issues, new access grants, Rovo prompts and costs retain their applicable approval/allowance boundaries.
- Do not edit/publish Devpost, Marketplace, YouTube or the live Vercel site. Drafts only. Public landing code is outside this redesign; record observed issues in the plan without fixing/publishing it.
- Specialized Industries / **Best Agents only**. Never claim MCP, Teamwork Graph or Marketplace bonuses. Keep `rovo:mcp` out of the judge production candidate; preserve separate development evidence without promoting it.
- No new paid service, card, plan or credit purchase. Keep secrets outside source/logs. No key in chat, generated assets or screenshots. Do not assume free access means unlimited usage.
- No recording during this planning/redesign authorization. Later approved demo editing uses Cardboard; generated narration uses **Deepgram exclusively**. Do not substitute another TTS provider without explicit approval.
- The user requests local commits after each approved, verified workstream. Use a task branch such as `feat/first-gap-ui`, verify author identity, inspect exact staged files and check secrets. The 20 November requests authorize creating `himanshu748/lotzero`, pushing its source and making the repository public. Later pushes outside an approved task and deployments retain their separate authorization boundaries.
- Report implemented, locally verified, hosted, published and submitted separately. Full Forge lint blocked by expired login is not a pass; SDK validation is separate. Retain dependency/privacy/native acceptance gates instead of calling UI polish production readiness.

## Approved implementation state

- The four-screen plan was approved for local implementation and local commits. Preserve the `feat/first-gap-ui` work branch. The owner subsequently requested its GitHub repository and public visibility on 20 November; `main` is the default branch of the public `himanshu748/lotzero` origin. Retain the source allowlist: credentials, private evidence, downloaded reports, media masters, local edition configuration and dependencies stay out of Git.
- Use `playwright.first-gap.config.ts` for the current app suite, preserving older screenshot folders. Do not use `build:web` here: it writes the protected public-site source.
- `--judge-release` must select the updated `config/judge-agent-prompt.md` and exclude the working manifest’s historical MCP declarations. The owner performs any eventual promotion.
- Reopening Follow-up and refreshing receipts must read the full canonical preview, preserving uncreated proposals alongside receipts. Never resave or replay a Jira write merely to refresh that view.

## Development rollout follow-up — 16 November 2026

- Development-only rollout and Jira verification are approved. The frozen judge export from `7a03736` deployed as **2.9.0**, following 2.8.0's native core checks. Production, sharing and the public page/demo remain protected. No install/upgrade command was needed.
- Existing credentials and full Forge lint passed again; do not create or request another token merely because an older note says login expired.
- Read `docs/FIRST_GAP_DEVELOPMENT_2026-11-16.md` and the preceding day's receipt. Native reopening, full proposal queue, text export/comparison parity and unchanged saved-state readback passed. The later `docs/DEVELOPMENT_IO_TRACE_2026-11-16.md` verifies native CSV paste content (after line-ending normalisation) and the fourth replay's exact read-only action trace. Download delivery, raw clipboard byte identity, other response traces, ordinary/denied users and fresh-install acceptance remain unverified.
- **All four approved development Rovo messages are used** (three original questions plus one separately approved citation replay). Origin UNKNOWN was preserved. The first saved WH-NORTH answer had correct facts but invented relative citation links; source `7a03736` repairs prompt/handoff formatting and extends the existing rubric. The approved 2.9.0 replay used inline IDs, no fabricated resource links, and correct simulation facts/revision. Saved JSON remained identical after the replay. One observed answer is not a general model guarantee. The fourth replay trace is now inspected: one GET evidence action, exact revision, DEVELOPMENT 2.9.0. No new question was used.
- Any further Rovo message needs a new explicit allowance. No Jira writes, paid activation, new terms/access grants, production rollout or public changes are authorised.

## Ten-critic continuation — 16–17 November 2026

- User requested ten independent critiques and a clearer Jira next-step flow. Findings use plain-language display titles/counts; canonical stored results/action IDs remain unchanged. Counterexamples, evidence uncertainty, save/write recovery and accessible graph handling retain regression coverage.
- Development-only rollout remains authorised after tests/lint. Production, sharing, staging and all public surfaces remain untouched. No extra Rovo question or Jira issue write was authorised.
- Owner clarified the demo: **Jira and Rovo only**. Keep Cardboard and prepare edit files only; do not render with FFmpeg. See `docs/demo-jira-rovo/README.md`. No new recording, narration, upload or publication in this continuation.
- Native Chrome downloaded JSON, Markdown and CSV from development 2.9.0. JSON dataset/result matched saved evidence, Markdown byte-matched the prior text export and CSV matched after line-ending normalisation. IAB delivery remains an observed browser limitation, not a proven app bug. See the current critic-pass receipt for final rollout/check status.

- Final continuation source `7993c31` deployed to **development 2.11.0** after 308 tests, 29 browser cases, final copy journey, build and full lint. Read `docs/CRITIC_PASS_DEVELOPMENT_2026-11-16.md`. The native first view and saved reopening passed; the repeat 2.11 Chrome download was interrupted, so only the earlier 2.9 actual file deliveries are a download pass.
- Production/staging deployment rows, installations, protected landing files, working manifest and media references were unchanged. No additional Rovo message or Jira issue was created. The browser became unavailable after the interruption; do not infer remaining native checks from local tests.

## Completed development continuation — 17 November 2026

- Read `docs/DEVELOPMENT_2_11_VERIFICATION_2026-11-17.md` for the current result. Actual JSON/Markdown/CSV downloads and JSON clipboard byte equality now pass on **2.11.0**, superseding the interrupted repeat and historical in-app delivery limitation above.
- The successful path used the existing signed-in in-app Jira session through native macOS UI controls. The isolated Chrome for Testing session remained unauthenticated; do not claim it completed these checks. Validate actual UI changes and downloaded bytes, not an accessibility action's success code alone.
- One additional synthetic rehearsal was saved and reopened at the same full revision. Destination-first proposals, disabled creation without approval, and the three local analyst fallbacks/handoff passed. No Jira issue or new Rovo model message was created; the four-prompt allowance is still exhausted.
- This continuation made no application-source change or deployment. Deployment history and all 14 protected landing files matched their baseline. Keep production, staging, public surfaces and the live demo untouched; Cardboard edit files remain the only approved demo deliverable.
