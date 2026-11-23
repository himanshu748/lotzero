import type { JiraAction, Snapshot } from "../contracts";
import { actionFindings } from "./action-findings";

/** Only saved deterministic findings become Jira suggestions; never trust client issue text. */
export function suggestActions(
  snapshot: Pick<Snapshot, "id" | "dataset" | "result">,
): JiraAction[] {
  return actionFindings(snapshot.result).map(({ gap: g }, i) => ({
    id: `action-${i + 1}`,
    summary: `[SIMULATED DRILL] ${g.message}`.slice(0, 240),
    recordIds: g.recordIds,
    evidence: g.evidence,
    description: [
      `LotZero simulated recall drill ${snapshot.id}`,
      `Dataset: ${snapshot.dataset.version}; fingerprint: ${snapshot.result.fingerprint}`,
      `Scenario: ${snapshot.result.scenario.hazard} at ${snapshot.result.scenario.sourceLotId}`,
      `Observed problem: ${g.message}`,
      `Records: ${g.recordIds.join(", ") || "No record identified"}`,
      `Evidence references:\n${
        g.evidence
          .map((id) => {
            const e = snapshot.dataset.evidence.find((e) => e.id === id);
            return e
              ? `${id}: ${e.title}; source: ${e.source}; recorded: ${e.recordedAt}`
              : `${id}: unresolved`;
          })
          .join("\n") || "Missing — investigate; do not infer safety"
      }`,
      `To inspect: Open LotZero in the originating Jira project, select saved drill ${snapshot.id}, then open Rehearsal (Trace) and select the referenced record. Synthetic evidence is embedded in the drill; it is not an external certificate.`,
      `Next steps: Review the referenced records with the quality team, document the correction and supporting evidence, then rerun this scenario.`,
      `This is a rehearsal only. Do not contact customers, hold shipments or execute a real recall on this issue's authority.`,
    ].join("\n\n"),
  }));
}

/** Deterministic evidence comment for an approved, created LotZero task. No model text. */
export function evidenceComment(
  snapshot: Pick<Snapshot, "id" | "dataset" | "result">,
  actionId: string,
): string[] {
  const action = suggestActions(snapshot).find((a) => a.id === actionId);
  if (!action) throw new Error("Unknown suggested action. Refresh the saved drill.");
  return [
    `LotZero rehearsal evidence (simulation only): ${action.summary.replace("[SIMULATED DRILL] ", "")}`,
    `Saved drill ${snapshot.id}; dataset ${snapshot.dataset.version}; source lot ${snapshot.result.scenario.sourceLotId}.`,
    `Records: ${action.recordIds.join(", ") || "No record identified"}`,
    `Evidence: ${action.evidence.join(", ") || "Not recorded. Investigate; do not infer safety."}`,
    "Posted from LotZero's saved evidence after explicit approval by the signed-in user. Rehearsal only: do not contact customers, hold shipments or execute a recall on this comment's authority.",
  ];
}
