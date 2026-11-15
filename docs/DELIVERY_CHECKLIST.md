# LotZero delivery checklist

Created 2026-10-28. All 60 checkpoints start unchecked. A check requires evidence below; local, mocked, live and published evidence are distinct.

- [x] 01. Inspect the repository and identify existing assets.
- [x] 02. Verify relevant current Forge APIs and CLI commands.
- [x] 03. Verify current Codegeist eligibility and submission requirements.
- [x] 04. Research competing products.
- [x] 05. Document the precise novelty claim.
- [x] 06. Record assumptions, dependencies, and external blockers.
- [x] 07. Define MVP and post-MVP priorities.
- [x] 08. Establish an evidence-based completion process.
- [x] 09. Write `PRD.md` with user stories and acceptance criteria.
- [x] 10. Write project-specific `design.md`.
- [x] 11. Document the architecture and data flow.
- [x] 12. Specify the dataset schema and provenance model.
- [x] 13. Define complete user journeys.
- [x] 14. Document a security and privacy threat model.
- [x] 15. Define responsive and accessibility requirements.
- [x] 16. Write the planned demo story and expected outcomes.
- [x] 17. Implement validated TypeScript data schemas.
- [x] 18. Implement CSV import and record validation.
- [x] 19. Implement typed lot and shipment relationships.
- [x] 20. Build deterministic graph construction.
- [x] 21. Implement forward traceability traversal.
- [x] 22. Implement backward traceability traversal.
- [x] 23. Correctly handle splits and merges.
- [x] 24. Implement compatible quantity and unit calculations.
- [x] 25. Propagate incomplete and ambiguous evidence as unknown.
- [x] 26. Detect duplicates, cycles, and invalid relationships.
- [x] 27. Model time-aware shipment and quarantine states.
- [x] 28. Implement reproducible scenario snapshots and comparisons.
- [x] 29. Implement the Jira project-page interface.
- [x] 30. Implement synthetic dataset onboarding.
- [x] 31. Build the Recall Readiness screen.
- [x] 32. Build the New Drill workflow.
- [x] 33. Build the interactive Impact Explorer.
- [x] 34. Build evidence-path inspection.
- [x] 35. Build the assertion and gap inspector.
- [x] 36. Implement transparent readiness metrics.
- [x] 37. Build the counterfactual intervention simulator.
- [x] 38. Implement evidence-backed report export.
- [x] 39. Configure valid Forge modules and minimal scopes.
- [x] 40. Implement persistent Forge storage.
- [x] 41. Connect to a real Jira site and project.
- [x] 42. Implement Jira issue bundle previews.
- [x] 43. Implement explicit approval for Jira writes.
- [x] 44. Implement retry safety and issue-creation idempotency.
- [x] 45. Implement working Jira issue links and permission errors.
- [x] 46. Implement audit records and data privacy controls.
- [x] 47. Unit-test deterministic forward and backward tracing.
- [x] 48. Test quantities, missing information, and uncertainty.
- [x] 49. Test counterfactual scenarios and graph edge cases.
- [x] 50. Test malicious and malformed imports.
- [x] 51. Test Forge resolvers and Jira error handling.
- [x] 52. Test primary frontend user journeys and accessibility.
- [ ] 53. Verify the complete flow on a clean Jira installation.
- [x] 54. Run and document reproducible performance and correctness benchmarks.
- [x] 55. Deploy and verify the production Forge build.
- [x] 56. Create a separate unlicensed judge-installable Forge edition.
- [x] 57. Test the judge installation link and onboarding instructions.
- [ ] 58. Prepare and submit the Marketplace edition for review, subject to required approval.
- [x] 59. Prepare a public YouTube demo under five minutes, with the core demonstration within the first three minutes.
- [x] 60. Prepare the complete, truthful Devpost submission and final evidence report.

## Evidence ledger

Updated 30 October 2026. **58/60 checkpoints have implementation and exercised evidence.** The checked items retain the distinction between local, mocked and native provider proof.

