# Saved-rehearsal agent evaluation cases

Run `npm test -- tests/integration/rovo-evals.test.ts` from the app directory. The checked-in JSON contains 21 questions, evidence/refusal expectations, forbidden answer behavior and a two-call agent budget. The test validates the case schema, executes the real deterministic evidence service with an in-memory store and mocked Jira permission boundary, and asserts returned IDs, counts, errors and unchanged stored bytes.

These are **retrieval/contract evaluations**, not model-answer evaluations. They do not send prompts to Rovo, validate its language or measure whether the model obeys the prompt. Rovo-unavailable behavior in the browser is a separate handoff/fallback check; a dependency failure here represents the evidence service being unavailable.

For an owner-approved later model trial, retain the exact saved identifiers/revision, prompt, action trace and final answer. Score each factual conclusion against returned assertion/record/evidence IDs; verify refusals, truncation, timing limits and no claimed writes. Record latency, call count and failures, using only the approved included-access allowance. Never mark that trial passed from these deterministic tests. The judge-only prompt is selected by the source exporter's `--judge-release` mode.
