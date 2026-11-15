# LotZero competitive analysis

Research date: 28 October 2026. This is a targeted review of public vendor material, not an exhaustive market search or hands-on competitor evaluation. Vendor claims below are attributed, not independently certified. LotZero differences describe the intended implementation; completion must be supported by `FINAL_EVIDENCE.md`.

## Relevant alternatives

| Alternative | Publicly documented capabilities | Overlap | LotZero's intended difference |
|---|---|---|---|
| [FoodLogiQ Recall, Trustwell](https://www.trustwell.com/products/foodlogiq/recall/) | Recall/withdrawal notifications, location acknowledgments, escalation, batch-lot targeting through its traceability product, and mock recalls/withdrawals. | Direct overlap in recall rehearsal, traceability, audit records, and readiness. | A bounded Jira-native executable test: deterministic lot graph, explicit PASS/FAIL/UNKNOWN assertions, record-level counterexamples, version regression and time-aware hypothetical controls. Do not claim that mock recalls themselves are novel. |
| [Quality Events for Jira, Qity](https://marketplace.atlassian.com/apps/3669831043/quality-events-for-jira) and [Qity product overview](https://www.qity.be/) | CAPA, nonconformity, deviation/concession records, evidence collection; related design-control and product-lifecycle modules cover requirements traceability and parts/BOM. | Quality work in Jira, investigations, accountability and evidence. | LotZero evaluates hypothetical ingredient propagation across production/shipment records before creating a selected response bundle. CAPA management is adjacent, not a differentiation claim. |
| [SoftComply CAPA activity guidance](https://softcomply.atlassian.net/wiki/spaces/SS/pages/606249037758465/Step-by-step+guide+to+CAPA+Activities) | Assigned tasks, required fields, root-cause approval, implementation evidence and effectiveness checks in a controlled workflow. | Human approval, corrective actions, ownership and evidence. | Domain-specific graph counterexamples generate proposed tasks; effectiveness can be checked by rerunning the same scenario against changed records. Do not claim the first evidence-backed corrective-action workflow. |
| [Requirements & Test Management for Jira, Deviniti](https://marketplace.atlassian.com/apps/1220294/%26) | Requirements, test cases, plans, executions, defects, traceability matrices, and manual/automated tests. | Executable tests, coverage, repeatability and Jira issue links. | The test subject is a food-material genealogy and its evidence completeness; the graph computes affected associations and preserves unknowns. The software-testing metaphor is an adaptation, not a new testing invention. |
| [QC Compliance Assistant](https://marketplace.atlassian.com/apps/1236854/qc-compliance-assistant?hosting=cloud&tab=overview) | Confluence agents for QMS document drafting, internal audits and risk assessment. | Quality-team audience, audit preparation and documentation. | LotZero uses deterministic data evaluation, rather than AI-generated compliance guidance. No AI provider is needed for the core calculation. |
| [Jira Service Management for manufacturing](https://www.atlassian.com/software/jira/service-management/manufacturing) | Workflows, requests, incidents, asset inventory/ownership, maintenance and service coordination. | Manufacturing work coordination and inventory context. | Typed ingredient-to-shipment propagation and evidence assertions are the product's central calculation, rather than a configured task board. |

These sources establish adjacent features. They do **not** prove that a competitor lacks any unmentioned capability, nor that its private roadmap lacks LotZero's proposed combination.

## Defensible positioning

**LotZero turns a food-recall rehearsal into an inspectable test of traceability records inside Jira: select a source lot, compute documented downstream associations, show failed or unknown readiness assertions with counterexamples, simulate future controls without erasing shipment history, and rerun the saved scenario after records change.**

The meaningful claim is this particular implemented workflow and its evidence quality. A comparison video should show a broken link, the uncertainty it causes, and a regression diff after the link is repaired. A beautiful graph alone is not evidence of differentiation.

## Features that are insufficient on their own

- Inventory totals, status cards, a generic risk score or a static supply-chain diagram.
- Jira issue creation from a button, approval checkboxes or ordinary CAPA fields.
- A generic recall checklist or AI chatbot paraphrasing policies.
- A PDF/report without reproducible inputs and record identifiers.
- Calling a hypothetical intervention a prevented recall or a real shipment hold.

## Claims to avoid

No claims of first/only/global novelty, regulatory certification, guaranteed completeness, operational recall execution, measured customer savings, or superiority to a competitor's untested product. Do not reuse vendor performance percentages as evidence for LotZero. No customer interviews or live manufacturing validation were performed in this research.

## Cheapest discriminating demonstration

Use the fixed synthetic ING-A19 scenario. Inspect one source-to-shipment path; reveal a deliberately absent origin; preserve UNKNOWN for the affected branch; simulate a warehouse quarantine; show the historical shipment unchanged; correct records in a new dataset version and rerun. Only after explicit review create Jira drill tasks. Measure the known fixture outputs separately from any future customer study.
