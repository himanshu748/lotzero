import type {
  AssertionId,
  AssertionResult,
  Dataset,
  DrillResult,
} from "../contracts";

const priority = { FAIL: 0, UNKNOWN: 1, PASS: 2 };
export function orderedAssertions(result: DrillResult): AssertionResult[] {
  return result.assertions
    .map((value, index) => ({ value, index }))
    .sort(
      (a, b) =>
        priority[a.value.status] - priority[b.value.status] ||
        a.index - b.index,
    )
    .map((item) => item.value);
}
export function findingRecord(
  assertion: AssertionResult,
  result: DrillResult,
  dataset: Dataset,
): string | null {
  const reachable = new Set(result.trace.map((item) => item.nodeId));
  const recorded = new Set(dataset.nodes.map((item) => item.id));
  return (
    assertion.counterexamples
      .flatMap((item) => item.recordIds)
      .find((id) => reachable.has(id) && recorded.has(id)) ?? null
  );
}
export function firstFinding(
  result: DrillResult,
  dataset: Dataset,
): { assertionId: AssertionId | null; recordId: string | null } {
  const first = orderedAssertions(result)[0];
  if (!first) return { assertionId: null, recordId: null };
  return {
    assertionId: first.id,
    recordId:
      first.status === "PASS"
        ? result.trace.some(
            (item) => item.nodeId === result.scenario.sourceLotId,
          ) &&
          dataset.nodes.some((item) => item.id === result.scenario.sourceLotId)
          ? result.scenario.sourceLotId
          : null
        : findingRecord(first, result, dataset),
  };
}
