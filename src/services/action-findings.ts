import type {
  AssertionResult,
  DrillResult,
  Gap,
  JiraAction,
} from "../contracts";

/** Canonical legacy order. Display priority must never change action-N identities. */
export function actionFindings(
  result: DrillResult,
): { gap: Gap; assertion?: AssertionResult }[] {
  const findings = [
    ...result.assertions
      .filter((a) => a.status !== "PASS")
      .flatMap((assertion) =>
        assertion.counterexamples.map((gap) => ({ gap, assertion })),
      ),
    ...result.gaps.map((gap) => ({ gap, assertion: undefined })),
  ];
  const seen = new Set<string>();
  return findings
    .filter(({ gap }) => {
      const key = [gap.code, ...[...gap.recordIds].sort()].join("|");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 20);
}
export interface ActionGroup {
  id: string;
  title: string;
  status: "FAIL" | "UNKNOWN";
  actions: JiraAction[];
}
/** Read-only presentation. Receipts and all original action objects remain intact. */
export function groupActions(
  result: DrillResult,
  actions: JiraAction[],
): ActionGroup[] {
  const findings = actionFindings(result);
  const groups = new Map<string, ActionGroup>();
  for (const action of actions) {
    const index = /^action-([1-9]\d*)$/.exec(action.id);
    const item = index ? findings[Number(index[1]) - 1] : undefined;
    const matching =
      item &&
      JSON.stringify(item.gap.recordIds) === JSON.stringify(action.recordIds);
    const assertion = matching ? item.assertion : undefined;
    const id = assertion?.id ?? "other-evidence";
    const group = groups.get(id) ?? {
      id,
      title: assertion?.title ?? "Other recorded evidence gaps",
      status: assertion?.status === "FAIL" ? "FAIL" : "UNKNOWN",
      actions: [],
    };
    group.actions.push(action);
    groups.set(id, group);
  }
  return [...groups.values()].sort(
    (a, b) => (a.status === "FAIL" ? 0 : 1) - (b.status === "FAIL" ? 0 : 1),
  );
}
