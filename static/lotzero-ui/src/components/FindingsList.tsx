import { useEffect, useRef, useState } from "react";
import type {
  AssertionId,
  AssertionResult,
  DrillResult,
} from "../../../../src/contracts";
import { orderedAssertions } from "../../../../src/scenarios/first-finding";
import { Badge } from "./Primitives";

export default function FindingsList({
  result,
  selected,
  onSelect,
  focusKey,
}: {
  result: DrillResult;
  selected: AssertionId | null;
  onSelect: (id: AssertionId) => void;
  focusKey: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const chosen = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (focusKey) chosen.current?.focus({ preventScroll: true });
  }, [focusKey]);
  function row(assertion: AssertionResult) {
    return (
      <li key={assertion.id}>
        <button
          ref={selected === assertion.id ? chosen : undefined}
          className={`finding-row ${
            selected === assertion.id ? "selected" : ""
          }`}
          aria-pressed={selected === assertion.id}
          aria-controls="rehearsal-evidence"
          onClick={() => onSelect(assertion.id)}
        >
          <Badge value={assertion.status} />
          <strong>{assertion.title}</strong>
          <span>
            {assertion.checked
              ? `${assertion.passed} of ${assertion.checked} satisfy`
              : "Not evaluated"}
          </span>
          <code>
            {assertion.counterexamples[0]?.recordIds.join(", ") ||
              (assertion.status === "PASS"
                ? "No counterexample"
                : "No applicable record")}
          </code>
        </button>
      </li>
    );
  }
  const assertions = orderedAssertions(result);
  return (
    <section
      className={`findings ${expanded ? "expanded" : ""}`}
      aria-label="Findings"
    >
      <div className="findings-heading">
        <h2>Findings</h2>
        <button
          className="findings-toggle"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded
            ? "Show selected finding"
            : `Show all ${result.assertions.length} findings`}
        </button>
      </div>
      <ul>{assertions.filter((item) => item.status !== "PASS").map(row)}</ul>
      {assertions.some((item) => item.status === "PASS") && (
        <details
          open={result.assertions.every((item) => item.status === "PASS")}
        >
          <summary>
            Passed assertions (
            {assertions.filter((item) => item.status === "PASS").length})
          </summary>
          <ul>
            {assertions.filter((item) => item.status === "PASS").map(row)}
          </ul>
        </details>
      )}
    </section>
  );
}
