> Historical 15 November receipt. The [16 November continuation](FIRST_GAP_DEVELOPMENT_2026-11-16.md) supersedes the interrupted checks and remaining allowance below. Development is now 2.9.0; production remains unchanged.

# The first gap — development rollout, 15 November 2026

**LotZero-Judge 2.8.0 is deployed to development only.** Production deployments/installations and the protected public-site source are unchanged. No sharing, Marketplace, Devpost, YouTube or Vercel action was performed.

[Open LotZero Dev in LZR](https://one-atlas-obka.atlassian.net/jira/software/projects/LZR/apps/f2443992-e1df-4ee4-b6ee-50abce811c9b/d0324e54-93c3-4fc6-8d7f-5febd8e6dfe0).

## Artifact and authentication

The deployed source is the frozen judge-only export from commit `82b8763b0b0e0c7441cf33cee4bde824ed745d55`, at `outputs/lotzero-first-gap-2026-11-15/lotzero`. All 130 exported file hashes matched before rollout. The manifest registers the existing Jira page and read-only Rovo agent/GET action, with the original three scopes. It excludes MCP and Marketplace-only modules.

The existing saved Forge credential authenticated successfully on this run. No replacement token, OTP, credential entry or terms acceptance was needed. Full Forge lint passed with **No issues found**, including deployment prechecks. CLI 15.0.0 reported a newer version; no toolchain update or bypass flag was used.

The sole mutating Forge command was `forge deploy -e development`, run from that isolated package. Forge returned success and **2.8.0**. The existing development installation on `one-atlas-obka.atlassian.net` remained Up-to-date, and the new UI loaded without an install/upgrade command. Read-only deployment and installation inventories were retained before and after.

## Native Jira checks

| Check | Observed result |
|---|---|
| Existing records | The previous Northstar dataset and saved rehearsal remained present. No dataset reset, import or deletion was performed. |
| One activation | Run Northstar sample (synthetic) opened Rehearsal on destination FAIL / SHIP-002, focused the selected finding and opened its inspector. |
| Evidence | Real path ING-A19 → BATCH-101 → FG-101 → SHIP-002; destination Not recorded; EV-MASTER and EV-RECEIPT references visible. |
| Stable path | Inspecting BATCH-101 changed the inspector while the path remained anchored to SHIP-002. |
| UNKNOWN | The origin finding stayed UNKNOWN; FG-102 and its potential path were inspected. No safety inference. |
| Alternatives and keyboard | Flow map contained 15 reachable records. Keyboard activation selected SHIP-002 in Record table; Selected path remained available. |
| Narrow Jira iframe | At a 390×844 browser viewport the actual iframe was 310px wide, with 310px scroll width and four path records. No internal horizontal overflow. Desktop was also inspected. |
| Suggested control | Rehearse suggested WH-NORTH and actual supplied EV-DRILL. Zero interventions existed before explicit Add. |
| Simulation | After Add, SHIP-002 was potentially preventable in the simulation and historical SHIP-001 remained in impact. No shipment changed. |
| Save | One new synthetic development rehearsal was saved: `163de088-8f31-473a-9f7e-6889dd5b3e23`, revision `080364f63fe29f14d837135039e763f6f5c8067b32cc045db3e6e4e128162b40`. The first wait expired while the RPC was pending; reading the completed state confirmed success. Save was not repeated. |
| Follow-up | Destination proposal first; all task and approval checkboxes initially unchecked. Project LZR was selected, real metadata included Task, and Create remained disabled without approval. No Jira issue was created. |
| Analyst handoff | Full saved revision, project, snapshot and shipment-destination filter matched the page. |
| Native destination answer | Rovo answered directly that the destination was missing, cited SHIP-002, shipment-destination and EV-MASTER, reported 3 of 4 passing and a complete 1-of-1 counterexample list, and used the matching short revision. It proposed review rather than claiming a write or safety. |

The destination answer is an actual native Rovo observation, unlike the earlier deterministic evaluation suite. Its raw debug trace/tool-call count and screenshot were not captured: the browser provider disconnected while opening Debug response. The observed answer text was transcribed into private evidence and labelled accordingly.

## Interrupted verification and remaining allowance

The owner separately approved **up to three** development Rovo questions using existing included access. **One** user message/answer was observed; two remain approved for origin UNKNOWN and the saved WH-NORTH simulation. No extra message was sent after the disconnect. Do not resend the destination message or exceed that total without further authority.

Browser recovery failed, and computer-use tools were subsequently removed. A native Codex-app fallback was rejected because computer use is not permitted to control that app. No alternative UI automation or security bypass was used.

These native checks remain **pending**, not passed:

- Reload/reopen of the new saved rehearsal and its complete proposal/receipt queue.
- Native exports/comparison and full snapshot readback after the analyst.
- The remaining two approved Rovo questions and raw action trace review.
- Restoring the temporary browser viewport override after reconnecting.

The local 258-test and 18-browser-journey results remain valid for their named local boundary; they do not fill these native gaps. Production promotion remains an owner decision. Dependency/privacy review and ordinary/denied-user/fresh-install acceptance are still separate release gates.

## Protection and evidence

Before/after comparison found the six recorded production deployment rows identical and both production installation records unchanged. The development installation was Up-to-date. All 14 protected public-site source/bundle hashes still matched the pre-redesign baseline. This establishes no production/public changes by this task; no new anonymous hosted-asset readback was performed.

Private logs, screenshots, inventories, saved inputs, prompt allowance and `verification.json` are in `evidence/first-gap-development-2026-11-15/`, excluded from Git and exports. The artifact itself remains frozen. Follow-up documentation changes do not imply another deployment.
