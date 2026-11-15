import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import type {
  Dataset,
  DrillResult,
  RecordNode,
  TraceEntry,
} from "../../../../src/contracts";
import { traceGraph } from "../../../../src/graph/engine";
import { Badge, Icon } from "./Primitives";
import "../styles/trace.css";
const groups = [
  ["ingredient", "supplier"],
  ["batch", "transformation"],
  ["product"],
  ["warehouse", "shipment"],
  ["destination"],
];
export interface EvidenceViewState {
  selected: string;
  pathTarget: string;
  mode: "graph" | "table" | "path";
  direction: "forward" | "backward";
}
export default function Impact({
  dataset,
  result,
  initialView,
  selectionRequest,
  onViewChange,
}: {
  dataset: Dataset;
  result: DrillResult;
  initialView?: EvidenceViewState;
  selectionRequest?: { recordId: string | null; key: number };
  onViewChange?: (state: EvidenceViewState) => void;
}) {
  const [selected, setSelected] = useState(
    initialView?.selected ?? result.scenario.sourceLotId,
  );
  const [mode, setMode] = useState<"graph" | "table" | "path">(
    initialView?.mode ?? "graph",
  );
  const [direction, setDirection] = useState<"forward" | "backward">(
    initialView?.direction ?? "forward",
  );
  const [query, setQuery] = useState("");
  const [pathTarget, setPathTarget] = useState(
    initialView?.pathTarget ?? selected,
  );
  const lastRequest = useRef(selectionRequest?.key);
  useEffect(() => {
    if (!selectionRequest || lastRequest.current === selectionRequest.key)
      return;
    lastRequest.current = selectionRequest.key;
    setSelected(selectionRequest.recordId ?? "");
    setPathTarget(selectionRequest.recordId ?? "");
    setMode("path");
    setDirection("forward");
  }, [selectionRequest]);
  useEffect(() => {
    onViewChange?.({ selected, pathTarget, mode, direction });
  }, [selected, pathTarget, mode, direction, onViewChange]);
  const [fit, setFit] = useState(false);
  const [graphWidth, setGraphWidth] = useState(1120);
  const searchRef = useRef<HTMLInputElement>(null);
  const graphRef = useRef<HTMLDivElement>(null);
  const inspectorHeadingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const graph = graphRef.current;
    if (!graph) return;
    const measure = () => setGraphWidth(graph.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(graph);
    return () => observer.disconnect();
  }, [mode]);
  const trace = useMemo(
    () =>
      direction === "forward"
        ? result.trace
        : traceGraph(dataset, selected, "backward"),
    [dataset, result, direction, selected],
  );
  const entries = useMemo(
    () => new Map(trace.map((x) => [x.nodeId, x])),
    [trace],
  );
  const nodes = useMemo(
    () =>
      [
        ...new Map(
          dataset.nodes.filter((n) => entries.has(n.id)).map((n) => [n.id, n]),
        ).values(),
      ].sort((a, b) => a.id.localeCompare(b.id)),
    [dataset, entries],
  );
  const positions = new Map<string, { x: number; y: number }>();
  groups.forEach((g, col) =>
    nodes
      .filter((n) => g.includes(n.kind))
      .forEach((n, row) =>
        positions.set(n.id, { x: col * 220 + 18, y: row * 104 + 55 }),
      ),
  );
  const height = Math.max(
    430,
    ...[...positions.values()].map((p) => p.y + 105),
  );
  const selectedNode = dataset.nodes.find((n) => n.id === selected);
  const selectedEntry =
    entries.get(selected) ?? result.trace.find((t) => t.nodeId === selected);
  const forwardEntries = new Map(
    result.trace.map((entry) => [entry.nodeId, entry]),
  );
  const supportingEntry = forwardEntries.get(
    mode === "path" ? pathTarget : selected,
  );
  const pathIds = new Set(supportingEntry?.path ?? []);
  const pathEdges = new Set(
    (supportingEntry?.path ?? [])
      .slice(1)
      .map((id, i) => JSON.stringify([supportingEntry!.path[i], id])),
  );
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const matches = normalizedQuery
    ? nodes.filter((node) =>
        `${node.id} ${node.label} ${node.kind}`
          .toLocaleLowerCase()
          .includes(normalizedQuery),
      )
    : [];
  const scale = fit ? Math.min(1, Math.max(1, graphWidth) / 1120) : 1;
  const select = (id: string) => {
    setSelected(id);
  };
  const jump = (id: string) => {
    select(id);
    if (mode === "path") setPathTarget(id);
    setQuery("");
    searchRef.current?.focus();
  };
  return (
    <div className="impact-layout">
      <section className="panel graph-panel">
        <div className="trace-search-area">
          <label className="trace-search">
            <Icon name="search" size={17} />
            <span className="sr-only">Find a reachable record</span>
            <input
              ref={searchRef}
              type="search"
              value={query}
              placeholder="Find a lot, shipment or location…"
              aria-controls="trace-search-results"
              aria-describedby="trace-search-help"
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && matches.length) {
                  event.preventDefault();
                  jump(matches[0].id);
                }
                if (event.key === "Escape") setQuery("");
              }}
            />
          </label>
          <span id="trace-search-help">
            {normalizedQuery
              ? "Enter opens the first match · Esc clears"
              : `${nodes.length} reachable records in this trace`}
          </span>
          {normalizedQuery && (
            <button
              className="trace-clear"
              onClick={() => {
                setQuery("");
                searchRef.current?.focus();
              }}
              aria-label="Clear record search"
            >
              <Icon name="close" size={16} />
            </button>
          )}
        </div>
        <div id="trace-search-results" className="trace-results">
          {normalizedQuery && (
            <>
              <p role="status">
                {matches.length
                  ? `${matches.length} matching ${
                      matches.length === 1 ? "record" : "records"
                    }${
                      matches.length > 6
                        ? ". Showing the first 6; refine your search."
                        : "."
                    }`
                  : `No reachable records match “${query}”.`}
              </p>
              {matches.length > 0 && (
                <ul aria-label="Matching reachable records">
                  {matches.slice(0, 6).map((node) => (
                    <li key={node.id}>
                      <button
                        onClick={() => jump(node.id)}
                        aria-label={`Go to ${node.id}`}
                      >
                        <span>
                          <strong>{node.id}</strong>
                          <small>{node.label}</small>
                        </span>
                        <span className="trace-result-kind">
                          {node.kind}
                          <Icon name="arrow" size={15} />
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
        <div className="graph-toolbar">
          <div className="segmented" aria-label="Impact presentation">
            <button
              aria-pressed={mode === "graph"}
              onClick={() => setMode("graph")}
            >
              <Icon name="graph" size={16} /> Flow map
            </button>
            <button
              aria-pressed={mode === "table"}
              onClick={() => setMode("table")}
            >
              <Icon name="grid" size={16} /> Record table
            </button>
            <button
              aria-pressed={mode === "path"}
              disabled={!forwardEntries.has(selected)}
              onClick={() => {
                setPathTarget(selected);
                setDirection("forward");
                setMode("path");
              }}
            >
              <Icon name="arrow" size={16} /> Selected path
            </button>
          </div>
          {mode !== "path" && (
            <label className="inline-label">
              Trace
              <select
                value={direction}
                onChange={(e) =>
                  setDirection(e.target.value as "forward" | "backward")
                }
              >
                <option value="forward">Downstream from source</option>
                <option value="backward">Origins of selected record</option>
              </select>
            </label>
          )}
        </div>
        <button
          className="selected-evidence-jump"
          onClick={() => inspectorHeadingRef.current?.focus()}
        >
          <span>
            View <strong>{selected}</strong> evidence
          </span>
          <Icon name="arrow" size={16} />
        </button>
        {mode === "graph" ? (
          <>
            <div className="map-controls">
              <p>
                {direction === "backward" ? (
                  <>
                    Origins traced from <strong>{selected}</strong>
                  </>
                ) : supportingEntry && supportingEntry.path.length > 1 ? (
                  <>
                    <span className="path-swatch" /> Path to{" "}
                    <strong>{selected}</strong> highlighted
                  </>
                ) : (
                  "Select a record to follow its supporting path"
                )}
              </p>
              <div role="group" aria-label="Map scale">
                <button aria-pressed={fit} onClick={() => setFit(true)}>
                  Fit map
                </button>
                <button
                  aria-label="Actual size"
                  aria-pressed={!fit}
                  onClick={() => setFit(false)}
                >
                  100%
                </button>
                <output aria-label="Current map scale">
                  {Math.round(scale * 100)}%
                </output>
              </div>
            </div>
            <div
              ref={graphRef}
              className="graph-scroll"
              role="region"
              aria-label="Interactive material-flow graph"
              tabIndex={0}
            >
              <div
                className="scaled-map"
                style={{ width: 1120 * scale, height: height * scale }}
              >
                <div
                  className="flow-canvas"
                  style={{
                    width: 1120,
                    height,
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                  }}
                >
                  <div className="lane-heads">
                    {[
                      "INGREDIENTS",
                      "TRANSFORMATIONS",
                      "PRODUCT LOTS",
                      "STORAGE & MOVEMENT",
                      "DESTINATIONS",
                    ].map((s) => (
                      <span key={s}>{s}</span>
                    ))}
                  </div>
                  <svg
                    className="flow-lines"
                    width={1120}
                    height={height}
                    aria-hidden="true"
                  >
                    <defs>
                      <marker
                        id="arrowhead"
                        markerWidth="6"
                        markerHeight="6"
                        refX="5"
                        refY="3"
                        orient="auto"
                      >
                        <path
                          d="M0,0 L6,3 L0,6"
                          fill="var(--ds-border-bold, #8590a2)"
                        />
                      </marker>
                    </defs>
                    {dataset.edges
                      .filter(
                        (e) => positions.has(e.from) && positions.has(e.to),
                      )
                      .map((e, i) => {
                        const a = positions.get(e.from)!,
                          b = positions.get(e.to)!;
                        return (
                          <path
                            key={`${e.id}-${i}`}
                            d={`M${a.x + 182},${a.y + 35} C${a.x + 210},${
                              a.y + 35
                            } ${b.x - 28},${b.y + 35} ${b.x},${b.y + 35}`}
                            fill="none"
                            stroke={
                              e.certainty === "confirmed"
                                ? direction === "forward" &&
                                  pathEdges.has(JSON.stringify([e.from, e.to]))
                                  ? "var(--ds-border-selected, #0c66e4)"
                                  : "var(--ds-border-bold, #8590a2)"
                                : "var(--ds-border-warning, #b38600)"
                            }
                            strokeWidth={
                              direction === "forward" &&
                              pathEdges.has(JSON.stringify([e.from, e.to]))
                                ? 3
                                : 1.5
                            }
                            strokeDasharray={
                              e.certainty === "confirmed" ? undefined : "5 4"
                            }
                            markerEnd="url(#arrowhead)"
                          />
                        );
                      })}
                  </svg>
                  {nodes.map((node) => (
                    <button
                      key={node.id}
                      className={`flow-node ${
                        selected === node.id ? "selected" : ""
                      } ${
                        direction === "forward" && pathIds.has(node.id)
                          ? "on-supporting-path"
                          : ""
                      } ${entries.get(node.id)?.certainty}`}
                      style={{
                        left: positions.get(node.id)?.x,
                        top: positions.get(node.id)?.y,
                      }}
                      aria-pressed={selected === node.id}
                      aria-controls="record-evidence"
                      onClick={() => select(node.id)}
                    >
                      <span className="node-kind">{node.kind}</span>
                      <strong>{node.id}</strong>
                      <span className="node-label">{node.label}</span>
                      <span className="node-certainty">
                        <Badge
                          value={entries.get(node.id)?.certainty ?? "unknown"}
                        />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : mode === "path" ? (
          <PathFocus
            dataset={dataset}
            entry={supportingEntry}
            entries={forwardEntries}
            selected={selected}
            onSelect={select}
          />
        ) : (
          <div className="table-wrap">
            <table>
              <caption className="sr-only">
                Reachable records and their association certainty
              </caption>
              <thead>
                <tr>
                  <th>Record</th>
                  <th>Type</th>
                  <th>Association</th>
                  <th>Evidence</th>
                </tr>
              </thead>
              <tbody>
                {nodes.map((node) => (
                  <tr
                    key={node.id}
                    className={selected === node.id ? "selected-row" : ""}
                  >
                    <td>
                      <button
                        className="text-link mono"
                        aria-pressed={selected === node.id}
                        aria-controls="record-evidence"
                        onClick={() => select(node.id)}
                      >
                        {node.id}
                      </button>
                      <span className="cell-detail">{node.label}</span>
                    </td>
                    <td>{node.kind}</td>
                    <td>
                      <Badge value={entries.get(node.id)!.certainty} />
                    </td>
                    <td>{entries.get(node.id)!.evidence.length} references</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="graph-footer">
          <span>
            <i className="legend-line" /> Recorded association
          </span>
          <span>
            <i className="legend-line dashed" /> Uncertain association
          </span>
          <span>{nodes.length} reachable records · select to inspect</span>
        </div>
      </section>
      <Inspector
        dataset={dataset}
        node={selectedNode}
        entry={selectedEntry}
        headingRef={inspectorHeadingRef}
      />
    </div>
  );
}
function PathFocus({
  dataset,
  entry,
  entries,
  selected,
  onSelect,
}: {
  dataset: Dataset;
  entry?: TraceEntry;
  entries: Map<string, TraceEntry>;
  selected: string;
  onSelect: (id: string) => void;
}) {
  const records = new Map(dataset.nodes.map((node) => [node.id, node]));
  return (
    <section className="path-focus" aria-label="Selected supporting path">
      <header className="path-focus-header">
        <p className="eyebrow">ONE RECORDED PATH</p>
        <h2>
          From source to <span>{entry?.nodeId ?? selected}</span>
        </h2>
        <p>
          Read the lineage, one record at a time. Select a step to inspect its
          evidence.
        </p>
      </header>
      {entry?.path.length ? (
        <ol className="path-steps">
          {entry.path.map((id, index) => {
            const node = records.get(id);
            return (
              <li key={`${id}-${index}`}>
                <span className="path-step-number">
                  {String(index + 1).padStart(2, "0")}
                  <Icon name="arrow" size={15} />
                </span>
                <button
                  className={selected === id ? "selected" : ""}
                  onClick={() => onSelect(id)}
                  aria-label={`Inspect ${id}`}
                  aria-pressed={selected === id}
                  aria-controls="record-evidence"
                >
                  <span className="node-kind">
                    {node?.kind ?? "Unresolved record"}
                  </span>
                  <strong>{id}</strong>
                  <span className="path-step-label">
                    {node?.label ?? "No source record supplied"}
                  </span>
                  <Badge value={entries.get(id)?.certainty ?? "unknown"} />
                </button>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="path-empty">
          No complete supporting path is recorded for this selection.
        </p>
      )}
      <p className="path-context-note">
        <Icon name="graph" size={17} />
        <span>
          This is one supporting path. The flow map retains the other recorded
          associations; uncertainty remains visible.
        </span>
      </p>
    </section>
  );
}
function Inspector({
  dataset,
  node,
  entry,
  headingRef,
}: {
  dataset: Dataset;
  node?: RecordNode;
  entry?: TraceEntry;
  headingRef?: RefObject<HTMLHeadingElement | null>;
}) {
  if (!node)
    return (
      <aside id="record-evidence" className="panel inspector">
        <h2>Record evidence</h2>
        <p>Select a record.</p>
      </aside>
    );
  const refs = [...new Set([...(entry?.evidence ?? []), ...node.evidence])];
  return (
    <aside
      id="record-evidence"
      className="panel inspector"
      aria-label="Selected record evidence"
    >
      <p className="sr-only" role="status" aria-atomic="true">
        Showing evidence for {node.id}.
      </p>
      <p className="eyebrow">EVIDENCE INSPECTOR</p>
      <div key={node.id} className="inspector-heading motion-arrival">
        <Icon name="search" />
        <h2 ref={headingRef} tabIndex={-1}>
          {node.id}
        </h2>
      </div>
      <p>{node.label}</p>
      <Badge value={entry?.certainty ?? "unknown"} />
      <dl className="detail-list">
        {node.kind === "shipment" && (
          <div>
            <dt>Recorded destination</dt>
            <dd>{node.destinationId || "Not recorded"}</dd>
          </div>
        )}
        {node.warehouseId && (
          <div>
            <dt>Warehouse</dt>
            <dd>{node.warehouseId}</dd>
          </div>
        )}
        <div>
          <dt>Record type</dt>
          <dd>{node.kind}</dd>
        </div>
        {node.quantity && (
          <div>
            <dt>Recorded quantity</dt>
            <dd>
              {node.quantity.value} {node.quantity.unit}
            </dd>
          </div>
        )}
        {node.state && (
          <div>
            <dt>Movement state</dt>
            <dd>{node.state}</dd>
          </div>
        )}
        {node.occurredAt && (
          <div>
            <dt>Recorded time</dt>
            <dd>
              {new Date(node.occurredAt).toLocaleString("en-GB", {
                timeZone: "UTC",
              })}{" "}
              UTC
            </dd>
          </div>
        )}
        <div>
          <dt>Response owner</dt>
          <dd>{node.owner ?? "Not recorded"}</dd>
        </div>
      </dl>
      <h3>Supporting path</h3>
      {entry?.path.length ? (
        <ol className="evidence-path">
          {entry.path.map((id, i) => (
            <li key={`${id}-${i}`}>
              <code>{id}</code>
            </li>
          ))}
        </ol>
      ) : (
        <p className="muted">No complete source path is recorded.</p>
      )}
      <h3>Document references</h3>
      <ul className="reference-list">
        {refs.map((id) => {
          const evidence = dataset.evidence.find((e) => e.id === id);
          return (
            <li key={id}>
              <code>{id}</code>
              <span>{evidence?.title ?? "Reference not found"}</span>
              <small>{evidence?.source ?? "Missing evidence"}</small>
            </li>
          );
        })}
      </ul>
      {!refs.length && (
        <p className="muted">
          No documentary evidence. Investigate this record.
        </p>
      )}
      <div className="inspector-note">
        Association describes recorded lineage, not confirmed contamination.
      </div>
    </aside>
  );
}
