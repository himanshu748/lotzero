import { useState } from "react";
import Button from "@atlaskit/button/new";
import type { Snapshot } from "../../../../src/contracts";
import {
  compareDrills,
  reportCsv,
  reportMarkdown,
} from "../../../../src/graph/engine";
import { download } from "./Primitives";

export default function ReportTools({
  snapshot,
  snapshots,
}: {
  snapshot: Snapshot;
  snapshots: Snapshot[];
}) {
  const [previous, setPrevious] = useState("");
  const [format, setFormat] = useState<"json" | "md" | "csv">("json");
  const [notice, setNotice] = useState("");
  const compatible = snapshots.filter(
    (item) =>
      item.id !== snapshot.id &&
      item.result.scenario.sourceLotId ===
        snapshot.result.scenario.sourceLotId &&
      item.result.scenario.hazard === snapshot.result.scenario.hazard &&
      item.result.scenario.at === snapshot.result.scenario.at &&
      [...item.result.scenario.assertions].sort().join() ===
        [...snapshot.result.scenario.assertions].sort().join(),
  );
  const before = compatible.find((item) => item.id === previous);
  const comparison = before
    ? compareDrills(before.result, snapshot.result)
    : null;
  const json = JSON.stringify(
    before && comparison
      ? {
          ...snapshot,
          comparison: { baselineSnapshot: before, result: comparison },
        }
      : snapshot,
    null,
    2,
  );
  const content =
    format === "json"
      ? json
      : format === "md"
        ? reportMarkdown(snapshot, before)
        : reportCsv(snapshot, before);
  return (
    <section className="report-tools" aria-label="Saved report tools">
      <details className="panel report-disclosure">
        <summary>Compare with a previous rehearsal</summary>
        <label>
          Baseline snapshot
          <select
            value={previous}
            onChange={(event) => setPrevious(event.target.value)}
          >
            <option value="">
              Choose the same source, hazard and scenario clock
            </option>
            {compatible.map((item) => (
              <option value={item.id} key={item.id}>
                {item.dataset.version} · {item.id}
              </option>
            ))}
          </select>
        </label>
        {comparison ? (
          <div className="comparison-summary">
            {[
              ["Improved assertions", comparison.improved],
              ["Regressed assertions", comparison.regressed],
              ["Unchanged assertions", comparison.unchanged],
              ["New shipment associations", comparison.addedShipments],
              ["Removed shipment associations", comparison.removedShipments],
            ].map(([title, values]) => (
              <div key={title as string}>
                <h3>{title}</h3>
                <p>{(values as string[]).join(", ") || "None"}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="field-help">
            Save a baseline, load corrected records, rerun the same scenario,
            then compare. A removed association alone does not establish reduced
            risk.
          </p>
        )}
      </details>
      <details className="panel report-disclosure">
        <summary>Exports and saved inputs</summary>
        <p className="field-help">
          The saved report includes the full source dataset, assertions and
          simulated controls. Jira reports expire 90 days after saving; export a copy before then.
        </p>
        <div className="button-row">
          <Button
            onClick={() =>
              download(`lotzero-${snapshot.id}.json`, json, "application/json")
            }
          >
            JSON
          </Button>
          <Button
            onClick={() =>
              download(
                `lotzero-${snapshot.id}.md`,
                reportMarkdown(snapshot, before),
                "text/markdown;charset=utf-8",
              )
            }
          >
            Markdown
          </Button>
          <Button
            onClick={() =>
              download(
                `lotzero-${snapshot.id}.csv`,
                reportCsv(snapshot, before),
                "text/csv;charset=utf-8",
              )
            }
          >
            CSV
          </Button>
        </div>
        <details className="export-preview">
          <summary>View or copy export</summary>
          <label>
            Export format
            <select
              value={format}
              onChange={(event) => {
                setFormat(event.target.value as typeof format);
                setNotice("");
              }}
            >
              <option value="json">JSON</option>
              <option value="md">Markdown</option>
              <option value="csv">CSV</option>
            </select>
          </label>
          <label>
            Report export contents
            <textarea readOnly value={content} rows={10} spellCheck={false} />
          </label>
          <Button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(content);
                setNotice("Report copied to clipboard.");
              } catch {
                setNotice(
                  "Clipboard unavailable. Select the report text and copy it with your keyboard.",
                );
              }
            }}
          >
            Copy export
          </Button>
          <p role="status">{notice}</p>
        </details>
      </details>
      <details className="panel report-disclosure">
        <summary>Limits of this rehearsal</summary>
        <p>
          This is a simulation of recorded associations, not a safety
          assessment, regulatory certification or operational recall. Missing
          records remain UNKNOWN. Historical shipments remain in impact;
          controls are hypothetical.
        </p>
        <p>
          Timing is not measured: timestamps do not measure response or
          evidence-retrieval duration. Neither a PASS nor a removed association
          establishes that a product is safe. The content revision identifies
          saved inputs; it is not a digital signature.
        </p>
        <p>
          {snapshot.dataset.synthetic
            ? "These Northstar records are synthetic."
            : "Imported records require validation by their owner."}
        </p>
      </details>
    </section>
  );
}
