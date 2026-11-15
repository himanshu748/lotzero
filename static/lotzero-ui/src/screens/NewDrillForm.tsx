import {useState, type FormEvent} from 'react';
import type {Dataset, Scenario, AssertionId} from '../../../../src/contracts';
import {DEFAULT_ASSERTIONS} from '../../../../src/contracts';
import {ASSERTION_TITLES as assertionLabels} from '../../../../src/assertions/labels';
import {Icon, SectionHead} from '../components/Primitives';
export default function NewDrillForm({
  dataset,
  onRun,
  disabled,
}: {
  dataset: Dataset;
  onRun: (s: Scenario) => void;
  disabled: boolean;
}) {
  const ingredients = [
    ...new Map(
      dataset.nodes
        .filter((n) => n.kind === "ingredient")
        .map((n) => [n.id, n]),
    ).values(),
  ];
  const [source, setSource] = useState(
    ingredients.some((n) => n.id === "ING-A19")
      ? "ING-A19"
      : (ingredients[0]?.id ?? ""),
  );
  const [hazard, setHazard] = useState<Scenario["hazard"]>("contamination");
  const [at, setAt] = useState("2026-10-28T09:00");
  const [assertions, setAssertions] =
    useState<AssertionId[]>(DEFAULT_ASSERTIONS);
  function submit(e: FormEvent) {
    e.preventDefault();
    onRun({
      sourceLotId: source,
      hazard,
      at: new Date(`${at}Z`).toISOString(),
      assertions,
    });
  }
  return (
    <div className="form-layout">
      <form className="panel drill-form" onSubmit={submit}>
        <SectionHead
          eyebrow="SCENARIO DEFINITION"
          title="Start with one ingredient lot"
        />
        <div className="form-content">
          <label>
            Initiating lot
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              required
            >
              {ingredients.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.id} — {n.label}
                </option>
              ))}
            </select>
            <span className="field-help">
              Trace all recorded downstream material relationships.
            </span>
          </label>
          <div className="form-columns">
            <label>
              Hypothetical hazard
              <select
                value={hazard}
                onChange={(e) =>
                  setHazard(e.target.value as Scenario["hazard"])
                }
              >
                <option value="contamination">Contamination</option>
                <option value="mislabeling">Mislabeling</option>
                <option value="allergen">Undeclared allergen</option>
              </select>
            </label>
            <label>
              Scenario effective time (UTC)
              <input
                type="datetime-local"
                value={at}
                onChange={(e) => setAt(e.target.value)}
                required
              />
              <span className="field-help">
                Separates historical from future movements.
              </span>
            </label>
          </div>
          <fieldset>
            <legend>Recall readiness assertions</legend>
            <p className="field-help">
              Choose the tests this rehearsal should execute.
            </p>
            {DEFAULT_ASSERTIONS.map((id) => (
              <label className="checkbox-label" key={id}>
                <input
                  type="checkbox"
                  checked={assertions.includes(id)}
                  onChange={(e) =>
                    setAssertions(
                      e.target.checked
                        ? [...assertions, id]
                        : assertions.filter((x) => x !== id),
                    )
                  }
                />
                <span>{assertionLabels[id]}</span>
              </label>
            ))}
          </fieldset>
          <button
            className="primary wide"
            disabled={disabled || !source || !assertions.length}
          >
            Run rehearsal <Icon name="arrow" size={18} />
          </button>
        </div>
      </form>
      <aside className="form-note"><h2>Records under test</h2><p>{dataset.name}</p><code>{dataset.version}</code><p>A path is a recorded association. Missing evidence remains unknown.</p></aside>
    </div>
  );
}
