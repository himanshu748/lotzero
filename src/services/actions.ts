import type { JiraAction, Snapshot } from '../contracts';

/** Only saved deterministic findings become Jira suggestions; never trust client issue text. */
export function suggestActions(snapshot: Pick<Snapshot, 'id' | 'dataset' | 'result'>): JiraAction[] {
  const findings = [...snapshot.result.assertions.filter(a=>a.status!=='PASS').flatMap(a=>a.counterexamples), ...snapshot.result.gaps];
  const seen = new Set<string>();
  return findings.filter(g=>{ const key=[g.code,...[...g.recordIds].sort()].join('|'); if(seen.has(key))return false; seen.add(key); return true; }).slice(0,20).map((g,i)=>({
    id:`action-${i+1}`, summary:`[SIMULATED DRILL] ${g.message}`.slice(0,240), recordIds:g.recordIds, evidence:g.evidence,
    description:[`LotZero simulated recall drill ${snapshot.id}`,`Dataset: ${snapshot.dataset.version}; fingerprint: ${snapshot.result.fingerprint}`,`Scenario: ${snapshot.result.scenario.hazard} at ${snapshot.result.scenario.sourceLotId}`,`Observed problem: ${g.message}`,`Records: ${g.recordIds.join(', ') || 'No record identified'}`,`Evidence references:\n${g.evidence.map(id=>{const e=snapshot.dataset.evidence.find(e=>e.id===id);return e?`${id}: ${e.title}; source: ${e.source}; recorded: ${e.recordedAt}`:`${id}: unresolved`;}).join('\n') || 'Missing — investigate; do not infer safety'}`,`To inspect: Open LotZero in the originating Jira project, select saved drill ${snapshot.id}, then open Impact Explorer and select the referenced record. Synthetic evidence is embedded in the drill; it is not an external certificate.`,`Next steps: Review the referenced records with the quality team, document the correction and supporting evidence, then rerun this scenario.`,`This is a rehearsal only. Do not contact customers, hold shipments or execute a real recall on this issue's authority.`].join('\n\n')
  }));
}
