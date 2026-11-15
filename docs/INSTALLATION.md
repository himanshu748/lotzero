# Installation, judge access and recovery

Updated 30 October 2026. The owner approved Atlassian registration terms and possible excess-usage invoices for both editions. **No payment card was added.** This approval superseded the earlier registration stop; it does not establish a no-overage cap or authorize unrelated spending.

## Verified release state

| Item | Recorded result |
|---|---|
| Developer Space | LotZero — `18159bee-5fcb-492f-ac1e-63ebe97c5b16` |
| Judge app | `ari:cloud:ecosystem::app/f2443992-e1df-4ee4-b6ee-50abce811c9b` — deployed to production |
| Judge production environment | `b639eccf-3101-495c-a417-1cbaed8198f1` |
| Marketplace app | `ari:cloud:ecosystem::app/38723408-eeba-4e64-8a81-903027d16f7c` — separately deployed to production |
| Judge distribution | Sharing with anyone possessing the installation link; Jira selected; personal-data declaration **Yes** |
| Provider/support | Himanshu Jha / LotZero — jhahimanshu653@gmail.com |
| Privacy | [Published, owner-approved policy](https://gist.github.com/himanshu748/5fdad6ed1e6daf7f159c39f6ddcfbb58) |
| Native verification sites/projects | `one-atlas-obka.atlassian.net` / private `LZR`; fresh sharing-link install on `lotzero-judge-verify.atlassian.net` / `KAN — My Kanban Space` |
| Live Jira receipt | [LZR-1](https://one-atlas-obka.atlassian.net/browse/LZR-1), approved SHIP-002 missing-destination Task |

Judge production is now **2.5.0**, including the owner-approved read-only Rovo analyst; [release receipt](../evidence/rovo-2026-10-30/production-release.json) and [native verification](ROVO_ANALYST.md). Marketplace remains **2.2.0**. The earlier [judge](../evidence/forge-judge-deploy-2026-10-30.log) and [Marketplace](../evidence/forge-marketplace-deploy-2026-10-30.log) logs are preserved as historical deployment evidence. The public [marketing page](https://lotzero-recall.vercel.app/) offers a labelled sample and this same judge-install destination; it does not expose private Jira project data. The [2:53 Jira + Rovo walkthrough](https://youtu.be/KNKdnH8N6kw) shows the native synthetic workflow with exclusively Deepgram narration and published manual English captions; [public playback receipt](../evidence/rovo-2026-10-30/youtube-public-playback.json). Rovo appears at 1:45; the original public video remains live.

## Install the judge edition

1. As a Jira Cloud site administrator, open the [actual LotZero-Judge installation link](https://developer.atlassian.com/console/install/f2443992-e1df-4ee4-b6ee-50abce811c9b?signature=AYABeCHj1xyDGh4AfiSaxSskT%2FUAAAADAAdhd3Mta21zAEthcm46YXdzOmttczp1cy13ZXN0LTI6NzA5NTg3ODM1MjQzOmtleS83MDVlZDY3MC1mNTdjLTQxYjUtOWY5Yi1lM2YyZGNjMTQ2ZTcAuAECAQB4CxqLTo9l4lqXuFjNim1xJM%2Bp%2F3TVP9xHS2BrU5DRRucBXV32g4gUJV52G1pXsnZE3QAAAH4wfAYJKoZIhvcNAQcGoG8wbQIBADBoBgkqhkiG9w0BBwEwHgYJYIZIAWUDBAEuMBEEDKV6sAADMKdtSrzWiQIBEIA74axB1UJGh1OPgRBtBpzU2As6xxCAITs2rxAICvyZf3xOT46J5O%2B%2BuqEHtGXyS6mUIIvBu5YaGJAuVucAB2F3cy1rbXMAS2Fybjphd3M6a21zOmV1LXdlc3QtMTo3MDk1ODc4MzUyNDM6a2V5LzQ2MzBjZTZiLTAwYzMtNGRlMi04NzdiLTYyN2UyMDYwZTVjYwC4AQICAHi9bVMAkme4qVQX1fQHo6ePw3H40A7cGfz7yrmSfBWMXgEDdp0xItlstkI4SFopCqdvAAAAfjB8BgkqhkiG9w0BBwagbzBtAgEAMGgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMtplsX64S7IKbfCKIAgEQgDt%2FSDizjG4YpEMiweej9w3NO5T2Oc7UvB7cw0LBUHFbIXuMZ%2BL3qo0U50BKUBIy82DSnFhDQHpsFBCa1AAHYXdzLWttcwBLYXJuOmF3czprbXM6dXMtZWFzdC0xOjcwOTU4NzgzNTI0MzprZXkvNmMxMjBiYTAtNGNkNS00OTg1LWI4MmUtNDBhMDQ5NTJjYzU3ALgBAgIAeDYASx0XCjkny4iLV6vz%2BKtEGSGT6kdt0QRpkn6D%2FlVEAWA%2Fd5iR%2F8ZpgLRrmYynqnMAAAB%2BMHwGCSqGSIb3DQEHBqBvMG0CAQAwaAYJKoZIhvcNAQcBMB4GCWCGSAFlAwQBLjARBAwQ8YAc3i%2F6Bph5lK0CARCAO7%2FPff%2B813Q30KDsJMkp1N4fitq2Qrh8Ti2jtT7eq0gYG9ssy0BjUeh4m4tzwkyP2wNi%2FWS%2FVmRmqvNkAgAAAAAMAAAQAAAAAAAAAAAAAAAAANZV5P5h3c%2B9wSNcCo2oQGr%2F%2F%2F%2F%2FAAAAAQAAAAAAAAAAAAAAAQAAADIaJlqkiEl%2FKLsNHSB0DRT%2BQ4UVQ9EOAAzXOVwGIpgNqXQoQajSlcCKLK5r6R70FFfgAq2V2ELXMtpU7XTFl6jBjNg%3D&product=jira). The identical URL is saved in [`evidence/judge-installation-url.txt`](../evidence/judge-installation-url.txt). Verify the app name/provider and published privacy policy. The link exposes an installation flow, not access to another site's project data.
2. Select **Get app**, choose a test site you administer, review the Jira issue-read/write and app-storage scopes, and install. The exact public sharing link was used for a fresh installation on the owner-approved free site `lotzero-judge-verify.atlassian.net`. All 12 onboarding/trace/save/reload steps passed in project KAN; [second-site receipt](../evidence/judge-second-site-verification.json).
3. Use a test project with an ordinary Task type, description/labels allowed and defaults for any additional required fields. Avoid project automations that could turn drill Tasks into operational actions. Open the project's **LotZero** page.
4. As project administrator, select **Load synthetic dataset**. Start **New drill** with `ING-A19`, contamination, and fixed scenario time `2026-10-28T09:00:00Z`. Expect 3 associated product lots, 4 shipments, 9 evidence gaps and 12 unresolved records.
5. In Impact Explorer, select SHIP-002 and inspect `ING-A19 → BATCH-101 → FG-101 → SHIP-002`. Check failed/unknown assertions and the missing destination.
6. In the simulator, quarantine WH-NORTH at the scenario time with supporting evidence `EV-DRILL`. SHIP-002 is potentially preventable; the historical SHIP-001 stays in the impact. Save the drill and review Jira suggestions.
7. The Jira project defaults to the originating project when permitted; **no actions are selected automatically**. Select Task and only the desired simulated-drill suggestion, inspect its description, then explicitly approve creation. Open its returned Jira key and verify the scenario/evidence and simulation warning.
8. Reload the app and open the saved rehearsal. The initial native installation, dataset/snapshot reload and the single approved LZR-1 creation have been verified. The guarded **Check saved receipt** action returned the same LZR-1 receipt, and an independent Jira search for its approval marker showed exactly 1 of 1. This action refuses to recreate a missing saved receipt.
9. Export needed reports and compare a corrected-data rerun where appropriate. Local Markdown/JSON/CSV downloads, clipboard copy and comparisons are tested. In native Jira, **View or copy export** exposes the verified saved report in all three formats. If downloads are blocked, select the report text to copy/save it. Native **Copy export** was followed by OS Command-V into TextEdit: exact contents matched in JSON, Markdown and CSV; [clipboard receipt](../evidence/native-clipboard-2026-10-30.json). The browser clipboard API still returned empty, so the verification uses OS paste. Automatic native downloads and second-user permission-denial checks remain unverified.

The second-site installation began with no dataset and zero saved rehearsals, then loaded 37 records/43 relationships and reproduced the 3/4/9/12 result. Its saved snapshot `1f060486-bd0d-44b0-8d6c-50d5bc112544` retained fingerprint `34cafdaf`; parsed JSON before/after reload matched despite object-key ordering differences. No Jira issue was created and the old LZR-1 receipt was absent. Forge CLI listed installation `60f67d2f-620f-4737-81f6-c0f077536bbc` as up-to-date on major version 2. These observations establish this onboarding path and basic data separation under the owner account, not adversarial cross-tenant or denied-user security proof.

The original verification site's expiry is **26 January 2027**. This does not cover the entire expected judging window. Judges should install the shared app on their own site; do not provide temporary private test-site access as the sole judging route.

## Optional Rovo analyst

Use a Jira Cloud tenant where Atlassian Rovo is already available to test the agent. The production app installation includes the Recall rehearsal analyst and one GET action; no separate LotZero API key, Deepgram key, external connector or Marketplace listing is needed. Deepgram is used only to narrate the demonstration video, not by the app at runtime.

Open a **saved Drill report**, choose a question and select **Ask Recall rehearsal analyst**. The handoff supplies the exact project, snapshot and SHA-256 input revision. Verify the returned revision, IDs, checked/passed populations, counterexamples and page counts against the report. Do not substitute a short fingerprint or ask the agent to assume the latest drill. The agent explains only the saved intervention; it cannot create Tasks, change records, contact anyone or hold stock.

If Rovo cannot open, use **View or copy the saved handoff** only in an available Rovo-enabled installation, or continue with Impact explorer, Evidence gaps, the simulator and report. The app does not activate Rovo, accept AI terms, upgrade a plan or buy credits. Tenant administrators control Rovo availability. The independent site's unavailable-Rovo fallback was observed without changing those settings; latest production core reload also passed there. This does not establish Rovo availability on that site.

Two native production questions were verified against the original saved LZR drill: all four shipment paths, destination FAIL at 3/4, and ingredient-origin UNKNOWN at 2/5 with three exact counterexamples. The original receipt and scenario stayed unchanged. [Guide and evidence](ROVO_ANALYST.md). Rovo's AI explanation can still be incomplete or wrong; the saved deterministic report remains authoritative.

## Maintain the registered editions

Authentication already works through the local OS keychain. If it expires, authenticate in the local CLI; never paste a token into chat, source, evidence or shell history.

```sh
npm run forge -- whoami
# Only when authentication is needed:
npm run forge -- login
```

Do not re-register the existing app identities during ordinary deployment. Select the saved identity, build, lint and deploy:

```sh
node scripts/edition.mjs select judge
npm run build
npm run forge -- lint
npm run forge -- deploy --environment production --non-interactive
```

For the separate Marketplace identity, use `node scripts/edition.mjs select marketplace` before lint/deploy and restore judge afterward. `config/editions.local.json` stores the real IDs and is ignored; `config/editions.example.json` intentionally contains nulls. Source and product assets are shared. Record a hash and deployment receipt for each edition. Deploying the Marketplace identity does **not** submit or publish a listing; follow the owner-review gates in [MARKETPLACE.md](MARKETPLACE.md).

For an additional authorized site installation via CLI:

```sh
npm run forge -- install --environment production --site YOUR-SITE.atlassian.net --product jira
```

`YOUR-SITE` is a parameter, not an existing URL. Installation requires the site's administrator approval for the displayed scopes.

## Storage and reset

Dataset changes require project administration; drill reads/saves require project Browse access. Snapshots and audit records request 90-day TTL with provider deletion delay; current dataset and action claims/receipts persist until reset. Native dataset and saved-snapshot persistence have been observed across reload. Provider TTL expiry and deletion lifecycle have not been time-tested. The independent installation began empty and did not contain the original receipt; adversarial cross-installation and denied-user tests remain unverified.

Export records first. **Activity & data controls → Delete LotZero workspace data → type DELETE → Delete data** removes the project's app data. Created Jira issues and downloaded exports remain under their independent retention policies. A reset-in-progress marker blocks new mutations after partial deletion; repeat the confirmed deletion to resume. Reset and interrupted-reset behavior have automated tests; do not claim native deletion was exercised merely from those tests.

## Interrupted Jira writes

A confirmed issue returns its saved receipt on retry. **Check saved receipt** uses the same retry route with an existing-receipt guard: it refuses to request a new Jira issue if the saved creation receipt is missing. A definite HTTP rejection allows a new explicit approval attempt. An unknown result is not automatically repeated: search Jira for the exact `lotzero-…` marker shown in the receipt, inspect the issue, and have a source-project administrator enter its key in **Verify existing issue**. The server reads Jira as the current user and accepts it only when the marker matches.

If no existing issue can be identified, the current version retains uncertainty and blocks reset. There is no implemented absence-proof or automatic release operation. Preserve the export/marker and investigate before a reviewed maintenance change. Do not delete claims to force a retry or treat an empty indexed search as proof of non-creation.

## Abandoned project update lock

A hard invocation termination can leave a project mutation lock. After at least five minutes, a project administrator can use **Recover abandoned lock (admin)** in the visible lock error. The resolver validates lock age and administration and retains per-action Jira claims. Reconcile any unknown receipts afterward. If recovery itself is hard-terminated, a maintenance escalation is still required. This path has automated adapter tests and remains live-unverified.

## Troubleshooting

- **App ID missing:** select the intended registered edition and verify ignored local configuration; do not fabricate an ID.
- **CLI not logged in:** local authentication is required even when the browser console is signed in.
- **Dataset changed after review:** rerun the drill; save checks the content fingerprint, not only a version string.
- **Permission denied:** ask the project administrator for the specific Browse/Administer/Create permission required.
- **Required fields or unsupported type:** choose a non-subtask Task type with description/labels enabled and defaults for other required fields.
- **Import rejected:** use the documented schema and 200 KB limit; errors do not overwrite current records.
- **Snapshot too large or history full:** export first, then explicitly reset project data. v0.1 stores at most 25 Forge snapshots.
- **Graph layout absent:** the manifest permits inline styles for validated graph positions; no unsafe script/eval permission is requested.
