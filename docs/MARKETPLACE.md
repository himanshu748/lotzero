# Marketplace submission package — owner review required

Status: **PRIVATE MARKETPLACE DRAFT 106576423; NOT SUBMITTED FOR REVIEW.** No review-ticket URL or listing URL exists in this package. The bonus is not met by this file. Reconcile every capability and security answer with `FINAL_EVIDENCE.md` and the deployed manifest before submission.

The owner approved the Marketplace Partner Agreement, Marketplace Admin upgrade and public LotZero partner profile. The Developer Console confirmed **Public on Marketplace**; authenticated [partner management](https://marketplace.atlassian.com/manage/vendors/613592504/details) loaded for vendor **613592504**. See the [publication receipt](../evidence/marketplace-partner-publication.json). On 6 November, the owner chose free customer pricing first as the product direction; exact app-listing approval and remaining end-user/legal declarations are separate gates. The [current product plan](MARKETPLACE_PRODUCT_PLAN.md) records the pilot and onboarding priorities. A portal recheck on 6 November required identity verification, so the private-draft details below remain the last recorded state rather than a fresh portal confirmation.

## Separate app identities

| Edition | Purpose | Registered app ID | Distribution evidence |
|---|---|---|---|
| Judge | Unlicensed app, shared product source | `f2443992-e1df-4ee4-b6ee-50abce811c9b` | Production **2.4.0** deployed; sharing enabled; [actual link and verification scope](INSTALLATION.md) |
| Marketplace | Separate registration for Marketplace review | `38723408-eeba-4e64-8a81-903027d16f7c` | Production **2.2.0** deployed; no submitted ticket or public listing |

Do not submit the judge identity to Marketplace. Atlassian's [distribution guide](https://developer.atlassian.com/platform/forge/distribute-your-apps/) restricts developer-console sharing for licensed or Marketplace-submitted apps. Separate identity configuration must not fork product behavior; record each build's source revision/hash and manifest.

The [canonical local package](../marketplace-package/README.md) now contains [listing-draft.json](../marketplace-package/listing-draft.json), eight PNG assets, [copy/dimension validation](../marketplace-package/validation.json) and [native-capture provenance](../marketplace-package/asset-provenance.json). The logo was uploaded to the private draft. The listing was not submitted for review. The exact JSON copy supersedes abbreviated positioning below.

## Draft listing copy

**Name:** LotZero — Recall Readiness for Jira

**Tagline:** Rehearse the recall. Find the gaps before they matter.

**Summary:** Run repeatable food-traceability drills, inspect evidence gaps, and review corrective actions in Jira.

**Audience:** Packaged-food manufacturing quality managers, traceability specialists, and recall coordinators.

**Draft description, for publication only after the owner approves the listing:**

LotZero helps quality teams rehearse a fictional ingredient-lot incident using synthetic or imported traceability records. Follow material relationships from ingredients through production and repackaging to shipments. Inspect the records supporting each association, and see where evidence remains incomplete.

Run explicit readiness assertions and inspect counterexamples. Explore simulated controls without removing shipments that already occurred. Save the dataset version and scenario, compare reruns, and export the evidence. Review suggested Jira follow-up issues before explicitly approving creation.

LotZero is a rehearsal and record-review tool. It does not certify compliance, determine product safety, contact customers, or execute a recall. A documented association is not proof of actual contamination. Unknown means investigation is still required.

**Taxonomy observed in the actual form:** Data and analytics and Project management were selected in the unfinished About App step. They are not evidence of a submitted listing.

**Pricing direction, 6 November:** Free initially, as requested by the owner. This local decision does not submit the listing, change remote pricing, enable paid licensing or approve a final customer agreement.

## Required assets and links

| Item | Draft/preparation | Publication gate |
|---|---|---|
| Brand | 144×144 logo and 1120×548 banner pass local dimension validation; [public interactive marketing page](https://lotzero-recall.vercel.app/) | Partner profile published with owner approval; owner still reviews the exact app-listing package |
| Screenshots | Three 1840×900 native Jira highlights plus three 580×330 previews, with synthetic labels and source provenance | Local asset validation passed; no upload/submission performed |
| Support | Himanshu Jha / LotZero; jhahimanshu653@gmail.com approved and public on the marketing page | Use the [published installation/support guide](https://lotzero-recall.vercel.app/support.html) |
| Privacy | [Published owner-approved policy](https://gist.github.com/himanshu748/5fdad6ed1e6daf7f159c39f6ddcfbb58); technical inventory in `PRIVACY.md` | Reconcile final listing answers with actual processing; personal-data storage is Yes |
| Terms/license | Forge registration terms accepted with owner approval; no card added, possible invoices accepted | Marketplace Partner Agreement accepted with owner approval; end-user/source-license and any applicable DPA decisions remain pending |
| Documentation | `README.md`, `INSTALLATION.md`, public landing-page FAQ and [2:55 native walkthrough](https://youtu.be/nsw-z9XYY1g) with Deepgram narration and captions | [Installation/support guide is published](https://lotzero-recall.vercel.app/support.html); use it in the actual listing |
| Security | `SECURITY.md`, tests, permission explanations | Complete actual questionnaire using current implementation evidence |
| Judge access | Separate unlicensed production edition; signed public link install and all 12 onboarding steps passed on an independent site | Retain the judge identity; basic separation observed, adversarial/denied-user tests still unverified |

The actual About App form requires a Personal Data Reporting API acknowledgment when personal-data storage is Yes. It remains **unchecked**: reporting and fine-grained erasure implementation have not been established. This is a concrete review gate, not a compliance certification or a submitted questionnaire response. The separate Marketplace distribution is configured for Jira with personal-data storage Yes; [receipt](../evidence/marketplace-distribution.json).

## Draft technical questionnaire worksheet

These are proposed evidence-backed answers, **not legal certifications or submitted responses**. Exact portal question wording may change.

| Topic | Answer to verify against the release | Evidence required |
|---|---|---|
| Authentication | Forge supplies authenticated invocation context; Jira requests use supported Forge APIs. No end-user API-token collection is intended. | Resolver code and live unauthorized-access tests |
| Authorization | Validate the server-provided project context and permissions before data access or Jira writes. Browser payloads must not establish identity or authority. | Cross-project and denied-permission tests |
| Persistence | Forge-hosted storage for datasets, snapshots, approval/issue state and audit metadata. | Manifest storage scopes; storage key boundaries; reset tests |
| Personal data | Synthetic demo has fictional destinations. Imports/free-text may contain personal data; Jira account identifiers used for initiation/audit can be personal data. Personal-data storage remains Yes. Current project reset is not an individual-account erasure service. | Review the actual field inventory, imported/free-text handling, individual requests, redaction, export and retention behavior |
| External transfer | No external database or AI provider is required. Jira receives explicitly approved drill issue content. Confirm the manifest has no unexpected remote hosts or egress. | Manifest and network/runtime inspection |
| Secrets | No browser secrets, hardcoded credentials or credentials in exports. Deployment credentials stay outside source. | Ignore rules and relevant source/diff scan |
| Reliability | Bounded imports/traversal; explicit uncertainty; retry-safe Jira issue creation, with partial/ambiguous failures exposed. | Actual test report and live Jira retry experiment |
| Vulnerability management | Do not claim a security program, certification, penetration test or response SLA without operational evidence. | Dependency scan, disclosure contact and owner-approved incident procedure |
| Residency/encryption | Use Atlassian documentation for platform properties; do not claim product-wide residency or encryption guarantees not assessed. | Current platform terms and verified application data flow |
| Retention/deletion | State the implemented policy exactly, including Jira copies and uninstall recovery behavior. App reset must not imply deletion of already-created Jira issues. | `PRIVACY.md`, deletion tests and actual provider lifecycle |

## Submission procedure

The [Forge listing guide](https://developer.atlassian.com/platform/marketplace/listing-forge-apps/) requires sharing configuration and publishing the Developer Space; it asks for scopes and any remote hosts. Its one-week review target differs from the [general approval guide](https://developer.atlassian.com/platform/marketplace/app-approval-guidelines/), which currently gives 10–15 business days. Neither is a guaranteed deadline.

1. Retain the verified first-install Forge/Jira journey, private LZR-1 receipt, source hash, manifests and screenshots. The guarded live retry returned LZR-1 and independent Jira marker search showed 1 of 1. Native export text and exact OS-paste clipboard contents are verified; [clipboard receipt](../evidence/native-clipboard-2026-10-30.json). Fresh sharing-link onboarding passed on an independent site; [second-site receipt](../evidence/judge-second-site-verification.json). Automatic native downloads, denied-user permissions and adversarial tenant isolation remain unverified.
2. Use the already registered/deployed Marketplace identity above. Retain the final production version and source hash; do not re-register it.
3. Use the approved public privacy policy and support contact above. Use the published installation/support guide and finalize the still-pending end-user/source-license terms for owner review.
4. Retain the recorded owner approval and acceptance of the Marketplace Partner Agreement and public partner profile. Obtain approval for the exact app listing, pricing and outstanding end-user/legal declarations before the relevant final action.
5. Complete the current [app security workflow](https://developer.atlassian.com/platform/marketplace/app-approval-security-workflow/): app and partner questionnaires, Privacy & Security fields, and vulnerability review.
6. Owner completes [partner due diligence](https://developer.atlassian.com/platform/marketplace/partner-due-diligence/) when requested. It may require business information, identity documents and selfie verification. Do not collect those documents in this repository.
7. Submit through the actual portal. Save the resulting review-ticket URL and receipt; only then describe the app as submitted for Marketplace review.
8. Resolve review feedback. Record approval/publication only after it actually occurs. Retest the separate judge sharing link.

## Submission receipt

- Approval to register/deploy and accept Forge terms: **obtained; possible invoices accepted; no card added**
- Marketplace Partner Agreement, Admin role and public profile: **owner-approved and executed; vendor 613592504; authenticated management access verified**
- Approval to submit this exact Marketplace app listing, pricing and remaining end-user/legal declarations: **missing**
- Partner identity/business due diligence: **unverified; profile publication and management access do not prove completion**
- Marketplace app ID: **`38723408-eeba-4e64-8a81-903027d16f7c`**
- Production build: **Marketplace 2.2.0 deployed; judge 2.4.0 separately deployed**
- Local package: **listing draft and eight PNG assets validated; native-capture provenance retained**
- Submitted source/build: **none; listing not submitted**
- Review-ticket URL: **missing**
- Public listing URL: **missing**
- Submission/approval date: **not submitted / not approved**
