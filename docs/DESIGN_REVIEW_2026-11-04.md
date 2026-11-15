# LotZero interface refresh — 4 November 2026

The redesigned landing page and real browser workspace are live at [LotZero](https://lotzero-recall.vercel.app/) and [the rehearsal workspace](https://lotzero-recall.vercel.app/app/). The Forge UI candidate builds, but the installed CLI rejected its expired API token before lint/deployment. This report distinguishes that native rollout from the released web experience.

## Audience and acceptance

The primary user is a food-manufacturing quality manager rehearsing an ingredient-lot incident. The entry experience should explain the value, reveal an actual evidence gap, open a working rehearsal without an account, retain historical movement during a hypothetical control, and save a report that survives reload. Keyboard access, mobile navigation, legible contrast and reduced motion are part of that journey.

The backend trace, evidence, assertion, simulation, storage and Jira mutation code is unchanged. No new integrations, scopes, external runtime hosts or AI calls were added. The web release does not activate Rovo, create Jira issues, operate shipments or introduce an account/billing flow.

## Comparable products studied

- [FoodLogiQ investigations](https://knowledge.foodlogiq.com/hc/en-us/articles/14279295757069-Investigations-in-FoodLogiQ): inspected the published application screenshots and flow documentation, including investigation scope, overview map and separate event/product/location views. The useful principle is persistent context around an investigation, with selected details near the results. LotZero now keeps the source, hazard, clock and saved state visible above the task workspace, alongside a step navigator.
- [FoodLogiQ investigation setup](https://knowledge.foodlogiq.com/hc/en-us/articles/28907894694541-Creating-an-Investigation): product/location scope and event details connect the overview to evidence. LotZero retains its explicit scenario definition, selectable flow map and record table rather than reducing a drill to summary counters.
- [FoodReady traceability](https://foodready.ai/features/food-traceability-software/): inspected the public product page and exercised its Transformation event control. Its task-focused explanation and ordered implementation journey informed a clearer route from product value to trying a workflow. LotZero's hero now contains a working sample and an immediate browser-workspace action.

This research used public product documentation, app screenshots and interactive marketing controls. It did not access either vendor's private customer workspace. Their branding, assets, customer claims, compliance claims and performance promises are not used in LotZero.

## Delivered experience

The landing page preserves LotZero's warm paper, dark green and chartreuse identity while placing a selectable ingredient-to-shipment flow beside the main message. Trace, evidence and hold modes update the selected record, supporting path and outcome. A guided next action walks through the missing destination and hypothetical quarantine. A user-triggered path replay makes the recorded branches easier to follow; it ends after one short sequence. The narrow-screen graph reflows into readable upper and lower rows.

The main action opens the actual React/TypeScript rehearsal at `/app/`, built with the browser transport and the existing deterministic engine. One click loads the fictional fixture and runs its scenario. The workspace adds persistent scope, five task steps, saved-rehearsal search, a resume action and a mobile navigation menu with Escape/focus recovery. Existing import, assertion, simulation, Jira-preview, export, comparison and reset behavior remains available.

The native video dialog loads YouTube only after a request, removes its frame on close and restores focus. The Rovo section uses a previously approved native capture and the existing public Deepgram-only demo. It explains that Rovo requires an enabled Jira tenant and is not available in the browser rehearsal.

Motion uses brief single-run entrances and record feedback, with the prior 180 ms desktop / 144 ms mobile title/inspector timing retained. Reduced-motion mode removes spatial transitions and path replay. No continuous decorative loop or new animation dependency was introduced.

## Verification

- **119/119 unit/integration tests passed.** No backend source file differs from the prior verified source manifest.
- **16/16 browser cases passed**, with zero flaky or skipped cases. The cases cover the complete local rehearsal, seven app screens with axe checks, imports/reset, saved comparisons, stale dataset saves, keyboard selection, motion, mobile navigation, reduced motion, sample progression, video-dialog focus and the built public entry path.
- The final mobile-graph refinement was followed by a **5/5 landing-case rerun**. Desktop coverage used 1440×1000; mobile used 390×844, with the existing 360 px overflow check. The published mobile menu and actual quarantine switch were also exercised through the native browser.
- Both `npm run build` and `npm run build:web` passed strict typechecking and Vite compilation. Existing dependencies were used; a fresh `npm ci` was not rerun. Rollup emitted existing Zod comment-annotation warnings; both builds completed.
- Vercel deployment **dpl_9v4oV8cdn2qJjEwutvmLZ5AN9VMS** is production **READY** in the existing approved `lotzero-recall` project. All **13 public assets** returned HTTP 200 and matched local bytes anonymously.
- A native public-browser journey started empty, ran the real engine on **37 synthetic records**, reached **four shipments**, inspected SHIP-002's evidence, read destination FAIL **3/4** and origin UNKNOWN **2/5**, then simulated WH-NORTH quarantine with supporting evidence. Only SHIP-002 became potentially preventable; historical SHIP-001 remained. The exported report retained one intervention, zero Jira receipts and fingerprint **34cafdaf**. A reload showed the saved local snapshot.

[Full browser results](../evidence/design-2026-11-04/browser-results-full-passed.json) · [Final landing results](../evidence/design-2026-11-04/browser-results.json) · [Unit results](../evidence/design-2026-11-04/unit-results.json) · [Public asset readback](../evidence/design-2026-11-04/public-assets-readback.json) · [Native public journey](../evidence/design-2026-11-04/public-native-journey.json).

The first browser pass found muted-text contrast failures, a title/inspector timing regression and a removed sample-anchor label. Those were repaired and the full suite passed. Its original failed report is preserved. The first unredirected run refreshed generated root UI screenshots; native historical Rovo/video captures remain in their dated folder. Later runs write to `ui-evidence/design-2026-11-04/`.

The dialog test isolates its third-party iframe, so it verifies the local dialog contract rather than asserting new YouTube streaming proof. Earlier public video playback evidence is preserved separately. Automated axe coverage does not establish accessibility certification or every-browser compatibility.

The existing Devpost project was subsequently updated to version **5**, adding a direct workspace link, a guided browser-rehearsal section and two labelled web captures alongside the three native Jira images. Both new gallery images loaded publicly, and clicking the story's workspace link opened the published application. The native submission form still shows **Submitted**, **5/5 steps done**, Specialized Industries and Best Agents. The installation URL, testing instructions, technology explanation, AI disclosure and prior video were preserved. See the [entry update receipt](../evidence/devpost-web-update-2026-11-04/receipt.json).

## Trace explorer follow-up

The public workspace now adds source-scoped record search, keyboard Enter/Escape handling, highlighted supporting paths and Fit map / Actual size controls. **Selected path** keeps its shipment target fixed while a user inspects individual ingredient, batch and product records. It displays one engine-produced path and explicitly retains the other associations in the full map. On narrow screens, **View selected evidence** moves focus directly to the inspector heading. No dataset or saved-rehearsal content is changed by these views.

The latest verification passed **119 unit/integration tests, 13 workspace browser cases and five landing cases**, with no skipped or flaky cases. New cases check an unrelated ingredient remains outside search scope, path inspection retains all four steps, map fitting responds to resizing, and mobile evidence focus/reduced motion remain usable. The first full run found existing opacity fades and navigation color transitions briefly reducing text contrast. Those effects were repaired in the product CSS; the accessibility assertions were not weakened. Brief movement and selection feedback remain.

Production deployment **dpl_2dGfRjUfHwnetbxBEnN5DcvYhbBS** is READY on the existing aliases. All 13 anonymous public asset hashes match local files. Native public-browser verification reopened the existing saved rehearsal, found SHIP-002, fitted the map and inspected BATCH-101 without losing the SHIP-002 target. Console error/warning readback was empty. Mobile was checked in repository Chromium at **390×844** and through the public Devpost-to-workspace journey at the native browser's natural **419×827** size. The mobile evidence action focused SHIP-002 with no horizontal overflow. No LotZero console errors/warnings were recorded; the tab retained two earlier Devpost cookie-control warnings. Temporary viewport settings were reset.

The current source-content fingerprint is **aa71d7e431d47cc8370f1c00116ec740d61b8e06d8341d18c3ad09254f1a6008** across 48 manifest files; backend sources, scopes and package dependencies are unchanged. This is a content hash, not a Git commit. The Devpost project is version **6**, with a revised guided path and an additional labelled browser capture. The submitted state, five completed steps, installation link, native testing instructions and both category selections were read back unchanged. [Release receipt](../../ui-evidence/trace-2026-11-04/release-receipt.json), [source manifest](../../ui-evidence/trace-2026-11-04/source-candidate.json), [public interface](../../ui-evidence/trace-2026-11-04/public-selected-path.png).

## Native Forge rollout and recovery

Judge production remains **2.5.0** and Marketplace remains **2.2.0**. Neither was redeployed by these web releases. The initial candidate manifest is [source-candidate.json](../evidence/design-2026-11-04/source-candidate.json), SHA-256 **8cb415a81f07b2ea300c797f14309a0e9898aace2e8a3f3ca2d1d318cd6da0af**; the trace follow-up above supersedes that UI source. The native UI build passes, but `npm run forge -- lint` returned “Your API token is no longer valid.” No current Forge lint or native deployment success is claimed.

Atlassian identity verification completed with the owner-provided code. The token-renewal dialog was prepared for `LotZero Forge UI refresh`, expiring 11 November 2026. Creation and local credential entry require the owner's personal step. The computer-use safety check rejected opening Terminal; this was not bypassed. Once the CLI login is renewed, rerun Forge lint, deploy the judge candidate to development, inspect the native interface with existing synthetic data, and then apply the authorized production rollout. No additional Rovo prompts or Jira issues are authorized by this UI pass. Do not deploy the separate Marketplace identity.

The five initial owned UI files and later documentation copies are preserved under `evidence/design-2026-11-04/before/` and `before-docs/`. Compare current hashes before any restore, and restore only this pass's owned files. The prior Vercel deployment is `dpl_5r3gtMdw8zTSzkEym1Gpb3N4sETq`; a web rollback should preserve the original support guide, privacy link and judge installation destination. No project-data reset, uninstallation, source-repository publication, commit or push is part of rollback.
