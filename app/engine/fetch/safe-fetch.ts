import http from 'node:http';
import {abortableDelay,boundedOperation} from '../security/timing.ts';
import https from 'node:https';
import { lookup } from 'node:dns/promises';
import { createGunzip,createInflate,createBrotliDecompress } from 'node:zlib';
import { createHash } from 'node:crypto';
import { Transform,PassThrough } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { ExtractionError,normalizeUrl,validateResolvedAddresses,sameAddress,canFollow } from '../security/network.ts';
import {NETWORK_LIMITS} from '../../shared/contracts/extraction-limits.ts';
import {robotsAllows} from '../discovery/links.ts';
import {retryAfterAt} from '../security/retry-after.ts';
export const LIMITS=Object.freeze({...NETWORK_LIMITS,htmlPages:8,depth:2,redirects:5,pdfBytes:10*1024*1024,imageBytes:8*1024*1024,downloadMs:30_000,navigationMs:60_000});
export interface AccessHooks {beforeRequest?:(url:string,maxBytes:number)=>Promise<void>;onCooldown?:(url:string,retryAt:number)=>Promise<void>}
// Compartida por las instancias del motor; la API mantiene además la reserva persistente.
const originAccess=new Map<string,{last:number;cooldown:number}>();
export interface FetchBudget {bytes:number;startedAt:number;requests:number;}
export interface SafeResource {url:string;originalUrl:string;status:number;mime:string;body:Buffer;hash:string;etag:string|null;lastModified:string|null;bytes:number;}
type Resolver=(hostname:string)=>Promise<{address:string;family:number}[]>;
export class SafeFetch {
 budget:FetchBudget;approvedDomains:string[];signal?:AbortSignal;resolver:Resolver;respectRobots:boolean;hooks:AccessHooks;robots=new Map<string,string>();
 constructor(options:{budget?:FetchBudget;approvedDomains?:string[];signal?:AbortSignal;resolver?:Resolver;respectRobots?:boolean}&AccessHooks={}){this.budget=options.budget||{bytes:0,startedAt:Date.now(),requests:0};this.approvedDomains=options.approvedDomains||[];this.signal=options.signal;this.resolver=options.resolver||((hostname)=>lookup(hostname,{all:true,verbatim:true}));this.respectRobots=options.respectRobots??false;this.hooks=options;}
 async get(raw:string,options:{base?:string;maxBytes?:number;robots?:boolean}={}):Promise<SafeResource>{
  const original=normalizeUrl(raw);let url=original;const base=options.base?normalizeUrl(options.base):original;const maxBytes=options.maxBytes||LIMITS.pageBytes;
  for(let hop=0;hop<=LIMITS.redirects;hop++){
   this.signal?.throwIfAborted();if(Date.now()-this.budget.startedAt>LIMITS.jobMs)throw new ExtractionError('PRESUPUESTO_TIEMPO','El análisis alcanzó su límite de tiempo; se conservaron los avances.');
   if(!canFollow(base,url,this.approvedDomains))throw new ExtractionError('DOMINIO_PENDIENTE','El enlace lleva a otro dominio. Confirmá su asociación con el negocio antes de analizarlo.');
   if(options.robots??this.respectRobots)await this.checkRobots(url,base);
   if(this.budget.requests>=LIMITS.requests)throw new ExtractionError('PRESUPUESTO_SOLICITUDES','Se alcanzó el límite de consultas del análisis. Revisá los datos recuperados.');
   const access=originAccess.get(url.hostname)||{last:0,cooldown:0};if(access.cooldown>Date.now())throw Object.assign(new ExtractionError('LIMITE_ORIGEN','El sitio pidió esperar antes de volver a consultar.',true),{retryAt:access.cooldown,origin:url.origin});
   const wait=Math.max(0,LIMITS.domainDelayMs-(Date.now()-access.last));if(wait)await abortableDelay(wait,this.signal);
   if(Date.now()-this.budget.startedAt>LIMITS.jobMs)throw new ExtractionError('PRESUPUESTO_TIEMPO','El análisis alcanzó su límite de tiempo.');
   await this.hooks.beforeRequest?.(url.href,maxBytes);this.signal?.throwIfAborted();
   access.last=Date.now();originAccess.set(url.hostname,access);if(originAccess.size>1024)originAccess.delete(originAccess.keys().next().value!);
   this.budget.requests++;const records=validateResolvedAddresses(await boundedOperation(this.resolver(url.hostname.replace(/^\[|\]$/g,'')),LIMITS.downloadMs,this.signal));const pinned=records[0];
   this.signal?.throwIfAborted();const response=await this.request(url,pinned,maxBytes);if(response.redirect){url=normalizeUrl(new URL(response.redirect,url).href);if(!canFollow(base,url,this.approvedDomains))throw new ExtractionError('DOMINIO_PENDIENTE','El destino de la redirección no está autorizado.');if(response.retryAt&&response.retryAt>Date.now()){const access=originAccess.get(url.hostname)||{last:0,cooldown:0};access.cooldown=Math.max(access.cooldown,response.retryAt);originAccess.set(url.hostname,access);await this.hooks.onCooldown?.(url.href,response.retryAt);throw Object.assign(new ExtractionError('LIMITE_ORIGEN','El sitio pidió esperar antes de seguir el enlace.',true),{retryAt:response.retryAt,origin:url.origin})}continue;}
   return {...response.resource!,originalUrl:original.href};
  }
  throw new ExtractionError('REDIRECCIONES_EXCESIVAS','La página redirige demasiadas veces. Revisá la dirección final.');
 }
 private async checkRobots(url:URL,base:URL){
  if(!this.robots.has(url.origin)){
   const robot=await this.get(new URL('/robots.txt',url).href,{base:base.href,maxBytes:LIMITS.robotsBytes,robots:false});
   if(robot.status===404)this.robots.set(url.origin,'');else if(robot.status===200&&robot.mime.startsWith('text/'))this.robots.set(url.origin,robot.body.toString('utf8'));else throw new ExtractionError('ROBOTS_NO_VERIFICADO','No se pudieron verificar las condiciones de acceso del sitio.');
  }
  if(!robotsAllows(this.robots.get(url.origin)!,url.pathname+url.search))throw new ExtractionError('ROBOTS_BLOQUEADO','El sitio no permite analizar esta ruta.');
 }
 private request(url:URL,pinned:{address:string;family:number},maxBytes:number):Promise<{redirect?:string;retryAt?:number;resource?:SafeResource}>{
  return new Promise((resolve,reject)=>{
   let finished=false,verified=false;let response:http.IncomingMessage|undefined;const fail=(error:unknown)=>{if(finished)return;finished=true;clearTimeout(timer);this.signal?.removeEventListener('abort',abort);response?.destroy();request.destroy();reject(error instanceof ExtractionError?error:new ExtractionError('DESCARGA_FALLIDA','No se pudo descargar la página. Probá de nuevo más tarde.',true));};
   const abort=()=>fail(new ExtractionError('CANCELADO','El análisis fue cancelado.'));
   const request=(url.protocol==='https:'?https:http).request(url,{
    method:'GET',agent:false,headers:{'User-Agent':'CostaALaCartaBot/0.1 (analisis editorial local)','Accept':'text/html,application/ld+json,application/json,application/pdf,text/plain;q=0.8','Accept-Encoding':'gzip, deflate, br'},
    // La conexión utiliza exclusivamente la IP resuelta y validada, con Host/SNI originales.
    lookup:((_host:any,opts:any,callback:any)=>opts?.all?callback(null,[pinned]):callback(null,pinned.address,pinned.family)) as any,
    ...(url.protocol==='https:'?{servername:url.hostname}:{})
   });
   const timer=setTimeout(()=>fail(new ExtractionError('TIEMPO_DESCARGA','La página tardó más de 30 segundos en responder.',true)),LIMITS.downloadMs);
   this.signal?.addEventListener('abort',abort,{once:true});
   request.on('socket',socket=>{const verify=()=>{if(!sameAddress(socket.remoteAddress||'',pinned.address))fail(new ExtractionError('IP_CAMBIADA','La conexión no coincide con la dirección validada. Se bloqueó por seguridad.'));};socket.once(url.protocol==='https:'?'secureConnect':'connect',()=>{verify();verified=!finished});});
   request.on('error',fail);request.on('response',async res=>{
    if(finished){res.destroy();return}if(!verified){res.destroy();fail(new ExtractionError('IP_NO_VERIFICADA','La conexión no verificó su destino efectivo.'));return}response=res;const status=res.statusCode||0;
    if(status>=300&&status<400&&res.headers.location){res.destroy();finished=true;clearTimeout(timer);this.signal?.removeEventListener('abort',abort);resolve({redirect:res.headers.location,retryAt:retryAfterAt(String(res.headers['retry-after']||''))});return;}
    if(status===429||status===503){
     const at=retryAfterAt(String(res.headers['retry-after']||''))??(status===429?Date.now()+60000:undefined);
     if(at!==undefined){const access=originAccess.get(url.hostname)||{last:Date.now(),cooldown:0};access.cooldown=Math.max(access.cooldown,at);originAccess.set(url.hostname,access);try{await this.hooks.onCooldown?.(url.href,at)}catch(error){fail(error);return}}
     fail(Object.assign(new ExtractionError(status===429?'LIMITE_ORIGEN':'ORIGEN_NO_DISPONIBLE','El sitio pidió esperar antes de volver a consultar. Podés revisar lo recuperado o intentar más tarde.',true),{retryAt:at,origin:url.origin}));return;
    }
    if([401,403].includes(status)){fail(new ExtractionError('ACCESO_RESTRINGIDO','El sitio restringe el acceso. Podés aportar una carta autorizada o cargar los datos manualmente.'));return;}
    if(status>=500){fail(new ExtractionError('ORIGEN_NO_DISPONIBLE','El sitio está temporalmente fuera de servicio.',true));return;}
    if(Number(res.headers['content-length']||0)>maxBytes){fail(new ExtractionError('ARCHIVO_GRANDE','El archivo supera el límite permitido.'));return;}
    const chunks:Buffer[]=[];let compressed=0;let decoded=0;const encoding=String(res.headers['content-encoding']||'identity').toLowerCase();
    if(!['identity','gzip','deflate','br'].includes(encoding)){fail(new ExtractionError('COMPRESION_NO_ADMITIDA','La compresión de la página todavía no es compatible.'));return;}
    const compressedGuard=new Transform({transform:(chunk,_enc,cb)=>{compressed+=chunk.length;if(compressed>maxBytes)return cb(new ExtractionError('ARCHIVO_GRANDE','La descarga supera su límite permitido.'));cb(null,chunk)}});
    const decoder=encoding==='gzip'?createGunzip():encoding==='deflate'?createInflate():encoding==='br'?createBrotliDecompress():new PassThrough();
    const sink=new Transform({transform:(chunk,_enc,cb)=>{decoded+=chunk.length;this.budget.bytes+=chunk.length;if(decoded>maxBytes||this.budget.bytes>LIMITS.totalBytes)return cb(new ExtractionError('PRESUPUESTO_BYTES','Se alcanzó el límite de datos, incluso después de descomprimir.'));chunks.push(Buffer.from(chunk));cb()}});
    try{await pipeline(res,compressedGuard,decoder,sink);if(finished)return;finished=true;clearTimeout(timer);this.signal?.removeEventListener('abort',abort);const body=Buffer.concat(chunks);resolve({resource:{url:url.href,originalUrl:url.href,status,mime:String(res.headers['content-type']||'').split(';')[0].trim().toLowerCase(),body,hash:createHash('sha256').update(body).digest('hex'),etag:res.headers.etag||null,lastModified:res.headers['last-modified']||null,bytes:decoded}})}catch(error){fail(error)}
   });if(this.signal?.aborted)abort();else request.end();
  });
 }
}