| Checkpoints | Evidence and acceptance boundary |
|---|---|
| 01–16 | PRD, design, architecture, threat model, research, competitive analysis, provenance and demo plan. The owner personally affirmed the required eligibility declarations and rules/terms for the submitted Codegeist entry. |
| 17–28, 47–50, 54 | 41 engine tests and fixed synthetic ground truth; benchmark.json. Timings exclude network/provider overhead. |
| 29–38, 52 | Seven working screens; local browser tests, accessibility/keyboard/mobile/reduced-motion checks; actual Jira project-page entry, evidence inspection, simulation and report UI. Native JSON/Markdown/CSV text exports and exact OS-paste clipboard contents are verified; automatic native downloads remain unverified. |
| 39–41, 55 | Both actual identities pass Forge lint and deploy to production: judge 2.4.0 and Marketplace 2.2.0. Judge installed on one-atlas-obka.atlassian.net in private LZR and through the public sharing link on lotzero-judge-verify.atlassian.net in KAN. Dataset and saved snapshots survive reload in Forge KVS. Actual TTL expiry and adversarial tenant-isolation tests remain unverified. |
| 42–46, 51 | Explicitly approved real Task LZR-1 for SHIP-002. Native issue link opened; guarded same-action retry returns LZR-1, and independent Jira marker search shows 1 of 1. Permission-denial, ambiguous outcomes, concurrency, reset and recovery failure cases use mocked service/adapter tests. |
| 56–57 | Distinct unlicensed judge app registered, deployed and shared. Actual signed public link installation and all 12 onboarding/trace/save/reload steps passed on an independent site; initially empty, no original LZR-1 receipt, no Jira issue created. Basic separation observation, not adversarial or denied-user proof. |
| 59 | [Public native Jira walkthrough](https://youtu.be/nsw-z9XYY1g), 174.788 seconds (2:55), Deepgram Aura-2 Thalia narration only, edited native captures with disclosure and captions. Anonymous metadata and 53 seconds of public playback with matching captions verified; [metadata](../evidence/youtube-public-metadata.json), [playback](../evidence/youtube-public-playback.json). |
| 60 | [Codegeist entry](https://devpost.com/software/lotzero), submission **1273039**, returned **Submitted** at **21:05 IST on 30 October 2026**. Public-page readback showed **SUBMITTED TO** Codegeist and **Edit hackathon submission**. Owner declarations/approval obtained; product-story write-up, public Deepgram video, exact judge link, thumbnail and three native screenshots included. No Marketplace bonus selected; [submission receipt](../evidence/devpost-submission-receipt.json). |

Machine-readable native receipt: [live-acceptance-2026-10-29.json](../evidence/live-acceptance-2026-10-29.json). Test details: [TEST_REPORT.md](TEST_REPORT.md). Production/source receipts: [FINAL_EVIDENCE.md](FINAL_EVIDENCE.md). New verification: [native clipboard](../evidence/native-clipboard-2026-10-30.json) and [second-site installation](../evidence/judge-second-site-verification.json).

## Remaining checkpoints

- **53 — partial:** Native onboarding, trace, simulation, snapshot save/reload, the approved Jira Task/retry and all three exact OS-paste clipboard exports passed. The fresh second-site link journey also passed. Automatic native browser file downloads remain uncaptured, so the complete-flow gate remains conservatively partial.
- **58 — incomplete:** Separate Marketplace app **38723408-eeba-4e64-8a81-903027d16f7c**, production **2.2.0**, deployed; listing copy and eight PNGs pass local validation. Partner Agreement/Admin upgrade/public profile are executed for vendor **613592504**. Sharing is configured with personal-data storage **Yes** and portal draft **106576423** exists. The Personal Data Reporting API confirmation remains explicitly unchecked; implementation/applicability is unresolved. Exact app-listing/pricing approval, remaining end-user/legal declarations and actual review submission remain open. No review ticket or public app listing exists.
Checkpoint **60 is complete** for the actual Codegeist submission and evidence report. This does not close the separate native-download or Marketplace review gates.

The additional [interactive marketing landing page](https://lotzero-recall.vercel.app/) is published and separately verified: two browser tests pass in 7.7s, zero axe violations in tested states, desktop/mobile/keyboard/reduced motion and exact install links exercised. Anonymous public readback matched all four tested assets; public mobile interaction was also checked. This does not replace Forge or submission evidence. See [landing results](../../lotzero-site/evidence/browser-results.json) and [public readback](../../lotzero-site/evidence/public-readback.json).

The support guide and new landing-page footer links added locally on 30 October are **not published** in the recorded marketing deployment; they are not claimed as public listing documentation. No application source change, new test run or Forge deployment was performed for this submission-only update.
