import type { Snapshot } from '../contracts';
import { csvCell } from '../schemas/csv';
import { compareDrills } from './run';
const clean=(text:unknown)=>String(text??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/[\r\n]/g,' ').replace(/([\\`*_[\]#|])/g,'\\$1');
export function reportMarkdown(snapshot:Snapshot,baseline?:Snapshot):string{
  const {result:r,dataset:d}=snapshot;
  const lines=[`# LotZero simulated drill — ${clean(r.id)}`,'','Rehearsal only. This report does not establish product safety, legal compliance, or that a real recall, quarantine, hold, or customer notification occurred.','',`- Snapshot: ${clean(snapshot.id)}`,`- Initiator: ${clean(snapshot.initiator)}`,`- Saved at: ${clean(snapshot.createdAt)}`,`- Dataset: ${clean(d.name)} / ${clean(d.version)}`,`- Synthetic data: ${d.synthetic?'yes':'no; imported untrusted records'}`,`- Dataset checksum: ${clean(r.fingerprint)} (FNV-1a identification only; not a signature)`,`- Scenario: ${clean(r.scenario.hazard)} at ${clean(r.scenario.sourceLotId)}`,`- Scenario time: ${clean(r.scenario.at)}`,'','## Associations',`- Finished lots: ${r.affectedProductIds.map(clean).join(', ')||'none evidenced'}`,`- Shipments: ${r.affectedShipmentIds.map(clean).join(', ')||'none evidenced'}`,`- Warehouses: ${r.warehouseIds.map(clean).join(', ')||'none evidenced'}`,`- Unresolved records: ${r.unknownRecordIds.map(clean).join(', ')||'none detected within supplied records'}`,'','Absence from the trace is not proof of being unaffected. Missing branches remain unresolved. Quantities below are full recorded shipment quantities, not contaminated ingredient mass. Units are normalized only within compatible dimensions.'];
  lines.push(...r.quantities.map(q=>`- ${q.value} ${clean(q.unit)} from ${q.recordIds.map(clean).join(', ')}`),'','## Assertions');
  for(const a of r.assertions){lines.push(`### ${clean(a.title)} — ${a.status}`,`${a.passed}/${a.checked} applicable records passed.`);for(const g of a.counterexamples)lines.push(`- ${clean(g.message)} Records: ${g.recordIds.map(clean).join(', ')||'none applicable'}. Evidence: ${g.evidence.map(clean).join(', ')||'not available'}.`);}
  lines.push('','## Evidence paths');for(const t of r.trace)lines.push(`- ${clean(t.nodeId)} [${t.certainty}]: ${t.path.map(clean).join(' → ')}; relationships: ${t.edgeIds.map(clean).join(', ')||'source'}; evidence: ${t.evidence.map(clean).join(', ')||'missing'}`);
  lines.push('','## Gaps');for(const g of r.gaps)lines.push(`- ${clean(g.code)}: ${clean(g.message)} (${g.recordIds.map(clean).join(', ')}); evidence ${g.evidence.map(clean).join(', ')||'missing'}`);
  lines.push('','## Simulated interventions');for(const i of r.interventions)lines.push(`- ${clean(i.type)}: ${clean(i.targetId)} at ${clean(i.at)}; owner ${clean(i.owner)||'not assigned'}; evidence ${i.evidence.map(clean).join(', ')||'missing'}`);
  lines.push(`- Historical shipments retained: ${r.simulation.historicalShipmentIds.map(clean).join(', ')||'none'}`,`- Preventable future shipments in this simulation: ${r.simulation.preventableShipmentIds.map(clean).join(', ')||'none'}`,`- Remaining/unknown future movements: ${r.simulation.remainingShipmentIds.map(clean).join(', ')||'none'}`,...r.simulation.notes.map(n=>`- ${clean(n)}`),'','## Jira proposals and creation receipts');
  if(!snapshot.actions.some(action=>action.status==='created' && action.issueKey))lines.push('No successful Jira issue creation is recorded. Proposals are not approval or evidence of creation.');
  for(const action of snapshot.actions)lines.push(`- ${clean(action.summary)} — ${clean(action.status??'preview')}; issue ${clean(action.issueKey)||'not created'}; ${clean(action.issueUrl)||'no issue URL'}; records ${action.recordIds.map(clean).join(', ')}; evidence ${action.evidence.map(clean).join(', ')||'missing'}`);
  lines.push('','## Documentary references');for(const e of d.evidence)lines.push(`- ${clean(e.id)}: ${clean(e.title)}; source ${clean(e.source)}; recorded ${clean(e.recordedAt)}`);
  if(baseline){
    const comparison=compareDrills(baseline.result,r);
    lines.push('','## Before and after',`Baseline snapshot: ${clean(baseline.id)}; dataset ${clean(baseline.dataset.version)}; checksum ${clean(baseline.result.fingerprint)}`);
    for(const [label,values] of Object.entries(comparison))lines.push(`- ${clean(label)}: ${values.map(clean).join(', ')||'none'}`);
    lines.push('The JSON comparison export includes the complete baseline snapshot for reproduction. Removed associations alone do not prove reduced risk.');
  }
  lines.push('','## Reproduction and limitations','Rerun the JSON snapshot dataset with the recorded scenario and interventions. Compare only snapshots using the same source, hazard, time, and assertion set. An exported comparison requires both snapshots.','The model establishes recorded associations, not dose, actual contamination, production yield, stock reconciliation, or regulatory readiness. Unknown is never a pass. Imported data quality and omitted records limit all conclusions.','');return lines.join('\n');
}
export function reportCsv(snapshot:Snapshot,baseline?:Snapshot):string{
  const rows:unknown[][]=[['type','id','status','description','records','evidence']];
  for(const a of snapshot.result.assertions)rows.push(['assertion',a.id,a.status,a.title,`${a.passed}/${a.checked}`,a.counterexamples.flatMap(g=>g.evidence).join(';')]);
  for(const g of snapshot.result.gaps)rows.push(['gap',g.id,'investigate',g.message,g.recordIds.join(';'),g.evidence.join(';')]);
  for(const t of snapshot.result.trace)rows.push(['association',t.nodeId,t.certainty,t.path.join(' -> '),t.edgeIds.join(';'),t.evidence.join(';')]);
  if(baseline)for(const [label,values] of Object.entries(compareDrills(baseline.result,snapshot.result)))rows.push(['comparison',baseline.id,label,values.join(';'),baseline.dataset.version,baseline.result.fingerprint]);
  return rows.map(row=>row.map(csvCell).join(',')).join('\r\n');
}
