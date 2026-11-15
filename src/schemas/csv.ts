import type { Dataset } from '../contracts';
import { LIMITS, validateDataset } from './dataset';
/** RFC4180 parser, deliberately bounded; no dynamic evaluation or spreadsheet parsing. */
export function parseCsv(text: string): string[][] {
  if (new TextEncoder().encode(text).length > LIMITS.bytes) throw new Error('CSV exceeds 200KB limit');
  const rows: string[][]=[]; let row:string[]=[], value='', quoted=false, closed=false;
  const push = () => { row.push(value); value=''; closed=false; };
  for(let i=0;i<text.length;i++) {
    const c=text[i];
    if(quoted){ if(c==='"'){if(text[i+1]==='"'){value+='"';i++;}else{quoted=false;closed=true;}}else value+=c; continue; }
    if(c==='"'){if(value||closed)throw new Error('Malformed CSV quote');quoted=true;continue;}
    if(c===','){push();continue;}
    if(c==='\r'||c==='\n'){if(c==='\r'&&text[i+1]==='\n')i++;push();rows.push(row);row=[];continue;}
    if(closed)throw new Error('Unexpected content after CSV quote'); value+=c;
  }
  if(quoted)throw new Error('Unterminated CSV quote');
  if(value||row.length||closed){push();rows.push(row);}
  return rows.filter(r=>r.some(Boolean));
}
export function importCsv(text: string): Dataset {
  const rows=parseCsv(text.replace(/^\uFEFF/,''));
  if(rows.shift()?.join(',')!=='record_type,json')throw new Error('Expected CSV header record_type,json');
  const d:Record<string,unknown>={nodes:[],edges:[],evidence:[]}; let metadata=false;
  for(const [index,row] of rows.entries()){
    if(row.length!==2)throw new Error(`CSV row ${index+2}: expected two columns`);
    let obj:unknown;try{obj=JSON.parse(row[1]);}catch{throw new Error(`CSV row ${index+2}: invalid JSON`);}
    if(!obj||typeof obj!=='object'||Array.isArray(obj))throw new Error(`CSV row ${index+2}: expected object`);
    if(row[0]==='metadata'){
      if(metadata)throw new Error('Duplicate CSV metadata'); metadata=true;
      if(Object.keys(obj).sort().join(',')!=='name,synthetic,version')throw new Error('Metadata must have exactly name, synthetic, version');
      Object.assign(d,obj);
    }else{
      const key=({node:'nodes',edge:'edges',evidence:'evidence'} as Record<string,string>)[row[0]];
      if(!key)throw new Error(`CSV row ${index+2}: unknown record type`);
      (d[key] as unknown[]).push(obj);
    }
  }
  if(!metadata)throw new Error('CSV needs metadata row');
  return validateDataset(d);
}
/** Prefix spreadsheet operators even after whitespace/control chars; quote all cells. */
export function csvCell(value: unknown): string {
  const s=String(value??'');const safe=/^[\s\u0000-\u001f]*[=+\-@]/u.test(s)?`'${s}`:s;
  return `"${safe.replace(/"/g,'""')}"`;
}
export function datasetCsv(dataset: Dataset): string {
  const {version,name,synthetic,nodes,edges,evidence}=validateDataset(dataset);
  return ['record_type,json',...[
    ['metadata',{version,name,synthetic}],...nodes.map(x=>['node',x]),...edges.map(x=>['edge',x]),...evidence.map(x=>['evidence',x])
  ].map(([kind,obj])=>[kind,JSON.stringify(obj)].map(csvCell).join(','))].join('\r\n');
}
