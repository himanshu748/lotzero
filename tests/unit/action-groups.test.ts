import { describe, it, expect } from "vitest";
import legacy from "../../fixtures/compatibility/production-2.5.0.json";
import type { Snapshot } from "../../src/contracts";
import { syntheticDataset } from "../../fixtures/synthetic/dataset";
import { runDrill } from "../../src/graph/engine";
import { suggestActions } from "../../src/services/actions";
import { groupActions } from "../../src/services/action-findings";

describe("prioritised action display with stable receipt identity", () => {
  const old = legacy as Snapshot;
  const snapshot = {
    ...old,
    dataset: syntheticDataset,
    result: runDrill(syntheticDataset, old.result.scenario),
  };
  it("puts destination FAIL first while retaining canonical action-4 and unchanged descriptions", () => {
    const actions = suggestActions(snapshot);
    const before = JSON.stringify(actions);
    const groups = groupActions(snapshot.result, actions);
    expect(groups[0].id).toBe("shipment-destination");
    expect(groups[0].actions[0]).toBe(actions.find((a) => a.id === "action-4"));
    expect(groups[0].actions[0].recordIds).toEqual(["SHIP-002"]);
    expect(groups.flatMap((g) => g.actions)).toHaveLength(actions.length);
    expect(JSON.stringify(actions)).toBe(before);
  });
  it("preserves created and uncertain legacy objects, without deriving a new action ID", () => {
    const actions = suggestActions(old);
    actions[0] = { ...actions[0], status: "uncertain" };
    actions[3] = { ...actions[3], status: "created", issueKey: "LZR-1" };
    const grouped = groupActions(old.result, actions).flatMap((g) => g.actions);
    expect(grouped.find((a) => a.id === "action-1")).toBe(actions[0]);
    expect(grouped.find((a) => a.issueKey === "LZR-1")).toBe(actions[3]);
  });
  it("does not mislabel a custom or unmatched receipt as an assertion proposal", () => {
    const action = {
      ...suggestActions(old)[0],
      id: "historical-custom",
      status: "uncertain" as const,
    };
    const groups = groupActions(old.result, [action]);
    expect(groups[0].id).toBe("other-evidence");
    expect(groups[0].actions[0]).toBe(action);
  });
});
