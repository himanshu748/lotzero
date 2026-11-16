import { useEffect, useRef, useState } from "react";
import type {
  AssertionId,
  Bootstrap,
  Dataset,
  DrillResult,
  Intervention,
  JiraAction,
  Scenario,
  Snapshot,
} from "../../../../src/contracts";
import { DEFAULT_ASSERTIONS } from "../../../../src/contracts";
import {
  runDrill,
  importCsv,
  validateDataset,
} from "../../../../src/graph/engine";
import {
  firstFinding,
  findingRecord,
} from "../../../../src/scenarios/first-finding";
import { client, localMode } from "../client";
import type { EvidenceViewState } from "../components/Impact";

export type Screen = "home" | "new" | "rehearsal" | "rehearse" | "follow-up";
const sampleScenario: Scenario = {
  sourceLotId: "ING-A19",
  hazard: "contamination",
  at: "2026-10-28T09:00:00.000Z",
  assertions: DEFAULT_ASSERTIONS,
};
export function useRehearsal() {
  const [data, setData] = useState<Bootstrap>({
    dataset: null,
    snapshots: [],
    audit: [],
    mode: localMode ? "local" : "forge",
  });
  const [screen, setScreen] = useState<Screen>("home");
  const [busy, setBusy] = useState("Loading records");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [active, setActive] = useState<{
    dataset: Dataset;
    result: DrillResult;
    snapshot: Snapshot | null;
    actions: JiraAction[];
  } | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<AssertionId | null>(
    null,
  );
  const [selectionRequest, setSelectionRequest] = useState({
    recordId: null as string | null,
    key: 0,
  });
  const [focusKey, setFocusKey] = useState(0);
  const [confirmation, setConfirmation] = useState<{
    message: string;
    accept: () => void;
  } | null>(null);
  const working = useRef(false);
  const saveRequests = useRef(new WeakMap<DrillResult, string>());
  const evidenceView = useRef<EvidenceViewState | undefined>(undefined);
  useEffect(() => {
    let current = true;
    void client
      .bootstrap()
      .then((next) => {
        if (current) setData(next);
      })
      .catch((e) => {
        if (current) setError(message(e));
      })
      .finally(() => {
        if (current) setBusy("");
      });
    return () => {
      current = false;
    };
  }, []);
  function go(next: Screen) {
    setScreen(next);
    setError("");
    setNotice("");
  }
  async function perform<T>(
    label: string,
    work: () => Promise<T>,
  ): Promise<T | undefined> {
    if (working.current) return;
    working.current = true;
    setBusy(label);
    setError("");
    setNotice("");
    try {
      return await work();
    } catch (e) {
      setError(message(e));
    } finally {
      working.current = false;
      setBusy("");
    }
  }
  function installCase(
    dataset: Dataset,
    result: DrillResult,
    snapshot: Snapshot | null = null,
  ) {
    const selected = firstFinding(result, dataset);
    setActive({ dataset, result, snapshot, actions: snapshot?.actions ?? [] });
    setSelectedFinding(selected.assertionId);
    evidenceView.current = {
      selected: selected.recordId ?? "",
      pathTarget: selected.recordId ?? "",
      mode: "path",
      direction: "forward",
    };
    setSelectionRequest((previous) => ({
      recordId: selected.recordId,
      key: previous.key + 1,
    }));
    setFocusKey((previous) => previous + 1);
    go("rehearsal");
  }
  function replace(message: string, work: () => void) {
    setConfirmation({
      message,
      accept: () => {
        setConfirmation(null);
        work();
      },
    });
  }
  function run(scenario: Scenario) {
    const action = () => {
      try {
        if (!data.dataset) throw new Error("Load records first.");
        installCase(data.dataset, runDrill(data.dataset, scenario));
      } catch (e) {
        setError(message(e));
      }
    };
    if (active && !active.snapshot)
      replace("Replace the unsaved rehearsal? Saved reports are kept.", action);
    else action();
  }
  function sample() {
    void perform("Loading Northstar sample", async () => {
      const next = await client.seed();
      if (!next.dataset) throw new Error("The sample could not be loaded.");
      setData(next);
      installCase(next.dataset, runDrill(next.dataset, sampleScenario));
    });
  }
  function open(snapshot: Snapshot) {
    const work = () => installCase(snapshot.dataset, snapshot.result, snapshot);
    if (active && !active.snapshot)
      replace(
        "Open this saved report and replace the unsaved rehearsal?",
        work,
      );
    else work();
  }
  function selectFinding(id: AssertionId, counterexampleId?: string) {
    if (!active) return;
    const assertion = active.result.assertions.find((item) => item.id === id);
    if (!assertion) return;
    const requested = counterexampleId && assertion.counterexamples.some(g => g.recordIds.includes(counterexampleId))
      && active.dataset.nodes.some(n => n.id === counterexampleId) ? counterexampleId : null;
    const recordId = requested ?? (
      assertion.status === "PASS"
        ? active.result.scenario.sourceLotId
        : findingRecord(assertion, active.result, active.dataset));
    setSelectedFinding(id);
    setSelectionRequest((previous) => ({ recordId, key: previous.key + 1 }));
    go("rehearsal");
  }
  function update(interventions: Intervention[]) {
    if (!active) return;
    try {
      setActive({
        ...active,
        result: runDrill(active.dataset, active.result.scenario, interventions),
        snapshot: null,
        actions: [],
      });
      setNotice("Simulated control added. No shipment was changed.");
    } catch (e) {
      setError(message(e));
    }
  }
  async function save(): Promise<Snapshot> {
    if (!active) throw new Error("Run a rehearsal first.");
    if (active.snapshot) return active.snapshot;
    let requestId = saveRequests.current.get(active.result);
    if (!requestId) {
      requestId = crypto.randomUUID();
      saveRequests.current.set(active.result, requestId);
    }
    const saved = await client.saveDrill(
      active.result.scenario,
      active.result.interventions,
      active.result.fingerprint,
      requestId,
    );
    setActive({ ...active, snapshot: saved, actions: saved.actions });
    setData(await client.bootstrap());
    return saved;
  }
  function followUp() {
    void perform(active?.snapshot ? "Loading saved follow-up" : "Saving rehearsal", async () => {
      const saved = await save();
      const actions = await client.previewActions(saved.id);
      setActive((previous) =>
        previous
          ? { ...previous, snapshot: { ...saved, actions }, actions }
          : null,
      );
      go("follow-up");
      setNotice("Rehearsal saved. Review proposed work before approval.");
    });
  }
  async function refresh() {
    const next = await client.bootstrap();
    setData(next);
    if (active?.snapshot) {
      const saved = next.snapshots.find(
        (item) => item.id === active.snapshot!.id,
      );
      if (saved) {
        const actions = await client.previewActions(saved.id);
        setActive({ ...active, snapshot: {...saved, actions}, actions });
      } else {
        setActive(null);
        go("home");
      }
    }
    setNotice("Saved state refreshed. No Jira write was repeated.");
  }
  function create(payload: Parameters<typeof client.createActions>[0]) {
    return perform(
      payload.receiptsOnly ? "Checking receipt" : "Creating approved Tasks",
      async () => {
        await client.createActions(payload);
        await refresh();
      },
    );
  }
  function reconcile(actionId: string, issueKey: string) {
    return perform("Reconciling Jira outcome", async () => {
      if (!active?.snapshot) throw new Error("Save a report first.");
      await client.reconcileAction({
        snapshotId: active.snapshot.id,
        actionId,
        issueKey,
      });
      await refresh();
    });
  }
  async function importFile(file: File) {
    if (file.size > 200000) {
      setError("Import is limited to 200 KB.");
      return;
    }
    await perform("Validating records", async () => {
      const text = await file.text();
      const dataset = file.name.toLowerCase().endsWith(".csv")
        ? importCsv(text)
        : validateDataset(JSON.parse(text));
      const commit = async () => {
        setData(await client.importDataset(dataset));
        setActive(null);
        go("home");
        setNotice("Records imported. Saved reports are preserved.");
      };
      if (data.dataset || active)
        replace(
          "Replace the current dataset? Saved reports are kept; unsaved changes will be discarded.",
          () => {
            void perform("Importing records", commit);
          },
        );
      else await commit();
    });
  }
  function reset() {
    void perform("Deleting workspace data", async () => {
      setData(await client.deleteData());
      setActive(null);
      go("home");
      setNotice("Workspace records deleted. Jira issues were not deleted.");
    });
  }
  const target = active?.dataset.nodes.find(
    (node) => node.id === selectionRequest.recordId,
  )?.warehouseId;
  const suggestedTarget =
    target && active?.result.warehouseIds.includes(target) ? target : undefined;
  return {
    data,
    active,
    screen,
    go,
    busy,
    error,
    notice,
    perform,
    sample,
    run,
    open,
    selectFinding,
    selectedFinding,
    selectionRequest,
    evidenceView,
    focusKey,
    update,
    followUp,
    refresh,
    create,
    reconcile,
    importFile,
    reset,
    confirmation,
    setConfirmation,
    suggestedTarget,
  };
}
function message(error: unknown) {
  return error instanceof Error
    ? error.message
    : "The operation could not be completed. Check access and try again.";
}
