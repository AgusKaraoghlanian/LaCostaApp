import {AppError} from './common.ts';
import type {Database} from '../../shared/contracts/index.ts';
export async function readJson(request:Request,maxBytes=2*1024*1024){
 if(Number(request.headers.get('content-length')||0)>maxBytes)throw new AppError(413,'CUERPO_GRANDE','La operación supera el tamaño permitido.');
 const reader=request.body?.getReader();if(!reader)return {};const chunks:Uint8Array[]=[];let size=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>maxBytes){await reader.cancel();throw new AppError(413,'CUERPO_GRANDE','La operación supera el tamaño permitido.')}chunks.push(value)}}finally{reader.releaseLock()}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}
 try{return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes)||'{}')}catch{throw new AppError(400,'JSON_INVALIDO','La solicitud no tiene un formato válido.')}
}
export async function rateLimit(db:Database,bucket:string,max:number,windowMs:number){
 const start=Math.floor(Date.now()/windowMs)*windowMs;
 const row=await db.prepare('INSERT INTO rate_limits VALUES(?,?,1) ON CONFLICT(bucket) DO UPDATE SET hits=CASE WHEN window_start=excluded.window_start THEN hits+1 ELSE 1 END,window_start=excluded.window_start RETURNING hits').bind(bucket,start).first<any>();
 if(row.hits>max)throw new AppError(429,'DEMASIADOS_INTENTOS','Se alcanzó el límite de intentos. Esperá unos minutos antes de volver a probar.');
}
export async function readBytes(request:Request,maxBytes:number){
 if(Number(request.headers.get('content-length')||0)>maxBytes)throw new AppError(413,'ARCHIVO_GRANDE','La foto supera 8 MB.');
 const reader=request.body?.getReader();if(!reader)throw new AppError(400,'ARCHIVO_VACIO','No se recibió la foto.');const chunks:Uint8Array[]=[];let size=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>maxBytes){await reader.cancel();throw new AppError(413,'ARCHIVO_GRANDE','La foto supera 8 MB.')}chunks.push(value)}}finally{reader.releaseLock()}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}return bytes;
}
