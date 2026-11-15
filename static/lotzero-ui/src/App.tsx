import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import type {
  AssertionId,
  Bootstrap,
  Dataset,
  DrillResult,
  Intervention,
  JiraAction,
  Project,
  Scenario,
  Snapshot,
} from "../../../src/contracts";
import { DEFAULT_ASSERTIONS } from "../../../src/contracts";
import {
  compareDrills,
  importCsv,
  reportCsv,
  reportMarkdown,
  runDrill,
  validateDataset,
} from "../../../src/graph/engine";
import { repairedDataset } from "../../../fixtures/synthetic/dataset";
import { client, localMode } from "./client";
import {
  Badge,
  download,
  Empty,
  Icon,
  JiraIssueLink,
  Metric,
  SectionHead,
} from "./components/Primitives";
import Impact from "./components/Impact";
import AnalystHandoff from "./components/AnalystHandoff";
import RunSummary from "./components/RunSummary";
import {isNorthstarSample} from "../../../src/scenarios/sample";
import {recoveryFor} from "./recovery";

type Screen =
  | "readiness"
  | "new"
  | "impact"
  | "gaps"
  | "simulator"
  | "jira"
  | "report";
const navigation: { id: Screen; label: string; icon: string }[] = [
  { id: "readiness", label: "Recall readiness", icon: "grid" },
  { id: "new", label: "New drill", icon: "plus" },
  { id: "impact", label: "Impact explorer", icon: "graph" },
  { id: "gaps", label: "Evidence gaps", icon: "gap" },
  { id: "simulator", label: "Intervention simulator", icon: "control" },
  { id: "jira", label: "Jira action review", icon: "jira" },
  { id: "report", label: "Drill report", icon: "report" },
];
const descriptions: Record<Screen, string> = {
  readiness: "Know what your records can prove. Rehearse what they cannot.",
  new: "Define one hypothetical hazard. Test the trace from ingredient to destination.",
  impact: "Follow the material. Inspect the record behind every connection.",
  gaps: "Turn incomplete evidence into explicit, testable findings.",
  simulator: "Rehearse a response without changing an operational record.",
  jira: "Review the evidence and approve the follow-up work.",
  report: "A reproducible account of the scenario, findings and decisions.",
};
const assertionLabels: Record<AssertionId, string> = {
  "ingredient-origin": "Every product lot has a traceable ingredient origin",
  "shipment-destination": "Affected shipped lots have recorded destinations",
  "warehouse-owner": "Affected warehouses have response owners",
  "quarantine-evidence": "Quarantine decisions have supporting evidence",
  "shipment-lot": "Affected shipments have usable lot identifiers",
};
const defaultScenario: Scenario = {
  sourceLotId: "ING-A19",
  hazard: "contamination",
  at: "2026-10-28T09:00:00Z",
  assertions: DEFAULT_ASSERTIONS,
};
export default function App() {
  const [data, setData] = useState<Bootstrap>({
    dataset: null,
    snapshots: [],
    mode: localMode ? "local" : "forge",
    audit: [],
  });
  const [screen, setScreen] = useState<Screen>("readiness");
  const [busy, setBusy] = useState("Loading installation");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [result, setResult] = useState<DrillResult | null>(null);
  const [activeDataset, setActiveDataset] = useState<Dataset | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [actions, setActions] = useState<JiraAction[]>([]);
  const [resetText, setResetText] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [ledgerQuery, setLedgerQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!menuOpen) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuRef.current?.focus();
      }
    };
    window.addEventListener("keydown", dismiss);
    return () => window.removeEventListener("keydown", dismiss);
  }, [menuOpen]);
  useEffect(() => {
    client
      .bootstrap()
      .then(setData)
      .catch((e) => setError(message(e)))
      .finally(() => setBusy(""));
  }, []);
  const go = (next: Screen) => {
    setMenuOpen(false);
    setScreen(next);
    setError("");
    setTimeout(() => {
      headingRef.current?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "instant" });
    }, 0);
  };
  async function perform(label: string, fn: () => Promise<void>) {
    setBusy(label);
    setError("");
    setNotice("");
    try {
      await fn();
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy("");
    }
  }
  function clearActive() {
    setResult(null);
    setSnapshot(null);
    setActiveDataset(null);
    setActions([]);
  }
  async function refreshSavedState() {
    const refreshed = await client.bootstrap();
    setData(refreshed);
    if (snapshot) {
      const saved = refreshed.snapshots.find(item => item.id === snapshot.id);
      if (saved) {setSnapshot(saved); setActions(saved.actions);}
      else {clearActive(); go('readiness');}
    }
    setNotice('Saved state refreshed. Review action receipts before any write.');
  }
  async function seed() {
    await perform("Loading synthetic records", async () => {
      setData(await client.seed());
      if (!data.dataset) clearActive();
      setNotice(
        "Synthetic records loaded. No real customer or supplier data is used.",
      );
    });
  }
  async function runSample() {
    if (result) {go("impact"); setNotice("Your current rehearsal is preserved. Continue inspecting its evidence."); return;}
    await perform("Preparing synthetic rehearsal", async () => {
      const next = data.dataset ? data : await client.seed();
      if (!isNorthstarSample(next.dataset) || !next.dataset)
        throw new Error("Choose a source lot in your imported dataset to start a drill.");
      const nextResult = runDrill(next.dataset, defaultScenario, []);
      setData(next);
      setActiveDataset(next.dataset);
      setResult(nextResult);
      setSnapshot(null);
      setActions([]);
      go("impact");
      setNotice("Synthetic rehearsal ready. Select a record to inspect its evidence.");
    });
  }
  async function importFile(file: File) {
    await perform("Validating records", async () => {
      if (file.size > 200_000)
        throw new Error(
          "Import is limited to 200 KB. Split the dataset before uploading.",
        );
      const text = await file.text();
      const parsed = file.name.toLowerCase().endsWith(".csv")
        ? importCsv(text)
        : validateDataset(JSON.parse(text));
      setData(await client.importDataset(parsed));
      clearActive();
      setNotice(
        `Dataset ${parsed.version} imported. Run a new drill to evaluate its evidence.`,
      );
    });
  }
  function run(scenario: Scenario) {
    try {
      if (!data.dataset) throw new Error("Load a dataset first.");
      const next = runDrill(data.dataset, scenario, []);
      setActiveDataset(data.dataset);
      setResult(next);
      setSnapshot(null);
      setActions([]);
      go("impact");
      setNotice(
        "Deterministic trace complete. Results describe recorded associations.",
      );
    } catch (e) {
      setError(message(e));
    }
  }
  async function save(): Promise<Snapshot> {
    if (!result || !activeDataset) throw new Error("Run a drill first.");
    if (snapshot) return snapshot;
    if (data.dataset?.version !== activeDataset.version)
      throw new Error(
        "The current dataset changed. Run a fresh drill before saving.",
      );
    const saved = await client.saveDrill(
      result.scenario,
      result.interventions,
      result.fingerprint,
    );
    setSnapshot(saved);
    setResult(saved.result);
    setActiveDataset(saved.dataset);
    setData(await client.bootstrap());
    setNotice("Reproducible snapshot saved.");
    return saved;
  }
  async function review() {
    await perform("Preparing Jira action preview", async () => {
      const saved = await save();
      setActions(await client.previewActions(saved.id));
      go("jira");
    });
  }
  function openSnapshot(value: Snapshot) {
    setSnapshot(value);
    setActiveDataset(value.dataset);
    setResult(value.result);
    setActions(value.actions);
    go("report");
  }
  const currentSnapshot =
    snapshot ??
    (result && activeDataset
      ? ({
          id: result.id,
          createdAt: "Unsaved preview",
          initiator: localMode ? "Local rehearsal user" : "Current Jira user",
          dataset: activeDataset,
          result,
          actions: [],
        } as Snapshot)
      : null);
  const latest = data.snapshots[0];
  const visibleSnapshots = data.snapshots.filter((saved) =>
    `${saved.result.scenario.sourceLotId} ${saved.result.scenario.hazard} ${saved.dataset.version}`
      .toLowerCase().includes(ledgerQuery.trim().toLowerCase()),
  );
  const passCount =
    latest?.result.assertions.filter((a) => a.status === "PASS").length ?? 0;
  const globalDisabled = Boolean(busy);
  const activeScreen = [
    "impact",
    "gaps",
    "simulator",
    "jira",
    "report",
  ].includes(screen);
  return (
    <div className={`app-shell${menuOpen ? " navigation-open" : ""}${activeScreen ? " active-rehearsal" : ""}`}>
      <a className="skip-link" href="#main">
        Skip to workspace
      </a>
      <aside className="sidebar" id="workspace-navigation">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            go("readiness");
          }}
          aria-label="LotZero home"
        >
          <span className="brand-symbol">∅</span>
          <span>
            lotzero<span className="brand-period">.</span>
            <small>RECALL REHEARSAL</small>
          </span>
        </a>
        <div className="workspace-label">
          <span className="workspace-avatar">LZ</span>
          <div>
            Quality operations
            <small>{data.project?.key ?? "Synthetic workspace"}</small>
          </div>
        </div>
        <p className="nav-label">WORKSPACE</p>
        <nav aria-label="Main navigation">
          {navigation.map((item, i) => (
            <button
              key={item.id}
              className={`nav-item ${screen === item.id ? "active" : ""}`}
              aria-current={screen === item.id ? "page" : undefined}
              disabled={globalDisabled || (i > 1 && !result)}
              onClick={() => (item.id === "jira" ? void review() : go(item.id))}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {item.id === "gaps" && result && result.gaps.length > 0 && (
                <span className="nav-count">{result.gaps.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="rail-bottom">
          {localMode && (
            <a className="product-home-link" href={import.meta.env.BASE_URL === "/app/" ? "../" : "https://lotzero-recall.vercel.app/"}>
              <Icon name="arrow" size={15} /> Product website
            </a>
          )}
          <div className="mode-state">
            <span className="status-dot" />
            {localMode ? "BROWSER REHEARSAL" : "FORGE EDITION"}
          </div>
          <p>
            Practice the response.
            <br />
            Protect the evidence.
          </p>
          <span className="version">LOTZERO / 0.1</span>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <button ref={menuRef} className="mobile-navigation-toggle" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="workspace-navigation" onClick={() => setMenuOpen(!menuOpen)}>
            <Icon name={menuOpen ? "close" : "grid"} size={18} />
          </button>
          <div className="breadcrumb">
            Quality operations <span>/</span> LotZero <span>/</span>
            <strong>{navigation.find((n) => n.id === screen)?.label}</strong>
          </div>
          <span className="simulation-label">
            <span className="status-dot" /> SIMULATION ONLY
          </span>
        </header>
        <main id="main" tabIndex={-1}>
          <div className="page-heading">
            <div key={screen} className="screen-title motion-arrival">
              <p className="eyebrow">REHEARSE. TRACE. IMPROVE.</p>
              <h1 ref={headingRef} tabIndex={-1}>
                {navigation.find((n) => n.id === screen)?.label}
              </h1>
              <p className="page-description">{descriptions[screen]}</p>
            </div>
            {screen === "readiness" && data.dataset && (
              <button
                className="primary"
                disabled={globalDisabled}
                onClick={() => go("new")}
              >
                <Icon name="plus" size={18} /> New drill
              </button>
            )}
            {activeScreen && result && (
              <span className="drill-id mono">
                {result.scenario.sourceLotId}
                <span> / {snapshot ? "SAVED" : "UNSAVED"}</span>
              </span>
            )}
          </div>
          {localMode && (
            <div className="environment-note">
              <strong>Local rehearsal</strong>
              <span>
                Data stays in this browser. Jira creation is disabled. This is
                not a deployed Forge installation.
              </span>
            </div>
          )}
          {!localMode && error.includes("mutation lock") && (
            <div className="notice caution">
              <span>
                Project administrators can recover an interrupted invocation
                after five minutes. Jira write claims are retained.
              </span>
              <button
                className="secondary"
                disabled={globalDisabled}
                onClick={() =>
                  void perform("Recovering abandoned lock", async () => {
                    setData(await client.recoverProjectLock());
                    setNotice(
                      "Abandoned lock recovered. Review any uncertain Jira receipts before retrying work.",
                    );
                  })
                }
              >
                Recover abandoned lock (admin)
              </button>
            </div>
          )}
          {error && (
            <div className="notice error" role="alert">
              <Icon name="gap" />
              <div><strong>{error}</strong><p>{recoveryFor(error).message}</p>
                <button className="secondary" disabled={globalDisabled} onClick={() => {
                  const action = recoveryFor(error).action;
                  if (action === 'refresh') void perform("Refreshing saved state", refreshSavedState);
                  else go(action === 'records' ? 'readiness' : result ? 'gaps' : 'readiness');
                }}>{recoveryFor(error).action === 'refresh' ? 'Refresh saved state' : recoveryFor(error).action === 'records' ? 'Review records' : 'Review rehearsal'}</button>
              </div>
              <button aria-label="Dismiss error" onClick={() => setError("")}>
                <Icon name="close" size={16} />
              </button>
            </div>
          )}
          <div role="status" aria-live="polite" aria-atomic="true">
            {busy ? (
              <div
                key={busy}
                className="notice operation-pending motion-arrival"
              >
                <Icon name="clock" />
                <span>{busy}…</span>
                <small className="operation-label">In progress</small>
              </div>
            ) : notice ? (
              <div key={notice} className="notice success motion-arrival">
                <Icon name="check" />
                <span>{notice}</span>
              </div>
            ) : null}
          </div>
          {screen === 'readiness' && <nav className="quick-start" aria-label="Three-step quick start">
            <ol>
              <li aria-current={!result ? 'step' : undefined}><span>01</span><button disabled={globalDisabled || Boolean(data.dataset && !isNorthstarSample(data.dataset))} onClick={() => void runSample()}>{result ? 'Continue current rehearsal' : 'Load Northstar sample recall (synthetic)'}</button></li>
              <li aria-current={result && !snapshot ? 'step' : undefined}><span>02</span><button disabled={globalDisabled || !result} onClick={() => go('gaps')}>Inspect FAIL & UNKNOWN</button></li>
              <li aria-current={snapshot ? 'step' : undefined}><span>03</span><button disabled={globalDisabled || !result} onClick={() => void perform('Saving your rehearsal', async () => {await save(); go('report');})}>Save & review report</button></li>
            </ol>
          </nav>}
          {result && activeScreen && (
            <>
              <nav className="journey-track" aria-label="Rehearsal steps">
                {([
                  ["new", "Define"], ["impact", "Trace"], ["gaps", "Evidence"],
                  ["simulator", "Rehearse"], ["report", "Report"],
                ] as const).map(([id, label], index) => (
                  <button key={id} className={screen === id || (id === "report" && screen === "jira") ? "current" : ""} aria-current={screen === id ? "step" : undefined} disabled={globalDisabled} onClick={() => go(id)}>
                    <span>{String(index + 1).padStart(2, "0")}</span>{label}<Icon name="arrow" size={13} />
                  </button>
                ))}
              </nav>
              <div className="scope-strip" aria-label="Current rehearsal scope">
                <span><span className="scope-label">SOURCE</span><strong>{result.scenario.sourceLotId}</strong></span>
                <span><span className="scope-label">SCENARIO</span>{result.scenario.hazard}</span>
                <span><span className="scope-label">CLOCK / UTC</span>{result.scenario.at.replace("T", " ").replace("Z", "")}</span>
                <span className="scope-saved"><span className="status-dot" />{snapshot ? "Saved rehearsal" : "Unsaved rehearsal"}</span>
              </div>
            </>
          )}
          {screen === "readiness" && (
            <>
              <section className="readiness-intro">
                <div>
                  <p className="eyebrow">
                    THE NEXT RECALL SHOULD BE A REHEARSAL
                  </p>
                  <h2>
                    Find the gaps
                    <br />
                    before they matter.
                  </h2>
                  <p>
                    A lot number is the starting point.
                    <br />A defensible chain of evidence is the outcome.
                  </p>
                  {(!data.dataset || isNorthstarSample(data.dataset)) ? (
                    <div className="readiness-actions">
                      <button className="primary" disabled={globalDisabled} onClick={() => void runSample()}>
                        Run sample rehearsal <Icon name="arrow" size={18} />
                      </button>
                      {!data.dataset && <button className="text-link" disabled={globalDisabled} onClick={() => void seed()}>Load synthetic dataset</button>}
                    </div>
                  ) : (
                    <button
                      className="primary"
                      disabled={globalDisabled}
                      onClick={() => go("new")}
                    >
                      Define a drill <Icon name="arrow" size={18} />
                    </button>
                  )}
                </div>
                <div className="trace-emblem" aria-hidden="true">
                  <span className="emblem-label">ING-A19</span>
                  <div className="emblem-line" />
                  <div className="emblem-branches">
                    <span>TRACE</span>
                    <span>TEST</span>
                    <span>REHEARSE</span>
                  </div>
                  <div className="emblem-foot">ONE LOT. EVERY CONNECTION.</div>
                </div>
              </section>
              <div className="getting-started" aria-label="Your next step">
                <div><span className="eyebrow">YOUR NEXT MOVE</span><strong>{data.dataset ? "Your records are ready. Follow a lot." : "Start with a fictional lot. Learn the workflow."}</strong></div>
                <p>{data.dataset ? "Define → Trace → Inspect evidence → Rehearse → Save" : "The sample follows ING-A19 through production to four shipments. One destination is missing."}</p>
                {latest && <button className="secondary" onClick={() => openSnapshot(latest)}>Continue latest rehearsal <Icon name="arrow" size={16} /></button>}
              </div>
              <div className="metrics-grid">
                <Metric
                  value={data.dataset?.nodes.length ?? "—"}
                  label="Traceability records"
                  note={
                    data.dataset
                      ? `${data.dataset.edges.length} recorded relationships`
                      : "Load data to establish a baseline"
                  }
                />
                <Metric
                  value={
                    latest
                      ? `${passCount} / ${latest.result.assertions.length}`
                      : "—"
                  }
                  label="Assertions passed"
                  note="Latest drill: passing ÷ configured assertions"
                />
                <Metric
                  value={latest?.result.gaps.length ?? "—"}
                  label="Evidence gaps"
                  note="Distinct findings in the latest saved drill"
                />
                <Metric
                  value={data.snapshots.length}
                  label="Saved rehearsals"
                  note="Reproducible snapshots in this workspace"
                />
              </div>
              <section className="panel">
                <SectionHead eyebrow="DRILL LEDGER" title="Recent rehearsals">
                  {data.snapshots.length ? <label className="ledger-search"><Icon name="search" size={15} /><span className="sr-only">Search saved rehearsals</span><input type="search" value={ledgerQuery} placeholder="Find a lot or scenario…" onChange={(event) => setLedgerQuery(event.target.value)} /></label> : <span className="subtle-label">No saved rehearsals yet</span>}
                </SectionHead>
                {data.snapshots.length ? (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Source & scenario</th>
                          <th>Dataset</th>
                          <th>Recorded impact</th>
                          <th>Assertions</th>
                          <th>Saved</th>
                          <th>
                            <span className="sr-only">Open</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleSnapshots.map((s) => (
                          <tr key={s.id}>
                            <td>
                              <strong className="mono">
                                {s.result.scenario.sourceLotId}
                              </strong>
                              <span className="cell-detail">
                                {s.result.scenario.hazard}
                              </span>
                            </td>
                            <td className="mono">{s.dataset.version}</td>
                            <td>
                              {s.result.affectedProductIds.length} product lots
                              · {s.result.affectedShipmentIds.length} shipments
                            </td>
                            <td>
                              {
                                s.result.assertions.filter(
                                  (a) => a.status === "PASS",
                                ).length
                              }{" "}
                              / {s.result.assertions.length} pass
                            </td>
                            <td>
                              {new Date(s.createdAt).toLocaleDateString(
                                "en-GB",
                              )}
                            </td>
                            <td>
                              <button
                                className="text-link"
                                onClick={() => openSnapshot(s)}
                              >
                                Open <Icon name="arrow" size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="ledger-empty">
                    <span className="ledger-index" aria-hidden="true">
                      01
                    </span>
                    <div>
                      <h3>Your first rehearsal starts with a single lot.</h3>
                      <p>
                        {data.dataset
                          ? "The synthetic dataset is loaded. Start a drill to reveal what the records can prove."
                          : "Load the built-in synthetic manufacturing records, or import your own rehearsal dataset."}
                      </p>
                    </div>
                    {data.dataset && (
                      <button className="secondary" onClick={() => go("new")}>
                        Start a drill <Icon name="arrow" size={16} />
                      </button>
                    )}
                  </div>
                )}
                {data.snapshots.length > 0 && visibleSnapshots.length === 0 && <div className="ledger-no-results"><p>No rehearsals match “{ledgerQuery}”.</p><button className="text-link" onClick={() => setLedgerQuery("")}>Clear search</button></div>}
              </section>
              <section className="panel dataset-panel">
                <SectionHead
                  eyebrow="DATA & PROVENANCE"
                  title={data.dataset?.name ?? "No dataset loaded"}
                >
                  <Badge
                    value={
                      data.dataset?.synthetic
                        ? "Synthetic"
                        : data.dataset
                          ? "Imported"
                          : "Empty"
                    }
                  />
                </SectionHead>
                <div className="dataset-meta">
                  <p>
                    {data.dataset ? (
                      <>
                        Version <code>{data.dataset.version}</code> ·{" "}
                        {data.dataset.evidence.length} documentary references.
                        Imports are validated before use.
                      </>
                    ) : (
                      "Use fully fictional manufacturing records for a safe, repeatable rehearsal."
                    )}
                  </p>
                  <div className="button-row">
                    <button
                      className="secondary"
                      disabled={globalDisabled || Boolean(data.dataset)}
                      onClick={() => void seed()}
                    >
                      Load synthetic dataset
                    </button>
                    <button
                      className="secondary"
                      disabled={globalDisabled}
                      onClick={() => inputRef.current?.click()}
                    >
                      Import JSON / CSV
                    </button>
                    <input
                      ref={inputRef}
                      className="sr-only"
                      type="file"
                      accept=".json,.csv"
                      aria-label="Import traceability dataset"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void importFile(f);
                        e.target.value = "";
                      }}
                    />
                    {data.dataset && (
                      <button
                        className="text-link"
                        disabled={globalDisabled}
                        onClick={() =>
                          void perform(
                            "Loading corrected synthetic records",
                            async () => {
                              setData(
                                await client.importDataset(repairedDataset),
                              );
                              clearActive();
                              setNotice(
                                "Corrected synthetic dataset loaded. Rerun ING-A19 and compare your saved reports.",
                              );
                            },
                          )
                        }
                      >
                        Load corrected fixture
                      </button>
                    )}
                  </div>
                </div>
                <details className="import-help">
                  <summary>Import format & limits</summary>
                  <p>
                    JSON follows the LotZero dataset schema. CSV uses two
                    columns, <code>record_type,json</code>, with metadata, node,
                    edge or evidence rows and RFC4180 quoting. Limit: 200 KB.
                    Imported strings are treated as data; missing links remain
                    explicit findings.
                  </p>
                </details>
              </section>
              <details className="audit-panel">
                <summary>Activity & data controls</summary>
                <ul>
                  {data.audit.slice(0, 10).map((a, i) => (
                    <li key={`${a.at}-${i}`}>
                      <time>{new Date(a.at).toLocaleString("en-GB")}</time>
                      <span>{a.event}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className="danger-text"
                  onClick={() => setShowReset(true)}
                >
                  Delete LotZero workspace data
                </button>
              </details>
            </>
          )}
          {screen === "new" &&
            (data.dataset ? (
              <NewDrill
                dataset={data.dataset}
                onRun={run}
                disabled={globalDisabled}
              />
            ) : (
              <Empty
                title="Start with traceability records"
                action={
                  <button className="primary" onClick={() => void seed()}>
                    Load synthetic dataset
                  </button>
                }
              >
                Load a dataset before defining a recall rehearsal.
              </Empty>
            ))}
          {screen === "impact" && result && activeDataset && (
            <>
              {currentSnapshot && <RunSummary snapshot={currentSnapshot} onInspect={() => go('gaps')} disabled={globalDisabled} onSave={() => void perform('Saving your rehearsal', async () => {await save(); go('report');})}/>}
              <OutcomeBar result={result} />
              <Impact
                key={result.fingerprint}
                dataset={activeDataset}
                result={result}
              />
              <div className="workflow-footer">
                <span>
                  Missing records never establish an unaffected status.
                </span>
                <button className="primary" onClick={() => go("gaps")}>
                  Inspect evidence gaps <Icon name="arrow" size={16} />
                </button>
              </div>
            </>
          )}
          {screen === "gaps" && result && (
            <>
              {currentSnapshot && <RunSummary snapshot={currentSnapshot}/>}
              <div className="section-intro">
                <span className="step-number" aria-hidden="true">
                  02
                </span>
                <p>
                  <strong>Unknown is a finding.</strong> Each assertion includes
                  its test population. Missing or ambiguous records require
                  investigation.
                </p>
              </div>
              <section className="assertion-list">
                {result.assertions.map((a) => (
                  <article className="panel assertion" key={a.id}>
                    <div className="assertion-head">
                      <Badge value={a.status} />
                      <div>
                        <h2>{a.title}</h2>
                        <p>
                          {a.passed} of {a.checked} checked records satisfy this
                          assertion
                        </p>
                      </div>
                    </div>
                    {a.counterexamples.length > 0 && (
                      <ul className="counterexamples">
                        {a.counterexamples.map((g, i) => (
                          <li key={`${g.id}-${i}`}>
                            <strong>{g.message}</strong>
                            <span className="mono">
                              {g.recordIds.join(" · ")}
                            </span>
                            <small>
                              Evidence:{" "}
                              {g.evidence.join(", ") || "Not recorded"}
                            </small>
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                ))}
              </section>
              <section className="panel">
                <SectionHead
                  eyebrow="VALIDATION & LINEAGE"
                  title={`${result.gaps.length} evidence gaps`}
                />
                <GapTable result={result} />
              </section>
              <div className="workflow-footer">
                <span>Findings are preserved in every saved report.</span>
                <button className="primary" onClick={() => go("simulator")}>
                  Rehearse a response <Icon name="arrow" size={16} />
                </button>
              </div>
            </>
          )}
          {screen === "simulator" && result && activeDataset && (
            <Simulator
              dataset={activeDataset}
              result={result}
              onUpdate={(interventions) => {
                try {
                  setResult(
                    runDrill(activeDataset, result.scenario, interventions),
                  );
                  setSnapshot(null);
                  setActions([]);
                  setNotice(
                    "Simulated controls updated. No operational records were changed.",
                  );
                } catch (e) {
                  setError(message(e));
                }
              }}
              onReview={() => void review()}
              busy={globalDisabled}
            />
          )}
          {screen === "jira" && result && (
            <JiraReview
              actions={actions}
              snapshot={snapshot}
              defaultProjectKey={data.project?.key}
              disabled={globalDisabled}
              onCreate={(payload) =>
                perform(payload.receiptsOnly ? "Checking saved Jira receipt" : "Creating approved Jira issues", async () => {
                  const receipts = await client.createActions(payload);
                  setActions((prior) =>
                    prior.map((a) => receipts.find((r) => r.id === a.id) ?? a),
                  );
                  const refreshed = await client.bootstrap();
                  setData(refreshed);
                  const updated = refreshed.snapshots.find(
                    (s) => s.id === payload.snapshotId,
                  );
                  if (updated) setSnapshot(updated);
                  setNotice(
                    payload.receiptsOnly
                      ? `Saved receipt verified for ${receipts.map((a) => a.issueKey).join(", ")}. No new issue was requested.`
                      : `${receipts.filter((a) => a.status === "created").length} Jira issue receipts recorded. Review any failed or uncertain actions below.`,
                  );
                })
              }
              onReconcile={(actionId, issueKey) =>
                perform("Reconciling Jira outcome", async () => {
                  if (!snapshot) throw new Error("Save a snapshot first.");
                  const receipt = await client.reconcileAction({
                    snapshotId: snapshot.id,
                    actionId,
                    issueKey,
                  });
                  setActions((prior) =>
                    prior.map((a) => (a.id === receipt.id ? receipt : a)),
                  );
                  const refreshed = await client.bootstrap();
                  setData(refreshed);
                  setSnapshot(
                    refreshed.snapshots.find((s) => s.id === snapshot.id) ??
                      snapshot,
                  );
                  setNotice(
                    "Existing Jira issue verified and its receipt recovered.",
                  );
                })
              }
              onReport={() => go("report")}
            />
          )}
          {screen === "report" && currentSnapshot && (
            <Report
              snapshot={currentSnapshot}
              projectKey={data.project?.key}
              snapshots={data.snapshots}
              saved={Boolean(snapshot)}
              onSave={() =>
                void perform("Saving reproducible snapshot", async () => {
                  await save();
                })
              }
              onReview={() => void review()}
              disabled={globalDisabled}
            />
          )}
          <footer className="workspace-footer">
            <span>LotZero · Rehearse the recall.</span>
            <span>Simulation only. Not for directing a real recall.</span>
          </footer>
        </main>
      </div>
      {showReset && (
        <ResetDialog onClose={() => setShowReset(false)}>
          <h2 id="reset-title">Delete LotZero workspace data?</h2>
          <p>
            This removes stored datasets, snapshots and local audit history.
            Existing Jira issues are not deleted. Export reports first.
          </p>
          <label>
            Type DELETE to confirm
            <input
              autoFocus
              value={resetText}
              onChange={(e) => setResetText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setShowReset(false);
              }}
            />
          </label>
          <div className="button-row">
            <button
              onClick={() => {
                setShowReset(false);
                setResetText("");
              }}
            >
              Cancel
            </button>
            <button
              className="danger"
              disabled={resetText !== "DELETE" || globalDisabled}
              onClick={() =>
                void perform("Deleting workspace data", async () => {
                  setData(await client.deleteData());
                  clearActive();
                  setShowReset(false);
                  setResetText("");
                  go("readiness");
                  setNotice("LotZero workspace data deleted.");
                })
              }
            >
              Delete data
            </button>
          </div>
        </ResetDialog>
      )}
    </div>
  );
}
function message(error: unknown) {
  return error instanceof Error
    ? error.message
    : "The operation could not be completed. Try again or check installation access.";
}
function OutcomeBar({ result }: { result: DrillResult }) {
  return (
    <div className="outcome-bar">
      <div>
        <span className="mono">{result.scenario.sourceLotId}</span>
        <small>Initiating ingredient</small>
      </div>
      <Icon name="arrow" size={18} />
      <div>
        <strong>{result.affectedProductIds.length}</strong>
        <small>Associated product lots</small>
      </div>
      <div>
        <strong>{result.affectedShipmentIds.length}</strong>
        <small>Associated shipments</small>
      </div>
      <div>
        <strong>{result.gaps.length}</strong>
        <small>Evidence gaps</small>
      </div>
      <div>
        <strong>{result.unknownRecordIds.length}</strong>
        <small>Unresolved records</small>
      </div>
    </div>
  );
}
function NewDrill({
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
            Run recall rehearsal <Icon name="arrow" size={18} />
          </button>
        </div>
      </form>
      <aside className="scenario-note">
        <span className="step-number" aria-hidden="true">
          01
        </span>
        <h2>
          Test the chain.
          <br />
          Keep the unknowns.
        </h2>
        <p>
          This rehearsal follows records, not assumptions. An association may be
          confirmed, potential or unknown.
        </p>
        <ul>
          <li>No shipment is held.</li>
          <li>No customer is contacted.</li>
          <li>No safety determination is made.</li>
        </ul>
        <div className="dataset-stamp">
          <span className="eyebrow">DATASET UNDER TEST</span>
          <strong>{dataset.name}</strong>
          <code>{dataset.version}</code>
          <Badge value={dataset.synthetic ? "Synthetic" : "Imported"} />
        </div>
      </aside>
    </div>
  );
}
function GapTable({ result }: { result: DrillResult }) {
  return result.gaps.length ? (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Finding</th>
            <th>Records</th>
            <th>Supporting evidence</th>
          </tr>
        </thead>
        <tbody>
          {result.gaps.map((g, i) => (
            <tr key={`${g.id}-${i}`}>
              <td>
                <span className="finding-code">
                  {g.code.replaceAll("_", " ")}
                </span>
                <span className="cell-detail">{g.message}</span>
              </td>
              <td className="mono">
                {g.recordIds.join(", ") || "Dataset-wide"}
              </td>
              <td className="mono">
                {g.evidence.join(", ") || "Not recorded"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <p className="panel-padding">
      No validation gaps detected in these records. This does not establish
      product safety.
    </p>
  );
}
function Simulator({
  dataset,
  result,
  onUpdate,
  onReview,
  busy,
}: {
  dataset: Dataset;
  result: DrillResult;
  onUpdate: (i: Intervention[]) => void;
  onReview: () => void;
  busy: boolean;
}) {
  const [type, setType] = useState<Intervention["type"]>("quarantine");
  const [target, setTarget] = useState("");
  const [at, setAt] = useState(result.scenario.at.slice(0, 16));
  const [evidence, setEvidence] = useState("");
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
      <div className="notice caution">
        <Icon name="control" />
        <span>
          <strong>Simulation only.</strong> Controls do not alter historical
          exposure or perform warehouse operations.
        </span>
      </div>
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
          Save & review Jira actions <Icon name="arrow" size={16} />
        </button>
      </div>
    </>
  );
}
function JiraReview({
  actions,
  snapshot,
  defaultProjectKey,
  disabled,
  onCreate,
  onReconcile,
  onReport,
}: {
  actions: JiraAction[];
  snapshot: Snapshot | null;
  defaultProjectKey?: string;
  disabled: boolean;
  onCreate: (p: {
    snapshotId: string;
    projectKey: string;
    issueTypeId: string;
    actionIds: string[];
    approved: true;
    receiptsOnly?: true;
  }) => Promise<void>;
  onReconcile: (actionId: string, issueKey: string) => Promise<void>;
  onReport: () => void;
}) {
  const [reconcileKeys, setReconcileKeys] = useState<Record<string, string>>(
    {},
  );
  const [projects, setProjects] = useState<Project[]>([]);
  const [project, setProject] = useState("");
  const [types, setTypes] = useState<{ id: string; name: string }[]>([]);
  const [issueType, setIssueType] = useState("");
  const [chosen, setChosen] = useState<string[]>([]);
  const [approved, setApproved] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    setChosen([]);
    setApproved(false);
  }, [actions]);
  useEffect(() => {
    let current = true;
    client
      .listProjects()
      .then((p) => {
        if (current) {
          setProjects(p);
          setProject(p.some((item) => item.key === defaultProjectKey) ? defaultProjectKey! : "");
        }
      })
      .catch((e) => setError(message(e)));
    return () => {
      current = false;
    };
  }, [defaultProjectKey]);
  useEffect(() => {
    if (!project) return;
    let current = true;
    setTypes([]);
    setIssueType("");
    setApproved(false);
    client
      .issueTypes(project)
      .then((t) => {
        if (current) {
          setTypes(t);
          setIssueType(t[0]?.id ?? "");
        }
      })
      .catch((e) => setError(message(e)));
    return () => {
      current = false;
    };
  }, [project]);
  return (
    <>
      {localMode && (
        <div className="notice caution">
          <Icon name="jira" />
          <span>
            <strong>Preview available; Jira writes disabled.</strong> This
            browser rehearsal has no Jira connection. A Forge installation is
            required to create real issues.
          </span>
        </div>
      )}
      {error && (
        <div className="notice error" role="alert">
          {error}
        </div>
      )}
      <div className="jira-layout">
        <section className="action-list">
          {actions.map((a) => (
            <article className="panel action-card" key={a.id}>
              <div className="action-title">
                <input
                  type="checkbox"
                  aria-label={`Select ${a.summary}`}
                  checked={chosen.includes(a.id)}
                  disabled={
                    Boolean(a.issueKey) ||
                    a.status === "uncertain" ||
                    disabled ||
                    (!chosen.includes(a.id) && chosen.length >= 5)
                  }
                  onChange={(e) => {
                    setChosen(
                      e.target.checked
                        ? [...chosen, a.id]
                        : chosen.filter((id) => id !== a.id),
                    );
                    setApproved(false);
                  }}
                />
                <div>
                  <h2>{a.summary}</h2>
                  <p className="mono">{a.recordIds.join(" · ")}</p>
                </div>
                <Badge value={a.status ?? "Suggested"} />
              </div>
              <details>
                <summary>Preview issue description & evidence</summary>
                <pre className="issue-description">{a.description}</pre>
              </details>
              {a.issueKey && (
                <p className="issue-receipt">
                  <Icon name="check" size={16} />
                  {a.issueUrl?.startsWith("https://") ? (
                    <JiraIssueLink href={a.issueUrl}>
                      {a.issueKey} ↗
                    </JiraIssueLink>
                  ) : (
                    a.issueKey
                  )}
                  <span>Creation receipt recorded</span>
                  {!localMode && a.status === "created" && (
                    <button
                      className="secondary"
                      disabled={disabled || !snapshot || !issueType || project !== a.issueKey.split("-")[0]}
                      onClick={() => {
                        if (snapshot) void onCreate({
                          snapshotId: snapshot.id,
                          projectKey: project,
                          issueTypeId: issueType,
                          actionIds: [a.id],
                          approved: true,
                          receiptsOnly: true,
                        });
                      }}
                    >
                      Check saved receipt for {a.issueKey}
                    </button>
                  )}
                </p>
              )}
              {a.error && <div className="inline-error">{a.error}</div>}
              {a.status === "uncertain" && (
                <div className="inline-error">
                  <p>
                    Outcome needs reconciliation. A project administrator can
                    attach the existing Jira issue after its approval marker is
                    verified.
                  </p>
                  {!localMode && (
                    <div className="reconcile-controls">
                      <label>
                        Existing Jira key
                        <input
                          value={reconcileKeys[a.id] ?? ""}
                          onChange={(e) =>
                            setReconcileKeys({
                              ...reconcileKeys,
                              [a.id]: e.target.value.toUpperCase(),
                            })
                          }
                          placeholder="LZ-123"
                        />
                      </label>
                      <button
                        className="secondary"
                        disabled={disabled || !reconcileKeys[a.id]}
                        onClick={() =>
                          void onReconcile(a.id, reconcileKeys[a.id])
                        }
                      >
                        Verify existing issue
                      </button>
                    </div>
                  )}
                </div>
              )}
            </article>
          ))}
          {!actions.length && (
            <Empty title="No proposed actions">
              No remediation suggestions are available for this saved drill.
            </Empty>
          )}
        </section>
        <aside className="panel approval-panel">
          <p className="eyebrow">HUMAN APPROVAL</p>
          <h2>Confirm the work</h2>
          <p>
            Only the selected simulated-drill tasks will be created. No recall
            action is executed.
          </p>
          <label>
            Jira project
            <select
              disabled={localMode || disabled || !projects.length}
              value={project}
              onChange={(e) => setProject(e.target.value)}
            >
              {!projects.length && (
                <option value="">
                  {localMode
                    ? "Unavailable in local mode"
                    : "No permitted projects found"}
                </option>
              )}
              {projects.length > 0 && <option value="">Choose a permitted project</option>}
              {projects.map((p) => (
                <option key={p.id} value={p.key}>
                  {p.key} — {p.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Issue type
            <select
              disabled={localMode || disabled || !types.length}
              value={issueType}
              onChange={(e) => {
                setIssueType(e.target.value);
                setApproved(false);
              }}
            >
              {!types.length && (
                <option value="">Select a permitted project</option>
              )}
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <div className="approval-count">
            <strong>{chosen.length}</strong>
            <span>selected tasks · maximum 5 per approval</span>
          </div>
          <label className="checkbox-label approval-checkbox">
            <input
              type="checkbox"
              checked={approved}
              disabled={localMode || disabled}
              onChange={(e) => setApproved(e.target.checked)}
            />
            <span>
              I approve creation of these simulated-drill tasks in the selected
              Jira project.
            </span>
          </label>
          <button
            className="primary wide"
            disabled={
              localMode ||
              disabled ||
              !approved ||
              !chosen.length ||
              !project ||
              !issueType ||
              !snapshot
            }
            onClick={() => {
              if (snapshot)
                void onCreate({
                  snapshotId: snapshot.id,
                  projectKey: project,
                  issueTypeId: issueType,
                  actionIds: chosen,
                  approved: true,
                });
            }}
          >
            Create {chosen.length} Jira issues <Icon name="arrow" size={16} />
          </button>
          <p className="field-help">
            Retries use saved action identifiers. Unknown write outcomes stop
            for investigation.
          </p>
        </aside>
      </div>
      <div className="workflow-footer">
        <span>{snapshot?.id}</span>
        <button className="secondary" onClick={onReport}>
          Open drill report <Icon name="arrow" size={16} />
        </button>
      </div>
    </>
  );
}
function Report({
  snapshot,
  projectKey,
  snapshots,
  saved,
  onSave,
  onReview,
  disabled,
}: {
  snapshot: Snapshot;
  projectKey?: string;
  snapshots: Snapshot[];
  saved: boolean;
  onSave: () => void;
  onReview: () => void;
  disabled: boolean;
}) {
  const [previous, setPrevious] = useState("");
  const [exportFormat, setExportFormat] = useState<"json" | "md" | "csv">("json");
  const [copyNotice, setCopyNotice] = useState("");
  const compatible = snapshots.filter(
    (s) =>
      s.id !== snapshot.id &&
      s.result.scenario.sourceLotId === snapshot.result.scenario.sourceLotId &&
      s.result.scenario.hazard === snapshot.result.scenario.hazard &&
      s.result.scenario.at === snapshot.result.scenario.at &&
      [...s.result.scenario.assertions].sort().join() ===
        [...snapshot.result.scenario.assertions].sort().join(),
  );
  const before = compatible.find((s) => s.id === previous);
  const comparison = before
    ? compareDrills(before.result, snapshot.result)
    : null;
  const jsonReport = JSON.stringify(
    before && comparison
      ? { ...snapshot, comparison: { baselineSnapshot: before, result: comparison } }
      : snapshot,
    null,
    2,
  );
  const exportContent = exportFormat === "json" ? jsonReport
    : exportFormat === "md" ? reportMarkdown(snapshot, before)
    : reportCsv(snapshot, before);
  return (
    <>
      {!saved && (
        <div className="notice caution">
          <Icon name="report" />
          <span>
            This is an unsaved preview. Save the snapshot before exporting a
            reproducible report.
          </span>
          <button className="secondary" onClick={onSave} disabled={disabled}>
            Save snapshot
          </button>
        </div>
      )}
      <RunSummary snapshot={snapshot}/>
      <section className="panel report-cover">
        <div className="report-title">
          <div>
            <p className="eyebrow">RECALL REHEARSAL / EVIDENCE REPORT</p>
            <h2>
              {snapshot.result.scenario.sourceLotId}
              <span>{snapshot.result.scenario.hazard} scenario</span>
            </h2>
            <p className="mono report-snapshot-id">{snapshot.id}</p>
          </div>
          <div className="report-mark" aria-hidden="true">
            ∅
          </div>
        </div>
        <div className="report-meta">
          <div>
            <span>Dataset</span>
            <strong>{snapshot.dataset.version}</strong>
          </div>
          <div>
            <span>Effective time</span>
            <strong>{snapshot.result.scenario.at}</strong>
          </div>
          <div>
            <span>Saved by</span>
            <strong>{snapshot.initiator}</strong>
          </div>
          <div>
            <span>Fingerprint</span>
            <code>{snapshot.result.fingerprint}</code>
          </div>
        </div>
        <div className="report-export">
          <span>
            <Icon name="report" />{" "}
            {saved
              ? "Snapshot saved with full source dataset"
              : "Save required for export"}
          </span>
          <div className="button-row">
            <button
              className="secondary"
              disabled={!saved}
              onClick={() =>
                download(
                  `lotzero-${snapshot.id}.md`,
                  reportMarkdown(snapshot, before),
                  "text/markdown;charset=utf-8",
                )
              }
            >
              <Icon name="download" size={16} /> Markdown
            </button>
            <button
              className="secondary"
              disabled={!saved}
              onClick={() =>
                download(
                  `lotzero-${snapshot.id}.json`,
                  jsonReport,
                  "application/json",
                )
              }
            >
              <Icon name="download" size={16} /> JSON
            </button>
            <button
              className="secondary"
              disabled={!saved}
              onClick={() =>
                download(
                  `lotzero-${snapshot.id}.csv`,
                  reportCsv(snapshot, before),
                  "text/csv;charset=utf-8",
                )
              }
            >
              <Icon name="download" size={16} /> CSV
            </button>
          </div>
        </div>
        {saved && (
          <details className="export-preview">
            <summary>View or copy export</summary>
            <p>If your browser blocks downloads, copy the report text and save it as a file.</p>
            <label>
              Export format
              <select value={exportFormat} onChange={(e) => {
                setExportFormat(e.target.value as "json" | "md" | "csv");
                setCopyNotice("");
              }}>
                <option value="json">JSON</option>
                <option value="md">Markdown</option>
                <option value="csv">CSV</option>
              </select>
            </label>
            <label>
              Report export contents
              <textarea readOnly value={exportContent} rows={10} spellCheck={false} />
            </label>
            <button className="secondary" onClick={async () => {
              try {
                await navigator.clipboard.writeText(exportContent);
                setCopyNotice("Report copied to clipboard.");
              } catch {
                setCopyNotice("Clipboard access is unavailable. Select the report text and copy it with your keyboard.");
              }
            }}>Copy export</button>
            <p role="status">{copyNotice}</p>
          </details>
        )}
      </section>
      <AnalystHandoff snapshot={snapshot} projectKey={projectKey} saved={saved} local={localMode} />
      <OutcomeBar result={snapshot.result} />
      <div className="report-grid">
        <section className="panel">
          <SectionHead
            eyebrow="EXECUTABLE READINESS TESTS"
            title="Assertion results"
          />
          <ul className="report-assertions">
            {snapshot.result.assertions.map((a) => (
              <li key={a.id}>
                <Badge value={a.status} />
                <span>
                  {a.title}
                  <small>
                    {a.passed} / {a.checked} checked records satisfy the
                    assertion
                  </small>
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section className="panel">
          <SectionHead
            eyebrow="RECORDED QUANTITIES"
            title="Unique shipment totals"
          />
          <div className="quantity-list">
            {snapshot.result.quantities.map((q) => (
              <div key={q.unit}>
                <strong>
                  {q.value.toLocaleString("en-GB", {
                    maximumFractionDigits: 3,
                  })}{" "}
                  <span>{q.unit}</span>
                </strong>
                <p>{q.recordIds.length} unique shipment records</p>
                <code>{q.recordIds.join(" · ")}</code>
              </div>
            ))}
          </div>
          <p className="panel-padding field-help">
            Totals group compatible units. They describe recorded shipment
            quantities, not contaminated mass. Missing quantities stay unknown.
          </p>
        </section>
      </div>
      <section className="panel">
        <SectionHead
          eyebrow="REGRESSION CHECK"
          title="Compare with a previous rehearsal"
        />
        <div className="form-content">
          <label>
            Baseline snapshot
            <select
              value={previous}
              onChange={(e) => setPrevious(e.target.value)}
            >
              <option value="">
                Choose a saved drill for the same source and hazard
              </option>
              {compatible.map((s) => (
                <option value={s.id} key={s.id}>
                  {s.dataset.version} · {s.id}
                </option>
              ))}
            </select>
          </label>
          {comparison ? (
            <div className="comparison-summary">
              <ComparisonList
                title="Improved assertions"
                values={comparison.improved}
              />
              <ComparisonList
                title="Regressed assertions"
                values={comparison.regressed}
              />
              <ComparisonList
                title="Unchanged assertions"
                values={comparison.unchanged}
              />
              <ComparisonList
                title="New shipment associations"
                values={comparison.addedShipments}
              />
              <ComparisonList
                title="Removed shipment associations"
                values={comparison.removedShipments}
              />
            </div>
          ) : (
            <p className="field-help">
              Save a baseline, load corrected records, rerun the same scenario
              and compare. A removed association alone does not prove reduced
              risk.
            </p>
          )}
        </div>
      </section>
      <section className="panel">
        <SectionHead
          eyebrow="CONTROL & ACTION RECEIPTS"
          title="Decisions preserved"
        />
        <div className="decision-summary">
          <div>
            <strong>{snapshot.result.interventions.length}</strong>
            <span>simulated interventions</span>
          </div>
          <div>
            <strong>
              {snapshot.result.simulation.historicalShipmentIds.length}
            </strong>
            <span>historical shipments retained</span>
          </div>
          <div>
            <strong>{snapshot.actions.filter((a) => a.issueKey).length}</strong>
            <span>real Jira issue receipts</span>
          </div>
        </div>
        {snapshot.actions
          .filter((a) => a.issueKey)
          .map((a) => (
            <p className="panel-padding" key={a.id}>
              {a.issueUrl?.startsWith("https://") ? (
                <JiraIssueLink href={a.issueUrl}>{a.issueKey}</JiraIssueLink>
              ) : (
                a.issueKey
              )}{" "}
              — {a.summary}
            </p>
          ))}
      </section>
      <section className="limitations">
        <Icon name="gap" />
        <div>
          <h2>Read this report within its limits</h2>
          <p>
            This is an evidence-backed simulation, not a real recall, product
            safety assessment or regulatory certification. Missing records
            remain unknown. Historical shipments remain part of the impact.
            Controls are hypothetical. The fingerprint identifies deterministic
            content; it is not a digital signature.
          </p>
        </div>
      </section>
      <div className="workflow-footer">
        <span>
          {snapshot.dataset.synthetic
            ? "All source records are synthetic."
            : "Imported records require owner validation."}
        </span>
        <button className="primary" disabled={disabled} onClick={onReview}>
          Review Jira follow-up <Icon name="arrow" size={16} />
        </button>
      </div>
    </>
  );
}
function ComparisonList({
  title,
  values,
}: {
  title: string;
  values: string[];
}) {
  return (
    <div>
      <h3>{title}</h3>
      {values.length ? (
        <ul>
          {values.map((v) => (
            <li key={v}>{v}</li>
          ))}
        </ul>
      ) : (
        <p className="muted">None</p>
      )}
    </div>
  );
}

function ResetDialog({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
    return () => ref.current?.close();
  }, []);
  return (
    <dialog
      className="modal"
      ref={ref}
      aria-labelledby="reset-title"
      onCancel={onClose}
    >
      {children}
    </dialog>
  );
}
