import {useState, type FormEvent} from 'react';
import type {Dataset, DrillResult, Intervention} from '../../../../src/contracts';
import {runDrill} from '../../../../src/graph/engine';
import {Badge, Icon, SectionHead} from '../components/Primitives';
export default function Rehearse({
  dataset,
  result,
  onUpdate,
  onReview,
  busy,
  suggestedTarget,
}: {
  dataset: Dataset;
  result: DrillResult;
  onUpdate: (i: Intervention[]) => void;
  onReview: () => void;
  busy: boolean;
  suggestedTarget?: string;
}) {
  const [type, setType] = useState<Intervention["type"]>("quarantine");
  const [target, setTarget] = useState(suggestedTarget ?? "");
  const [at, setAt] = useState(result.scenario.at.slice(0, 16));
  const [evidence, setEvidence] = useState(suggestedTarget && dataset.evidence.some(e => e.id === "EV-DRILL") ? "EV-DRILL" : "");
  const [owner, setOwner] = useState("");
  const targets = [
    ...new Map(
      dataset.nodes
        .filter((n) =>
          type === "quarantine"
            ? result.warehouseIds.includes(n.id)
            : type === "hold"
              ? result.affectedShipmentIds.includes(n.id)
              : type === "assign-owner"
                ? result.warehouseIds.includes(n.id)
                : result.unknownRecordIds.includes(n.id) ||
                  result.affectedShipmentIds.includes(n.id),
        )
        .map((n) => [n.id, n]),
    ).values(),
  ];
  const effectiveTarget = targets.some((n) => n.id === target)
    ? target
    : (targets[0]?.id ?? "");
  function submit(e: FormEvent) {
    e.preventDefault();
    onUpdate([
      ...result.interventions,
      {
        id: `SIM-${result.interventions.length + 1}-${Date.now()}`,
        type,
        targetId: effectiveTarget,
        at: new Date(`${at}Z`).toISOString(),
        evidence: evidence ? [evidence] : [],
        ...(type === "assign-owner" ? { owner } : {}),
      },
    ]);
  }
  const baseline = runDrill(dataset, result.scenario, []);
  return (
    <>
      <div className="simulator-layout">
        <form className="panel" onSubmit={submit}>
          <SectionHead eyebrow="PROPOSED CONTROL" title="Add an intervention" />
          <div className="form-content">
            <label>
              Intervention type
              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value as Intervention["type"]);
                  setTarget("");
                }}
              >
                <option value="quarantine">Quarantine warehouse stock</option>
                <option value="hold">Hold a planned shipment</option>
                <option value="investigate">
                  Investigate a missing record
                </option>
                <option value="assign-owner">Assign a response owner</option>
              </select>
            </label>
            <label>
              Target record
              <select
                value={effectiveTarget}
                onChange={(e) => setTarget(e.target.value)}
                required
              >
                {!targets.length && (
                  <option value="">No eligible records</option>
                )}
                {targets.map((n) => (
                  <option value={n.id} key={n.id}>
                    {n.id} — {n.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Effective time (UTC)
              <input
                type="datetime-local"
                value={at}
                onChange={(e) => setAt(e.target.value)}
                required
              />
            </label>
            <label>
              Supporting evidence
              <select
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
              >
                <option value="">Not recorded — preserve uncertainty</option>
                {dataset.evidence.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.id} — {e.title}
                  </option>
                ))}
              </select>
              <span className="field-help">
                A proposed control is not evidence that an operational action
                occurred.
              </span>
            </label>
            {type === "assign-owner" && (
              <label>
                Proposed response owner
                <input
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  maxLength={100}
                  required
                  placeholder="e.g. Quality lead (simulation)"
                />
              </label>
            )}
            <button
              className="primary wide"
              disabled={busy || !effectiveTarget}
            >
              Add simulated intervention <Icon name="plus" size={16} />
            </button>
          </div>
        </form>
        <section className="panel simulation-comparison">
          <SectionHead
            eyebrow="ORIGINAL → SIMULATED"
            title="What changes. What remains."
          />
          <div className="comparison-columns">
            <div>
              <span className="eyebrow">ORIGINAL TRACE</span>
              <strong>{baseline.affectedShipmentIds.length}</strong>
              <p>associated shipment records</p>
              <ul>
                {baseline.affectedShipmentIds.map((id) => (
                  <li key={id}>
                    <code>{id}</code>
                  </li>
                ))}
              </ul>
            </div>
            <div className="simulated-column">
              <span className="eyebrow">SIMULATED CONTROLS</span>
              <strong>{result.simulation.preventableShipmentIds.length}</strong>
              <p>future movements potentially preventable</p>
              <ul>
                {result.simulation.preventableShipmentIds.map((id) => (
                  <li key={id}>
                    <code>{id}</code>
                    <Badge value="Simulated" />
                  </li>
                ))}
              </ul>
              {!result.simulation.preventableShipmentIds.length && (
                <p className="muted">No eligible future movement prevented.</p>
              )}
            </div>
          </div>
          <div className="history-preserved">
            <Icon name="report" />
            <div>
              <strong>
                {result.simulation.historicalShipmentIds.length} historical{" "}
                {result.simulation.historicalShipmentIds.length === 1
                  ? "shipment remains"
                  : "shipments remain"}{" "}
                in the impact report
              </strong>
              <p>
                {result.simulation.historicalShipmentIds.join(" · ") ||
                  "No recorded historical shipments"}
              </p>
            </div>
          </div>
          <ul className="simulation-notes">
            {result.simulation.notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </section>
      </div>
      <section className="panel">
        <SectionHead
          eyebrow="SIMULATED DECISION LOG"
          title={`${result.interventions.length} proposed intervention${result.interventions.length === 1 ? "" : "s"}`}
        />
        {result.interventions.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Control</th>
                  <th>Target</th>
                  <th>Effective time</th>
                  <th>Evidence</th>
                  <th>
                    <span className="sr-only">Remove</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.interventions.map((i) => (
                  <tr key={i.id}>
                    <td>{i.type}</td>
                    <td className="mono">{i.targetId}</td>
                    <td>{i.at}</td>
                    <td>{i.evidence.join(", ") || "Not recorded"}</td>
                    <td>
                      <button
                        className="text-link"
                        onClick={() =>
                          onUpdate(
                            result.interventions.filter((x) => x.id !== i.id),
                          )
                        }
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="panel-padding muted">
            Add a control to compare its eligible effect with the original
            trace.
          </p>
        )}
      </section>
      <div className="workflow-footer">
        <span>
          Saving preserves the original trace and every proposed control.
        </span>
        <button className="primary" disabled={busy} onClick={onReview}>
          Save and follow up <Icon name="arrow" size={16} />
        </button>
      </div>
    </>
  );
}
