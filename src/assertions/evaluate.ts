import type { AssertionId, AssertionResult, Intervention, RecordNode, TraceEntry } from '../contracts';
import { gap, traverse, type Graph } from '../graph/core';
import {ASSERTION_TITLES as titles} from './labels';

export function originState(graph:Graph,product:RecordNode):'PASS'|'UNKNOWN'{
  const ancestors=traverse(graph,product.id,'backward');
  const ingredients=ancestors.filter(x=>graph.nodes.get(x.nodeId)?.kind==='ingredient');
  // A known ingredient does not erase a second missing/ambiguous branch in a merged batch.
  const ancestorIds=new Set(ancestors.map(x=>x.nodeId));
  const uncertainBranch=graph.edges.some(e=>ancestorIds.has(e.to)&&ancestorIds.has(e.from)&&(e.certainty!=='confirmed'||!e.evidence.length||e.evidence.some(x=>!graph.evidence.has(x))));
  return ingredients.length>0 && ancestors.every(x=>x.certainty==='confirmed') && !ancestors.some(x=>graph.uncertainTargets.has(x.nodeId)) && !uncertainBranch ? 'PASS':'UNKNOWN';
}
export function evaluateAssertions(graph:Graph,ids:AssertionId[],trace:TraceEntry[],warehouseIds:string[],interventions:Intervention[]):AssertionResult[]{
  const shipments=trace.map(x=>graph.nodes.get(x.nodeId)!).filter(n=>n.kind==='shipment');
  return ids.map(id=>{
    const counterexamples:AssertionResult['counterexamples']=[];let checked=0,passed=0,failed=false,unknown=false;
    const check=(ok:boolean|null,nodeIds:string[],message:string,evidence:string[])=>{checked++;if(ok===true){passed++;return;}if(ok===false)failed=true;else unknown=true;counterexamples.push(gap(id,message,nodeIds,evidence));};
    if(id==='ingredient-origin')for(const n of graph.nodes.values())if(n.kind==='product')check(originState(graph,n)==='PASS'?true:null,[n.id],'Ingredient origin cannot be established for every recorded branch.',n.evidence);
    if(id==='shipment-destination')for(const n of shipments){const d=n.destinationId?graph.nodes.get(n.destinationId):undefined;const edge=graph.edges.find(e=>e.from===n.id&&e.to===n.destinationId&&e.relation==='delivers');check(!n.destinationId?false:d?.kind!=='destination'||!d.evidence.length||d.evidence.some(x=>!graph.evidence.has(x))||!edge||edge.certainty!=='confirmed'||!edge.evidence.length||edge.evidence.some(x=>!graph.evidence.has(x))?null:true,[n.id,...(n.destinationId?[n.destinationId]:[])],!n.destinationId?'Affected shipment has no recorded destination.':'Destination reference lacks a confirmed documentary delivery link.',n.evidence);}
    if(id==='shipment-lot')for(const n of shipments){const edges=graph.edges.filter(e=>e.to===n.id&&e.relation==='ships');check(!n.lotId?false:graph.nodes.get(n.lotId)?.kind!=='product'||!graph.nodes.get(n.lotId)!.evidence.length||graph.nodes.get(n.lotId)!.evidence.some(x=>!graph.evidence.has(x))?null:edges.some(e=>e.from!==n.lotId)?false:edges.some(e=>e.from===n.lotId&&e.certainty==='confirmed'&&e.evidence.length>0&&e.evidence.every(x=>graph.evidence.has(x)))?true:null,[n.id,...(n.lotId?[n.lotId]:[])],!n.lotId?'Shipment lot identifier is missing.':'Shipment lot identifier is contradictory or insufficiently evidenced.',n.evidence);}
    if(id==='warehouse-owner')for(const warehouseId of warehouseIds){const n=graph.nodes.get(warehouseId)!;const assignment=interventions.find(x=>x.type==='assign-owner'&&x.targetId===n.id&&x.owner?.trim()&&x.evidence.length&&x.evidence.every(e=>graph.evidence.has(e)));check(Boolean(n.owner?.trim()||assignment),[n.id],'No response owner is recorded for this affected warehouse.',n.evidence);}
    if(id==='quarantine-evidence')for(const action of interventions.filter(x=>x.type==='quarantine'))check(action.evidence.length>0&&action.evidence.every(e=>graph.evidence.has(e)),[action.id,action.targetId],'Simulated quarantine has no resolvable supporting evidence.',action.evidence);
    if(checked===0){unknown=true;counterexamples.push(gap(id,'No applicable records or simulated actions were evaluated; no pass is claimed.',[]));}
    return {id,title:titles[id],status:failed?'FAIL':unknown?'UNKNOWN':'PASS',checked,passed,counterexamples};
  });
}
