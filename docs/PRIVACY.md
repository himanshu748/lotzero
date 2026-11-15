# Privacy and retention — technical processing inventory

**6 November development note:** a local account-metadata reporting/erasure candidate now exists; see [PRIVACY_REPORTING.md](PRIVACY_REPORTING.md). It is disabled in the current judge manifest and restricted to Marketplace development. No hosted reporting or erasure, production activation, public-policy update or Marketplace acknowledgment occurred. The published 30 October behavior and policy below remain the live baseline. Imported personal-data handling and operational recovery still need review.

Updated 30 October 2026. The owner approved publication of the [LotZero Privacy Policy](https://gist.github.com/himanshu748/5fdad6ed1e6daf7f159c39f6ddcfbb58), effective 30 October 2026, provided by **Himanshu Jha**, with **jhahimanshu653@gmail.com** as privacy/support contact. Its published content was read back and matched `legal/privacy-policy.md`. This document is the technical processing inventory supporting that policy. Judge distribution declares personal-data storage **Yes**, including retained Atlassian account IDs. No GDPR or other legal-compliance certification is asserted.

## Data processed

- Synthetic seed records contain fictional suppliers, ingredients, batches, warehouses, destinations, quantities and evidence. They are labeled synthetic.
- Imports may include commercially sensitive or personal information in labels, owners, destinations and documentary references. The synthetic flag is a label, not verification that imported content contains no personal data.
- Drill snapshots include the full dataset, scenario, interventions, result, save timestamp and the initiating Atlassian account ID.
- Audit entries contain account ID, time and event; event text may include dataset versions and drill/action references.
- Jira action receipts currently include action summary/description, record/evidence IDs, outcome/error, and created issue key/URL when available. Claims include the approving actor, time, target project/type and marker.
- Jira project names/IDs, permission results and issue-type metadata are read to support authorized coordination. No passwords or end-user API tokens are requested by the application.

## Storage and disclosure

In the Forge edition, these records use Forge-hosted KVS. Forge isolates installations, and LotZero adds verified project-specific keys and permission checks. Approved issue text is copied to the selected Jira project, where that project's access rules and automation apply. A user authorizing a cross-project task is authorizing that disclosure.

The application does not require an external database, AI provider or third-party analytics service. It does not send customer recall notices or operate shipment systems. Platform/CLI service telemetry and provider operations are governed separately by Atlassian. Do not infer a public badge, residency status or organization-wide security guarantee from this architecture.

Downloaded Markdown, JSON and CSV are local copies controlled by the downloading user; JSON snapshots can contain the full imported dataset. Sharing an export shares that data. Browser rehearsal uses the `lotzero.local.v1` localStorage key on the rehearsal origin; it does not connect to Jira or Forge persistence.

## Optional Rovo analyst — judge production 2.5.0

The development/staging analyst receives explicit project/snapshot/revision identifiers and returns project-authorized, bounded record paths, evidence IDs, assertion states/counterexamples and saved intervention effects to Atlassian Rovo. It withholds dataset labels, documentary free text/URLs, owners, actor IDs and issue bodies. Imported identifiers can still be sensitive. The user's prompt and returned summaries are processed by Atlassian's AI service; LotZero does not supply a separate AI-provider API key or call an external model host.

Rovo conversation retention is governed separately by Atlassian and tenant settings. LotZero's 90-day snapshot TTL and project reset do not promise to erase Rovo chats. The core evidence workflow remains available without Rovo. Only synthetic records were used in hosted verification. The owner approved the full revised disclosure, which is now public at the existing policy URL and matches the updated local canonical copy. [Publication/readback receipt](../evidence/rovo-2026-10-30/privacy-publication.json). The separately retained draft is the review artifact, not a second published policy.

## Retention

| Record | Application retention |
|---|---|
| Current Forge dataset | Until overwritten or explicit project-data deletion |
| Forge drill snapshots | 90-day TTL from save |
| Forge audit entries | 90-day TTL from event |
| Jira receipts and action claims | Until explicit project reset; retained to prevent silent duplicate retries |
| Mutation lock | Removed after normal completion; interrupted invocations can leave it until deliberate recovery |
| Local rehearsal data | Browser localStorage until reset/browser clearing; currently capped histories, no timed expiry |
| Created Jira issues | Jira's independent retention/access policies; app reset does not delete them |
| Downloaded reports | User-controlled; app reset cannot delete downloads |

[Forge TTL documentation](https://developer.atlassian.com/platform/forge/storage-reference/kvs-api/) states expired items can remain readable while asynchronous deletion completes, potentially up to 48 hours. The current adapter does not enforce stricter expiry filtering; do not promise deletion at exactly 90 days.

## Deletion and access

Export needed reports first. A source-project administrator can use LotZero's confirmed project-data deletion control. The intended reset removes that project's current dataset, snapshots, action receipts/claims and audit history. Uncertain Jira outcomes block reset until reconciliation so idempotency evidence is not silently erased. Deletion is not secure erasure of every provider backup. Confirm successful reset by reopening the project and checking that onboarding is empty.

[Atlassian's hosted-storage lifecycle](https://developer.atlassian.com/platform/forge/storage-reference/hosted-storage-data-lifecycle/) distinguishes removal from primary storage from provider soft-deletion/backups. Uninstall is not a promise of immediate irreversible erasure. Reinstallation is treated as a new installation; provider-supported recovery/relinking can be requested within 21 days. The provider's retention policy governs its retained copies. No old 28-day retention promise is made here.

There is no individual-account erasure workflow implemented beyond project reset. If imported personal data, actor-specific erasure, legal hold or access requests require finer-grained handling, the owner must resolve that before adopting the app for real sensitive records or representing Marketplace privacy compliance. Do not put identity-verification documents in the application or repository.

## Published details and remaining owner decisions

The provider identity, public privacy/support contact and policy URL above are owner-approved and published. The owner separately approved the Marketplace Partner Agreement, Marketplace Admin upgrade and public LotZero partner profile; publication and authenticated partner-management access were verified for vendor 613592504 ([receipt](../evidence/marketplace-partner-publication.json)). End-user terms, any required DPA and source licensing remain separate decisions. The current policy directs access/correction/deletion requests to the approved contact, subject to authority verification; the release does not provide an automated account-specific erasure workflow. Marketplace Privacy & Security answers must describe these limits accurately. Publishing the policy and enabling judge sharing did not submit the Marketplace listing.
