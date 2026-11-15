import {describe, it, expect} from 'vitest';
import legacy from '../../fixtures/compatibility/production-2.5.0.json';
import type {Snapshot} from '../../src/contracts';
import {summarizeRehearsal} from '../../src/scenarios/summary';
import {suggestActions} from '../../src/services/actions';
import {recoveryFor} from '../../static/lotzero-ui/src/recovery';

describe('run-derived summary and safe recovery', () => {
  const snapshot = legacy as Snapshot;
  it('derives populations, actual statuses and counterexamples without changing saved bytes', () => {
    const before = JSON.stringify(snapshot);
    const summary = summarizeRehearsal(snapshot);
    expect(summary.productLots).toBe(snapshot.result.affectedProductIds.length);
    expect(summary.shipments).toBe(snapshot.result.affectedShipmentIds.length);
    expect(summary.assertions.pass + summary.assertions.fail + summary.assertions.unknown).toBe(snapshot.result.assertions.length);
    expect(summary.blocking.find(a => a.id === 'shipment-destination')?.firstCounterexample?.recordIds).toContain('SHIP-002');
    expect(summary.timing.status).toBe('UNKNOWN');
    expect(JSON.stringify(snapshot)).toBe(before);
  });
  it('counts created, failed and uncertain receipts without treating uncertain as complete', () => {
    const proposals = suggestActions(snapshot);
    const actions = proposals.slice(0, 3).map((action, index) => ({...action, status: ['created','uncertain','failed'][index] as 'created'|'uncertain'|'failed', ...(index === 0 ? {issueKey: 'SYN-1'} : {})}));
    const summary = summarizeRehearsal({...snapshot, actions});
    expect(summary.actions).toMatchObject({total: proposals.length, created: 1, uncertain: 1, failed: 1, open: proposals.length - 1});
  });
  it('adapts to a different configured assertion set, never hard-coding sample counts', () => {
    const changed = {...snapshot, result: {...snapshot.result, affectedProductIds: ['ONE'], affectedShipmentIds: [], assertions: snapshot.result.assertions.filter(a => a.status === 'PASS')}, actions: []};
    expect(summarizeRehearsal(changed)).toMatchObject({productLots: 1, shipments: 0, assertions: {fail: 0, unknown: 0}, blocking: []});
  });
  it.each(['uncertain receipt', 'Project administrator permission is required', 'storage unavailable', 'A project update is in progress'])('offers a read refresh instead of replaying writes: %s', message => {
    expect(recoveryFor(message).action).toBe('refresh');
  });
});
