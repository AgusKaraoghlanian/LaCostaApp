import {randomUUID} from 'node:crypto';
import {SCHEMA_VERSION,ENGINE_VERSION,ExtractionResult,type Extraction} from '../../shared/contracts/index.ts';
import {SafeFetch,LIMITS,type AccessHooks} from '../fetch/safe-fetch.ts';
import {normalizeUrl,ExtractionError} from '../security/network.ts';
import {parseResource} from './bounded-parser.ts';
import {PROCESS_LIMITS,LIMIT_MESSAGE} from '../security/limits.ts';
export async function analyzeSource(input:{runId:string;source:{id:string;url:string;allowedDomains:string[]};checkpoints?:any[];signal?:AbortSignal;onCheckpoint:(value:any)=>Promise<void>;onStage?:(stage:string)=>void;access?:AccessHooks}){
 const start=Date.now(),source=input.source,root=normalizeUrl(source.url);
 const result:Extraction={schemaVersion:SCHEMA_VERSION,runId:input.runId,sourceId:source.id,extractor:'html-jsonld',version:ENGINE_VERSION,status:'partial',businessCandidates:[],observations:[],menuCandidates:[],mediaCandidates:[],discoveredResources:[],warnings:[],errors:[],coverage:{processed:[],pending:[],blocked:[]},metrics:{pages:0,bytes:0,durationMs:0,requests:0}};
 if(/(^|\.)(instagram|facebook)\.com$/.test(root.hostname)){result.status='blocked';result.errors.push({code:'RED_SOCIAL_SIN_AUTORIZACION',message:'Este enlace se conserva como fuente. La importación por APIs oficiales de Meta requiere una integración autorizada; podés aportar material propio o cargar datos manualmente.'});return result}
 const seen=new Set<string>();let priorDuration=0,priorBytes=0,priorRequests=0;
 for(const cp of input.checkpoints||[]){
  if(cp.result?.sourceId!==source.id||!cp.resource?.id)continue;
  const saved=ExtractionResult.parse(cp.result);seen.add(cp.resourceKey);seen.add(cp.resource.url);
  priorBytes=Math.max(priorBytes,saved.metrics.bytes);priorDuration=Math.max(priorDuration,saved.metrics.durationMs);priorRequests=Math.max(priorRequests,saved.metrics.requests||0);
  result.businessCandidates=saved.businessCandidates;result.menuCandidates=saved.menuCandidates;result.mediaCandidates=saved.mediaCandidates;result.discoveredResources=saved.discoveredResources;result.coverage=saved.coverage;result.warnings=saved.warnings;result.errors=saved.errors;
  for(const observation of saved.observations)if(!result.observations.some(o=>o.id===observation.id))result.observations.push(observation);
  if(Buffer.byteLength(JSON.stringify(result))>PROCESS_LIMITS.resultBytes)throw new ExtractionError('RESULTADO_GRANDE',LIMIT_MESSAGE);
 }
 if(seen.size)result.warnings.push('Análisis reanudado desde avances guardados. Las páginas ya procesadas conservan su fecha de lectura original.');
 result.metrics.pages=result.coverage.processed.length;
 const fetcher=new SafeFetch({budget:{bytes:priorBytes,startedAt:start-priorDuration,requests:priorRequests},approvedDomains:source.allowedDomains,signal:input.signal,respectRobots:true,...input.access});
 const queue=[{url:root.href,depth:0,kind:'html'},...result.discoveredResources.filter(d=>!d.external&&!['pdf','image'].includes(d.kind))];
 while(queue.length&&result.metrics.pages<LIMITS.htmlPages){
  input.signal?.throwIfAborted();const item=queue.shift()!;if(seen.has(item.url)||item.depth>LIMITS.depth)continue;seen.add(item.url);
  let before:Extraction|undefined;
  try{
   const u=normalizeUrl(item.url);input.onStage?.('Analizando '+u.pathname);
   const resource=await fetcher.get(item.url,{base:root.href});
   if(resource.status!==200){result.errors.push({code:'PAGINA_NO_DISPONIBLE',message:'La página respondió con estado '+resource.status+'.',url:item.url});continue}
   if(!resource.mime.includes('html')&&!resource.mime.includes('json')&&!resource.mime.startsWith('text/')){result.coverage.blocked.push(item.url);result.warnings.push('Este recurso requiere un lector de documentos que todavía no está habilitado.');continue}
   const resourceId=randomUUID();
   const extracted=await parseResource(resource.body.toString('utf8'),resource.mime,{url:resource.url,sourceId:source.id,resourceId,runId:input.runId,depth:item.depth,allowedDomains:source.allowedDomains},{signal:input.signal});
   before=structuredClone(result);
   for(const candidate of extracted.businessCandidates){const existing=result.businessCandidates.find(c=>c.key===candidate.key);if(existing){for(const [path,value] of Object.entries(candidate.fields))if(!existing.fields[path])existing.fields[path]=value}else if(result.businessCandidates.length<PROCESS_LIMITS.businesses)result.businessCandidates.push(candidate)}
   const accepted=new Set<string>();
   for(const entry of extracted.menuCandidates){if(result.menuCandidates.some(m=>m.key===entry.key))continue;if(result.menuCandidates.length<PROCESS_LIMITS.menu){result.menuCandidates.push(entry);accepted.add(entry.key)}else if(!result.warnings.includes(LIMIT_MESSAGE))result.warnings.push(LIMIT_MESSAGE)}
   const delta=extracted.observations.filter(o=>o.entityType==='business'||o.entityType==='opening_period'||accepted.has(o.entityKey));
   if(result.observations.length+delta.length>PROCESS_LIMITS.observations)throw new ExtractionError('LIMITE_PROCESAMIENTO',LIMIT_MESSAGE);
   result.observations.push(...delta);
   result.mediaCandidates.push(...extracted.mediaCandidates.filter(m=>!result.mediaCandidates.some(p=>p.url===m.url)).slice(0,Math.max(0,PROCESS_LIMITS.media-result.mediaCandidates.length)));
   result.warnings=[...new Set([...result.warnings,...extracted.warnings])].slice(0,PROCESS_LIMITS.warnings);
   for(const d of extracted.discoveredResources.slice(0,PROCESS_LIMITS.links)){if(result.discoveredResources.length>=PROCESS_LIMITS.links)break;if(result.discoveredResources.some(r=>r.url===d.url))continue;result.discoveredResources.push(d);if(!d.external&&!['pdf','image'].includes(d.kind)&&d.depth<=LIMITS.depth&&!seen.has(d.url))queue.push(d)}
   seen.add(resource.url);result.coverage.processed.push(item.url);
   result.metrics={pages:result.coverage.processed.length,bytes:fetcher.budget.bytes,durationMs:priorDuration+Date.now()-start,requests:fetcher.budget.requests};
   if(Buffer.byteLength(JSON.stringify(result))>PROCESS_LIMITS.resultBytes)throw new ExtractionError('RESULTADO_GRANDE',LIMIT_MESSAGE);
   const checkpoint={resourceKey:item.url,resource:{...resource,id:resourceId,body:undefined},result:{...result,observations:delta},stage:'Analizadas '+result.metrics.pages+' páginas'};
   if(Buffer.byteLength(JSON.stringify(checkpoint))>PROCESS_LIMITS.checkpointBytes)throw new ExtractionError('RESULTADO_GRANDE',LIMIT_MESSAGE);
   try{await input.onCheckpoint(checkpoint)}catch(error){const e=error as any;if(e.status===413)throw new ExtractionError('RESULTADO_GRANDE',LIMIT_MESSAGE);if(e.status>=400&&e.status<500)throw e;throw new ExtractionError('AVANCE_NO_GUARDADO','No se pudo guardar el avance. Se reintentará desde el último recurso confirmado.',true)}
  }catch(error){
   if(before)Object.assign(result,before);
   if(input.signal?.aborted)throw error;const e=error as ExtractionError;
   if(e.code==='AVANCE_NO_GUARDADO'||e.retryable&&!result.coverage.processed.length)throw e;
   result.errors.push({code:e.code||'LECTURA_FALLIDA',message:e.message||'No se pudo interpretar este recurso.',url:item.url});
   result.errors=result.errors.slice(0,PROCESS_LIMITS.warnings);
   if(['DNS_NO_PUBLICO','DESTINO_PRIVADO','IP_CAMBIADA','URL_NO_PERMITIDA','ROBOTS_BLOQUEADO'].includes(e.code))result.coverage.blocked.push(item.url);
   if(e.code?.startsWith('PRESUPUESTO_')||['LIMITE_PROCESAMIENTO','MEMORIA_PROCESAMIENTO','TIEMPO_PROCESAMIENTO','RESULTADO_GRANDE','ORIGEN_EN_ESPERA','LIMITE_ORIGEN','FUENTE_CAMBIO'].includes(e.code))break;
  }
 }
 result.coverage.pending=[...new Set([...queue.map(q=>q.url).filter(u=>!seen.has(u)),...result.discoveredResources.filter(d=>d.external||['pdf','image'].includes(d.kind)).map(d=>d.url)])].slice(0,PROCESS_LIMITS.links);
 result.coverage.fieldsFound=[...new Set(result.businessCandidates.flatMap(c=>Object.keys(c.fields)))];result.coverage.fieldsMissing=['nombre','localidad','categoria','direccion','telefono','whatsapp','horarios','instagram','facebook'].filter(k=>!result.coverage.fieldsFound!.includes(k));
 result.coverage.javascriptRequired=result.warnings.some(w=>w.includes('depender de JavaScript'));result.warnings=[...new Set(result.warnings)].slice(0,PROCESS_LIMITS.warnings);
 result.metrics={pages:result.coverage.processed.length,bytes:fetcher.budget.bytes,durationMs:priorDuration+Date.now()-start,requests:fetcher.budget.requests};
 result.status=result.coverage.processed.length?(result.errors.length||result.warnings.includes(LIMIT_MESSAGE)||result.coverage.pending.length||result.coverage.blocked.length||result.coverage.javascriptRequired?'partial':'complete'):'failed';
 return ExtractionResult.parse(result);
}
