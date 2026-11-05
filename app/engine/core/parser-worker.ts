import {parentPort} from 'node:worker_threads';
import {extractHtml} from '../extractors/html.ts';
import {runAdapters} from '../adapters/registry.ts';
import {PROCESS_LIMITS,LIMIT_MESSAGE} from '../security/limits.ts';
parentPort!.once('message',({text,mime,context})=>{try{
 parentPort!.postMessage({started:true});
 const adapted=runAdapters({...context,mime,text,safeFetch:null,budget:{bytes:0,requests:0,startedAt:Date.now()},documentReader:null});
 const html=adapted.html||(mime.includes('json')?'<script type="application/ld+json">'+text.replace(/<\/script/gi,'<\\/script')+'</script>':text);
 if(/<!\s*(?:DOCTYPE[^>]*(?:\[|\bSYSTEM\b|\bPUBLIC\b)|ENTITY\b)/i.test(html))throw Object.assign(new Error('El recurso declara entidades XML y no se interpretó.'),{code:'XML_ENTIDADES_BLOQUEADAS'});
 if(Buffer.byteLength(html)>2*1024*1024)throw new Error(LIMIT_MESSAGE);
 const result=extractHtml(html,context);
 result.discoveredResources.push(...adapted.links.slice(0,PROCESS_LIMITS.links-result.discoveredResources.length));
 result.warnings.push(...adapted.warnings);
 if(Buffer.byteLength(JSON.stringify(result))>PROCESS_LIMITS.resultBytes)throw new Error(LIMIT_MESSAGE);
 parentPort!.postMessage({result});
}catch(error){const e=error as any;parentPort!.postMessage({error:{code:e.code||'LIMITE_PROCESAMIENTO',message:e.message||LIMIT_MESSAGE}})}finally{parentPort!.close()}});
parentPort!.postMessage({ready:true});
