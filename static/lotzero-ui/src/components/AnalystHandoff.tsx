import { useEffect, useState } from "react";
import Button from "@atlaskit/button/new";
import type { Snapshot } from "../../../../src/contracts";
import { analystHandoff, openAnalyst, type AnalystQuestion } from "../analyst";
import { Badge } from "./Primitives";
const questions: { id: AnalystQuestion; label: string; assertion?: string }[] =
  [
    {
      id: "destination",
      label: "Explain the missing destination",
      assertion: "shipment-destination",
    },
    {
      id: "origins",
      label: "Which origins need more evidence?",
      assertion: "ingredient-origin",
    },
    { id: "hold", label: "What did the WH-NORTH hold change?" },
  ];
export default function AnalystHandoff({
  snapshot,
  projectKey,
  local,
}: {
  snapshot: Snapshot;
  projectKey?: string;
  local: boolean;
}) {
  const [question, setQuestion] = useState<AnalystQuestion>("destination");
  const [prompt, setPrompt] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let current = true;
    setPrompt("");
    setNotice("");
    if (projectKey && !local)
      void analystHandoff(snapshot, projectKey, question)
        .then((value) => {
          if (current) setPrompt(value);
        })
        .catch(() => {
          if (current)
            setNotice(
              "The saved handoff could not be prepared. Reopen this rehearsal and try again.",
            );
        });
    return () => {
      current = false;
    };
  }, [snapshot, projectKey, local, question]);
  const option = questions.find((item) => item.id === question)!;
  const assertion = snapshot.result.assertions.find(
    (item) => item.id === option.assertion,
  );
  const control = snapshot.result.interventions.some(
    (item) => item.type === "quarantine" && item.targetId === "WH-NORTH",
  );
  return (
    <section className="panel analyst-panel" aria-labelledby="analyst-title">
      <div className="section-heading">
        <h2 id="analyst-title" tabIndex={-1}>
          Ask the analyst
        </h2>
        <Badge value="Read-only" />
      </div>
      <p>
        Ask why a finding needs attention or what the simulated hold changed. The analyst reads this saved rehearsal and cites the records behind its answer.
      </p>
      <div
        className="analyst-questions"
        role="group"
        aria-label="Saved rehearsal questions"
      >
        {questions.map((item) => (
          <button
            key={item.id}
            aria-pressed={question === item.id}
            disabled={
              busy ||
              Boolean(
                item.assertion &&
                  !snapshot.result.assertions.some(
                    (a) => a.id === item.assertion,
                  ),
              ) ||
              (item.id === "hold" && !control)
            }
            onClick={() => setQuestion(item.id)}
          >
            {item.id === "destination"
              ? `Why did shipment-destination ${
                  snapshot.result.assertions.find(
                    (a) => a.id === "shipment-destination",
                  )?.status === "PASS"
                    ? "pass"
                    : snapshot.result.assertions.find(
                          (a) => a.id === "shipment-destination",
                        )?.status === "UNKNOWN"
                      ? "stay UNKNOWN"
                      : "fail"
                }?`
              : item.id === "origins" &&
                  snapshot.result.assertions.find(
                    (a) => a.id === "ingredient-origin",
                  )?.status !== "UNKNOWN"
                ? "What do the origin records establish?"
                : item.label}
          </button>
        ))}
      </div>
      <div className="saved-evidence" aria-label="Saved evidence fallback">
        <h3>From the saved records</h3>
        {assertion ? (
          <>
            <p>
              <Badge value={assertion.status} /> <code>{assertion.id}</code> ·{" "}
              {assertion.passed} of {assertion.checked} checked records satisfy
              the assertion.
            </p>
            <ul>
              {assertion.counterexamples.map((gap) => (
                <li key={gap.id}>
                  {gap.message}{" "}
                  <code>
                    {gap.recordIds.join(", ") || "No applicable record"}
                  </code>
                  <span>
                    Evidence:{" "}
                    <code>{gap.evidence.join(", ") || "Not recorded"}</code>
                  </span>
                </li>
              ))}
            </ul>
            {!assertion.counterexamples.length && (
              <p>No counterexample is recorded for this assertion.</p>
            )}
          </>
        ) : question === "hold" ? (
          <>
            <p>
              Potentially preventable:{" "}
              <code>
                {snapshot.result.simulation.preventableShipmentIds.join(", ") ||
                  "None established"}
              </code>
              .
            </p>
            <p>
              Historical shipments retained:{" "}
              <code>
                {snapshot.result.simulation.historicalShipmentIds.join(", ") ||
                  "None recorded"}
              </code>
              .
            </p>
            <p>
              Control evidence:{" "}
              <code>
                {snapshot.result.interventions
                  .filter((item) => item.targetId === "WH-NORTH")
                  .flatMap((item) => item.evidence)
                  .join(", ") || "Not recorded"}
              </code>
              . Simulation only.
            </p>
          </>
        ) : (
          <p>This assertion was not evaluated in the saved rehearsal.</p>
        )}
      </div>
      {local ? (
        <p className="field-help">
          Rovo is unavailable in browser preview. The saved counterexamples
          above remain usable; no model answer is being shown.
        </p>
      ) : !projectKey ? (
        <p>
          Open this saved rehearsal from its Jira project to prepare the analyst
          handoff.
        </p>
      ) : (
        <>
          <p className="field-help">
            Opening Rovo sends saved identifiers and authorised evidence
            summaries to Atlassian. Verify the explanation against these
            records; the analyst cannot write Jira work.
          </p>
          <Button
            isDisabled={!prompt || busy}
            onClick={async () => {
              setBusy(true);
              setNotice("");
              try {
                await openAnalyst(prompt);
                setNotice(
                  "Rovo opened with this exact saved revision. Check its citations against the records.",
                );
              } catch (error) {
                setNotice(
                  error instanceof Error
                    ? error.message
                    : "Rovo could not open. Continue with the saved evidence here.",
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            Open question in Rovo
          </Button>
          <details>
            <summary>View or copy saved handoff</summary>
            <label>
              Saved rehearsal analyst handoff
              <textarea readOnly value={prompt} rows={7} />
            </label>
            <Button
              isDisabled={!prompt}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(prompt);
                  setNotice("Saved handoff copied.");
                } catch {
                  setNotice(
                    "Clipboard unavailable. Select the handoff and copy it with your keyboard.",
                  );
                }
              }}
            >
              Copy analyst handoff
            </Button>
          </details>
        </>
      )}
      <p role="status">{notice}</p>
    </section>
  );
}
