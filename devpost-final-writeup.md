# LotZero

Rehearse the recall. Find the gaps before they matter.

## One ingredient. Four shipments. One missing destination.

In LotZero's fictional Northstar Foods rehearsal, ingredient lot ING-A19 has already travelled through production and repackaging. Some product has shipped. Some remains in stock. A shipment is connected to the ingredient, but its destination is missing.

For a food-manufacturing quality manager, that is the moment a mock recall becomes useful: can the team explain what the records establish, what they cannot establish, and what to investigate next?

LotZero brings that rehearsal into Jira.

## Try the rehearsal

[Open the interactive workspace](https://lotzero-recall.vercel.app/app/) and choose **Run sample rehearsal**. Find **SHIP-002** with record search and open **Selected path**. Inspect each step from ingredient to shipment while keeping the target in view. Switch to the full flow map to explore the other recorded associations, then simulate a **WH-NORTH** hold and save the report. The workspace keeps the source lot, hazard and scenario clock in view as you move from trace to evidence, rehearsal and report. Reopen the saved drill to continue where you left off.

No account is needed for the browser rehearsal. It uses fictional records, the same deterministic engine and local browser storage. For Forge storage, permission checks, approved Jira follow-up Tasks and the optional Rovo analyst, use the [Jira judge setup](https://lotzero-recall.vercel.app/support.html).

## Follow the evidence

Choose an ingredient and a hypothetical hazard. Explore the material-flow graph from ingredient lots through batches, finished products, warehouses and shipments. Select a record to inspect the path and documentary evidence behind its association.

The Northstar example reaches 3 product lots and 4 shipments. Nine evidence gaps remain visible. A missing record never becomes a reassuring claim that a product is unaffected.

## Turn a drill into a test

LotZero evaluates explicit readiness assertions: does every affected shipment have a destination? Can each finished lot be traced to ingredient origins? Does a warehouse have a response owner?

Results are PASS, FAIL or UNKNOWN, with counterexamples to investigate. This gives the team a concrete next question instead of an unexplained readiness score.

## Explain the rehearsal with Rovo

A quality manager can ask the read-only Recall rehearsal analyst why a saved drill failed. It reads that exact saved revision and uses the same deterministic engine as the report, pointing to record and evidence IDs.

In the Northstar rehearsal, SHIP-002 has no recorded destination: three of four shipments pass that check. Ingredient origin remains UNKNOWN for three product lots, with two of five passing. The analyst helps the team understand those counterexamples without turning missing evidence into a safety claim.

The analyst cannot change the scenario or create Jira Tasks. A person still reviews and approves follow-up work. Rovo must already be available on the tenant; the core traceability report also works without it.

## Rehearse the response without rewriting history

Try a hypothetical quarantine at WH-NORTH. LotZero uses the scenario clock to distinguish future movement that may be prevented from shipments that have already happened. SHIP-002 becomes potentially preventable; historical SHIP-001 stays in the impact.

Controls are simulations. They do not operate a warehouse or notify customers.

## Make the gaps someone's work

Review suggested follow-up Tasks, select the relevant Jira project, inspect the exact issue content, and explicitly approve creation. Keep the returned Jira receipts with the rehearsal. Save the dataset and scenario, export the evidence, then compare a later run to see which findings improved or regressed.

The goal is a repeatable conversation between records and people: trace, question, investigate, improve.

## Built for the Jira workflow

LotZero is a working Atlassian Forge project-page app with React Custom UI, a deterministic TypeScript engine and Forge-hosted storage. It uses Jira's signed-in user for permitted project metadata and approved follow-up work. The judge edition has been installed and exercised on an independent Jira site, including synthetic onboarding and save/reload. The original verification created one approved simulated-drill Task and checked its saved retry receipt.

The optional Rovo analyst is delivered through a Forge rovo:agent module and one read-only GET action. The server checks the signed-in user's Jira Browse permission, reads the requested saved rehearsal, verifies its revision and recomputes the deterministic result before returning selected evidence.

OpenAI Codex assisted development and testing. The public walkthrough uses edited captures of the actual native Jira app, captions and disclosed Deepgram Aura-2 Thalia narration. The recall engine itself requires no AI service.

## What we learned and what comes next

The hardest design decision was preserving uncertainty: incomplete genealogy, incompatible units and historical movement must survive a polished interface. The hardest integration boundary was making approved Jira writes recoverable without silently repeating an uncertain action.

Next comes feedback from manufacturing quality teams, stronger privacy operations and the separate Marketplace review. LotZero does not claim customer validation or regulatory certification. It rehearses the supplied records; qualified people remain responsible for real product-safety and recall decisions.

