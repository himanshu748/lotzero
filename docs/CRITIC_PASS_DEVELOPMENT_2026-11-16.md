# Ten-critic repair and development verification

**17 November continuation:** the interrupted 2.11 download check is now complete. The native Jira flow, all three actual report downloads, JSON clipboard byte equality, save/reopen and analyst fallback/handoff passed. See the [current receipt](DEVELOPMENT_2_11_VERIFICATION_2026-11-17.md). The chronology below records the earlier pass and its then-outstanding limits.

Status: **development 2.11.0 is deployed and the revised first view and saved-case reopening are verified in Jira**. Source `7993c31` follows the main ten-critic repair commit `fa68bbe`. Production, staging and public surfaces remain unchanged. See [review decisions](TEN_CRITIC_REVIEW_2026-11-16.md).

- 308 unit/integration checks passed with one worker and a 30-second test timeout under host CPU contention.
- TypeScript and Forge UI build passed. Existing large-bundle warning remains.
- All 29 browser cases passed with one worker, including desktop/mobile Axe, real keyboard paths, reduced motion, downloads, saved recovery and canonical graph rejection. The original aggregate five-screen Axe test timed out under load; it was split into five independent checks with the same coverage. The native disabled-option test now checks its actual DOM disabled property plus keyboard behavior. No native result is inferred from local tests.
- Cardboard edit files only: [handoff](demo-jira-rovo/README.md). No narration or video generated, uploaded or published.
- No new Rovo prompt or Jira issue creation in this pass. The fourth approved replay trace remains the last observed model evidence.
- Native IAB download repeated using a native accessibility click after the listener started: no event in 12 seconds, no matching file in Downloads or Codex attachments. No console error or proven product cause. Safari was occupied by other activity. Chrome subsequently signed in and completed all three downloads: JSON dataset/result equal the retained saved snapshot; Markdown bytes match the earlier native text export; CSV matches after CRLF/LF normalisation. The download history visibly marked all three Done. No credential/token was extracted or transferred between browsers.

## Compatibility and recovery

The canonical Northstar result and sanitized historical snapshot fixtures retain parity. Repaired ambiguity/orphan-evidence cases intentionally become UNKNOWN. The analyst rejects a saved result that no longer agrees with its inputs; it never rewrites historical evidence silently.

The current UI retains one save request ID for the same mounted rehearsal result. Retrying after a lost response recovers one snapshot and one save audit. Legacy callers without a request ID still work but do not acquire that deduplication guarantee. Reloading a completely unsaved UI loses its in-memory request identity; reopen existing saved history before starting again.

Jira preparation failures can be retried only while the saved claim explicitly establishes that dispatch has not begun. Once dispatch may have started, uncertainty still stops automatic creation. Project locking excludes concurrent retries. Existing administrator recovery of a stale, still-running lock remains a limitation; no stronger fencing or migration is claimed. No live fault injection or real Jira POST tested these repairs.

## Native development case — 17 November IST

On the existing LZR development installation, one activation of the sample opened shipment-destination FAIL / SHIP-002, with focus on the finding and the true selected path. Follow-up on the unsaved case displayed an explicit save choice; cancel preserved the unsaved case. All three origin counterexamples could be inspected, including FG-404's honest missing-path state.

WH-NORTH and EV-DRILL were suggested without applying a control. Explicit Add changed only the hypothetical result: SHIP-002 potentially preventable, SHIP-001 historical. Saving produced one new synthetic rehearsal (`save-49063c3fb087c60c791c92d7ea183c930231490279a82bf47e7afe7a071d7a2b`, revision `20e1874424a9a113a4a0a181a9cbb15595794f35deacd33b966042ded1c5ed5f`). No Jira issue was created.

The destination proposal was first and no selection or approval was prechecked. Selecting that proposal and Task in LZR left creation disabled without approval; it was then deselected. The saved WH-NORTH fallback retained SHIP-002 / SHIP-001 / EV-DRILL, and the handoff included the exact new save ID and full revision. The handoff was inspected, not sent to Rovo.

Native laptop inspection revealed that the old two-row selected-path layout pushed the shipment and inspector below the fold. A compact four-step row and adjacent inspector now have a regression at a 1200×580 app viewport, approximating the observed 1280×720 Jira host. Graph/table and mobile remain separate responsive views. An overridden question label and the obsolete “Impact Explorer” proposal direction were also corrected without changing the agent request or action IDs.

## Final rollout and readback

- Isolated judge-only package: `../lotzero-clarity-2026-11-17/lotzero`; all 134 exported hashes verified. Matching-lock dependencies were reused through an ignored symlink; this was not a clean install.
- Final source passed 308 unit/integration tests. The layout passed all 29 browser cases, then the complete hold/save/follow-up/export case passed again after the final wording change. TypeScript/build and authenticated Forge lint passed; deployment's own lint also passed. Existing bundle-size/dependency gates remain separate.
- Forge assigned development **2.11.0**. No installation/upgrade, scope, sharing, distribution, staging or production mutation was performed. Native Jira displayed the new asset version.
- At the observed 1280×720 Jira viewport, the destination FAIL, all four path records and the SHIP-002 inspector's missing destination were visible together. The first finding retained keyboard focus. See `evidence/critic-pass-2026-11-16/jira-2-11-first-finding.jpg`.
- The previously saved development case reopened after the update with the same revision, 1 PASS / 3 FAIL / 1 UNKNOWN and nine proposals. The destination group remained first; creation was disabled with no selection/approval. The analyst displayed “Explain the missing destination”. Saved inputs/results were not replaced by the presentation update.
- Actual JSON, Markdown and CSV delivery was completed in native Chrome on **2.9.0** earlier in this pass. The new 2.10 report's JSON and Markdown text were separately retained; its Markdown used the correct neutral proposal/receipt heading. A repeat Chrome download on **2.11.0 was interrupted by the user before completion**; do not label that repeat a pass. No app fault was established.
- Production/staging deployment rows and installed-app readback matched the before state. All 14 protected landing files, the working manifest and retained media hashes matched their baseline. This is state/readback evidence, not a claim of a new public deployment.

## Evidence and remaining limits

Private evidence is under `evidence/critic-pass-2026-11-16/`: `tests-release.txt`, `browser-compact.txt`, `browser-copy.txt`, `final-candidate-build.txt`, `final-candidate-forge-lint.txt`, `final-candidate-deploy-development.txt`, `final-source-export.json`, native 2.10 exports/handoff, native 2.11 screenshots, actual Chrome download files/check and protected-state readbacks. These artifacts are intentionally excluded from source publication.

No fresh installation, ordinary/denied-user native check, new Jira POST, provider fault injection or new Rovo response was performed. Four approved Rovo questions remain the full allowance; the retained fourth replay/trace is development 2.9.0 evidence, not a 2.11 model evaluation. The current saved handoff and deterministic fallback were checked without sending another question. Raw clipboard byte identity remains separate from the earlier verified native paste content.

The browser session ended during the repeat download check and was unavailable afterward. The current native layout and saved-state screenshots were already retained. The Cardboard deliverable is edit files only: no recording, replacement video, narration, upload or public edit.
