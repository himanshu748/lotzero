# LotZero

A product recall starts with a clock. A quality manager has to say where an ingredient lot went, which shipments are tied to it, and which of those ties the records can actually prove. A missing destination, owner or document is the gap that turns a trace into a guess.

LotZero is a Jira app for rehearsing that question before a real recall. You trace one ingredient lot to the shipments on record, see which checks fail or cannot be answered, try a hold while the stock stays where it is, and approve any follow-up task yourself. The rehearsal leaves the safety decision with you.

## Install

**Prerequisites: Jira Cloud with Rovo.**

Rovo is how the recall analyst reads a saved rehearsal. The trace, the findings and the saved report still work when Rovo cannot be opened. Install as a Jira Cloud site administrator. LotZero does not ask for its own account or API key.

**[Install LotZero on Jira Cloud](https://developer.atlassian.com/console/install/f2443992-e1df-4ee4-b6ee-50abce811c9b?signature=AYABeCHj1xyDGh4AfiSaxSskT%2FUAAAADAAdhd3Mta21zAEthcm46YXdzOmttczp1cy13ZXN0LTI6NzA5NTg3ODM1MjQzOmtleS83MDVlZDY3MC1mNTdjLTQxYjUtOWY5Yi1lM2YyZGNjMTQ2ZTcAuAECAQB4CxqLTo9l4lqXuFjNim1xJM%2Bp%2F3TVP9xHS2BrU5DRRucBXV32g4gUJV52G1pXsnZE3QAAAH4wfAYJKoZIhvcNAQcGoG8wbQIBADBoBgkqhkiG9w0BBwEwHgYJYIZIAWUDBAEuMBEEDKV6sAADMKdtSrzWiQIBEIA74axB1UJGh1OPgRBtBpzU2As6xxCAITs2rxAICvyZf3xOT46J5O%2B%2BuqEHtGXyS6mUIIvBu5YaGJAuVucAB2F3cy1rbXMAS2Fybjphd3M6a21zOmV1LXdlc3QtMTo3MDk1ODc4MzUyNDM6a2V5LzQ2MzBjZTZiLTAwYzMtNGRlMi04NzdiLTYyN2UyMDYwZTVjYwC4AQICAHi9bVMAkme4qVQX1fQHo6ePw3H40A7cGfz7yrmSfBWMXgEDdp0xItlstkI4SFopCqdvAAAAfjB8BgkqhkiG9w0BBwagbzBtAgEAMGgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMtplsX64S7IKbfCKIAgEQgDt%2FSDizjG4YpEMiweej9w3NO5T2Oc7UvB7cw0LBUHFbIXuMZ%2BL3qo0U50BKUBIy82DSnFhDQHpsFBCa1AAHYXdzLWttcwBLYXJuOmF3czprbXM6dXMtZWFzdC0xOjcwOTU4NzgzNTI0MzprZXkvNmMxMjBiYTAtNGNkNS00OTg1LWI4MmUtNDBhMDQ5NTJjYzU3ALgBAgIAeDYASx0XCjkny4iLV6vz%2BKtEGSGT6kdt0QRpkn6D%2FlVEAWA%2Fd5iR%2F8ZpgLRrmYynqnMAAAB%2BMHwGCSqGSIb3DQEHBqBvMG0CAQAwaAYJKoZIhvcNAQcBMB4GCWCGSAFlAwQBLjARBAwQ8YAc3i%2F6Bph5lK0CARCAO7%2FPff%2B813Q30KDsJMkp1N4fitq2Qrh8Ti2jtT7eq0gYG9ssy0BjUeh4m4tzwkyP2wNi%2FWS%2FVmRmqvNkAgAAAAAMAAAQAAAAAAAAAAAAAAAAANZV5P5h3c%2B9wSNcCo2oQGr%2F%2F%2F%2F%2FAAAAAQAAAAAAAAAAAAAAAQAAADIaJlqkiEl%2FKLsNHSB0DRT%2BQ4UVQ9EOAAzXOVwGIpgNqXQoQajSlcCKLK5r6R70FFfgAq2V2ELXMtpU7XTFl6jBjNg%3D&product=jira)**

1. Open the link, choose **Get app**, and install it on a Jira Cloud site you administer.
2. Review the Jira read, Jira write and app-storage permissions, and the [privacy policy](https://gist.github.com/himanshu748/5fdad6ed1e6daf7f159c39f6ddcfbb58).
3. Open a test project and the **LotZero** page. Use a project with an ordinary Task type, and keep automations from treating a drill task as a live operational action.
4. Run the fictional Northstar sample for ingredient lot `ING-A19`. Look for shipment `SHIP-002`, whose destination is missing.

The [recorded judge release](docs/INSTALLATION.md) is production **2.5.0**, with the recall rehearsal and read-only Rovo analyst. The newer four-screen desk described below was verified on a development site. Use the local preview to see that interface. The [release checklist](RELEASE_CHECK.md) tracks verification and promotion of the newer build.

- [Submitted demo on YouTube](https://www.youtube.com/watch?v=Z7zlvTNkD2A) · [Codegeist entry on Devpost](https://devpost.com/software/lotzero)
- [Earlier Jira and Rovo walkthrough](https://youtu.be/KNKdnH8N6kw) (synthetic records, Deepgram narration)

## What you do in the current source preview

One case, four screens.

- **Home.** Load the Northstar sample, or start a drill from your own JSON or CSV records. Saved rehearsals stay searchable.
- **Rehearsal.** Failures come first, then unknowns. The sample selects shipment-destination **FAIL** for `SHIP-002`, and shows the path `ING-A19 → BATCH-101 → FG-101 → SHIP-002`. You can inspect an earlier record while that shipment stays selected.
- **Rehearse.** Compare the original movements with a hypothetical warehouse hold. For this finding the suggested warehouse is `WH-NORTH`. You add the hold yourself. Earlier shipments, including `SHIP-001`, stay in the impact. Stock stays where it is.
- **Follow-up.** Suggested Jira tasks are grouped by the check that failed. Nothing is pre-selected. You read the exact project, type and text, then approve creation. When Jira does not confirm the write, you reconcile it. The app does not send a second attempt on its own.

A path is an association between records. It is not proof that a product is contaminated. A passing check is a passed check. The safety decision stays outside the app.

Under the [FDA Food Traceability Rule](https://www.fda.gov/food/food-safety-modernization-act-fsma/fsma-final-rule-requirements-additional-traceability-records-certain-foods), covered firms must provide traceability records within 24 hours of a request. FDA will not enforce the rule before 20 July 2028. That is why complete records matter. LotZero does not decide who is covered, and it does not issue a compliance certificate.

## Ask the analyst

On a saved rehearsal you can ask the **Recall rehearsal analyst**. It is a read-only Rovo agent. It explains the saved revision you name, and it cites record and evidence IDs from that revision. It has no tool that creates tasks, changes records, holds stock or runs a recall.

The entry is in **Apps for Specialized Industries**. The submitted bonus is **Best Agents**, for this analyst.

The on-screen checks are deterministic. They remain usable when Rovo is off.

## The MCP tool, stated as it is

The working manifest in this repository declares `rovo:mcp`: a read-only tool named **LotZero rehearsal evidence** (`lotzero-mcp-read-rehearsal`). It reads one saved rehearsal when you supply the project, the saved id and the exact revision. The MCP contract tests pass.

Codegeist allows one bonus. This entry is submitted for Best Agents. The judge package is built with `scripts/prepare-source.mjs --judge-release`. That package keeps the Jira page and the read-only analyst, and leaves the MCP module in this repository. Best MCP is not the submitted bonus. The module is real in this source, and the shared judge install is prepared without it.

What a live MCP client did and did not confirm is in [the MCP notes](docs/MCP_BONUS.md).

## Try the sample without Jira

You need Node 22.23.4 and npm.

```sh
git clone https://github.com/himanshu748/lotzero.git
cd lotzero
npm ci
npm run dev
```

Open http://127.0.0.1:4173 and choose **Run Northstar sample (synthetic)** once. The browser preview stores data in this browser. It does not create Jira issues or call Rovo. The records are fictional Northstar data.

A labelled sample of the earlier public release is at [lotzero-recall.vercel.app](https://lotzero-recall.vercel.app/).

## License and limits

Source is [MIT licensed](LICENSE). Copyright 2026 Himanshu Kumar.

Provider and support: Himanshu Kumar, jhahimanshu653@gmail.com.

LotZero rehearses a recall. An operational recall, customer notification and product certification stay with the manufacturer. Unknown records stay unknown. Quantities are recorded shipment quantities. A real response time is not measured here. Imported records need your own review. This repository reports no customers, pilots or hours saved.

## For people working on the code

```sh
npm run typecheck
npm test
npm run build
npx playwright test --config playwright.first-gap.config.ts
```

`npm run build` prepares the Forge resource on this machine. Deployment is a separate owner step. `build:web` writes the protected public site; leave that script unused.

- [Installation and recovery](docs/INSTALLATION.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Security](docs/SECURITY.md)
- [Privacy](docs/PRIVACY.md)
- [Privacy reporting gaps](docs/PRIVACY_REPORTING.md)
- [Recall rehearsal analyst](docs/ROVO_ANALYST.md)
- [MCP tool notes](docs/MCP_BONUS.md)
- [Fixture schema](fixtures/README.md)
- [Owner release checks](RELEASE_CHECK.md)
- [Dependency review](docs/DEPENDENCY_REVIEW_2026-11-06.md)
- [Rovo evaluations](evals/rovo/README.md)
- [What the development site showed](docs/DEVELOPMENT_2_11_VERIFICATION_2026-11-17.md)

Promote the judge build from the export in [RELEASE_CHECK.md](RELEASE_CHECK.md). The working manifest, which still contains the MCP module, is the wrong package for that promotion. The public page, the video and the Devpost form change only when the owner updates them.
