import { describe, expect, it } from 'vitest';
import { repairedDataset, syntheticDataset } from '../../fixtures/synthetic/dataset';
import { DEFAULT_ASSERTIONS, type AssertionId, type Dataset, type Intervention, type RecordEdge, type RecordNode, type Scenario } from '../../src/contracts';
import { runDrill } from '../../src/graph/engine';

const scenario:Scenario={sourceLotId:'ING-A19',hazard:'contamination',at:'2026-10-28T09:00:00Z',assertions:DEFAULT_ASSERTIONS};
const quarantine:Intervention={id:'CONTROL-1',type:'quarantine',targetId:'WH-NORTH',at:'2026-10-28T10:00:00Z',evidence:['EV-DRILL']};
const assertion=(data:Dataset,id:AssertionId,interventions:Intervention[]=[])=>runDrill(data,scenario,interventions).assertions.find(a=>a.id===id)!;

describe('origin completeness across every material branch',()=>{
  it.each<[RecordNode['kind'],RecordEdge['relation']]>([
    ['batch','produces'],['transformation','produces'],['product','repackages'],
  ])('does not let a known ingredient hide a %s branch without inputs', (kind,relation)=>{
    const data=structuredClone(repairedDataset);
    data.nodes.push({id:'MATERIAL-ORPHAN',kind,label:'Documented material with no inputs',evidence:['EV-MASTER']});
    data.edges.push({id:'ORPHAN-101',from:'MATERIAL-ORPHAN',to:'FG-101',relation,certainty:'confirmed',evidence:['EV-MASTER']});

    const result=runDrill(data,scenario);
    const origin=result.assertions.find(a=>a.id==='ingredient-origin')!;
    expect(origin.status).toBe('UNKNOWN');
    expect(origin.counterexamples.flatMap(g=>g.recordIds)).toEqual(expect.arrayContaining(['FG-101','FG-201']));
    expect(result.unknownRecordIds).toEqual(expect.arrayContaining(['FG-101','FG-201','SHIP-001','SHIP-002','SHIP-003']));
    expect(result.affectedShipmentIds).toEqual(runDrill(repairedDataset,scenario).affectedShipmentIds);

    data.edges.push({id:'ORPHAN-INPUT',from:kind==='product'?'BATCH-101':'ING-B01',to:'MATERIAL-ORPHAN',relation:kind==='product'?'produces':'consumes',certainty:'confirmed',evidence:['EV-MASTER']});
    expect(assertion(data,'ingredient-origin').status).toBe('PASS');
  });

  it('accepts evidenced ingredients as material roots without requiring supplier links',()=>{
    const data=structuredClone(repairedDataset);
    data.edges=data.edges.filter(edge=>edge.relation!=='supplies');
    expect(assertion(data,'ingredient-origin')).toMatchObject({status:'PASS',checked:5,passed:5});
  });
});

describe('assertions require unambiguous supporting identities',()=>{
  it('does not pass a documentary delivery link to a conflicting destination identity',()=>{
    const data=structuredClone(repairedDataset);
    data.nodes.push({...data.nodes.find(n=>n.id==='DEST-01')!,label:'Conflicting retailer identity'});
    const result=assertion(data,'shipment-destination');
    expect(result).toMatchObject({status:'UNKNOWN',checked:4,passed:2});
    expect(result.counterexamples.flatMap(g=>g.recordIds)).toEqual(expect.arrayContaining(['DEST-01','SHIP-001','SHIP-002']));
    data.nodes.reverse();
    expect(assertion(data,'shipment-destination')).toEqual(result);
  });

  it.each(['DEST-03',undefined])('does not choose a trusted destination from conflicting shipment records (%s)',destinationId=>{
    const data=structuredClone(repairedDataset);
    const duplicate={...data.nodes.find(n=>n.id==='SHIP-002')!};
    if(destinationId)duplicate.destinationId=destinationId;else delete duplicate.destinationId;
    data.nodes.push(duplicate);
    expect(assertion(data,'shipment-destination')).toMatchObject({status:'UNKNOWN',checked:4,passed:3});
    expect(assertion(data,'shipment-lot')).toMatchObject({status:'UNKNOWN',checked:4,passed:3});
  });

  it('does not pass a lot reference whose identity is ambiguous',()=>{
    const data=structuredClone(repairedDataset);
    data.nodes.push({...data.nodes.find(n=>n.id==='FG-101')!,label:'Conflicting product identity'});
    expect(assertion(data,'shipment-lot')).toMatchObject({status:'UNKNOWN',checked:4,passed:2});
  });

  it('does not assign an owner or validate a quarantine against an ambiguous warehouse identity',()=>{
    const data=structuredClone(repairedDataset);
    data.nodes.push({...data.nodes.find(n=>n.id==='WH-NORTH')!,owner:'Another recorded owner'});
    const assignment:Intervention={...quarantine,id:'CONTROL-OWNER',type:'assign-owner',owner:'Rehearsal coordinator'};
    expect(assertion(data,'warehouse-owner',[assignment])).toMatchObject({status:'UNKNOWN',checked:2,passed:1});
    expect(assertion(data,'quarantine-evidence',[quarantine])).toMatchObject({status:'UNKNOWN',checked:1,passed:0});
  });
});

describe('quarantine requires supported stock and movement identities',()=>{
  const missingSupport:[string,string][]=['SHIP-002','FG-101','WH-NORTH'].flatMap(id=>[
    [id,'missing evidence'],[id,'unresolved evidence'],[id,'ambiguous identity'],
  ] as [string,string][]);

  it.each(missingSupport)('does not credit prevention when %s has %s', (id,defect)=>{
    const data=structuredClone(syntheticDataset);
    const node=data.nodes.find(n=>n.id===id)!;
    if(defect==='ambiguous identity')data.nodes.push({...node,label:'Conflicting supporting identity'});
    else node.evidence=defect==='missing evidence'?[]:['EVIDENCE-NOT-RECORDED'];

    const result=runDrill(data,scenario,[quarantine]);
    expect(result.simulation.preventableShipmentIds).toEqual([]);
    expect(result.simulation.remainingShipmentIds).toContain('SHIP-002');
    expect(result.simulation.historicalShipmentIds).toEqual(['SHIP-001']);
    expect(result.affectedShipmentIds).toContain('SHIP-002');
    expect(result.simulation.notes.some(note=>note.startsWith('SHIP-002:')&&note.includes('unknown'))).toBe(true);
  });
});
