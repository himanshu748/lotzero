# Security and threat model

This is an implementation threat model and operational checklist, not a certification, penetration-test report or guarantee. Live tenant isolation and Jira permission behavior must be verified before public distribution; current evidence belongs in `TEST_REPORT.md` and `FINAL_EVIDENCE.md`.

## Assets and trust boundaries

Protect imported traceability records, project datasets, immutable drill inputs, user identifiers, Jira issue content and idempotency/audit state. The boundaries are browser→resolver, resolver→Forge KVS, resolver→Jira and exports→the user's filesystem/spreadsheet. Browser payloads, imported strings, documentary references and remote API responses are untrusted.

The deterministic engine needs no AI. The optional Rovo analyst uses bounded read-only evidence calls; it has no write tool. There is no external database, supplier notification or shipment-control integration. The only intended external write is an explicitly reviewed Jira drill issue. Jira itself may apply the site's configured issue notifications or automation; LotZero does not override those policies. Use an appropriate test project.

## Controls in source

| Threat | Control | Remaining validation |
|---|---|---|
| Cross-project reads/writes | Server resolver context, Jira project lookup, Browse check and verified project ID in storage keys | Exercise with two differently permissioned users on a real site |
| Cross-installation access | Forge KVS installation partition, with per-project keys inside it | Clean installations and distinct sites |
| Unauthorized dataset change/reset | Project-admin check; reset requires exact DELETE confirmation | Live denied-permission test |
| Arbitrary Jira issue injection | Server regenerates suggestions from saved findings; strict payload IDs; maximum five unique selected actions; explicit approval | Tampered-payload test plus real Jira trial |
| Jira privilege escalation | `asUser()` calls; Browse/Create checks on target project; issue-type metadata validation | Actual project/type configuration |
| Duplicate or ambiguous issue creation | Atomic `FAIL_IF_EXISTS` claim, approval/uncertain record before POST, durable receipts, no blind POST retry | Concurrent/retry tests and live timeout reconciliation |
| Reset/create race | Per-project mutation lock serializes mutations | Interrupted invocation recovery remains operationally unverified |
| Malicious/oversized import | Strict Zod schemas, byte/record/string/ref limits, supported units/dates, bounded CSV parser | Malformed import fixtures |
| Cycles/conflicting data | Bounded traversal, cycle/duplicate/relationship checks, conservative uncertainty | Deterministic adversarial fixtures |
| HTML or formula injection | React text rendering; Markdown escaping; CSV formula-prefix escaping and quoting | Browser and export adversarial tests |
| Forged evidence | Store source IDs and provenance; do not execute documentary references; no unsupported assurance from missing records | Imported records still require human verification |
| Secrets disclosure | No browser API tokens, no credentials in fixture/export; `.env*`, `.forge/` and local identity config ignored | Review diff and built assets before any public release |

The manifest requests `read:jira-work` for project/permission/create-metadata reads, `write:jira-work` for approved issue creation, and `storage:app` for Forge KVS. These are classic scopes; absence of external egress does not remove the need to explain Jira data access. Do not claim 'Runs on Atlassian', Cloud Fortified, SOC 2 or legal compliance based solely on the manifest.

## Failure behavior

A failed import does not replace the current dataset. A saved drill uses the server's current dataset and validates the scenario/control inputs again. Storage failure before the Jira boundary prevents the write. If Jira may have accepted a POST, the action remains uncertain and retains its marker for investigation. A lost receipt write after successful creation is also uncertain to the caller; retrying must not bypass its durable claim.

Reconciliation must require project administration, explicit confirmation and a user-readable Jira issue with the correct marker. Absence from search is insufficient proof that a request failed. The implemented reconciliation operation is covered by mocked tests and remains live-unverified; it does not release claims when no matching issue is found. Check `FINAL_EVIDENCE.md` for the implemented scope.

A hard Forge invocation termination can leave the project mutation lock. Automatic lock expiry could permit overlapping writes and is intentionally avoided. Recovery needs the procedure in `INSTALLATION.md`; it has not been verified on a production installation.

## Security reporting and release gates

Owner must supply a monitored private security contact before Marketplace publication. Do not send private datasets, credentials or identity documents through a public issue. No support SLA, bug bounty enrollment or incident-response certification is asserted.

Before publishing: run tests/types/build and dependency review; inspect the relevant source/diff/ignore rules; confirm production transport uses Forge; exercise denied permissions, partial failure, replay and clean-install behavior; review public screenshots/exports for sensitive data; approve the exact privacy/legal disclosures. No current evidence should be inferred from this checklist alone.

Official references checked 28 October 2026: [resolver context security](https://developer.atlassian.com/platform/forge/app-context-security/), [KVS conflict policy and TTL](https://developer.atlassian.com/platform/forge/storage-reference/kvs-api/), [Jira issue API](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/), [Marketplace security workflow](https://developer.atlassian.com/platform/marketplace/app-approval-security-workflow/).

The manifest allows inline styles for validated graph coordinates. It does not allow unsafe inline scripts or eval. Dataset save checks a content fingerprint against reviewed input. A reset-in-progress tombstone blocks new writes after interrupted deletion until an administrator resumes the confirmed reset.

## Local judge candidate — 15 November 2026

The isolated judge manifest retains the existing three scopes and original GET analyst; optional MCP and Marketplace privacy registration are excluded. Repeated sample loading first checks project administration and full sample equality, preserving imported data and saved receipts. Recovery refreshes saved state and never replays a Jira POST. A run summary is a presentation projection; it changes no stored result or revision. Rovo task proposals expose bounded IDs only, with no claim of approval or creation. Timing remains unknown. Local tests are not proof of denied-user behavior on a hosted site. Dependency advisories and account-data lifecycle verification remain release gates.
