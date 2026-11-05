import { z } from 'zod';
import {allowedLink} from './urls.ts';
import {OpeningPeriod,OpeningException} from './opening.ts';
import {OcrProvenance} from './menu-text.ts';
const link=(kind='web',max=1000)=>z.string().max(max).refine(v=>allowedLink(v,kind),'Ingresá un enlace HTTP o HTTPS válido para este canal.').default('');
export const SCHEMA_VERSION='1.0';
export const ENGINE_VERSION='0.1.0';
export const TEMPLATE_VERSION='ficha-2';
export const JobStatus=z.enum(['queued','running','awaiting_review','partial','retry_scheduled','completed','failed','cancelled']);
export const BusinessFields=z.object({
 estadoComercial:z.enum(['sin_confirmar','activo','temporalmente_cerrado','cerrado']).default('sin_confirmar'),
 openingPeriods:z.array(OpeningPeriod).max(50).default([]),openingExceptions:z.array(OpeningException).max(50).default([]),
 nombre:z.string().trim().min(2).max(150),localidad:z.string().min(2).max(150),localidadId:z.string().max(150).default(''),categoria:z.string().min(2).max(80),
 descripcion:z.string().max(1800).default(''),direccion:z.string().max(250).default(''),zonaAtencion:z.string().max(250).default(''),
 telefono:z.string().max(80).default(''),whatsapp:link('whatsapp',250),web:link(),
 instagram:link('instagram',500),facebook:link('facebook',500),horarios:z.string().max(1500).default(''),
 prestaciones:z.array(z.string().max(100)).max(30).default([]),precio:z.number().int().min(1).max(3).nullable().default(null),
 referenciaVerificacion:z.string().min(3).max(1500)
}).strict();
export const Observation=z.object({
 id:z.string(),entityType:z.enum(['business','product','variant','price','opening_period']),entityKey:z.string(),fieldPath:z.string().max(250),
 rawValue:z.unknown(),normalizedValue:z.unknown(),sourceId:z.string(),resourceId:z.string(),runId:z.string(),observedAt:z.string(),
 method:z.string(),extractorVersion:z.string(),pointer:z.string().max(500),evidence:z.string().max(500),
 uncertainty:z.enum(['alta','media','baja']),reason:z.string().max(500)
});
export const PriceCandidate=z.object({raw:z.string().max(250),amountMinor:z.number().int().min(0).max(Number.MAX_SAFE_INTEGER).nullable(),currency:z.string().regex(/^[A-Z]{3}$/).nullable(),channel:z.enum(['salon','delivery','retiro','sin_especificar']).default('sin_especificar'),needsReview:z.boolean(),reason:z.string().max(1000),zeroEvidence:z.string().max(500).optional()});
export const MenuItem=z.object({key:z.string().max(500),businessKey:z.string().max(500).optional(),name:z.string().trim().min(1).max(250),description:z.string().max(1500).default(''),menuName:z.string().max(150).default('Carta'),section:z.string().max(200).default('Carta'),variant:z.string().max(200).default('Base'),price:PriceCandidate,sourceUrl:link(),evidence:z.string().max(500),pointer:z.string().max(500),provenance:OcrProvenance.optional(),status:z.enum(['propuesto','aprobado','descartado']).default('propuesto')}).refine(m=>m.status!=='aprobado'||!m.price.needsReview&&(m.price.amountMinor===null||Boolean(m.price.currency)),{message:'Confirmá la moneda y resolvé el precio antes de aprobar.',path:['price']}).refine(m=>m.status!=='aprobado'||!m.provenance||m.provenance.reviewed,{message:'Revisá el producto OCR contra el original antes de aprobar.',path:['provenance']}).refine(m=>m.status!=='aprobado'||m.price.amountMinor!==0||/^0+(?:[.,]0+)?$/.test(m.price.raw.replace(/[^0-9.,-]/g,''))||(m.price.zeroEvidence?.trim().length||0)>=10,{message:'El precio cero necesita evidencia explícita.',path:['price','zeroEvidence']});
export const ExtractionResult=z.object({schemaVersion:z.literal(SCHEMA_VERSION),runId:z.string(),sourceId:z.string(),extractor:z.string(),version:z.string(),status:z.enum(['complete','partial','blocked','failed']),
 businessCandidates:z.array(z.object({key:z.string(),name:z.string(),fields:z.record(z.string(),z.unknown())})),observations:z.array(Observation),menuCandidates:z.array(MenuItem),
 mediaCandidates:z.array(z.object({url:z.string(),kind:z.enum(['desconocida','plato','establecimiento','carta']),rights:z.literal('desconocido'),resourceId:z.string(),pageUrl:z.string().optional(),label:z.string().max(500).optional(),score:z.number().optional(),signals:z.array(z.string()).optional()})),
 discoveredResources:z.array(z.object({url:z.string(),kind:z.string(),label:z.string(),depth:z.number().int(),external:z.boolean()})),warnings:z.array(z.string()),errors:z.array(z.object({code:z.string(),message:z.string(),url:z.string().optional()})),
 coverage:z.object({processed:z.array(z.string()),pending:z.array(z.string()),blocked:z.array(z.string()),fieldsFound:z.array(z.string()).optional(),fieldsMissing:z.array(z.string()).optional(),javascriptRequired:z.boolean().optional()}),metrics:z.object({pages:z.number(),bytes:z.number(),durationMs:z.number(),requests:z.number().int().min(0).optional()})});
export const ImportRequest=z.object({url:z.string().max(2000),listingId:z.string().optional(),allowedDomains:z.array(z.string().max(250)).max(10).default([]),accessReference:z.string().min(10).max(1000),policyReviewed:z.literal(true)}).strict();
export const DecisionRequest=z.object({expectedRevision:z.number().int().nonnegative(),listingId:z.string().optional(),candidateKey:z.string().optional(),fields:BusinessFields,lockedFields:z.array(z.string()).default([]),menuItems:z.array(MenuItem).max(1000).default([]),rejectedObservationIds:z.array(z.string()).default([])}).strict();
export const ReviewDraftDecision=DecisionRequest.extend({fields:BusinessFields.extend({nombre:z.string().max(150),localidad:z.string().max(150),categoria:z.string().max(80),referenciaVerificacion:z.string().max(1500)})});
export type ObservationValue=z.infer<typeof Observation>;
export type Extraction=z.infer<typeof ExtractionResult>;
export type Fields=z.infer<typeof BusinessFields>;
export type MenuEntry=z.infer<typeof MenuItem>;
export interface SqlStatement {bind(...values:unknown[]):SqlStatement;first<T=Record<string,unknown>>(column?:string):Promise<T|null>;all<T=Record<string,unknown>>():Promise<{results:T[]}>;run():Promise<{meta?:{changes?:number}}>;}
export interface Database {prepare(sql:string):SqlStatement;batch<T=unknown>(statements:SqlStatement[]):Promise<T[]>;exec(sql:string):Promise<unknown>;}
export interface Bindings {DB:Database;MEDIA:{put(key:string,value:string|ArrayBuffer,options?:unknown):Promise<void>;get(key:string,type?:string):Promise<any>;delete(key:string):Promise<void>};APP_ENV:string;AUTH_MODE:string;CATALOG_BACKEND:string;UI_ORIGIN:string;ASSETS?:{fetch(request:Request):Promise<Response>};}
export interface Actor {id:string;role:'admin'|'owner'|'registered';csrf:string;}
