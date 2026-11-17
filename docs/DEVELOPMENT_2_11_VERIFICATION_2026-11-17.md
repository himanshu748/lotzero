# Development 2.11: Jira flow and report delivery

Verified on 17 November 2026 in the existing LZR development installation. The core synthetic judge journey, actual JSON/Markdown/CSV downloads, and JSON clipboard delivery passed. Application source remains `7993c31`; this continuation changes documentation only. No deployment, installation, Jira issue, Rovo model message, or public change was made.

## Actual browser and scope

The isolated Chrome for Testing session continued to redirect to login. The successful checks used the already signed-in **Codex in-app Jira browser**, inspected through macOS accessibility and operated with native pointer/keyboard events. No browser profile, cookie or credential was copied. Accessibility action success alone was not treated as interaction proof: each meaningful transition was checked against the resulting UI and, for downloads, actual files.

Target: [LotZero Dev in LZR](https://one-atlas-obka.atlassian.net/jira/software/projects/LZR/apps/f2443992-e1df-4ee4-b6ee-50abce811c9b/d0324e54-93c3-4fc6-8d7f-5febd8e6dfe0). The native page identified LotZero Dev. Observed browser content sizes were 648×826 and 1127×826. This was an existing administrator workspace with Northstar already loaded, not a fresh installation or empty-storage test.

## Observed journey

| Check | Result |
| --- | --- |
| Run Northstar sample | One native activation opened Rehearsal with shipment-destination FAIL / SHIP-002 selected, the ING-A19 → BATCH-101 → FG-101 → SHIP-002 path, and the missing-destination inspector. Initial status was 0 PASS / 3 FAIL / 2 UNKNOWN. |
| Unsaved Follow-up | Displayed the save choice. Keep inspecting retained the unsaved rehearsal. |
| Rehearse | Suggested WH-NORTH and EV-DRILL while showing zero proposed controls. Explicit Add produced one control: SHIP-002 potentially preventable, SHIP-001 historical, four shipment records retained. |
| Save and follow up | Created exactly one new synthetic saved rehearsal. The ledger increased from three to four entries. Saved assertions were 1 PASS / 3 FAIL / 1 UNKNOWN. |
| Prioritised work | Shipment destination was the first group; all nine proposals were retained. Nothing was preselected. The issue preview named SHIP-002 and EV-MASTER and directed the reader to Rehearsal (Trace). |
| Jira approval boundary | Selected only the destination proposal and Task in LZR. Create 1 Jira issues remained disabled without approval. The proposal was subsequently deselected; no approval was granted and no issue was created. |
| Analyst fallback | Destination remained FAIL with SHIP-002 / EV-MASTER. Origin remained UNKNOWN for FG-102, FG-201 and FG-404. The hold fallback retained SHIP-002, historical SHIP-001, EV-DRILL and its simulation qualification. |
| Analyst handoff | The WH-NORTH handoff carried the full saved ID and exact revision, requested the existing read-only action, prohibited writes and invented record links, and was inspected without sending it. |
| Reopen | Opened the new ledger entry again. Saved status, the exact ID/revision, SHIP-002 selection and the prioritised queue remained intact. Create 0 Jira issues was disabled. |

Saved at **17 November, 10:57:21 IST** (`2026-11-17T05:27:21.603Z`):

- ID: `save-6f01cff05ec9306567c2d6da84f2db4f5f30da79c950133f6ebd83a88d9dd25e`
- Revision: `069cb35618398dd06963ee24727a2a78e032a41b7a03ec6073bd91fc3c778cf8`

## Actual download and clipboard checks

All three export buttons produced files in `~/Downloads/`; the native Downloads panel marked all three **Downloaded**. Their names share the prefix `lotzero-save-6f01cff05ec9306567c2d6da84f2db4f5f30da79c950133f6ebd83a88d9dd25e`.

| Format | Bytes | Validation |
| --- | ---: | --- |
| JSON | 46,044 | Parsed successfully. Re-running the current deterministic engine on its saved dataset, scenario and interventions reproduced the complete result. Its nine actions matched current proposals. |
| Markdown | 8,970 | Byte-for-byte equal to the current report generator applied to the downloaded snapshot. |
| CSV | 4,010 | Byte-for-byte equal to the current report generator; no line-ending normalisation was needed. |
| Copy export, JSON | 46,044 | The macOS clipboard matched the downloaded JSON byte-for-byte. No unrelated clipboard content was retained. |

This closes the earlier 2.11 delivery interruption. The previous failed in-app download attempts remain historical observations; they do not establish a current browser or app limitation.

Private evidence is retained under `evidence/development-2-11-2026-11-17/`: actual downloaded files, `download-verification.json` with SHA-256 hashes, `clipboard-verification.json`, `reopen-verification.json`, `handoff-verification.json`, scoped native accessibility snapshots, screenshots and deployment comparisons. These artifacts remain excluded from Git.

## Protected state and remaining limits

Fresh Forge deployment rows exactly matched the before-state, including production's last deployment at `2026-10-30T17:58:39.772Z`. All 14 protected landing source files matched the retained baseline. No production/staging installation, distribution, sharing, live page, demo, Devpost, Marketplace or YouTube change was made. Cardboard remains an edit-file handoff only.

No new Rovo response or tool trace was generated: the four-prompt allowance remains exhausted, and the retained 2.9 replay is still the last actual model evidence. This continuation verifies the 2.11 deterministic fallback and handoff, not a new model answer. No Jira POST, fault injection, fresh-install, ordinary/denied-user, cross-tenant or compatible-correction comparison check was added.

No source repair was needed. The prior 308 tests, 29 browser cases, build and full Forge lint remain the matching application's local validation; they were not rerun for these documentation-only changes. Console-log collection was unavailable through the native fallback. Current screenshots and interactions showed no error overlay; comprehensive keyboard, axe, themes and reduced-motion checks remain the earlier local suite's evidence.
