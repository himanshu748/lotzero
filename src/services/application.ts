import {createHash,randomUUID} from 'node:crypto';
import {z} from 'zod';
import type {Bootstrap,Dataset,JiraAction,Snapshot} from '../contracts';
import type {Store} from '../storage/port';
import {JiraError,type JiraGateway} from '../integrations/port';
import {validateDataset,scenarioSchema,interventionSchema} from '../schemas/dataset';
import {runDrill} from '../graph/engine';
import {syntheticDataset} from '../../fixtures/synthetic/dataset';
import {suggestActions} from './actions';
import {isNorthstarSample} from '../scenarios/sample';
const id=z.string().regex(/^[A-Za-z0-9_-]{1,100}$/);
const projectKey=z.string().regex(/^[A-Z][A-Z0-9_]{1,49}$/);
const requestSchema=z.object({snapshotId:id,projectKey,issueTypeId:z.string().regex(/^\d+$/),actionIds:z.array(id).min(1).max(5).refine(a=>new Set(a).size===a.length),approved:z.literal(true),receiptsOnly:z.literal(true).optional()}).strict();
export interface ActorContext {accountId?:string;extension?:{project?:{id?:string;key?:string}}}
export type MutationRunner = <T>(work:()=>Promise<T>)=>Promise<T>;
export class Application {
  constructor(private store:Store,private jira:JiraGateway,private now:()=>string=()=>new Date().toISOString(),private uuid:()=>string=randomUUID,private runMutation:MutationRunner=work=>work()){}
  private async scope(context:ActorContext,admin=false){
    if(!context.accountId)throw new Error('Authenticated Jira user required.');
    const raw=context.extension?.project?.id??context.extension?.project?.key;
    if(!raw||!id.safeParse(raw).success)throw new Error('Open LotZero from a Jira project page.');
    const project=await this.jira.project(raw);
    if(!await this.jira.permission(project.key,'BROWSE_PROJECTS'))throw new Error('Jira project access denied.');
    if(admin&&!await this.jira.permission(project.key,'ADMINISTER_PROJECTS'))throw new Error('Project administrator permission is required to change or delete datasets.');
    return {prefix:`p:${project.id}:`,project,actor:context.accountId};
  }
  private async mutate<T>(context:ActorContext,work:()=>Promise<T>,allowReset=false):Promise<T>{
    const {prefix,actor}=await this.scope(context);
    return this.runMutation(()=>this.mutateProject(prefix,actor,work,allowReset));
  }
  private async mutateProject<T>(prefix:string,actor:string,work:()=>Promise<T>,allowReset=false):Promise<T>{
    const key=`${prefix}mutation-lock`;
    if(!await this.store.claim(key,{actor,at:this.now()}))throw new Error('A project update is in progress. If an invocation was interrupted, an administrator must reconcile Jira outcomes before clearing the project mutation lock.');
    try{
      if(!allowReset&&await this.store.get(`${prefix}resetting`))throw new Error('Project data deletion is incomplete. A project administrator must repeat Delete data to finish before new changes.');
      return await work();
    }finally{await this.store.delete(key);}
  }
  seed(context:ActorContext){return this.mutate(context,()=>this.seedLocked(context));}
  importDataset(context:ActorContext,payload:unknown){return this.mutate(context,()=>this.importDatasetLocked(context,payload));}
  saveDrill(context:ActorContext,payload:unknown){return this.mutate(context,()=>this.saveDrillLocked(context,payload));}
  createActions(context:ActorContext,payload:unknown){return this.mutate(context,()=>this.createActionsLocked(context,payload));}
  deleteData(context:ActorContext,payload:unknown){return this.mutate(context,()=>this.deleteDataLocked(context,payload),true);}
  reconcileAction(context:ActorContext,payload:unknown){return this.mutate(context,()=>this.reconcileLocked(context,payload));}
  async recoverProjectLock(context:ActorContext,payload:unknown){
    z.object({confirmation:z.literal('RECOVER')}).strict().parse(payload);
    const {prefix,actor}=await this.scope(context,true);
    return this.runMutation(()=>this.recoverProjectLockLocked(prefix,actor,context));
  }
  private async recoverProjectLockLocked(prefix:string,actor:string,context:ActorContext){
    const recoveryKey=`${prefix}recovery-lock`;
    if(!await this.store.claim(recoveryKey,{at:this.now(),actor}))throw new Error('Another recovery is active.');
    try{
      const lock=await this.store.get<{at:string}>(`${prefix}mutation-lock`);
      if(!lock)throw new Error('No abandoned mutation lock exists.');
      const age=Date.parse(this.now())-Date.parse(lock.at);
      if(!Number.isFinite(age)||age<300_000)throw new Error('Wait at least five minutes after the interrupted invocation before recovery.');
      await this.audit(prefix,actor,'Recovered an abandoned project mutation lock; Jira action claims retained');
      await this.store.delete(`${prefix}mutation-lock`);
    }finally{await this.store.delete(recoveryKey);}
    return this.bootstrap(context);
  }
  private async reconcileLocked(context:ActorContext,payload:unknown){
    const data=z.object({snapshotId:id,actionId:id,issueKey:z.string().regex(/^[A-Z][A-Z0-9_]*-\d+$/)}).strict().parse(payload);
    const {prefix,actor}=await this.scope(context,true);
    const key=`${prefix}receipt:${data.snapshotId}:${data.actionId}`;
    const action=await this.store.get<JiraAction>(key);
    if(!action||action.status!=='uncertain')throw new Error('No uncertain receipt to reconcile.');
    const claim=await this.store.get<{marker:string}>(`${prefix}claim:${data.snapshotId}:${data.actionId}`);
    if(!claim)throw new Error('Approval marker is missing.');
    const verified=await this.jira.verifyIssue(data.issueKey,claim.marker);
    const {error:_,...original}=action;
    const receipt:JiraAction={...original,status:'created',issueKey:verified.key,issueUrl:verified.url};
    await this.store.set(key,receipt);await this.audit(prefix,actor,`Reconciled ${data.snapshotId}/${data.actionId} to ${verified.key}`);
    return receipt;
  }
  private async audit(prefix:string,actor:string,event:string){await this.store.set(`${prefix}audit:${this.now()}:${this.uuid()}`,{at:this.now(),actor,event},90);}
  private async hydrate(prefix:string,snapshot:Snapshot){
    const receipts=await this.store.list<JiraAction>(`${prefix}receipt:${snapshot.id}:`);
    return {...snapshot,actions:receipts.map(r=>r.value).sort((a,b)=>a.id.localeCompare(b.id))};
  }
  async bootstrap(context:ActorContext):Promise<Bootstrap>{
    const {prefix,project}=await this.scope(context);
    const records=await this.store.list<Snapshot>(`${prefix}snapshot:`);
    const snapshots=await Promise.all(records.map(r=>r.value).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).slice(0,25).map(s=>this.hydrate(prefix,s)));
    const audit=(await this.store.list<{at:string;actor:string;event:string}>(`${prefix}audit:`)).map(r=>r.value).sort((a,b)=>b.at.localeCompare(a.at)).slice(0,50);
    return {mode:'forge',dataset:await this.store.get<Dataset>(`${prefix}dataset`)??null,snapshots,project,audit};
  }
  private async seedLocked(context:ActorContext){
    const {prefix,actor}=await this.scope(context,true);
    const existing=await this.store.get<Dataset>(`${prefix}dataset`);
    if(existing){
      if(isNorthstarSample(existing))return this.bootstrap(context);
      throw new Error('A dataset already exists. The Northstar sample will not replace your records. Define a drill using the current dataset.');
    }
    if(!await this.store.claim(`${prefix}dataset`,syntheticDataset))throw new Error('A dataset was loaded by another request. Refresh the workspace before continuing; no records were replaced.');
    await this.audit(prefix,actor,'Loaded synthetic dataset');return this.bootstrap(context);
  }
  private async importDatasetLocked(context:ActorContext,payload:unknown){
    const data=z.object({dataset:z.unknown()}).strict().parse(payload);
    const dataset=validateDataset(data.dataset);
    const {prefix,actor}=await this.scope(context,true);
    await this.store.set(`${prefix}dataset`,dataset); await this.audit(prefix,actor,`Imported dataset ${dataset.version}`); return this.bootstrap(context);
  }
  private async saveDrillLocked(context:ActorContext,payload:unknown):Promise<Snapshot>{
    const data=z.object({scenario:scenarioSchema,interventions:z.array(interventionSchema).max(30),expectedFingerprint:z.string().min(1).max(100)}).strict().parse(payload);
    const {prefix,actor}=await this.scope(context);
    const dataset=await this.store.get<Dataset>(`${prefix}dataset`); if(!dataset)throw new Error('Load a dataset first.');
    const records=await this.store.list<Snapshot>(`${prefix}snapshot:`);if(records.length>=25)throw new Error('25 saved drills reached. Export and delete project data before saving more.');
    const result=runDrill(dataset,data.scenario,data.interventions);
    if(result.fingerprint!==data.expectedFingerprint)throw new Error('The dataset changed after this drill was reviewed. Run a fresh drill before saving.');
    const snapshot:Snapshot={id:this.uuid(),createdAt:this.now(),initiator:actor,dataset,result,actions:[]};
    if(Buffer.byteLength(JSON.stringify(snapshot),'utf8')>230_000)throw new Error('Drill snapshot exceeds storage limit. Reduce the dataset.');
    await this.store.set(`${prefix}snapshot:${snapshot.id}`,snapshot,90);
    await this.audit(prefix,actor,`Saved drill ${snapshot.id}`);return snapshot;
  }
  async previewActions(context:ActorContext,payload:unknown){
    const {snapshotId}=z.object({snapshotId:id}).strict().parse(payload);
    const {prefix}=await this.scope(context);
    const snapshot=await this.store.get<Snapshot>(`${prefix}snapshot:${snapshotId}`);if(!snapshot)throw new Error('Drill not found in this project.');
    const hydrated=await this.hydrate(prefix,snapshot);
    return suggestActions(snapshot).map(action=>hydrated.actions.find(a=>a.id===action.id)??action);
  }
  async listProjects(context:ActorContext){await this.scope(context);return this.jira.projects();}
  async issueTypes(context:ActorContext,payload:unknown){
    const data=z.object({projectKey}).strict().parse(payload);await this.scope(context);
    if(!await this.jira.permission(data.projectKey,'CREATE_ISSUES'))throw new Error('No permission to create issues in the selected project.');
    return this.jira.issueTypes(data.projectKey);
  }
  private async createActionsLocked(context:ActorContext,payload:unknown){
    const data=requestSchema.parse(payload);
    const {prefix,actor}=await this.scope(context);
    if(!await this.jira.permission(data.projectKey,'BROWSE_PROJECTS')||!await this.jira.permission(data.projectKey,'CREATE_ISSUES'))throw new Error('Jira target project permission denied.');
    const snapshot=await this.store.get<Snapshot>(`${prefix}snapshot:${data.snapshotId}`);if(!snapshot)throw new Error('Drill not found in this project.');
    const suggestions=suggestActions(snapshot);if(data.actionIds.some(i=>!suggestions.some(a=>a.id===i)))throw new Error('Unknown suggested action. Refresh the saved drill.');
    await this.jira.validateIssueType(data.projectKey,data.issueTypeId);
    // A receipt check exercises the retry path but must never recreate a missing receipt.
    if(data.receiptsOnly){
      for(const actionId of data.actionIds){
        const receipt=await this.store.get<JiraAction>(`${prefix}receipt:${snapshot.id}:${actionId}`);
        if(receipt?.status!=='created'||!receipt.issueKey)throw new Error('Saved creation receipt is missing. No Jira issue was requested.');
      }
    }
    const results:JiraAction[]=[];
    for(const actionId of data.actionIds){
      const action=suggestions.find(a=>a.id===actionId)!;
      // Target project/type cannot be changed to bypass a previously claimed snapshot action.
      const key=`${prefix}receipt:${snapshot.id}:${actionId}`;const claimKey=`${prefix}claim:${snapshot.id}:${actionId}`;
      const existing=await this.store.get<JiraAction>(key);
      if(existing?.status==='created'||existing?.status==='uncertain'){results.push(existing);continue;}
      const marker=`lotzero-${createHash('sha256').update(`${prefix}${snapshot.id}:${actionId}`).digest('hex').slice(0,24)}`;
      const uncertain:JiraAction={...action,status:'uncertain',error:`Outcome pending or unknown. Search Jira label ${marker}; do not recreate automatically.`};
      if(!await this.store.claim(claimKey,{actor,at:this.now(),project:data.projectKey,type:data.issueTypeId,marker})){
        results.push(await this.store.get<JiraAction>(key)??uncertain);continue;
      }
      // Persist uncertainty and approval BEFORE crossing the Jira boundary.
      await this.store.set(key,uncertain);await this.audit(prefix,actor,`Approved ${snapshot.id}/${actionId} for ${data.projectKey}; ${marker}`);
      let receipt:JiraAction;
      try{
        const created=await this.jira.create(data.projectKey,data.issueTypeId,action,marker);
        receipt={...action,status:'created',issueKey:created.key,issueUrl:created.url};
      }catch(error){
        if(error instanceof JiraError&&error.definiteRejection){
          receipt={...action,status:'failed',error:error.message};
          await this.store.set(key,receipt);await this.store.delete(claimKey);
        }else receipt={...uncertain,error:`${uncertain.error} ${error instanceof JiraError?error.message:'No confirmed Jira response.'}`};
      }
      await this.store.set(key,receipt);await this.audit(prefix,actor,`${snapshot.id}/${actionId}: ${receipt.status}`);results.push(receipt);
    }
    return results;
  }
  private async deleteDataLocked(context:ActorContext,payload:unknown){
    z.object({confirmation:z.literal('DELETE')}).strict().parse(payload);
    const {prefix}=await this.scope(context,true);
    // Do not race an active approval. Unknown outcomes require reconciliation before reset.
    const receipts=await this.store.list<JiraAction>(`${prefix}receipt:`);
    if(receipts.some(r=>r.value.status==='uncertain'))throw new Error('Unresolved Jira outcomes must be reconciled before deleting project data.');
    await this.store.set(`${prefix}resetting`,{at:this.now()});
    await this.store.deletePrefix(prefix,[`${prefix}mutation-lock`,`${prefix}resetting`]);
    await this.store.delete(`${prefix}resetting`);
    return this.bootstrap(context);
  }
}
