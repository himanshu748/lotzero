import {describe, expect, it, vi} from 'vitest';
import legacy from '../../fixtures/compatibility/production-2.5.0.json';
import type {Snapshot} from '../../src/contracts';
import {runDrill, validateDataset, traceGraph} from '../../src/graph/engine';
import {scaleDataset} from '../../fixtures/synthetic/scale';
import {RecallAnalyst, rehearsalRevision} from '../../src/rovo/analyst';
import {Application} from '../../src/services/application';
import type {Store} from '../../src/storage/port';
import type {JiraGateway} from '../../src/integrations/port';

describe('historical contract and bounded scale', () => {
  it('recomputes the sanitized native export and reopens its original shaped receipts', async () => {
    const snapshot = legacy as Snapshot;
    expect(runDrill(snapshot.dataset, snapshot.result.scenario, snapshot.result.interventions)).toEqual(snapshot.result);
    const prefix = 'p:10001:';
    const rows = new Map<string, unknown>([[prefix+'dataset', snapshot.dataset], [prefix+'snapshot:'+snapshot.id, {...snapshot, actions: []}], ...snapshot.actions.map(action => [prefix+`receipt:${snapshot.id}:${action.id}`, action] as [string, unknown])]);
    const store: Store = {get: async <T>(key: string) => rows.get(key) as T|undefined, list: async <T>(prefix: string) => [...rows].filter(([key]) => key.startsWith(prefix)).map(([key,value]) => ({key,value:value as T})), set: vi.fn(), claim: vi.fn(), delete: vi.fn(), deletePrefix: vi.fn()};
    const jira = {project: vi.fn(async () => ({id:'10001',key:'LZR',name:'Synthetic project'})), permission: vi.fn(async () => true)} as unknown as JiraGateway;
    const app = new Application(store,jira);
    const restored = (await app.bootstrap({accountId:'synthetic-user',extension:{project:{id:'10001'}}})).snapshots[0];
    expect(restored.actions).toEqual(snapshot.actions);
    const analyst = new RecallAnalyst(store, {project: jira.project, canBrowse: async () => true}, () => Date.parse(snapshot.createdAt)+1000);
    const response = await analyst.read({projectKey:'LZR',snapshotId:snapshot.id,expectedRevision:rehearsalRevision(snapshot),view:'summary'}, {accountId:'synthetic-user',installationId:'synthetic',environmentId:'development'});
    expect(response.snapshot.revision).toBe(rehearsalRevision(restored));
    expect(store.set).not.toHaveBeenCalled(); expect(store.claim).not.toHaveBeenCalled();
  });
  it('accepts a valid 1,000-node graph and rejects 1,001 nodes', () => {
    const maximum = scaleDataset(1000);
    expect(Buffer.byteLength(JSON.stringify(maximum))).toBeLessThan(200000);
    expect(validateDataset(maximum).nodes).toHaveLength(1000);
    expect(traceGraph(maximum,'I')).toHaveLength(1000);
    expect(() => validateDataset(scaleDataset(1001))).toThrow();
  });
  it('rejects a 5,001-record payload through the real parser and graph entry without relaxing limits', () => {
    const oversized = scaleDataset(5001);
    expect(() => validateDataset(oversized)).toThrow();
    expect(() => traceGraph(oversized,'I')).toThrow();
  });
});
