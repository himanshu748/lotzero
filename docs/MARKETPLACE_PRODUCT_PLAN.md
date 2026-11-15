# LotZero: Marketplace product plan

Direction recorded **6 November 2026**: **Rehearse the recall. Find the gaps before they matter.** The product is a Jira Marketplace app for food-manufacturing quality teams, starting free to customers, with 3–5 real pilot teams as the next validation goal. This is a local plan and package update; it does not create a repository, contact teams, change remote pricing, submit a listing or authorize a deployment. LotZero remains lower priority than the owner's other three projects this week.

## What changes in priority

Marketplace readiness now matters as a product-distribution goal independent of the Codegeist bonus choice. The earlier [competition audit](CODEGEIST_AUDIT_2026-11-05.md) remains the requirements/evidence baseline. Keep its judge-install route and submitted entry intact. Do not switch the bonus selection automatically.

Launch on **Jira first**: the app already uses a Jira project page, project permissions and reviewed Tasks. Confluence is a later hypothesis, not a missing first-release module. Rovo remains optional; the core result must work without tenant AI availability. External MCP OAuth is a stretch and must not block a useful first release.

## Existing work and the real gaps

| Workstream | Current evidence | Next deliverable / acceptance |
|---|---|---|
| Source ownership | Code exists locally; no Git worktree or remote is configured. The 5 November audit identified no GitHub repository. | Prepare a curated private `himanshu748/lotzero` repository candidate. Include app source, fixtures, tests, lockfile and setup documentation; include landing source under a clear directory. Exclude credentials, local edition configuration, raw account/portal evidence, caches and media masters. Resolve relative build paths in an isolated copy before requesting explicit creation/commit/push approval. Do not upload the entire workspace or invent a source license. |
| Marketplace | Existing identity, provider profile, copy, eight assets and private draft are recorded. A fresh portal read on 6 November stopped at identity verification; draft contents/status were not reverified. | Reuse the existing Marketplace app and draft. Reconcile the exact build, privacy/security answers, support and end-user terms; obtain the real review ticket after an approved submission. A draft or partner profile is not a live listing. |
| First run | Latest UI already offers **Run sample rehearsal**; `runSample()` seeds only when no dataset exists and refuses an imported dataset. Server seeding requires project administration. | Promote the tested onboarding through the normal release gates. An authorized admin can install, open LotZero and reach the synthetic result without a separate account/API key. Explain the admin setup requirement and give ordinary members a useful next step instead of a dead-end mutation error. Never overwrite imported data to start a demo. |
| Pilot | No verified external pilot teams are recorded. | Recruit 3–5 consenting teams only after owner-approved outreach. Count installation, first useful result, assistance and a repeat rehearsal separately. A signup or demo view is not an active team. |

The source locations are unchanged: `outputs/lotzero` and sibling `outputs/lotzero-site`. The Marketplace identity is separate from the Codegeist judge identity. Preserve that separation during review and later releases.

## Free first, with an explicit operating model

Use **Free** as the initial customer-pricing direction in the local draft. Do not enable paid licensing, add a checkout, promise permanent free service or alter remote pricing in this pass. Atlassian's [payment-model guide](https://developer.atlassian.com/platform/marketplace/pricing-payment-and-billing/) describes Free and Paid via Atlassian; automated customer billing belongs to the latter.

