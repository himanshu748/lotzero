import {useEffect, useState} from 'react';
import type {Snapshot} from '../../../../src/contracts';
import {analystHandoff, openAnalyst, type AnalystQuestion} from '../analyst';

export default function AnalystHandoff({snapshot, projectKey, saved, local}: {snapshot: Snapshot; projectKey?: string; saved: boolean; local: boolean}) {
  const [question, setQuestion] = useState<AnalystQuestion>('shipments');
  const [prompt, setPrompt] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    setPrompt(''); setNotice('');
    if (saved && projectKey && !local) {
      void analystHandoff(snapshot, projectKey, question).then(value => {if (active) setPrompt(value);}).catch(() => {if (active) setNotice('The saved handoff could not be prepared. Reopen this report and try again.');});
    }
    return () => {active = false;};
  }, [snapshot, projectKey, saved, local, question]);
  return <section className="panel" aria-labelledby="analyst-title">
    <p className="eyebrow">OPTIONAL / READ-ONLY ROVO</p>
    <h2 id="analyst-title">Ask about this rehearsal</h2>
    <p>The Recall rehearsal analyst reads the exact saved scenario and explains the same trace, assertions and interventions shown in this report. It cannot create Tasks or change records.</p>
    {!saved ? <p>Save this rehearsal before preparing an analyst handoff.</p> : local ? <p>Rovo is unavailable in browser rehearsal. Use a Forge installation with Rovo activated for the optional analyst. The evidence and simulator remain available here.</p> : !projectKey ? <p>Open this report from its Jira project to identify the permitted context.</p> : <>
      <label>Question for the analyst<select value={question} disabled={busy} onChange={event => setQuestion(event.target.value as AnalystQuestion)}>
        <option value="shipments">Associated shipments and trace paths</option>
        <option value="evidence">Missing evidence and counterexamples</option>
        <option value="assertions">Why an assertion fails or stays unknown</option>
        <option value="simulation">What the saved intervention changes</option>
        <option value="summary">Blocking evidence, timing limits & task proposals</option>
      </select></label>
      <p>Opening Rovo sends the saved identifiers and authorized evidence summaries to Atlassian Rovo. Verify its AI explanation against the report. Follow-up Tasks still require Jira action review and your explicit approval.</p>
      <button className="secondary" disabled={!prompt || busy} onClick={async () => {setBusy(true); setNotice(''); try {await openAnalyst(prompt); setNotice('Rovo was opened with this saved rehearsal handoff. Verify the returned revision and evidence.');} catch (error) {setNotice(error instanceof Error ? error.message : 'Rovo could not open. Continue using the report.');} finally {setBusy(false);}}}>{busy ? 'Opening Rovo…' : 'Ask Recall rehearsal analyst'}</button>
      <details className="export-preview"><summary>View or copy the saved handoff</summary>
        <p>If Rovo is unavailable, keep using Impact explorer, Evidence gaps and the simulator here. Installing/enabling Rovo is an administrator step; this control does not activate a subscription.</p>
        <label>Saved rehearsal analyst handoff<textarea readOnly value={prompt} rows={7} spellCheck={false}/></label>
        <button className="secondary" disabled={!prompt} onClick={async () => {try {await navigator.clipboard.writeText(prompt); setNotice('Saved handoff copied.');} catch {setNotice('Clipboard access is unavailable. Select the handoff and copy it with your keyboard.');}}}>Copy analyst handoff</button>
      </details>
    </>}
    <p className="field-help">Rovo is optional. If it cannot open, use the assertion counterexamples and evidence IDs in this report; no AI service is needed to inspect them.</p>
    <p role="status">{notice}</p>
  </section>;
}
