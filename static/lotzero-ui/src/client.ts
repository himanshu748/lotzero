import type {
  Bootstrap,
  Dataset,
  Intervention,
  JiraAction,
  Project,
  Scenario,
  Snapshot,
} from "../../../src/contracts";
import { runDrill, validateDataset } from "../../../src/graph/engine";
import { syntheticDataset } from "../../../fixtures/synthetic/dataset";
import { suggestActions } from "../../../src/services/actions";
import {isNorthstarSample} from "../../../src/scenarios/sample";
export const localMode = import.meta.env.VITE_LOCAL_DEMO === "true";
const key = "lotzero.local.v1";
function read(): Bootstrap {
  const raw = localStorage.getItem(key);
  if (!raw) return { dataset: null, snapshots: [], audit: [], mode: "local" };
  const value = JSON.parse(raw) as Bootstrap;
  if (value.dataset) validateDataset(value.dataset);
  if (!Array.isArray(value.snapshots) || !Array.isArray(value.audit))
    throw new Error(
      "Saved browser data is invalid. Clear this site’s local storage to reset.",
    );
  return { ...value, mode: "local" };
}
function write(state: Bootstrap, event: string) {
  state.audit = [
    { at: new Date().toISOString(), actor: "Local rehearsal user", event },
    ...state.audit,
  ].slice(0, 100);
  localStorage.setItem(key, JSON.stringify(state));
  return state;
}
async function rpc<T>(
  name: string,
  payload: Record<string, unknown> = {},
): Promise<T> {
  const { invoke } = await import("@forge/bridge");
  return (await invoke<T>(name, payload)) as T; // No metadata option: Forge returns the resolver body.
}
export const client = {
  bootstrap: async (): Promise<Bootstrap> =>
    localMode ? read() : rpc("bootstrap"),
  seed: async (): Promise<Bootstrap> => {
    if (!localMode) return rpc("seed");
    const state = read();
    if (state.dataset) {
      if (isNorthstarSample(state.dataset)) return state;
      throw new Error("A dataset already exists. The Northstar sample will not replace your records. Define a drill using the current dataset.");
    }
    return write({...state, dataset: structuredClone(syntheticDataset)}, "Loaded synthetic dataset");
  },
  importDataset: (dataset: Dataset): Promise<Bootstrap> =>
    localMode
      ? Promise.resolve(
          write(
            { ...read(), dataset: validateDataset(dataset) },
            `Imported dataset ${dataset.version}`,
          ),
        )
      : rpc("importDataset", { dataset }),
  saveDrill: (
    scenario: Scenario,
    interventions: Intervention[],
    expectedFingerprint: string,
  ): Promise<Snapshot> => {
    if (!localMode)
      return rpc("saveDrill", { scenario, interventions, expectedFingerprint });
    const state = read();
    if (!state.dataset)
      return Promise.reject(new Error("Load a dataset first."));
    if (state.snapshots.length >= 25)
      return Promise.reject(
        new Error(
          "25 saved drills reached. Export and delete workspace data before saving more.",
        ),
      );
    const result = runDrill(state.dataset, scenario, interventions);
    if (result.fingerprint !== expectedFingerprint)
      return Promise.reject(
        new Error("The dataset changed after review. Run a fresh drill."),
      );
    const snapshot: Snapshot = {
      id: `LOCAL-${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
      initiator: "Local rehearsal user",
      dataset: structuredClone(state.dataset),
      result,
      actions: [],
    };
    state.snapshots = [snapshot, ...state.snapshots];
    write(state, `Saved drill ${snapshot.id}`);
    return Promise.resolve(snapshot);
  },
  listProjects: (): Promise<Project[]> =>
    localMode ? Promise.resolve([]) : rpc("listProjects"),
  issueTypes: (projectKey: string): Promise<{ id: string; name: string }[]> =>
    localMode ? Promise.resolve([]) : rpc("issueTypes", { projectKey }),
  previewActions: (snapshotId: string): Promise<JiraAction[]> => {
    if (!localMode) return rpc("previewActions", { snapshotId });
    const snapshot = read().snapshots.find((x) => x.id === snapshotId);
    return snapshot
      ? Promise.resolve(suggestActions(snapshot))
      : Promise.reject(new Error("Saved drill not found."));
  },
  createActions: (payload: {
    snapshotId: string;
    projectKey: string;
    issueTypeId: string;
    actionIds: string[];
    approved: true;
    receiptsOnly?: true;
  }): Promise<JiraAction[]> =>
    localMode
      ? Promise.reject(
          new Error(
            "Jira creation is disabled in local rehearsal. Install the Forge edition to create real issues.",
          ),
        )
      : rpc("createActions", payload),
  reconcileAction: (payload: {
    snapshotId: string;
    actionId: string;
    issueKey: string;
  }): Promise<JiraAction> =>
    localMode
      ? Promise.reject(new Error("Reconciliation requires Forge."))
      : rpc("reconcileAction", payload),
  recoverProjectLock: (): Promise<Bootstrap> =>
    localMode
      ? Promise.reject(new Error("Lock recovery requires Forge."))
      : rpc("recoverProjectLock", { confirmation: "RECOVER" }),
  deleteData: (): Promise<Bootstrap> => {
    if (!localMode) return rpc("deleteData", { confirmation: "DELETE" });
    localStorage.removeItem(key);
    return Promise.resolve(read());
  },
};
