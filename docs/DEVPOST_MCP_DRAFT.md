# LotZero MCP update — paste-ready draft

Prepared 5 November 2026. **Not published.** Keep the existing submitted entry, original video, links, eligibility answers and Best Agents choice. The MCP increment is deployed to **Forge development 2.7.0** and one genuine native Studio read is verified from its raw tool trace. Production promotion remains unapproved. Third-party-client OAuth is unresolved; the draft below states these availability limits.

## Paste-ready addition to “What it does”

### Bring the saved rehearsal into an MCP workflow

A quality manager sees a failed destination check for SHIP-002. The next question is concrete: which recorded path connects that shipment to the ingredient lot, and what evidence is missing?

LotZero's optional MCP development preview gives that workflow one read-only tool: **Read saved LotZero rehearsal**, declared through Atlassian's native `rovo:mcp` module and discoverable in Rovo Studio. It uses the exact report's project, snapshot ID and content revision to return shipment paths, evidence gaps, assertion counterexamples or saved simulation results. It uses the same deterministic engine as the report, so the workflow stays anchored to inspectable records. Missing evidence stays UNKNOWN.

The tool checks the signed-in user's Jira Browse permission and refuses a different saved revision. It cannot change the rehearsal, create Jira Tasks or execute a recall. The existing Jira review and approval flow remains the place for follow-up work.

In the verified native development workflow, the tool returned **ING-A19 → BATCH-101 → FG-101 → SHIP-002**, its missing-destination finding, and the exact saved revision. The original saved report stayed unchanged.

**Availability:** MCP is verified in Forge development through an unpublished Rovo Studio test agent. It is off by default and restricted to the development runtime. The live judge install and published demo retain the existing Jira + Rovo experience while production rollout awaits approval. Third-party-client OAuth setup is currently blocked at Atlassian's consent callback; that external path is not presented as working.

## Paste-ready addition to “How we built it”

The MCP candidate adds a dedicated GET action and development flag wrapper around the existing saved-rehearsal reader. The reader resolves the current user's Jira project access, reads the installation's saved snapshot, validates its SHA-256 revision and recomputes the deterministic result. Bounded pages retain record IDs, supporting evidence and full assertion counts. The original Rovo agent keeps its original action, and the increment adds no scopes, runtime dependencies or separate server.

The local suite passes 154 unit/integration cases, including 35 new MCP boundary cases, plus all 13 existing browser rehearsal cases. Full Forge lint passes. A separate real Studio tool trace verifies the development read, and a native reload confirms that the entire saved snapshot stayed unchanged. The Jira issue list still contains only the original LZR-1. Third-party OAuth remains a separate unresolved integration limit.

## 30-second clip script — verified native development path

This is a **recording plan**, not a completed clip. Use the existing verified native Studio response and raw debug trace; no new model prompt is needed. Do not substitute a local mock, browser simulation, external-client footage or production Rovo footage for the native MCP invocation. Show a visible **Development · synthetic data · read-only** label. Keep the existing published video intact. Any new model turn needs fresh approval because the two-prompt test allowance is used.

| Time | Actual screen to capture | Narration |
|---|---|---|
| 0–6s | Saved development report; highlight SHIP-002's destination failure and exact handoff | “A missing destination turns a recall rehearsal into a question: where did this shipment go?” |
| 6–13s | Studio's Connected apps tool picker, then the already-recorded development invocation and its exact input | “LotZero brings the saved rehearsal into Rovo Studio through MCP, anchored to the exact report revision.” |
| 13–23s | Real returned shipment path, evidence IDs and destination counterexample | “The tool returns the recorded path and missing-evidence counterexample. UNKNOWN stays unknown; it never becomes a safety claim.” |
| 23–30s | Return to unchanged saved report; show the separate Jira review action | “Read-only, with Jira permission checks. Follow-up work still goes through LotZero's explicit review and approval.” |

Rehearse the narration with short pauses to fit 30 seconds. If generated audio is later requested, use **Deepgram exclusively** with existing authorized access; this task creates only the script and authorizes no TTS call, credit purchase or publication.

## Gate before claiming the bonus

The native evidence now records version 2.7.0, `environmentType=DEVELOPMENT`, tool discovery, an actual `lotzero-mcp-read-rehearsal` invocation, the matching report revision and unchanged saved report/Jira issue count. Keep the [raw verification limits](MCP_BONUS.md) separate from the product story. The planned hosted wrong-revision case did not run; its local regression passes. Resolve the external OAuth and client privacy boundary before claiming third-party access. Production promotion and any Devpost bonus-selection change require separate owner approval.
