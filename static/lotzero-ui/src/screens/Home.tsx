import { useRef, useState } from "react";
import Button from "@atlaskit/button/new";
import type { ReturnTypeOfUseRehearsal } from "../types";
import { isNorthstarSample } from "../../../../src/scenarios/sample";
import { repairedDataset } from "../../../../fixtures/synthetic/dataset";
import { localMode } from "../client";
import { Badge } from "../components/Primitives";
import ConfirmDialog from "../components/ConfirmDialog";
import { hazardLabel, utcLabel } from "../finding-copy";

export default function Home({ desk }: { desk: ReturnTypeOfUseRehearsal }) {
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const { data, active } = desk;
  const disabled = Boolean(desk.busy);
  const sampleAllowed = !data.dataset || isNorthstarSample(data.dataset);
  const snapshots = data.snapshots.filter((saved) =>
    `${saved.result.scenario.sourceLotId} ${saved.result.scenario.hazard} ${saved.dataset.version}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  return (
    <>
      <header className="home-heading">
        <h1 tabIndex={-1}>Recall rehearsal</h1>
        <p>Practice tracing an ingredient to its shipments. Find missing records and review the follow-up work.</p>
        <p className="field-help">
          Under the FDA Food Traceability Rule, covered firms must provide
          traceability records within 24 hours of a request. FDA will not
          enforce the rule before 20 July 2028.
        </p>
      </header>
      <div className="home-actions">
        {active ? (
          <Button
            appearance="primary"
            isDisabled={disabled}
            onClick={() => desk.go("rehearsal")}
          >
            Resume rehearsal
          </Button>
        ) : sampleAllowed ? (
          <Button
            appearance="primary"
            isDisabled={disabled}
            onClick={desk.sample}
          >
            Run Northstar sample (synthetic)
          </Button>
        ) : (
          <Button
            appearance="primary"
            isDisabled={disabled}
            onClick={() => desk.go("new")}
          >
            Start a new drill
          </Button>
        )}
        {data.dataset && (active || sampleAllowed) && (
          <Button isDisabled={disabled} onClick={() => desk.go("new")}>
            Start a new drill
          </Button>
        )}
        <Button isDisabled={disabled} onClick={() => input.current?.click()}>
          Import records
        </Button>
        <input
          ref={input}
          hidden
          type="file"
          accept=".json,.csv"
          aria-label="Import traceability dataset"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void desk.importFile(file);
            event.target.value = "";
          }}
        />
      </div>
      {data.dataset && (
        <p className="loaded-records">
          Records loaded: <strong>{data.dataset.name}</strong> ·{" "}
          <code>{data.dataset.version}</code>{" "}
          <Badge value={data.dataset.synthetic ? "Synthetic" : "Imported"} />
        </p>
      )}
      <section className="ledger" aria-labelledby="ledger-title">
        <p className="field-help">{data.snapshots.length} of 25 saved rehearsals. Jira reports expire 90 days after saving; export a report from Follow-up to keep a copy.</p>
        <div className="section-heading">
          <h2 id="ledger-title">Saved rehearsals</h2>
          {data.snapshots.length > 0 && (
            <label className="search-label">
              <span className="sr-only">Search saved rehearsals</span>
              <input
                type="search"
                placeholder="Search by lot or scenario"
                aria-label="Search saved rehearsals"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
          )}
        </div>
        {!data.snapshots.length ? (
          <div className="empty-state">
            <h3>No saved rehearsals yet</h3>
            <p>
              The synthetic Northstar sample traces ingredient lot{" "}
              <code>ING-A19</code> to its shipments and opens on the first gap:
              a shipment with no recorded destination.
            </p>
            <p>
              Run a rehearsal, inspect the findings, then save it for follow-up.
            </p>
          </div>
        ) : snapshots.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Lot</th>
                  <th>Scenario</th>
                  <th>Saved</th>
                  <th>Findings</th>
                  <th>Open</th>
                </tr>
              </thead>
              <tbody>
                {snapshots.map((saved) => (
                  <tr key={saved.id}>
                    <td>
                      <code>{saved.result.scenario.sourceLotId}</code>
                    </td>
                    <td>{hazardLabel(saved.result.scenario.hazard)}</td>
                    <td>{utcLabel(saved.createdAt)}</td>
                    <td>
                      {
                        saved.result.assertions.filter(
                          (a) => a.status === "FAIL",
                        ).length
                      }{" "}
                      FAIL ·{" "}
                      {
                        saved.result.assertions.filter(
                          (a) => a.status === "UNKNOWN",
                        ).length
                      }{" "}
                      UNKNOWN
                    </td>
                    <td>
                      <Button
                        isDisabled={disabled}
                        onClick={() => desk.open(saved)}
                      >
                        Open
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>
            No rehearsals match “{query}”.{" "}
            <button onClick={() => setQuery("")}>Clear search</button>
          </p>
        )}
      </section>
      <details className="data-controls">
        <summary>Records and workspace controls</summary>
        <p>
          Imports use JSON or record_type,json CSV; maximum 200 KB, 1,000 nodes
          and 3,000 edges. Saved reports keep their original inputs.
        </p>
        {localMode && data.dataset?.synthetic && (
          <Button
            isDisabled={disabled}
            onClick={() =>
              void desk.importFile(
                new File([JSON.stringify(repairedDataset)], "corrected.json", {
                  type: "application/json",
                }),
              )
            }
          >
            Load corrected sample
          </Button>
        )}
        {data.audit.length > 0 && (
          <details>
            <summary>Recent activity</summary>
            <ul>
              {data.audit.slice(0, 10).map((entry, index) => (
                <li key={index}>
                  {entry.at} · {entry.event}
                </li>
              ))}
            </ul>
          </details>
        )}
        <Button
          appearance="danger"
          isDisabled={disabled}
          onClick={() => setDeleting(true)}
        >
          Delete LotZero workspace data
        </Button>
      </details>
      {deleting && (
        <ConfirmDialog
          titleId="delete-title"
          onClose={() => {
            setDeleting(false);
            setConfirmation("");
          }}
        >
          <h2 id="delete-title">Delete workspace data?</h2>
          <p>
            Jira issues are kept. Uncertain receipts must be reconciled first.
          </p>
          <label>
            Type DELETE to confirm
            <input
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
            />
          </label>
          <div className="button-row">
            <Button
              onClick={() => {
                setDeleting(false);
                setConfirmation("");
              }}
            >
              Cancel
            </Button>
            <Button
              appearance="danger"
              isDisabled={confirmation !== "DELETE" || disabled}
              onClick={() => {
                desk.reset();
                setDeleting(false);
                setConfirmation("");
              }}
            >
              Delete data
            </Button>
          </div>
        </ConfirmDialog>
      )}
    </>
  );
}
