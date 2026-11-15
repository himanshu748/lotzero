# Judge release comparison — 15 November 2026

The historical production receipt names judge 2.5.0, source revision `09a23d6b356e1dd18123fea739df548507a201b04cf3f1092dc3acf7765fa764`. The development receipt records 2.7.0. Hosted state was not re-queried or changed in this local-only pass. There is no Git history here.

## What can actually be compared

The historical receipt contains 41 file hashes. All listed current paths exist. The original production manifest was recovered from the preserved pre-MCP manifest and its bytes match the production hash. Additional preserved files are used only when their hashes match. Unchanged files supply matching baseline bytes themselves. Where original changed-file bytes remain unavailable, the record is a hash difference, not a reconstructed line diff. Added paths are recorded separately by the local baseline inventory.

| Changed path from the 41-file historical receipt | Original bytes available |
|---|---|
| `manifest.yml` | Yes, hash matched |
| `package.json` | No; hash comparison only |
| `src/index.ts` | Yes, hash matched |
| `src/rovo/analyst.ts` | No; hash comparison only |
| `src/services/actions.ts` | No; hash comparison only |
| `src/services/application.ts` | Yes, hash matched |
| `static/lotzero-ui/src/App.tsx` | Yes, hash matched |
| `static/lotzero-ui/src/analyst.ts` | No; hash comparison only |
| `static/lotzero-ui/src/client.ts` | No; hash comparison only |
| `static/lotzero-ui/src/components/AnalystHandoff.tsx` | No; hash comparison only |
| `static/lotzero-ui/src/components/Impact.tsx` | Yes, hash matched |
| `static/lotzero-ui/src/main.tsx` | No; hash comparison only |
| `tests/e2e/motion.spec.ts` | No; hash comparison only |
| `tests/integration/application.test.ts` | No; hash comparison only |
| `tests/integration/rovo-handler.test.ts` | Yes, hash matched |

The owner workspace retains the exact per-file hashes, recovered-path inventory and recoverable patch in `evidence/judged-release-2026-11-15/`. This is not a claim to have recovered the entire original build artifact, queried the hosted source, or produced a complete historical line diff.

## Release decisions

| Surface | Historical production | Current working tree | Isolated judge candidate |
|---|---|---|---|
| Project page and resolver | Existing Jira Custom UI | UI refresh plus local guide/summary/recovery | Included and locally tested |
| Rovo | Original agent + saved-rehearsal GET action | Original manifest prompt; enhanced evidence projection | Same agent/action with explicit citation, proposal and timing prompt |
| MCP | Not registered | Development-only wrapper/module retained | Module, dedicated action and dedicated function excluded |
| Privacy | No scheduled reporter in judge manifest | Separate off-by-default Marketplace development worker source | No reporter registration/scope; worker cannot activate on judge identity |
| Scopes | read:jira-work, write:jira-work, storage:app | Same three scopes | Same three scopes |
| Storage/result contract | Project-prefixed data, snapshots, claims and receipts | No schema/result/revision-input change | No migration intended; sanitized legacy parity test |
| External integrations | Jira/Forge and optional Rovo | No added service/dependency | No third-party external permissions or remote |

The working `manifest.yml`, package metadata/lockfile and public-site source are preserved in this increment. The candidate manifest is generated only in a new isolated directory. Package semver remains 0.1.0; no next Forge version or successful deployment is invented.

The sanitized native clipboard fixture replaces real identity/issue details and is not an exact production backup. It establishes local result parity and receipt hydration, not a native upgrade or privacy compliance. The old deterministic engine's listed source hashes remain unchanged; presentation projections and Rovo response additions do not rewrite stored results. Native permission, migration/upgrade, Rovo and privacy checks still belong to the owner release script.
