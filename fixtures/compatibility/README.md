# Sanitized historical rehearsal

`production-2.5.0.json` derives from the historical native clipboard export captured on 30 October. That export's deterministic core was retained in the 2.5.0 production release. The current engine recomputes its saved result exactly.

The real actor, snapshot selector, Jira issue references and issue prose are replaced with synthetic values. `COMPAT-*` and `example.invalid` are fictional compatibility receipts. The provenance file records the original capture's hash and transformations, without copying the private source capture into this package. This is **not an exact production backup**, proof of a native upgrade, or a preserved real user's identity. Compatibility tests check result/revision parity, old-shaped snapshot reading and receipt hydration without writes.
