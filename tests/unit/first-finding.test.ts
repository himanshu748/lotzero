import { describe, it, expect } from "vitest";
import legacy from "../../fixtures/compatibility/production-2.5.0.json";
import type { DrillResult, Snapshot } from "../../src/contracts";
import {
  firstFinding,
  findingRecord,
  orderedAssertions,
} from "../../src/scenarios/first-finding";
const { result, dataset } = legacy as Snapshot;
describe("first blocking finding selection", () => {
  it("opens the sample destination FAIL at SHIP-002 without mutating saved bytes", () => {
    const before = JSON.stringify({ result, dataset });
    expect(firstFinding(result, dataset)).toEqual({
      assertionId: "shipment-destination",
      recordId: "SHIP-002",
    });
    expect(JSON.stringify({ result, dataset })).toBe(before);
  });
  it("keeps configured order within each status and puts FAIL before UNKNOWN and PASS", () => {
    const ordered = orderedAssertions(result);
    expect(ordered.map((a) => a.status)).toEqual([
      "FAIL",
      "FAIL",
      "FAIL",
      "UNKNOWN",
      "PASS",
    ]);
    expect(
      ordered.filter((a) => a.status === "UNKNOWN").map((a) => a.id),
    ).toEqual(
      result.assertions.filter((a) => a.status === "UNKNOWN").map((a) => a.id),
    );
  });
  it("selects UNKNOWN when no FAIL exists without inventing a missing path", () => {
    const unknown = result.assertions.find((a) => a.status === "UNKNOWN")!;
    const r = { ...result, assertions: [unknown] } as DrillResult;
    const pick = firstFinding(r, dataset);
    expect(pick.assertionId).toBe(unknown.id);
    expect(pick.recordId).toBe(findingRecord(unknown, r, dataset));
    expect(firstFinding({ ...r, trace: [] }, dataset).recordId).toBeNull();
  });
  it("requires a counterexample record to exist and be reachable", () => {
    const fail = result.assertions.find(
      (a) => a.id === "shipment-destination",
    )!;
    expect(
      findingRecord(fail, result, {
        ...dataset,
        nodes: dataset.nodes.filter((n) => n.id !== "SHIP-002"),
      }),
    ).toBeNull();
    expect(
      findingRecord({ ...fail, counterexamples: [] }, result, dataset),
    ).toBeNull();
  });
  it("uses the recorded source for an all-PASS run, and handles no assertions", () => {
    const pass = {
      ...result.assertions[0],
      status: "PASS" as const,
      counterexamples: [],
    };
    expect(firstFinding({ ...result, assertions: [pass] }, dataset)).toEqual({
      assertionId: pass.id,
      recordId: result.scenario.sourceLotId,
    });
    expect(firstFinding({ ...result, assertions: [] }, dataset)).toEqual({
      assertionId: null,
      recordId: null,
    });
  });
});
