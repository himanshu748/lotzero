# Dependency review: 6 November 2026

The isolated source candidate completed `npm ci` from the existing lockfile. No dependency or override was changed in this increment. The clean install exposed advisories that must remain visible before a repository/release handoff is described as ready for customer use.

| Audit scope | Result |
|---|---|
| Production dependencies (`npm audit --omit=dev`) | 6 moderate; 0 high; 0 critical |
| Full dependency tree | 43 total: 3 low, 22 moderate, 13 high, 5 critical |

The five critical package entries are `proxy-addr`, `shell-quote`, `tinypool`, `vitest` and `websocket-driver`, in the development/tooling tree. Runtime advisory propagation includes Forge packages through `@forge/manifest`, `glob` and `minimatch`. These are package-audit results, not proof that a deployed LotZero path is exploitable or unaffected.

The audit proposes some major tool changes and Forge dependency downgrades. Do not run `npm audit fix --force` or downgrade SDKs used by the privacy/TTL contracts without compatibility checks. Resolve patched transitive dependencies where supported, review the Vitest/Forge toolchain upgrade separately, then rerun tests, typechecking, build and lint. Keep development servers on loopback. No new public deployment is warranted by a passing functional suite while these release concerns remain unresolved.

Use Node **22.23.4** for the pinned Forge CLI. The first clean install ran under system Node 26.12.0 and warned that Forge CLI 15.0.0 requires a newer patch on that line. The clean install was repeated successfully with Node 22.23.4, with its separate log retained. The local install-script policy was not bypassed. React 18 peer warnings from nested Atlaskit tooling and the two existing Zod Rollup annotation warnings also remain; they are distinct from the audit severities.

This document does not claim a clean security audit, Marketplace acceptance or production readiness. Detailed JSON reports stay in the owner's original workspace under `evidence/productization-2026-11-06/`; raw portal/credential records are not included in source exports.

## Refresh — 15 November 2026

Both audit scopes were rerun using the existing lockfile. Counts remain six moderate production advisories and 43 overall (3 low, 22 moderate, 13 high, 5 critical). The raw reports are in the owner's `evidence/judged-release-2026-11-15/` directory. Package metadata and the lockfile are unchanged. The reported Vitest/tinypool repair requires a major toolchain change; Forge's suggested major downgrade is not an acceptable automatic fix. Other proposed transitive updates need review of their parent constraints and targeted regression checks. No forced fix, override pile-up or install-script policy bypass was performed.

Decision: keep the local feature candidate reviewable while holding deployment/customer release behind dependency remediation or an explicit documented owner risk decision. This is not a resolved audit or a production-ready claim. The new release candidate reuses the earlier clean-installed, matching-lock dependency tree for local checks; no new clean install is claimed for this refresh.
