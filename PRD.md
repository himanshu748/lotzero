# LotZero product requirements

Rehearse the recall. Find the gaps before they matter.

## User and outcome
Food-manufacturing quality managers rehearse a fictional ingredient-lot hazard, find evidence gaps, inspect why records were associated, simulate future controls, and explicitly approve Jira remediation work. Success is a reproducible evidence-backed drill, not an arbitrary readiness score.

## Scope and acceptance
1. A fresh Jira installation can load one clearly synthetic dataset and run ING-A19 at a fixed scenario time.
2. Forward/backward graph traversals preserve record paths, splits/merges, missing evidence and uncertainty; independent fixtures check expected outcomes.
3. Each configurable readiness assertion reports PASS/FAIL/UNKNOWN with denominator and counterexamples; absence of evidence cannot become safety.
4. Quarantine/hold simulation affects only eligible future movements; prior shipments remain exposed.
5. Import validates untrusted CSV/JSON; exports include provenance and neutralize CSV formula injection.
6. A user previews selected Jira tasks, chooses a permitted project/type and explicitly confirms creation. Server validates authorization and exact saved findings. Concurrent retries cannot silently duplicate tasks; indeterminate outcomes stop for reconciliation.
7. Saved snapshots retain the dataset, scenario, interventions and action receipts; reruns compare assertion changes.
8. Keyboard users can complete the flow using a record table in place of the graph. Desktop and mobile browsers show useful empty, busy and error states.
9. Real Forge/Jira deployment is independently verified; browser-local mode is visibly labeled and cannot fake Jira creation.

## Milestones
A: install, seed, trace, gap, evidence, real approved Jira task, demo and judge access.
B: intervention controls, comparisons, import/export, security tests and Marketplace preparation.

## Non-goals
No operational recall execution, customer notifications, shipment changes, safety certification, AI provider, external database, inventory allocation optimizer, paid resources, or publication without owner approval.

## Constraints and assumptions
TypeScript, React Custom UI, Forge project page/resolver/KVS; deterministic engine. Synthetic example dates fixed at 2026-10-28T09:00:00Z. Quantities describe recorded shipments, never inferred contamination mass. Dataset and snapshot byte/record limits are enforced. Jira data is scoped to authorized project members within each installation. Owner identity, support contact and legal terms remain external decisions.

## Journeys
Clean installation → load synthetic data → create drill → impact/evidence → failed assertions → simulate → save snapshot → review selected Jira tasks → confirm → export. Correction journey: import repaired dataset → rerun same scenario → compare saved snapshots. Failure journey: missing destination remains a failed assertion; API denial creates no successful receipt; indeterminate Jira write is never auto-retried.

## Completion evidence
See docs/DELIVERY_CHECKLIST.md. A source build or local browser does not satisfy deployment, installation, real Jira, public video or Marketplace submission checkpoints.
