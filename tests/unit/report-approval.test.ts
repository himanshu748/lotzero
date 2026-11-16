import {expect, it} from 'vitest';
import {syntheticDataset} from '../../fixtures/synthetic/dataset';
import {DEFAULT_ASSERTIONS, type Snapshot, type JiraAction} from '../../src/contracts';
import {runDrill, reportMarkdown} from '../../src/graph/engine';
const result=runDrill(syntheticDataset,{sourceLotId:'ING-A19',hazard:'contamination',at:'2026-10-28T09:00:00Z',assertions:DEFAULT_ASSERTIONS});
const proposal:JiraAction={id:'proposal-1',summary:'Destination gap',description:'Synthetic',recordIds:['SHIP-002'],evidence:['EV-MASTER']};
const snapshot:Snapshot={id:'report',createdAt:'2026-11-16T09:00:00Z',initiator:'test',dataset:syntheticDataset,result,actions:[]};
it.each([undefined,'failed','uncertain'] as const)('does not label %s proposals as approved or created',status=>{
 const text=reportMarkdown({...snapshot,actions:[{...proposal,status}]});
 expect(text).toContain('Jira proposals and creation receipts');
 expect(text).not.toContain('Approved Jira actions');
 expect(text).toContain('No successful Jira issue creation is recorded');
});
it('retains mixed proposal and confirmed receipt states',()=>{
 const text=reportMarkdown({...snapshot,actions:[proposal,{...proposal,id:'created',status:'created',issueKey:'LZR-1'}]});
 expect(text).toContain('preview; issue not created');
 expect(text).toContain('created; issue LZR-1');
 expect(text).not.toContain('No successful Jira issue creation is recorded');
});
