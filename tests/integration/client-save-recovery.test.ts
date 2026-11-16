import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {DEFAULT_ASSERTIONS, type Scenario} from '../../src/contracts';
import {runDrill} from '../../src/graph/engine';
import {syntheticDataset} from '../../fixtures/synthetic/dataset';

const scenario: Scenario = {sourceLotId: 'ING-A19', hazard: 'allergen', at: '2026-10-28T09:00:00Z', assertions: DEFAULT_ASSERTIONS};
const fingerprint = () => runDrill(syntheticDataset, scenario).fingerprint;
const invoke = vi.hoisted(() => vi.fn());
vi.mock('@forge/bridge', () => ({invoke}));
beforeEach(() => { vi.resetModules(); invoke.mockReset(); });
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('save request transport and local parity', () => {
  it('passes a stable request identity through Forge and keeps the legacy call shape valid', async () => {
    vi.stubEnv('VITE_LOCAL_DEMO', 'false');
    const {client} = await import('../../static/lotzero-ui/src/client');
    await client.saveDrill(scenario, [], fingerprint(), 'same-save-request');
    expect(invoke).toHaveBeenLastCalledWith('saveDrill', {scenario, interventions: [], expectedFingerprint: fingerprint(), requestId: 'same-save-request'});
    await client.saveDrill(scenario, [], fingerprint());
    expect(invoke).toHaveBeenLastCalledWith('saveDrill', {scenario, interventions: [], expectedFingerprint: fingerprint()});
  });
  it('reuses the local snapshot and audit after persistence succeeds but its response fails', async () => {
    vi.stubEnv('VITE_LOCAL_DEMO', 'true');
    const rows = new Map<string, string>(); let loseResponse = false;
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => rows.get(key) ?? null,
      setItem: (key: string, value: string) => { rows.set(key, value); if (loseResponse) { loseResponse = false; throw new Error('response lost'); } },
      removeItem: (key: string) => rows.delete(key),
    });
    const {client} = await import('../../static/lotzero-ui/src/client');
    await client.seed(); loseResponse = true;
    expect(() => client.saveDrill(scenario, [], fingerprint(), 'same-save-request')).toThrow('response lost');
    const savedBytes = rows.get('lotzero.local.v1');
    const recovered = await client.saveDrill(scenario, [], fingerprint(), 'same-save-request');
    expect(recovered.id).toBe('LOCAL-same-save-request');
    expect(rows.get('lotzero.local.v1')).toBe(savedBytes);
    await expect(client.saveDrill({...scenario, hazard: 'mislabeling'}, [], fingerprint(), 'same-save-request')).rejects.toThrow('different rehearsal');
    expect((await client.bootstrap()).snapshots).toHaveLength(1);
  });
});
