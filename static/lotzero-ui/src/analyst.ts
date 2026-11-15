import type {Snapshot} from '../../../src/contracts';
import {ANALYST_KEY, ANALYST_NAME, rehearsalRevisionInput} from '../../../src/rovo/revision';

export type AnalystQuestion = 'shipments' | 'evidence' | 'assertions' | 'simulation' | 'summary';
export async function analystHandoff(snapshot: Snapshot, projectKey: string, view: AnalystQuestion): Promise<string> {
  if (!/^[A-Z][A-Z0-9_]{1,49}$/.test(projectKey)) throw new Error('Open the saved report in its Jira project first.');
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rehearsalRevisionInput(snapshot)));
  const expectedRevision = [...new Uint8Array(digest)].map(x => x.toString(16).padStart(2, '0')).join('');
  const assertionId = view === 'assertions' ? snapshot.result.assertions.find(a => a.status !== 'PASS')?.id : undefined;
  const questions: Record<AnalystQuestion, string> = {
    shipments: 'Which shipments are associated with this saved source lot? Explain the recorded paths, uncertainty and historical movement.',
    evidence: 'Where is evidence missing in this saved rehearsal? Show record IDs, evidence references and counterexamples. Missing evidence remains unknown.',
    assertions: 'Why does this saved assertion fail or remain unknown? Explain its checked population and counterexamples.',
    simulation: 'What do the interventions already saved in this rehearsal change? Preserve historical shipments and distinguish potentially preventable movement.',
    summary: 'Which missing evidence blocks this rehearsal, and what follow-up tasks could I review? Cite assertions and evidence IDs. Do not claim a four-hour recall or a slowest link: timing is not measured. Task lists are proposals, not created issues.',
  };
  return `This is a LotZero recall rehearsal, not a real recall. Use the lotzero-read-saved-rehearsal action with these exact inputs:\n${JSON.stringify({projectKey, snapshotId: snapshot.id, expectedRevision, view, ...(assertionId ? {assertionId} : {})})}\n${questions[view]}\nUse only this saved revision. State pagination/truncation and relevant IDs. Do not create Tasks or change records; direct any follow-up to LotZero's existing exact-content Jira action review and explicit approval.`;
}

export async function openAnalyst(prompt: string): Promise<void> {
  try {
    const {rovo} = await import('@forge/bridge');
    if (!await rovo.isEnabled()) throw new Error();
    await rovo.open({type: 'forge', agentKey: ANALYST_KEY, agentName: ANALYST_NAME, prompt});
  } catch {
    throw new Error('Rovo could not open in this tenant or installation. Continue with the report here. If your administrator has enabled Rovo and installed this analyst, select Recall rehearsal analyst in Rovo and paste the handoff below.');
  }
}
