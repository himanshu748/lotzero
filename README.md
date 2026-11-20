# LotZero

**Rehearse the recall. Find the gaps before they matter.**

LotZero is a Jira app for a food-manufacturing quality manager's mock recall. Trace one ingredient lot to its shipments, test what the records establish, rehearse a control and assign the gaps after explicit approval. The read-only Recall rehearsal analyst explains the same saved evidence through Rovo.

The current development design, **The first gap**, opens the Northstar sample directly on **SHIP-002's missing destination**. A FAIL is a failed assertion; UNKNOWN means the records cannot establish an answer. Neither status nor a PASS is a product-safety decision.

## Development verification — 17 November 2026

**Development 2.11.0 is deployed and its core Jira flow is verified.** [Open LotZero Dev in LZR](https://one-atlas-obka.atlassian.net/jira/software/projects/LZR/apps/f2443992-e1df-4ee4-b6ee-50abce811c9b/d0324e54-93c3-4fc6-8d7f-5febd8e6dfe0). Sample → SHIP-002 → hold simulation → save/reopen → follow-up passed, including the approval boundary and analyst fallback/handoff. Actual JSON, Markdown and CSV downloads passed on 2.11; JSON clipboard content matched the downloaded file byte-for-byte. Local validation previously passed 308 tests, 29 browser cases, type/build and full Forge lint. No new Jira issue or Rovo question was used. See [current verification and limits](docs/DEVELOPMENT_2_11_VERIFICATION_2026-11-17.md) and [ten critique decisions](docs/TEN_CRITIC_REVIEW_2026-11-16.md). Production and the live page/demo remain unchanged.

## Run locally

Use Node 22.23.4 and npm. Clone the [source repository](https://github.com/himanshu748/lotzero):

```sh
git clone https://github.com/himanshu748/lotzero.git
cd lotzero
```

From the app directory:

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4173. The browser transport stores data in localStorage and disables Jira writes and Rovo execution. It uses fictional Northstar records, not customer or ERP data.

1. On **Home**, activate **Run Northstar sample (synthetic)** once. It loads the unchanged sample idempotently and runs ING-A19 without saving or creating work.
2. **Rehearsal** opens on destination FAIL / SHIP-002, with the selected path **ING-A19 → BATCH-101 → FG-101 → SHIP-002** and its inspector. Select other findings or switch to Flow map / Record table. Inspecting an ancestor keeps the path anchored to the shipment.
3. Choose **Rehearse a hold**. WH-NORTH is suggested for this finding; select/add the warehouse quarantine explicitly. With EV-DRILL, SHIP-002 is hypothetically potentially preventable. Historical SHIP-001 remains in impact. No shipment changes.
4. **Save and follow up**. Review the destination proposal first, expand other assertion groups and inspect exact issue content. Nothing is preselected. In an authorised Forge installation, choose the permitted project/type and explicitly approve before Jira creation. Uncertain outcomes require reconciliation.
5. In **Ask the analyst**, select a saved-evidence question. With an enabled Jira/Rovo installation, open it in the existing analyst. The full saved revision is sent internally; the page shows a short reference and exposes the full value. In browser preview, the on-page counterexamples remain usable and are labelled as saved records, not a model answer.

Home also launches the existing scenario form and JSON / `record_type,json` CSV import. Imports retain the 200 KB, 1,000-node and 3,000-edge limits. Replacing records requires confirmation and preserves saved rehearsals. To compare corrections, save the sample, return Home, open Records and workspace controls, load the corrected sample, choose the same source, hazard, assertion set and scenario clock (Northstar: `2026-10-28 09:00 UTC`), run and save. Comparison and JSON/Markdown/CSV exports are below the work and analyst in Follow-up.

## Four screens, one case

- **Home:** records, sample/new-drill actions and searchable saved rehearsals.
- **Rehearsal:** FAIL-first findings, selected evidence path, inspector, map and table.
- **Rehearse:** proposed controls beside original versus simulated movement.
- **Follow-up:** prioritised proposals/receipts, the saved-revision analyst, exports/comparison and one limitations disclosure.

The React Custom UI uses ADS buttons, lozenges and design tokens. Forge enables host theming with `view.theme.enable()`; the standalone preview uses the documented token theme loader. There is no external font dependency: Atlassian typography tokens use their system sans/mono fallbacks when the Atlassian fonts are unavailable. Keyboard, focus, narrow layouts and reduced motion are covered by browser checks.

## Check this source

```sh
npm run typecheck
npm test
npm run build
npx playwright test --config playwright.first-gap.config.ts
npm run forge -- lint
```

The first-gap config uses port 4352 and preserves older screenshot folders. It tests the browser transport, not native Forge access or model answers. `npm run build` creates the Forge resource locally; it does not deploy. **Do not use `build:web` for this pass**: that older script writes into the protected sibling public-site source.

See [first-gap verification](docs/FIRST_GAP_VERIFICATION.md) for actual outcomes and remaining gates. Full Forge CLI lint passed during the development rollout. Local manifest SDK validation is a separate result. Dependency advisories, hosted/privacy obligations and native acceptance remain open; UI polish does not resolve them.

## Forge architecture and release boundary

The Jira project-page Custom UI calls the existing resolvers. Jira user/project permissions authorise reads and approved writes. A deterministic TypeScript engine owns trace, assertion and simulation results; Forge storage keeps saved inputs, revisions, claims and receipts. Rovo's existing GET action reads a specifically identified saved rehearsal. It cannot create issues or change records. Its bounded evidence service checks identity, Browse permission, expiry and the exact revision. Imported text remains untrusted data.

The UI redesign introduces no storage migration or additional scope. Display priority never renumbers Jira proposals: Northstar's destination task remains `action-4`, even though it is shown first. Historical result compatibility and retry/reconciliation coverage remain in the suite.

The working manifest retains separate historical MCP development declarations. **Do not deploy it wholesale.** `scripts/prepare-source.mjs --judge-release` prepares a separate judge-only manifest containing the Jira page and existing read-only analyst/GET action, excluding MCP and Marketplace-only modules. Read [owner release commands and native checks](RELEASE_CHECK.md) before any hosting action. No deployment, install, tunnel, sharing change, public edit or recording is authorised by these instructions.

## Existing public release

The [public landing](https://lotzero-recall.vercel.app/), [browser preview](https://lotzero-recall.vercel.app/app/), [2:53 Jira + Rovo demo](https://youtu.be/KNKdnH8N6kw) and [submitted entry](https://devpost.com/software/lotzero) are earlier released artifacts. **This local redesign has not changed them.** The existing demo uses synthetic records and Deepgram narration. Follow [Forge installation instructions](docs/INSTALLATION.md) for the existing approved sharing link; it does not install this unpromoted candidate.

Specialized Industries remains the category and **Best Agents the sole bonus**. No MCP, Teamwork Graph, Marketplace approval, customer validation, certification or measured time saving is claimed by this candidate. The [Devpost update](DEVPOST_UPDATE.md) and [video shot list](VIDEO_SHOTLIST.md) are files for owner review after promotion, not public edits.

## Further reading and limits

[Fixture schema](fixtures/README.md) · [Architecture](docs/ARCHITECTURE.md) · [Security](docs/SECURITY.md) · [Privacy](docs/PRIVACY.md) · [Privacy reporting gaps](docs/PRIVACY_REPORTING.md) · [Dependency review](docs/DEPENDENCY_REVIEW_2026-11-06.md) · [Rovo evaluations](evals/rovo/README.md) · [Approved redesign](PLAN.md).

Quantities describe recorded shipment quantities grouped by compatible units, not contamination mass. A path is association, not contamination. Missing records remain unknown. Timing is not measured. Controls are hypothetical, and no operational recall or regulatory assessment is performed. Imported data needs owner validation. Native Rovo availability is a tenant prerequisite; no subscription is activated here.

Provider/support: Himanshu Jha, jhahimanshu653@gmail.com. [Published privacy policy](https://gist.github.com/himanshu748/5fdad6ed1e6daf7f159c39f6ddcfbb58). Source licensing and remaining listing/legal decisions remain unresolved; this local source commit does not grant a licence or publish a Marketplace listing.

Source exports are app-only by default and do not require a sibling landing repository. Add `--include-site` explicitly only when a separate reference-site copy is needed. The export tests use synthetic site fixtures.
