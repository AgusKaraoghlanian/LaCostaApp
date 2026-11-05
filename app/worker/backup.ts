import {mkdir,readFile,writeFile,rename} from 'node:fs/promises';import {resolve} from 'node:path';
import {digest,json} from '../server/application/common.ts';
export async function performBackup(job:any,request:(path:string,data:any)=>Promise<any>){
 const folder=resolve('.local/backups');await mkdir(folder,{recursive:true});if(!/^[a-f0-9-]{36}$/.test(job.id))throw new Error('Identificador de copia inválido.');const part=resolve(folder,job.id+'.part.json'),target=resolve(folder,job.id+'.json');let rows:any[]=[];try{const saved=JSON.parse(await readFile(part,'utf8'));if(saved.id===job.id)rows=saved.rows}catch{}
 while(rows.length<job.rowCount){const page=await request('worker/backups/'+job.id+'/page',{leaseToken:job.leaseToken,after:rows.at(-1)?.sequence||0});if(!page.length)throw new Error('La copia quedó incompleta.');rows.push(...page);await writeFile(part,json({id:job.id,rows}));}
 const sha256=await digest(json(rows));const manifest={format:job.format,rows:rows.length,sha256,createdAt:job.createdAt,completedAt:new Date().toISOString(),objects:0,secretsIncluded:false,schema:6,template:'ficha-2'};const packageData={id:job.id,manifest,rows};await writeFile(target+'.tmp',json(packageData));await rename(target+'.tmp',target);await request('worker/backups/'+job.id+'/complete',{leaseToken:job.leaseToken,manifest});return manifest;
}
