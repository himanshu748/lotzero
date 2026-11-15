import type { Intervention, RecordNode, Scenario, Simulation } from '../contracts';
import { lexical, type Graph } from '../graph/core';
import { normalizeQuantity } from '../graph/quantities';
export function simulate(shipments:RecordNode[],scenario:Scenario,interventions:Intervention[],graph:Graph):Simulation{
  const historicalShipmentIds:string[]=[],preventableShipmentIds:string[]=[],remainingShipmentIds:string[]=[],notes:string[]=[];
  const at=Date.parse(scenario.at),stockRemaining=new Map<string,number>();
  // Allocate explicit recorded stock in scheduled movement order. Equal times use stable IDs.
  const orderedShipments=[...shipments].sort((a,b)=>(a.occurredAt?Date.parse(a.occurredAt):Infinity)-(b.occurredAt?Date.parse(b.occurredAt):Infinity)||lexical(a.id,b.id));
  for(const shipment of orderedShipments){
    const when=shipment.occurredAt?Date.parse(shipment.occurredAt):NaN;
    if(shipment.state==='shipped'||Number.isFinite(when)&&when<=at){historicalShipmentIds.push(shipment.id);continue;}
    let preventable=false;
    const stock=graph.edges.filter(e=>e.relation==='stores'&&e.from===shipment.lotId&&e.to===shipment.warehouseId);
    const origins=graph.edges.filter(e=>e.relation==='ships'&&e.to===shipment.id);
    const stockEntry=stock[0],quantity=shipment.quantity?normalizeQuantity(shipment.quantity):undefined,available=stockEntry?.quantity?normalizeQuantity(stockEntry.quantity):undefined;
    const validStock=stock.length===1&&stockEntry.certainty==='confirmed'&&stockEntry.evidence.length>0&&stockEntry.evidence.every(x=>graph.evidence.has(x))&&origins.length===1&&origins[0].from===shipment.lotId&&origins[0].certainty==='confirmed'&&origins[0].evidence.length>0&&origins[0].evidence.every(x=>graph.evidence.has(x))&&Boolean(quantity&&available?.unit===quantity.unit);
    const stockKey=`${shipment.lotId}:${shipment.warehouseId}`;
    const remaining=stockRemaining.get(stockKey)??available?.value??NaN;
    const coversWholeShipment=Boolean(validStock&&quantity&&Number.isFinite(remaining)&&remaining>=quantity.value);
    const effective=interventions.filter(action=>Date.parse(action.at)>=at&&Date.parse(action.at)<when&&action.evidence.length>0&&action.evidence.every(x=>graph.evidence.has(x)));
    if(shipment.state==='planned'&&Number.isFinite(when)&&when>at&&shipment.quantity&&shipment.quantity.value>0){
      if(effective.some(a=>a.type==='hold'&&a.targetId===shipment.id))preventable=true;
      else if(effective.some(a=>a.type==='quarantine'&&a.targetId===shipment.warehouseId)){
        if(coversWholeShipment)preventable=true;
        else notes.push(`${shipment.id}: unique evidenced stock, usable lot, compatible quantity, or sufficient remaining stock is missing; whole-shipment quarantine prevention is unknown.`);
      }
    }else if(!shipment.quantity||shipment.quantity.value<=0)notes.push(`${shipment.id}: positive shipment quantity is unknown; prevention is not claimed.`);
    // Reserve stock for every scheduled movement, including movements before a proposed control.
    // Unknown earlier quantities invalidate the remaining budget rather than assuming zero consumption.
    if(shipment.state==='planned'&&Number.isFinite(when)&&when>at){
      stockRemaining.set(stockKey,validStock&&quantity&&Number.isFinite(remaining)?Math.max(0,remaining-quantity.value):NaN);
    }
    if(preventable)preventableShipmentIds.push(shipment.id);else remainingShipmentIds.push(shipment.id);
    if(!Number.isFinite(when)||!shipment.state)notes.push(`${shipment.id}: unknown timing/state; not counted as preventable.`);
  }
  for(const action of interventions){
    if(action.type==='investigate')notes.push(`${action.targetId}: investigation proposed; no missing record is invented or repaired.`);
    if(action.type==='assign-owner')notes.push(`${action.targetId}: owner assignment is a simulation, not a Jira assignment or dataset edit.`);
    if(!action.evidence.length||action.evidence.some(e=>!graph.evidence.has(e)))notes.push(`${action.id}: missing evidence; control is not counted as effective.`);
  }
  notes.push('Simulated controls only. Already shipped and elapsed movements remain historical exposure. No shipment is actually held.');
  notes.push('Quarantine assumes each stores relationship quantity is remaining stock as of scenario time; no yield or inventory conservation is inferred. Whole shipments only, allocated by scheduled timestamp then identifier.');
  return {historicalShipmentIds:historicalShipmentIds.sort(),preventableShipmentIds:preventableShipmentIds.sort(),remainingShipmentIds:remainingShipmentIds.sort(),notes:notes.sort()};
}
