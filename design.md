# LotZero design system

## Direction
An industrial traceability workbench inside Jira. Warm near-white paper, deep forest-green shell, ink text, restrained amber for unresolved evidence. Compact operational typography; no decorative hero cards or generic dashboard scores. The LotZero symbol uses a square trace boundary and a zero/lot mark.

## Layout and hierarchy
A slim left rail holds seven named workflow screens and installation status. Main work area has a small context breadcrumb, clear title, a one-sentence decision prompt and primary action. Readiness shows a broad drill ledger and a compact measurable assertion summary. Impact is a material-flow lane diagram with a persistent evidence inspector. A table offers every graph selection action accessibly.

## Tokens
Background #f5f6f1; paper #ffffff; ink #172d28; muted #53645d; brand #155e46; dark #102f27; amber #8a4b0b on #fff3d6; red #a32d2d on #fff0ed. Status always includes text. System sans-serif for labels/body; system monospace for lot IDs and evidence. Body 14px/1.5; headings 28px/1.2; metadata 12px. Space scale 4/8/12/16/24/32. Fine borders, 6–10px radii, restrained shadows only on overlays.

## Interaction
Visible focus rings, semantic buttons/labels, native inputs, minimum 40px practical targets, clearly described pending/empty/error states. Show provenance on selection. Preview counts and descriptions precede an unchecked explicit Jira approval control. Exports are real downloads. Unsaved changes remain explicit. Local mode prominently says it is a browser rehearsal and Jira creation is disabled.

## Responsive and accessible
At 900px the rail becomes a compact top navigation; at 600px panels stack. Graph can scroll inside its region but page must not overflow. Provide table fallback and keyboard-selectable nodes. Dialogs trap focus or use native dialog. Status text and semantic headings, no color-only evidence. WCAG AA is a test target, not certification.

## Motion
Applied the local motion-design skill and its context-adaptation guidance to an enterprise workbench. The intended feeling is calm, decisive feedback: a new screen is ready, the evidence selection changed, or a request reached its next state. The visual system and data layout remain unchanged. Open Design was not used for this refinement.

Use one decelerating curve, `cubic-bezier(0.2, 0, 0, 1)`, and three short timings: 90ms for control color feedback, 180ms for arrival, and 160ms for operation feedback. Only the screen title and selected evidence heading arrive, moving down-to-rest by 4px at full opacity. An initial fade failed the browser contrast check on small heading text, so text retains its full contrast throughout the cue. The rest of the workspace is immediately available. Repeated selection of the same record does not restart the cue. Animations have no retained fill state or persistent transform after completion. No stagger, outgoing animation, ambient motion, graph-flow animation, error shaking or celebration is used. These deliberate exceptions to decorative skill recipes keep attention on the evidence.

A stable polite live region announces pending operations and completion. Pending operations show a static clock, the actual operation name and “In progress”; there is no estimated percentage or artificial delay. Errors remain immediate alerts. The selection stays focused while the inspector announces the chosen record. Graph and table controls expose both pressed state and the controlled evidence panel; navigation focuses the new screen heading immediately.

At widths up to 650px, timings are 70/144/128ms, keeping touch feedback short. Under `prefers-reduced-motion: reduce`, every animation and transition is removed, press displacement is disabled, and states appear instantly. Motion never carries information by itself. Browser checks cover the single-run cue, retained keyboard focus, completed animation cleanup, desktop/mobile timings and immediate reduced-motion states; local browser evidence does not establish Forge deployment or live Jira behavior.

## Screens
Readiness: dataset provenance, transparent counts, recent immutable snapshots, seed/import/reset.
New drill: source, hazard, fixed effective timestamp, assertion selection.
Impact: flow, record list, selected record provenance and source path.
Evidence gaps: assertion state/denominator, counterexamples, gaps requiring investigation.
Simulator: explicit type/target/time/evidence and historical versus preventable movements.
Jira review: server generated suggestions, authorized project/issue type, selected tasks and approval, partial receipts/errors.
Report: immutable scenario/dataset, original and simulated outcome, actions, limitations, comparison, Markdown/JSON/CSV export.
