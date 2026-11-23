import api,{route} from '@forge/api';
import {z} from 'zod';
import {JiraError,type JiraGateway} from './port';
const projectSchema=z.object({id:z.string(),key:z.string(),name:z.string()});
async function bounded<T>(request:Promise<T>,ms=6000):Promise<T>{
  let timer:ReturnType<typeof setTimeout>|undefined;
  try{return await Promise.race([request,new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error('Jira request timed out')),ms);})]);}finally{if(timer)clearTimeout(timer);}
}
async function read<T>(request:()=>Promise<{ok:boolean;status:number;json:()=>Promise<unknown>}>,schema:z.ZodType<T>):Promise<T>{
  const response=await bounded(request());
  if(!response.ok)throw new JiraError(response.status===403?'Jira permission denied. Ask a project administrator for access.':response.status===429?'Jira rate limit reached. Wait before retrying.':`Jira request failed (${response.status}).`,true);
  return schema.parse(await bounded(response.json()));
}
export const jiraGateway:JiraGateway={
  async permission(project,permission){
    const data=await read(()=>api.asUser().requestJira(route`/rest/api/3/mypermissions?projectKey=${project}&permissions=${permission}`),z.object({permissions:z.record(z.string(),z.object({havePermission:z.boolean()}))}));
    return data.permissions[permission]?.havePermission===true;
  },
  project:id=>read(()=>api.asUser().requestJira(route`/rest/api/3/project/${id}`),projectSchema),
  async projects(){
    const result:z.infer<typeof projectSchema>[]=[];
    for(let start=0;start<500;start+=50){
      const page=await read(()=>api.asUser().requestJira(route`/rest/api/3/project/search?startAt=${start}&maxResults=50&action=create`),z.object({values:z.array(projectSchema),isLast:z.boolean().optional()}));
      result.push(...page.values); if(page.isLast||page.values.length<50)return result;
    }
    throw new Error('More than 500 projects. Narrow site membership before choosing a response project.');
  },
  async issueTypes(project){
    const result:{id:string;name:string}[]=[];
    for(let start=0;start<200;start+=50){
      const page=await read(()=>api.asUser().requestJira(route`/rest/api/3/issue/createmeta/${project}/issuetypes?startAt=${start}&maxResults=50`),z.object({issueTypes:z.array(z.object({id:z.string(),name:z.string(),subtask:z.boolean().optional()})),total:z.number().optional()}));
      result.push(...page.issueTypes.filter(t=>!t.subtask)); if(page.issueTypes.length<50||(page.total!==undefined&&start+50>=page.total))return result;
    }
    throw new Error('Issue-type pagination limit exceeded.');
  },
  async validateIssueType(project,type){
    const types=await this.issueTypes(project); if(!types.some(t=>t.id===type))throw new Error('Select a supported non-subtask issue type.');
    const writable=new Set<string>();
    for(let start=0;start<500;start+=50){
      const page=await read(()=>api.asUser().requestJira(route`/rest/api/3/issue/createmeta/${project}/issuetypes/${type}?startAt=${start}&maxResults=50`),z.object({fields:z.array(z.object({fieldId:z.string(),name:z.string(),required:z.boolean(),hasDefaultValue:z.boolean().optional()})),total:z.number().optional()}));
      const unsupported=page.fields.filter(f=>f.required&&!f.hasDefaultValue&&!['summary','description','project','issuetype','labels'].includes(f.fieldId));
      page.fields.forEach(f=>writable.add(f.fieldId));
      if(unsupported.length)throw new Error(`This issue type requires additional fields: ${unsupported.map(f=>f.name).join(', ')}. Choose a task type with defaults.`);
      if(page.fields.length<50||(page.total!==undefined&&start+50>=page.total)){
        if(!writable.has('description')||!writable.has('labels'))throw new Error('The selected create screen must allow description and labels for drill evidence and retry markers.');
        return;
      }
    }
    throw new Error('Issue-field pagination limit exceeded.');
  },
  async create(project,type,action,marker){
    // Resolve trusted site origin before any write, not from client context or payload.
    let origin:URL;
    try{
      const site=await read(()=>api.asUser().requestJira(route`/rest/api/3/serverInfo`),z.object({baseUrl:z.string().url()}));
      origin=new URL(site.baseUrl); if(origin.protocol!=='https:')throw new Error('Unsupported origin');
    }catch{throw new JiraError('Could not verify Jira site before creation. No issue was sent; retry when Jira is reachable.',true);}
    let response;
    try{
      response=await bounded(api.asUser().requestJira(route`/rest/api/3/issue`,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({fields:{project:{key:project},issuetype:{id:type},summary:action.summary,labels:['lotzero-simulated-drill',marker],description:{type:'doc',version:1,content:action.description.split('\n\n').map(text=>({type:'paragraph',content:[{type:'text',text}]}))}},properties:[{key:'lotzero.action',value:{marker,actionId:action.id}}]})}),8000);
    }catch{throw new JiraError('Jira response was interrupted. Outcome unknown; inspect Jira using the marker before any retry.');}
    if(!response.ok)throw new JiraError(response.status===403?'Jira denied issue creation.':response.status===429?'Jira rate limit rejected creation. Retry after waiting.':`Jira issue creation returned ${response.status}.`,[400,401,403,404,413,422,429].includes(response.status));
    const created=z.object({key:z.string().regex(/^[A-Z][A-Z0-9_]*-\d+$/)}).parse(await bounded(response.json()));
    return {key:created.key,url:`${origin.origin}/browse/${created.key}`};
  },
  async comment(key,marker,paragraphs){
    // Only an issue carrying this approved action's marker can receive the evidence comment.
    try{await jiraGateway.verifyIssue(key,marker);}catch{throw new JiraError('Could not verify the LotZero task before commenting. No comment was sent.',true);}
    let response;
    try{
      response=await bounded(api.asUser().requestJira(route`/rest/api/3/issue/${key}/comment`,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({body:{type:'doc',version:1,content:paragraphs.map(text=>({type:'paragraph',content:[{type:'text',text}]}))}})}));
    }catch{throw new JiraError('Jira response was interrupted. Outcome unknown; check the task comments before posting again.');}
    if(!response.ok)throw new JiraError(response.status===403?'Jira denied adding a comment.':`Jira comment returned ${response.status}.`,[400,401,403,404,413,422,429].includes(response.status));
    return z.object({id:z.string()}).parse(await bounded(response.json()));
  },
  async verifyIssue(key,marker){
    const issue=await read(()=>api.asUser().requestJira(route`/rest/api/3/issue/${key}?fields=labels`),z.object({key:z.string(),fields:z.object({labels:z.array(z.string())})}));
    if(!issue.fields.labels.includes(marker))throw new Error('Issue does not contain this approved action marker.');
    const site=await read(()=>api.asUser().requestJira(route`/rest/api/3/serverInfo`),z.object({baseUrl:z.string().url()}));
    const origin=new URL(site.baseUrl);if(origin.protocol!=='https:')throw new Error('Unsupported Jira origin.');
    return {key:issue.key,url:`${origin.origin}/browse/${encodeURIComponent(issue.key)}`};
  }
};
