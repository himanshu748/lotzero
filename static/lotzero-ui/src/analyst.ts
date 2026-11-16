import type { Snapshot } from "../../../src/contracts";
import {
  ANALYST_KEY,
  ANALYST_NAME,
  rehearsalRevisionInput,
} from "../../../src/rovo/revision";

export type AnalystQuestion =
  | "shipments"
  | "evidence"
  | "assertions"
  | "simulation"
  | "summary"
  | "destination"
  | "origins"
  | "hold";
export async function savedRevision(snapshot: Snapshot): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(rehearsalRevisionInput(snapshot)),
  );
  return [...new Uint8Array(digest)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}
export async function analystHandoff(
  snapshot: Snapshot,
  projectKey: string,
  question: AnalystQuestion,
): Promise<string> {
  if (!/^[A-Z][A-Z0-9_]{1,49}$/.test(projectKey))
    throw new Error("Open the saved report in its Jira project first.");
  const expectedRevision = await savedRevision(snapshot);
  const view =
    question === "destination" || question === "origins"
      ? "assertions"
      : question === "hold"
        ? "simulation"
        : question;
  const assertionId =
    question === "destination"
      ? "shipment-destination"
      : question === "origins"
        ? "ingredient-origin"
        : question === "assertions"
          ? snapshot.result.assertions.find((a) => a.status !== "PASS")?.id
          : undefined;
  const questions: Record<AnalystQuestion, string> = {
    shipments:
      "Which shipments are associated with this saved source lot? Explain recorded paths, uncertainty and historical movement.",
    evidence:
      "Where is evidence missing? Cite record IDs, evidence references and counterexamples. Missing evidence remains unknown.",
    assertions:
      "Why does this saved assertion fail or remain unknown? Explain its checked population and counterexamples.",
    simulation:
      "What do the already saved interventions change? Preserve historical shipments and distinguish potentially preventable movement.",
    summary:
      "Which evidence gaps need follow-up? Cite assertions and evidence IDs. Timing is not measured. Tasks are proposals, not created issues.",
    destination:
      "Explain shipment-destination's actual saved outcome. If FAIL, start with the missing destination and counterexample; if PASS or UNKNOWN, explain that actual status without inventing a failure. Cite supporting record and evidence IDs. Do not invent a destination.",
    origins:
      "Explain the actual saved ingredient-origin outcome. Name any UNKNOWN lots and why, citing counterexamples and evidence IDs. If PASS, explain that status without inventing UNKNOWN lots. UNKNOWN does not mean safe.",
    hold: "What did the already saved WH-NORTH warehouse quarantine change? Separate hypothetical preventable movements from historical shipments that remain in impact. Do not propose or execute a new control.",
  };
  return `This is a LotZero recall rehearsal, not a real recall. Use the lotzero-read-saved-rehearsal action with these exact inputs:\n${JSON.stringify(
    {
      projectKey,
      snapshotId: snapshot.id,
      expectedRevision,
      view,
      ...(assertionId ? { assertionId } : {}),
      ...(question === "hold" ? { entityId: "WH-NORTH" } : {}),
    },
  )}\n${
    questions[question]
  }\nUse only this saved revision. Answer the question first in plain language, then cite assertion, record and evidence IDs as inline code or plain text. The action does not return record URLs; do not invent links, paths or routes for identifiers. State pagination/truncation. Do not create Tasks or change records; direct follow-up to LotZero Follow-up for exact-content review and explicit approval.`;
}

export async function openAnalyst(prompt: string): Promise<void> {
  try {
    const { rovo } = await import("@forge/bridge");
    if (!(await rovo.isEnabled())) throw new Error();
    await rovo.open({
      type: "forge",
      agentKey: ANALYST_KEY,
      agentName: ANALYST_NAME,
      prompt,
    });
  } catch {
    throw new Error(
      "Rovo could not open in this tenant or installation. Continue with the report here. If your administrator has enabled Rovo and installed this analyst, select Recall rehearsal analyst in Rovo and paste the handoff below.",
    );
  }
}
