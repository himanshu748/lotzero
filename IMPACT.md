# Rehearse the recall. Find the gaps before they matter.

A plant quality lead starts with an ingredient lot and a practical question: which recorded products and shipments are associated with it, and which parts of the answer can the records support?

LotZero turns that question into a Jira-based rehearsal. The user inspects a trace, tests specific assertions and sees a counterexample when a destination, owner or evidence link is missing. They can rehearse a hypothetical control, preserve the inputs in a saved report and review proposed Jira work before approving any Task. UNKNOWN remains an explicit result.

## Why this workflow matters

Traceability depends on connected records. For example, the FDA describes key data elements associated with critical tracking events in its [Food Traceability Rule overview](https://www.fda.gov/food/food-safety-modernization-act-fsma/fsma-final-rule-requirements-additional-traceability-records-certain-foods). That supports the importance of inspectable record relationships; it does not validate LotZero, establish that a particular business is subject to the rule, or make this app a compliance solution. No compliance-date or guaranteed-response-time claim is made here.

The intended audience is a quality/traceability lead working with a Jira administrator. A weekly synthetic mock recall is one possible operating cadence to test with a team, not a researched industry norm or regulatory prescription. The product aims to replace the manual assembly of one rehearsal's findings across spreadsheets and email with a saved, inspectable result and permission-aware follow-up. It does not replace ERP traceability, official records, expert judgment or operational recall procedures.

## What the demonstration establishes

The fictional Northstar scenario exposes SHIP-002's missing destination and distinguishes that failure from an uncertain ingredient origin. A simulated control retains historical shipments. Saved inputs can be reopened and compared, and real Jira writes have a separate exact-content approval gate. The current local candidate adds a clearer first run and evidence summary; hosted acceptance of that candidate remains pending.

The distinctive mechanism is deterministic trace/assertion evaluation, exact saved-revision evidence for the optional Rovo explanation, and a separate permission/approval/receipt path for Jira Tasks. The agent explains an inspectable finding instead of making an operational decision.

## What still needs validation

There are no customer, pilot, time-saving, revenue or safety-impact claims. Test with consenting quality teams whether they can reach and explain a finding, identify missing records, return for another rehearsal and use the proposed follow-up. Record assistance and failures as well as successes. The 60-second first-finding objective is a product target after the installed app opens, not an installation SLA or a measured native Jira result.

## Limitations and what's next

Simulation only; no certification or safety determination. Missing records remain unknown. Imports use a typed fixture schema with fixed bounds. Timing of evidence retrieval and real recall response is not measured. Rovo is optional and tenant-dependent. Account identifiers and imported/free-text personal data need the documented privacy lifecycle and release review; a synthetic business-data label is not a blanket privacy guarantee. Resolve dependency advisories, run the owner-approved fresh-site checks, then test the workflow with real teams before adding more integrations.
