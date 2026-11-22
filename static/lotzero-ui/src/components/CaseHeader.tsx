import type { DrillResult, Snapshot } from "../../../../src/contracts";
import { Badge } from "./Primitives";
import { hazardLabel, utcLabel } from "../finding-copy";
export default function CaseHeader({
  result,
  snapshot,
}: {
  result: DrillResult;
  snapshot: Snapshot | null;
}) {
  return (
    <header className="case-header">
      <div>
        <h1 tabIndex={-1}>
          Rehearsal <code>{result.scenario.sourceLotId}</code>
        </h1>
        <p>
          {hazardLabel(result.scenario.hazard)} · {utcLabel(result.scenario.at)}{" "}
          <Badge value={snapshot ? "Saved" : "Unsaved"} />
        </p>
      </div>
      <p className="case-status" aria-label="Rehearsal status">
        {result.affectedProductIds.length} lots ·{" "}
        {result.affectedShipmentIds.length} shipments ·{" "}
        {result.assertions.filter((a) => a.status === "PASS").length} PASS ·{" "}
        {result.assertions.filter((a) => a.status === "FAIL").length} FAIL ·{" "}
        {result.assertions.filter((a) => a.status === "UNKNOWN").length} UNKNOWN
      </p>
    </header>
  );
}
