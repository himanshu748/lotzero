import type { Certainty, Dataset, Gap, RecordEdge, RecordNode, TraceEntry } from '../contracts';
import { validateDataset } from '../schemas/dataset';
export const lexical = (a:string,b:string) => a<b?-1:a>b?1:0;
export const ordered = (items:string[]) => [...new Set(items)].sort();
export const stable = (value:unknown):string => JSON.stringify(value,(_,v)=>v && typeof v==='object' && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
/** FNV-1a identification checksum. Not a cryptographic authenticity or security guarantee. */
export function fingerprint(value:unknown):string { let hash=2166136261;for(const c of stable(value)){hash^=c.charCodeAt(0);hash=Math.imul(hash,16777619);}return (hash>>>0).toString(16).padStart(8,'0'); }
export const gap = (code:string, message:string, recordIds:string[], evidence:string[]=[]):Gap => ({id:`${code}:${ordered(recordIds).join(':')}`,code,message,recordIds:ordered(recordIds),evidence:ordered(evidence)});
const rank:Record<Certainty,number>={unknown:0,potential:1,confirmed:2};
export const weakest = (...c:Certainty[]):Certainty => c.reduce((a,b)=>rank[a]<rank[b]?a:b,'confirmed');
const allowed:Record<RecordEdge['relation'],string[]>={supplies:['supplier:ingredient'],consumes:['ingredient:batch','product:batch','ingredient:transformation','product:transformation'],produces:['batch:product','transformation:product'],repackages:['product:transformation','product:product'],stores:['product:warehouse'],ships:['product:shipment'],delivers:['shipment:destination']};
export interface Graph {dataset:Dataset;nodes:Map<string,RecordNode>;edges:RecordEdge[];out:Map<string,RecordEdge[]>;incoming:Map<string,RecordEdge[]>;gaps:Gap[];ambiguous:Set<string>;evidence:Set<string>;uncertainTargets:Set<string>}
export function buildGraph(input:Dataset):Graph {
  const dataset=validateDataset(input);const nodes=new Map<string,RecordNode>(),ambiguous=new Set<string>(),gaps:Gap[]=[],uncertainTargets=new Set<string>();
  for(const node of [...dataset.nodes].sort((a,b)=>lexical(stable(a),stable(b)))){
    if(nodes.has(node.id)){ambiguous.add(node.id);gaps.push(gap('duplicate-node','Duplicate node identifier; record identity is uncertain.',[node.id],node.evidence));}else nodes.set(node.id,node);
  }
  const evidence=new Set<string>(),evidenceGroups=new Map<string,typeof dataset.evidence>();
  for(const e of dataset.evidence)evidenceGroups.set(e.id,[...(evidenceGroups.get(e.id)??[]),e]);
  for(const [id,records] of evidenceGroups){
    if(records.length>1)gaps.push(gap('duplicate-evidence','Duplicate documentary evidence identifier.',[id]));
    if(records.some(e=>stable(e)!==stable(records[0]))){gaps.push(gap('conflicting-evidence','Conflicting documentary references cannot establish a confirmed association.',[id]));continue;}
    evidence.add(id);
  }
  for(const n of nodes.values()){
    if(n.evidence.length===0 || n.evidence.some(e=>!evidence.has(e)))gaps.push(gap('missing-evidence','Record has missing or unresolved documentary evidence.',[n.id],n.evidence));
    if(n.kind==='shipment'){
      if(!n.warehouseId)gaps.push(gap('missing-warehouse','Shipment warehouse is not recorded; warehouse response coverage is incomplete.',[n.id],n.evidence));
      for(const [field,kind] of [['warehouseId','warehouse'],['destinationId','destination'],['lotId','product']] as const){
        const ref=n[field];if(ref && nodes.get(ref)?.kind!==kind)gaps.push(gap('invalid-reference',`Shipment ${field} does not resolve to a ${kind}.`,[n.id,ref],n.evidence));
      }
      if(!n.occurredAt||!n.state)gaps.push(gap('unknown-movement-time','Shipment time or movement state is missing; prevention cannot be determined.',[n.id],n.evidence));
    }
  }
  const byEdge=new Map<string,RecordEdge[]>();for(const e of dataset.edges)byEdge.set(e.id,[...(byEdge.get(e.id)??[]),e]);
  const edges:RecordEdge[]=[];
  for(const [id,items] of [...byEdge].sort(([a],[b])=>lexical(a,b))){
    const e=[...items].sort((a,b)=>lexical(stable(a),stable(b)))[0];
    if(items.length>1){gaps.push(gap('duplicate-edge','Duplicate relationship identifier; identical records counted once.',[id,e.from,e.to],e.evidence));
      if(items.some(x=>stable(x)!==stable(e))){for(const item of items)uncertainTargets.add(item.to);gaps.push(gap('conflicting-edge','Conflicting duplicate relationship is excluded from definite association.',[id,...items.flatMap(x=>[x.from,x.to])],items.flatMap(x=>x.evidence)));continue;}}
    const from=nodes.get(e.from),to=nodes.get(e.to);
    if(!from||!to){gaps.push(gap('broken-link','Relationship references a missing record. Downstream safety cannot be inferred.',[e.id,e.from,e.to],e.evidence));if(to)uncertainTargets.add(to.id);continue;}
    if(!allowed[e.relation].includes(`${from.kind}:${to.kind}`)){gaps.push(gap('invalid-relationship',`Invalid ${e.relation} relationship between ${from.kind} and ${to.kind}.`,[e.id,e.from,e.to],e.evidence));uncertainTargets.add(to.id);continue;}
    if(!e.evidence.length || e.evidence.some(x=>!evidence.has(x)))gaps.push(gap('missing-evidence','Relationship has missing or unresolved documentary evidence.',[e.id,e.from,e.to],e.evidence));
    if(e.certainty!=='confirmed')gaps.push(gap('ambiguous-link',`Relationship is recorded as ${e.certainty}.`,[e.id,e.from,e.to],e.evidence));
    if(e.relation==='ships' && to.lotId && to.lotId!==from.id)gaps.push(gap('contradictory-lot','Shipment lot identifier contradicts its shipping relationship.',[e.id,e.from,e.to,to.lotId],e.evidence));
    edges.push(e);
  }
  const out=new Map<string,RecordEdge[]>(),incoming=new Map<string,RecordEdge[]>();
  for(const e of edges){out.set(e.from,[...(out.get(e.from)??[]),e]);incoming.set(e.to,[...(incoming.get(e.to)??[]),e]);}
  // Iterative DFS: no recursion and at most one scan of each edge for cycle detection.
  const color=new Map<string,number>();
  for(const id of [...nodes.keys()].sort()){
    if(color.has(id))continue; const stack:{id:string;index:number}[]=[{id,index:0}];color.set(id,1);
    while(stack.length){const top=stack[stack.length-1],list=out.get(top.id)??[];
      if(top.index>=list.length){color.set(top.id,2);stack.pop();continue;}
      const e=list[top.index++];if(color.get(e.to)===1){gaps.push(gap('cycle','Cycle in material genealogy; traversal is bounded and does not imply extra quantity.',[e.id,e.from,e.to],e.evidence));uncertainTargets.add(e.from);uncertainTargets.add(e.to);}
      else if(!color.has(e.to)){color.set(e.to,1);stack.push({id:e.to,index:0});}
    }
  }
  return {dataset,nodes,edges,out,incoming,gaps:[...new Map(gaps.map(g=>[g.id,g])).values()].sort((a,b)=>lexical(a.id,b.id)),ambiguous,evidence,uncertainTargets};
}
function nodeCertainty(graph:Graph,node:RecordNode):Certainty{return graph.ambiguous.has(node.id)||graph.uncertainTargets.has(node.id)||!node.evidence.length||node.evidence.some(e=>!graph.evidence.has(e))?'unknown':'confirmed';}
export function traverse(graph:Graph,startId:string,direction:'forward'|'backward'):TraceEntry[]{
  const first=graph.nodes.get(startId);if(!first)throw new Error(`Unknown source record ${startId}`);
  const start:TraceEntry={nodeId:startId,certainty:nodeCertainty(graph,first),path:[startId],edgeIds:[],evidence:ordered(first.evidence)};
  const found=new Map<string,TraceEntry>([[startId,start]]),queue=[start];let steps=0;
  for(let i=0;i<queue.length;i++){
    if(++steps>graph.nodes.size*4)throw new Error('Traversal work bound exceeded');
    const current=queue[i];if(found.get(current.nodeId)!==current)continue;
    // Storage and delivery destinations are terminal physical associations, never contamination conduits.
    if(direction==='forward' && ['warehouse','destination'].includes(graph.nodes.get(current.nodeId)!.kind))continue;
    for(const e of (direction==='forward'?graph.out:graph.incoming).get(current.nodeId)??[]){
      const next=direction==='forward'?e.to:e.from;if(current.path.includes(next))continue;
      const node=graph.nodes.get(next)!;
      const edgeCertainty=!e.evidence.length||e.evidence.some(x=>!graph.evidence.has(x))?'unknown':e.certainty;
      const certainty=weakest(current.certainty,edgeCertainty,nodeCertainty(graph,node));const previous=found.get(next);
      if(previous && rank[previous.certainty]>=rank[certainty])continue;
      const entry={nodeId:next,certainty,path:[...current.path,next],edgeIds:[...current.edgeIds,e.id],evidence:ordered([...current.evidence,...e.evidence,...node.evidence])};found.set(next,entry);queue.push(entry);
    }
  }
  return [...found.values()].sort((a,b)=>lexical(a.nodeId,b.nodeId));
}
export function traceGraph(dataset:Dataset,startId:string,direction:'forward'|'backward'='forward'):TraceEntry[]{return traverse(buildGraph(dataset),startId,direction);}
