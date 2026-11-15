import fs from 'node:fs';
import YAML from 'yaml';
function writeAtomic(target,content){
  const temporary=`${target}.${process.pid}.tmp`;
  let fd,created=false;
  try{
    fd=fs.openSync(temporary,'wx',fs.existsSync(target)?fs.statSync(target).mode&0o777:0o600);created=true;
    fs.writeFileSync(fd,content);fs.fsyncSync(fd);fs.closeSync(fd);fd=undefined;
    fs.renameSync(temporary,target);
  }finally{
    if(fd!==undefined)fs.closeSync(fd);
    if(created&&fs.existsSync(temporary))fs.unlinkSync(temporary);
  }
}
const [operation,edition]=process.argv.slice(2);
if(!['save','select'].includes(operation)||!['judge','marketplace'].includes(edition))throw new Error('Usage: node scripts/edition.mjs <save|select> <judge|marketplace>');
const file='config/editions.local.json';
const ids=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{judge:null,marketplace:null};
const manifest=YAML.parse(fs.readFileSync('manifest.yml','utf8'));
const valid=id=>typeof id==='string'&&/^ari:cloud:ecosystem::app\/[0-9a-f-]{36}$/.test(id);
if(operation==='save'){
  if(!valid(manifest.app?.id))throw new Error('Register the real app first using npm run forge -- register. No app ID is invented.');
  ids[edition]=manifest.app.id;
  if(ids.judge&&ids.marketplace&&ids.judge===ids.marketplace)throw new Error('Judge and Marketplace registrations must be distinct.');
  writeAtomic(file,JSON.stringify(ids,null,2)+'\n');
}else{
  if(!valid(ids[edition]))throw new Error(`Missing registered ${edition} app ID in ${file}.`);
  manifest.app.id=ids[edition];
  if(manifest.app.licensing)throw new Error('Edition switching expects an unlicensed hackathon build. Review licensing manually before distribution.');
  writeAtomic('manifest.yml',YAML.stringify(manifest));
}
console.log(`${operation==='save'?'Recorded':'Selected'} registered ${edition} identity. Product implementation is shared.`);
