# Saved-rehearsal agent evaluation cases

Run `npm test -- tests/integration/rovo-evals.test.ts` from the app directory. The JSON contains **24** questions, evidence/refusal expectations, forbidden answer behaviour and a two-call agent budget. Tests execute the real deterministic evidence service with an in-memory store and mocked Jira permission boundary, then inspect returned IDs, populations, errors and unchanged stored bytes.

The three `desk-*` cases build the **actual UI handoff** using `analystHandoff`, check its full saved revision and assertion/entity filters, and feed that request to the existing read-only evidence service. They connect the Follow-up destination, origin and saved WH-NORTH questions to their real data contract. The other cases retain UNKNOWN, historical movement, pagination, injection, changed-current-data, expiry, permission and write-refusal coverage.

These are **retrieval/contract evaluations**, not model-answer evaluations. No prompt is sent to a model. They do not establish natural-language quality, prompt compliance, latency or native Rovo availability. Browser tests separately check the saved-record fallback; it is labelled and does not stage an AI answer.

The revised judge prompt replaces the earlier metadata-first instruction with a direct conclusion, nearby evidence citations and a compact saved reference. `--judge-release` selects that prompt for the original agent/GET action; no second agent or write tool is introduced. The working development manifest is preserved and is not the promotion artifact.

For a later separately approved native trial, use [ANSWER_REVIEW.md](ANSWER_REVIEW.md). Retain the exact saved identifiers/revision, prompt, action trace, final answer, latency and call count. Use only the approved included-access allowance; no current model-trial pass is claimed.
