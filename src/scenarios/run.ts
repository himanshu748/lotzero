import type { Comparison, Dataset, DrillResult, Intervention, Scenario } from '../contracts';
import { buildGraph, lexical, fingerprint, gap, ordered, stable, traverse } from '../graph/core';
import { validateInterventions, validateScenario } from '../schemas/dataset';
import { evaluateAssertions, originState } from '../assertions/evaluate';
import { simulate } from './simulate';
import { normalizeQuantity } from '../graph/quantities';
export function runDrill(input:Dataset,inputScenario:Scenario,inputInterventions:Intervention[]=[]):DrillResult{
  const graph=buildGraph(input),dataset=graph.dataset,scenario=validateScenario(inputScenario),interventions=validateInterventions(inputInterventions);
  const source=graph.nodes.get(scenario.sourceLotId);if(!source||source.kind!=='ingredient')throw new Error('Scenario source must be an existing ingredient lot');
  for(const action of interventions){if(Date.parse(action.at)<Date.parse(scenario.at))throw new Error('Intervention cannot predate the scenario timestamp');const target=graph.nodes.get(action.targetId);if(!target)throw new Error(`Unknown intervention target ${action.targetId}`);if(action.type==='quarantine'&&target.kind!=='warehouse')throw new Error('Quarantine target must be a warehouse');if(action.type==='hold'&&target.kind!=='shipment')throw new Error('Hold target must be a shipment');if(action.type==='assign-owner'&&!action.owner?.trim())throw new Error('Owner assignment needs an owner');}
  const trace=traverse(graph,source.id,'forward');
  const affectedProductIds=trace.filter(x=>graph.nodes.get(x.nodeId)?.kind==='product').map(x=>x.nodeId),affectedShipmentIds=trace.filter(x=>graph.nodes.get(x.nodeId)?.kind==='shipment').map(x=>x.nodeId);
  const shipments=affectedShipmentIds.map(id=>graph.nodes.get(id)!);
  const warehouseIds=ordered([...trace.filter(x=>graph.nodes.get(x.nodeId)?.kind==='warehouse').map(x=>x.nodeId),...shipments.flatMap(s=>s.warehouseId&&graph.nodes.get(s.warehouseId)?.kind==='warehouse'?[s.warehouseId]:[])]);
  const unresolved=new Set(trace.filter(x=>x.certainty==='unknown').map(x=>x.nodeId));
  for(const n of graph.nodes.values())if(n.kind==='product'&&originState(graph,n)==='UNKNOWN')for(const e of traverse(graph,n.id,'forward'))unresolved.add(e.nodeId);
  for(const id of graph.uncertainTargets)for(const e of traverse(graph,id,'forward'))unresolved.add(e.nodeId);
  const assertions=evaluateAssertions(graph,scenario.assertions,trace,warehouseIds,interventions);
  const gaps=[...graph.gaps,...assertions.flatMap(x=>x.counterexamples.filter(g=>g.recordIds.length>0))];
  for(const shipment of shipments)if(!shipment.quantity)gaps.push(gap('unknown-quantity','Affected shipment quantity is missing; totals exclude it.',[shipment.id],shipment.evidence));
  const totals=new Map<string,{unit:string;value:number;recordIds:string[]}>();
  for(const shipment of shipments){if(!shipment.quantity)continue;const normalized=normalizeQuantity(shipment.quantity),unit=normalized.unit;const total=totals.get(unit)??{unit,value:0,recordIds:[]};total.value+=normalized.value;total.recordIds.push(shipment.id);totals.set(unit,total);}
  const canonical={...dataset,nodes:[...dataset.nodes].sort((a,b)=>lexical(stable(a),stable(b))),edges:[...dataset.edges].sort((a,b)=>lexical(stable(a),stable(b))),evidence:[...dataset.evidence].sort((a,b)=>lexical(stable(a),stable(b)))};
  const fp=fingerprint(canonical),id=`DRILL-${fingerprint({dataset:canonical,scenario:{...scenario,assertions:[...scenario.assertions].sort()},interventions:[...interventions].sort((a,b)=>lexical(a.id,b.id))}).toUpperCase()}`;
  return {id,fingerprint:fp,datasetVersion:dataset.version,scenario,trace,gaps:[...new Map(gaps.map(g=>[g.id,g])).values()].sort((a,b)=>lexical(a.id,b.id)),assertions,affectedProductIds,affectedShipmentIds,warehouseIds,unknownRecordIds:[...unresolved].sort(),quantities:[...totals.values()].map(q=>({...q,value:Number(q.value.toPrecision(12)),recordIds:q.recordIds.sort()})).sort((a,b)=>lexical(a.unit,b.unit)),interventions,simulation:simulate(shipments,scenario,interventions,graph)};
}
export function compareDrills(before:DrillResult,after:DrillResult):Comparison{
  if(before.scenario.sourceLotId!==after.scenario.sourceLotId||before.scenario.hazard!==after.scenario.hazard||before.scenario.at!==after.scenario.at||[...before.scenario.assertions].sort().join()!==[...after.scenario.assertions].sort().join())throw new Error('Comparison requires the same source, hazard, timestamp, and assertion set');
  const improved:string[]=[],regressed:string[]=[],unchanged:string[]=[];
  for(const a of after.assertions){const b=before.assertions.find(x=>x.id===a.id)!;if(a.status==='PASS'&&b.status!=='PASS')improved.push(a.id);else if(b.status==='PASS'&&a.status!=='PASS')regressed.push(a.id);else if(a.status!==b.status){ // FAIL↔UNKNOWN cannot by itself demonstrate improved readiness.
      unchanged.push(`${a.id}: ${b.status} → ${a.status}; unresolved`);
    }else unchanged.push(a.id);}
  return {improved:improved.sort(),regressed:regressed.sort(),unchanged:unchanged.sort(),addedShipments:after.affectedShipmentIds.filter(id=>!before.affectedShipmentIds.includes(id)),removedShipments:before.affectedShipmentIds.filter(id=>!after.affectedShipmentIds.includes(id))};
}
