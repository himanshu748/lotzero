# The first gap — resumed development verification, 16 November 2026

**LotZero-Judge development 2.9.0 is deployed.** Development-only verification resumed after the browser connection recovered. The existing Forge login works; no token, verification code or credential change was required. Production, staging, distribution, the live landing/preview, demo and submitted entry remain outside this rollout.

[Open LotZero Dev in LZR](https://one-atlas-obka.atlassian.net/jira/software/projects/LZR/apps/f2443992-e1df-4ee4-b6ee-50abce811c9b/d0324e54-93c3-4fc6-8d7f-5febd8e6dfe0). The preceding [2.8.0 receipt](FIRST_GAP_DEVELOPMENT_2026-11-15.md) retains the original first-run, keyboard, narrow-iframe, explicit-control and save observations.

## Saved case and outputs

The existing synthetic case `163de088-8f31-473a-9f7e-6889dd5b3e23` reopened with exact revision `080364f63fe29f14d837135039e763f6f5c8067b32cc045db3e6e4e128162b40`. Destination FAIL / SHIP-002 and the real selected path remained intact. Follow-up restored all nine proposals in five groups, with the destination proposal first and still identified as `action-4`. No task or approval box was selected; there were no created receipts.

Native JSON, Markdown and CSV were inspected through the text fallback. Recomputing from the exported saved inputs reproduced the engine result exactly; Markdown and CSV matched byte-for-byte. The compatible earlier case `afdd2696-43bc-41de-8b32-c62de6dd70ec` produced a comparison matching the local comparison service: five unchanged assertions, no improved/regressed assertions, and no added/removed shipments. The exported comparison included the full baseline.

After the three original approved Rovo reads and again after the separately approved citation replay, a fresh reload/reopen produced identical saved JSON. The ledger still contained the same two saved cases. No additional save, import/reset/delete, Jira issue or shipment change occurred during this resumption.

## Actual Rovo answers and citation repair

All three approved development questions were consumed across the two days:

- **Destination:** the 15 November answer identified SHIP-002's missing destination, cited the returned assertion/evidence and used the saved revision. Its screenshot/raw action trace was not captured before the disconnect.
- **Origins:** the resumed answer retained UNKNOWN for FG-102, FG-201 and FG-404, cited `ingredient-origin` / `EV-MASTER`, and reported the 2-of-5 passing population and complete three-counterexample list without claiming safety or contamination.
- **Saved WH-NORTH control:** the resumed answer correctly distinguished potentially preventable SHIP-002 from historical SHIP-001, with the saved intervention and evidence references. However, it formatted identifiers as invented `/records/`, `/evidence/` and `/assertions/` links. Those routes are not returned by the action. Its factual result passed; citation rendering failed.

Local commit `7a03736` repairs the existing judge prompt and saved handoff to require identifiers as inline code/plain text and forbid fabricated resource links. The existing three desk evaluations and answer-review rubric now include this regression. This does not add a tool, provider, scope, storage shape or engine change. The test configuration also accepts explicit dated evidence/report destinations so later runs need not replace prior browser captures.

The repaired source passed **258 tests**, typechecking/build and **18 Playwright journeys**, including first activation, saved reopening, complete follow-up, comparison, keyboard, narrow viewport, host-style dark tokens, reduced motion and axe. A separate judge-only export contains 131 hash-verified files, the original page/GET analyst and the same three scopes, with no MCP or Marketplace modules. Its build reused matching-lock dependencies; it was not a clean dependency installation. Full authenticated Forge lint returned **No issues found**. Vite's existing large-chunk warning remains.

The citation candidate is at `outputs/lotzero-citation-repair-2026-11-16/lotzero`, frozen from `7a0373689c164e78f5b8b39ee41bb8d4a2a1953a`. The sole mutating Forge command in this resumption was `forge deploy -e development`. It returned success and **2.9.0**. The development installation remains Up-to-date; no install/upgrade command was needed.

After reload, the existing saved case still opened on destination FAIL / SHIP-002 and the same selected path. Follow-up retained the complete prioritised queue and zero checked task/approval inputs. The actual native saved-hold handoff contained the repaired citation wording and exact saved inputs. No new case was saved. The temporary browser viewport override was reset.

The owner separately approved **one additional read-only WH-NORTH replay** on 2.9.0. It returned SHIP-002 as hypothetically potentially preventable, SHIP-001 as historical-retained, the saved control/evidence/path IDs, the complete two-movement population and matching revision. IDs rendered as inline code. The rendered panel contained only the actual LotZero context and Atlassian AI-notice links: no invented record/evidence/assertion URL. This observed replay passed the citation regression. Its DOM excerpt, link inspection and screenshot are retained privately. One response is not a general stochastic quality guarantee.

Exactly **four messages were approved and used**: the original three plus this one replay. No further prompt is authorised. A fresh reload/reopen after the replay again produced exactly the prior saved JSON, with zero checked inputs.

Read-only before/after inventories confirm all six production deployment rows and both production installations unchanged. All 14 protected website source/bundle hashes and the original working manifest still match the baseline. This task made no public hosting/publishing action; no new anonymous public-asset fetch was used as proof.

## Limits retained

- The native text export fallback and engine parity passed. One download activation produced no browser download event. Copy reported success, but the browser clipboard readback was empty. Automatic file download and exact OS clipboard transfer remain unverified.
- Raw Rovo action traces/tool-call counts and adversarial native trials remain unverified. Both the three-question allowance and the separately approved one-question replay are exhausted.
- Ordinary/denied-user, fresh-install, cross-site and hosted privacy/dependency acceptance remain separate release gates. This run does not establish production readiness, safety, recall timing, customer validation or another bonus.
- No production/install/sharing/public command, paid activation, credit purchase, new terms or access grant is part of this resumption.

Private snapshots, native answer captures, export-parity receipt, allowance, tests, build/lint/deployment logs and protection checks are under `evidence/first-gap-development-2026-11-16/` (ignored by Git). The three-question allowance is retained in the preceding day's evidence folder. No raw account evidence, credentials or media is committed or published.
