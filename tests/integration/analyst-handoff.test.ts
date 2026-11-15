import {beforeEach, describe, expect, it, vi} from 'vitest';
const mocks = vi.hoisted(() => ({enabled: vi.fn(), open: vi.fn()}));
vi.mock('@forge/bridge', () => ({rovo: {isEnabled: mocks.enabled, open: mocks.open}}));
import {analystHandoff, openAnalyst} from '../../static/lotzero-ui/src/analyst';
import {rehearsalRevision} from '../../src/rovo/analyst';
import {runDrill} from '../../src/graph/engine';
import {syntheticDataset} from '../../fixtures/synthetic/dataset';
import {DEFAULT_ASSERTIONS, type Snapshot} from '../../src/contracts';
const snapshot: Snapshot = {id: 'handoff-saved', createdAt: '2026-10-30T10:00:00Z', initiator: 'PRIVATE_ACTOR', dataset: syntheticDataset, result: runDrill(syntheticDataset, {sourceLotId: 'ING-A19', hazard: 'contamination', at: '2026-10-28T09:00:00Z', assertions: DEFAULT_ASSERTIONS}), actions: []};
beforeEach(() => {vi.clearAllMocks(); mocks.enabled.mockResolvedValue(true); mocks.open.mockResolvedValue(undefined);});
describe('saved-report Rovo handoff', () => {
  it('binds the browser handoff to the same SHA-256 saved revision as the server', async () => {
    const handoff = await analystHandoff(snapshot, 'LZR', 'assertions');
    expect(handoff).toContain(rehearsalRevision(snapshot));
    expect(handoff).toContain('"snapshotId":"handoff-saved"');
    expect(handoff).toContain('"assertionId":"ingredient-origin"');
    expect(handoff).not.toContain('PRIVATE_ACTOR');
    expect(handoff).not.toContain(syntheticDataset.name);
  });
  it('does not transmit a raw dataset when opening the same-app Forge agent', async () => {
    const prompt = await analystHandoff(snapshot, 'LZR', 'shipments');
    await openAnalyst(prompt);
    expect(mocks.open).toHaveBeenCalledWith({type: 'forge', agentKey: 'lotzero-recall-analyst', agentName: 'Recall rehearsal analyst', prompt});
    expect(prompt).not.toContain('"nodes"'); expect(prompt).not.toContain('"edges"');
  });
  it('keeps the normal report as the fallback when Rovo is unavailable', async () => {
    mocks.enabled.mockResolvedValue(false);
    await expect(openAnalyst('handoff')).rejects.toThrow('Continue with the report');
    expect(mocks.open).not.toHaveBeenCalled();
  });
  it('handles a connector failure without leaking its private error', async () => {
    mocks.open.mockRejectedValue(new Error('secret endpoint response'));
    await expect(openAnalyst('handoff')).rejects.toThrow('Rovo could not open');
    await expect(openAnalyst('handoff')).rejects.not.toThrow('secret endpoint');
  });
});
