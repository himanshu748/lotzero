import type {Snapshot} from '../contracts';
import {suggestActions} from '../services/actions';

/** A presentation projection only; saved engine output and revision remain unchanged. */
export function summarizeRehearsal(snapshot: Pick<Snapshot, 'id' | 'dataset' | 'result' | 'actions'>) {
  const {result} = snapshot;
  const suggestions = suggestActions(snapshot);
  const actual = new Map(snapshot.actions.map(action => [action.id, action]));
  const actions = suggestions.map(action => actual.get(action.id) ?? action);
  const created = actions.filter(action => action.status === 'created' && Boolean(action.issueKey)).length;
  const uncertain = actions.filter(action => action.status === 'uncertain').length;
  const failed = actions.filter(action => action.status === 'failed').length;
  const blocking = result.assertions.filter(assertion => assertion.status !== 'PASS');
  return {
    sourceLotId: result.scenario.sourceLotId,
    productLots: new Set(result.affectedProductIds).size,
    shipments: new Set(result.affectedShipmentIds).size,
    assertions: {
      pass: result.assertions.filter(assertion => assertion.status === 'PASS').length,
      fail: result.assertions.filter(assertion => assertion.status === 'FAIL').length,
      unknown: result.assertions.filter(assertion => assertion.status === 'UNKNOWN').length,
    },
    blocking: blocking.map(assertion => ({id: assertion.id, title: assertion.title, status: assertion.status, checked: assertion.checked, passed: assertion.passed, firstCounterexample: assertion.counterexamples[0] ?? null})),
    actions: {total: actions.length, open: actions.length - created, created, uncertain, failed},
    timing: {status: 'UNKNOWN' as const, label: 'Timing not measured', reason: 'These records do not measure evidence-retrieval or response duration. A four-hour recall cannot be established.'},
  };
}
