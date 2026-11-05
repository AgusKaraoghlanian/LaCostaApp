import type {Database} from '../../shared/contracts/index.ts';
import {NETWORK_LIMITS} from '../../shared/contracts/extraction-limits.ts';
import {AppError,atomic,guard} from '../application/common.ts';
import {assertEvaluationSource} from '../application/extraction-policy.ts';
import {SourceRepository,canonicalSource} from './sources.ts';
export class ExtractionAccess{
 db:Database;constructor(db:Database){this.db=db}
 async source(job:any){
  const source=await new SourceRepository(this.db).byId(job.source_id);
  if(source.state!=='activa'||!job.source_revision||source.config_revision!==job.source_revision)throw new AppError(409,'FUENTE_CAMBIO','La fuente cambió o está pausada. Revisá su configuración y creá un nuevo análisis.');
  assertEvaluationSource(source);return source;
 }
 async reserve(job:any,input:{url:string;maxBytes:number;retryAt?:number},image=false){
  const source=await this.source(job);const url=new URL(canonicalSource(input.url)),root=new URL(source.url);
  assertEvaluationSource({url:url.href,allowedDomains:source.allowedDomains});
  if(url.origin!==root.origin&&!(root.protocol==='http:'&&url.protocol==='https:'&&url.hostname===root.hostname)&&!source.allowedDomains.includes(url.hostname))throw new AppError(409,'DOMINIO_PENDIENTE','El destino no está autorizado para esta fuente.');
  const timestamp=Date.now();
  if(input.retryAt!==undefined){
   if(!Number.isSafeInteger(input.retryAt)||input.retryAt<timestamp-1000||input.retryAt>8640000000000000)throw new AppError(400,'ESPERA_INVALIDA','El sitio indicó una espera que no se pudo interpretar.');
   await this.db.prepare('INSERT INTO extraction_origins(hostname,cooldown_until) VALUES(?,?) ON CONFLICT(hostname) DO UPDATE SET cooldown_until=max(cooldown_until,excluded.cooldown_until)').bind(url.hostname,input.retryAt).run();return {waitMs:0};
  }
  if(!Number.isInteger(input.maxBytes)||input.maxBytes<1||input.maxBytes>(image?8*1024*1024:NETWORK_LIMITS.pageBytes))throw new AppError(400,'LIMITE_INVALIDO','La descarga supera el tamaño permitido.');
  if(job.network_requests>=NETWORK_LIMITS.requests||job.network_bytes+input.maxBytes>NETWORK_LIMITS.totalBytes)throw new AppError(409,'PRESUPUESTO_SOLICITUDES','Se alcanzó el límite de consultas del análisis. Revisá los datos recuperados o cargá los datos faltantes manualmente.');
  if(!image&&job.network_started_at&&timestamp-job.network_started_at>=NETWORK_LIMITS.jobMs)throw new AppError(409,'PRESUPUESTO_TIEMPO','El análisis alcanzó su límite de tiempo. Sus avances se conservaron.');
  const origin=await this.db.prepare('SELECT * FROM extraction_origins WHERE hostname=?').bind(url.hostname).first<any>();
  if(origin?.cooldown_until>timestamp)throw Object.assign(new AppError(409,'ORIGEN_EN_ESPERA','El sitio pidió esperar antes de volver a consultar. Intentá más tarde.'),{retryAt:origin.cooldown_until});
  if(origin?.next_request_at>timestamp)return {waitMs:origin.next_request_at-timestamp};
  // Reserva atómica: aun dos dispositivos no pueden reiniciar el contador ni la pausa.
  const active=image?"EXISTS(SELECT 1 FROM image_requests WHERE id=? AND state='running' AND lease_device=? AND lease_token_hash=? AND expires_at>?)":"EXISTS(SELECT 1 FROM import_jobs WHERE id=? AND state='running' AND generation=? AND lease_token_hash=? AND lease_expires_at>?)";
  const lease=image?[job.accessImage.id,job.accessImage.lease_device,job.accessImage.lease_token_hash,new Date().toISOString()]:[job.id,job.generation,job.lease_token_hash,new Date().toISOString()];
  const check=guard(this.db,active+" AND EXISTS(SELECT 1 FROM import_jobs j JOIN sources s ON s.id=j.source_id WHERE j.id=? AND j.network_requests=? AND j.network_bytes=? AND j.source_revision=s.config_revision AND s.state='activa') AND NOT EXISTS(SELECT 1 FROM extraction_origins WHERE hostname=? AND (next_request_at>? OR cooldown_until>?))",[...lease,job.id,job.network_requests,job.network_bytes,url.hostname,timestamp,timestamp]);
  await atomic(this.db,[check.start,this.db.prepare('UPDATE import_jobs SET network_requests=network_requests+1,network_bytes=network_bytes+?,network_started_at=coalesce(network_started_at,?) WHERE id=?').bind(input.maxBytes,timestamp,job.id),this.db.prepare('INSERT INTO extraction_origins(hostname,next_request_at) VALUES(?,?) ON CONFLICT(hostname) DO UPDATE SET next_request_at=excluded.next_request_at').bind(url.hostname,timestamp+NETWORK_LIMITS.domainDelayMs),check.end]);return {waitMs:0};
 }
}
