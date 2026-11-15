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
- The existing Recall rehearsal analyst stays read-only, saved-revision specific and citation-first. Integrate useful questions into Follow-up; the deterministic findings stay usable when Rovo is off. Do not create another agent or a write tool.

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
- The user requests local commits after each approved, verified workstream. If no Git repository exists, disclose and include local initialization/ignore boundaries in plan approval first. Use a task branch such as `feat/first-gap-ui`, verify author identity, inspect exact staged files and check secrets. No remote/push or source publication is authorized.
- Report implemented, locally verified, hosted, published and submitted separately. Full Forge lint blocked by expired login is not a pass; SDK validation is separate. Retain dependency/privacy/native acceptance gates instead of calling UI polish production readiness.
