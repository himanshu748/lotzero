# Local productization verification — 6 November 2026

LotZero's next product increment is prepared locally. The existing public app, demo, submitted entry and installations were not changed. This is a source and development candidate handoff, not a Marketplace release.

## Delivered

- A bounded, resumable account-metadata privacy worker. It reports app-owned actor identifiers, journals provider instructions, removes attribution while preserving Jira action receipts and retry protection, and preserves remaining record retention. It is off by default and requires the existing Marketplace identity in **DEVELOPMENT**. See [behavior, limits and live gates](PRIVACY_REPORTING.md).
- A curated source exporter with explicit file selection, known-pattern credential checks, destination/symlink protection and content hashes. It excludes credentials, local configuration, private evidence, compiled bundles and media masters. It creates no Git repository, commit or push; no source license is chosen.
- Two local, 83-file source candidates in the sibling `outputs` directory: `lotzero-repository-candidate` retains the judge manifest; `lotzero-privacy-development-candidate` adds the development worker and reporting scope only to its own manifest. Each has its own `source-export.json` receipt. Neither is a remote repository or deployed app.

## What passed

| Check | Observed result | Evidence in original workspace |
|---|---|---|
| Original app tests | 208 passed; zero failed/skipped | [JSON](../evidence/productization-2026-11-06/unit-results.json) |
| Curated source candidate tests | 208 passed | [JSON](../evidence/productization-2026-11-06/candidate-unit-results.json) |
| Privacy development candidate tests | 208 passed | [JSON](../evidence/productization-2026-11-06/privacy-candidate-unit-results.json) |
| Original TypeScript | Passed | [Log](../evidence/productization-2026-11-06/original-typecheck-final.txt) |
| Both candidate Forge builds | Passed, including TypeScript | [Base log](../evidence/productization-2026-11-06/source-candidate-build-final.txt), [privacy log](../evidence/productization-2026-11-06/privacy-candidate-build-final.txt) |
| Original and privacy candidate Forge lint | No issues found | [Original log](../evidence/productization-2026-11-06/original-forge-final.txt), [privacy log](../evidence/productization-2026-11-06/privacy-candidate-forge-final.txt) |
| Existing local browser journeys | 13 passed; zero failures, flaky cases or skips | [Browser JSON](../evidence/productization-2026-11-06/browser-results.json) |
| Public assets | All 13 returned HTTP 200 and matched the previous release bytes | [Readback](../evidence/productization-2026-11-06/public-assets-readback.json) |
| Candidate content receipts | All listed hashes match; relative Markdown links resolve | [Final receipt](../evidence/productization-2026-11-06/verification-receipt.json) |

Browser coverage includes save/reload, comparison/export, seven-screen accessibility checks, keyboard access, mobile layout, reduced motion and selected-path/map controls. The browser run preceded the final backend/test-only refinements; UI and public-site source hashes remained unchanged. These checks do not establish a fresh live Jira installation or a reporting API call.

The base candidate completed a clean lockfile install using Node **22.23.4** and built both transports. The privacy candidate reused that dependency tree through an ignored local symlink; it did not receive a second independent clean install. No install-script policy was bypassed. The final receipt records exact source hashes, checks and public-readback boundaries.

One exporter regression exposed macOS path aliases bypassing destination protection; canonical physical paths now reject those aliases. The final type check also caught a test-fixture header type, which was corrected before the final passes. Failed pre-correction logs are retained. The first privacy-candidate lint ran before its required UI build and failed on the missing resource; the build-then-lint sequence passes. Existing peer/annotation warnings are documented separately from failures.

## Release gates

1. **Dependencies:** the unchanged lockfile reports six moderate production advisories; the complete development/tooling tree reports 43 advisories including five critical package entries. These counts do not establish exploitability of a hosted path. Review supported fixes before customer release; do not apply forced upgrades/downgrades blindly. See [dependency review](DEPENDENCY_REVIEW_2026-11-06.md).
2. **Privacy:** hosted provider behavior, real response headers, KVS expiry metadata, scheduling and interruption/recovery remain unverified. Imported/free-text personal data requires a reviewed request-handling process. The Marketplace privacy acknowledgment remains pending.
3. **Onboarding:** verify a permitted fresh Jira installation, an ordinary member and a tenant without Rovo. The five-minute first-result target remains unmeasured. Core rehearsal should not require Rovo.
4. **Distribution:** obtain the exact authorization for owner-controlled repository creation and any commit/push; later development deployment, new access grants, listing submission and public changes need their applicable approval. No new repository or Marketplace app identity is needed merely to inspect these candidates.
5. **Pilots:** recruit 3–5 consenting teams after the release/privacy gates. No teams have been recruited, contacted or represented as customers by this increment. Use the [pilot plan](MARKETPLACE_PRODUCT_PLAN.md) to record assistance, first results and return use.

No Forge deploy/install, environment-variable change, hosted reporting/erasure, public policy update, Marketplace submission, Devpost edit, YouTube change, recording, narration, outreach or purchase occurred in this increment.