Customer price and developer operating cost are separate. [Forge pricing](https://developer.atlassian.com/platform/forge/forge-platform-pricing/) bills consumption beyond monthly allowances. Before a pilot release, read current app usage, estimate the bounded rehearsal workflow and choose an owner-approved usage/cost ceiling. No credit purchase, payment-method change or new spend is authorized here.

Free-to-paid is a later migration, not a pricing-toggle assumption. The [Forge listing guide](https://developer.atlassian.com/platform/marketplace/listing-forge-apps/#add-licensing-to-an-existing-app) documents adding licensing and warns that existing installations become unlicensed until their admins subscribe. Review server-side entitlement checks, communication and a transition period before such a change. Do not add licensing to the judge app.

## Launch-blocking technical work

1. **Personal-data lifecycle.** Current snapshots, audit entries and action claims retain Atlassian account IDs; no reporter is declared in the current manifest. The [Forge privacy guide](https://developer.atlassian.com/platform/forge/user-privacy-guidelines/) requires reporting stored user data and handling erase/refresh responses. Implement and test the applicable reporting/erasure flow before making the portal acknowledgment. Preserve issue markers, receipts and uncertainty protections when removing personal identifiers; do not clear claims to force retries. Imported free text needs a defined request-handling process too. Synthetic business records do not make real actor IDs fictional.
2. **Onboarding acceptance.** On a permitted fresh Jira site, test admin setup → sample run → inspect SHIP-002 → explain FAIL versus UNKNOWN → save/reopen. Proposed target: first useful finding within **five minutes**; this is a target, not a measured result. Test an ordinary member, unavailable Rovo and an existing imported dataset. No automatic Jira issue creation.
3. **Release and trust.** Verify the chosen Marketplace build, permission boundaries, retention/reset behavior, support path, dependency checks and accurate privacy/security disclosures. Prepare end-user terms and any applicable DPA for owner review; do not accept or publish terms automatically. Run affected tests, types, build and Forge lint, then development verification before any requested production approval.

## A small pilot that tests the product

Seek one named quality/traceability lead and a site admin per team. Start with synthetic records; real commercial or personal records need the agreed privacy/access boundary. Record feedback manually with team codes, not an unsolicited analytics integration.

- **Team 1:** an observed installation to discover friction. Mark any assistance explicitly.
- **Teams 2–3:** follow the in-product path and setup guide; record whether they reach the first finding without intervention.
- **Teams 4–5:** confirm whether the same workflow holds across different team setups, if capacity permits.
- **After 7–14 days:** ask whether they reran a rehearsal, what changed and whether the report led to useful follow-up. A concise permission-aware feedback request is drafted below, not sent.

Proposed success thresholds: at least **three teams** complete a rehearsal, at least **two without setup help**, and at least **two return for a second rehearsal**. Also record failures and non-return reasons. These are learning gates, not promised traction or release guarantees.

| Team code | Opted in / install allowed | Installed | First useful result / minutes | Assistance | Second rehearsal | Main friction |
|---|---|---|---|---|---|---|
| P01 | Pending | — | — | — | — | — |
| P02 | Pending | — | — | — | — | — |
| P03 | Pending | — | — | — | — | — |
| P04 | Pending | — | — | — | — | — |
| P05 | Pending | — | — | — | — | — |

**Outreach draft — unsent:** “We're testing LotZero, a Jira app for rehearsing a food-traceability incident and finding missing evidence. Would your quality team and Jira admin try a short synthetic rehearsal and tell us where setup or the evidence is unclear? It does not operate a recall or certify safety. Participation is optional; we'll agree on access and any records before the session.” Final recipients and wording require owner approval before sending.

## Sequence and completion boundaries

1. **This week:** retain the working release, settle the source-package scope and define the privacy/onboarding increment. No additional bonus sprint.
2. **Next focused work:** implement the personal-data lifecycle and permission-aware first run locally, with regression coverage; prepare the curated repository candidate. Keep new scopes and deployment consent for a concrete reviewed candidate.
3. **After development verification:** obtain approvals for the exact source-repository action, relevant deployment/access grants and selected pilot outreach. Run the first pilot before making impact claims.
4. **Marketplace review:** submit the completed, approved package using the existing identity; retain the review ticket and address feedback. Keep Codegeist access stable. Do not promise a review date or business success based on other entrants' histories.
5. **Scale only on evidence:** use the 3–5-team results to decide on import integrations, Confluence support and eventual paid packaging. Preserve the [Codegeist deadline and demo gates](CODEGEIST_AUDIT_2026-11-05.md) throughout.

Completed locally: pricing direction, product/pilot plan, documentation research, code inspection, the bounded [account-metadata privacy worker and curated source exporter](PRIVACY_REPORTING.md), regression coverage and two prepared source candidates. The privacy manifest exists only in the isolated Marketplace development candidate; the current judge manifest is unchanged.

Still open: repository creation/publication, hosted privacy reporting, imported-data requests, operational recovery, fresh-site onboarding acceptance, pilot recruitment and Marketplace submission/publication. The clean install exposed [dependency advisories](DEPENDENCY_REVIEW_2026-11-06.md), which add a release concern. Local implementation does not establish full privacy handling or Marketplace readiness.
