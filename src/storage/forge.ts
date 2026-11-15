import { kvs, WhereConditions } from '@forge/kvs';
import type { Store } from './port';
export const forgeStore:Store={
  get: key=>kvs.get(key),
  set:async(key,value,ttlDays)=>{await kvs.set(key,value,ttlDays?{ttl:{unit:'DAYS',value:ttlDays}}:undefined);},
  claim:async(key,value)=>{
    try{await kvs.set(key,value,{keyPolicy:'FAIL_IF_EXISTS'}); return true;}
    catch(error){
      // Confirm an existing claim. A network/storage failure must never permit a Jira write.
      if(await kvs.get(key)!==undefined)return false;
      throw error;
    }
  },
  delete:key=>kvs.delete(key),
  deletePrefix:async(prefix,except)=>{
    // Re-query the first page after each batch; deletion never invalidates a cursor.
    for(let page=0;page<100;page++){
      const batch=await kvs.query().where('key',WhereConditions.beginsWith(prefix)).limit(100).getMany();
      const rows=batch.results.filter(r=>!except?.includes(r.key));
      if(!rows.length)return;
      for(const row of rows)await kvs.delete(row.key);
    }
    throw new Error('Deletion made partial progress. Repeat to continue deleting remaining project records.');
  },
  list:async<T>(prefix:string)=>{
    const rows:{key:string;value:T}[]=[]; let cursor:string|undefined;
    do{
      let query=kvs.query().where('key',WhereConditions.beginsWith(prefix)).limit(100);
      if(cursor)query=query.cursor(cursor);
      const page=await query.getMany<T>(); rows.push(...page.results); cursor=page.nextCursor;
      if(rows.length>2000)throw new Error('Project storage limit reached. Export and delete old drill data before continuing.');
    }while(cursor);
    return rows;
  }
};
