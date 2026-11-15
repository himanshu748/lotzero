# Reproducible benchmark results

Measured 2026-10-28T07:39:19.136Z with `v22.23.4` on darwin/arm64. Source: [raw measurements](../evidence/benchmark.json). Run `npm run benchmark` to repeat. These are local synthetic measurements under concurrent machine load, not Forge latency or production capacity.

| Workload | Repeats | Median | p95 |
|---|---:|---:|---:|
| Fixture forward trace (37 nodes / 43 edges) | 100 | 3.895 ms | 15.149 ms |
| Full fixture drill | 50 | 10.112 ms | 18.269 ms |
| Chain forward trace (300 nodes / 299 edges) | 50 | 14.979 ms | 36.489 ms |

## Correctness and uncertainty

- Exactly 4/4 expected synthetic shipment IDs; zero false-positive/false-negative IDs on this fixed fixture.
- 9 distinct evidence gaps detected.
- Zero unsupported safe conclusions in the measured scenario. Method: the result contract has no safe/unaffected status, while explicit missing-genealogy assertions and unresolved-record tests check conservative handling. This is not a general proof for arbitrary imported records.
- CSV round-trip matches the synthetic dataset: True.
- Corrected records improve four assertions while preserving all four source-associated shipments. Quarantine makes SHIP-002 potentially preventable while SHIP-001 remains historical.
- The principal automated browser journey uses 15 scripted control actions (14 clicks and one selection) through three export controls. Navigation, scrolls, screenshots and final reload are excluded. This is not a timed human usability study or evidence of a manual-work reduction.

The ground-truth file is `fixtures/ground-truth/expected.json`; fixed scenarios and adversarial coverage live in `tests/unit/engine.test.ts`. The benchmark does not call Jira, include KVS overhead, stress maximum-sized imports, model physical inventory or measure real recall performance. Synthetic stock is assumed remaining as of the scenario clock; no yield or contamination-mass inference occurs. Timings vary with runtime and machine load; earlier workstream timings were superseded by this saved run.

## Local judged-candidate refresh — 15 November 2026

Measured on Apple M4, Node 22.23.4; synthetic fixed inputs only. The existing harness warms each case before recording samples.

| Case | Repetitions | Median | p95 |
|---|---:|---:|---:|
| Full Northstar drill | 50 | 3.049 ms | 4.954 ms |
| Supported 1,000-node / 999-edge forward trace | 10 | 12.235 ms | 13.561 ms |
| Oversized 5,001-node input rejection | 10 | 2.189 ms | 2.422 ms |

The supported graph is 169,676 JSON bytes. The oversized case has 5,001 nodes, 5,000 edges and one evidence record; it is rejected through the real parser (865,850 bytes), not accepted as a 5k traversal. Import bounds remain 200 KB / 1,000 nodes / 3,000 edges. These local timings are not real recall-response or evidence-retrieval durations. No customer or provider performance claim is inferred. The dated raw benchmark is retained in the owner workspace at `evidence/judged-release-2026-11-15/benchmark.json`; older results are preserved.
