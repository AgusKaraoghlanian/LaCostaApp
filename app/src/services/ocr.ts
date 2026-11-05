import {inspectImage,IMAGE_LIMITS} from '../../shared/media/image.ts';
let active=false;
export async function recognizePhoto(file:Blob,options:{signal:AbortSignal;onProgress?:(value:{status:string;progress:number})=>void}){
 if(typeof Worker==='undefined'||typeof OffscreenCanvas==='undefined'||typeof createImageBitmap==='undefined')throw new Error('Este navegador necesita soporte de Web Workers y procesamiento de imágenes. Probá una versión actual de Chrome, Edge o Firefox.');
 if(active)throw new Error('Ya hay una foto en reconocimiento. Cancelala antes de iniciar otra.');
 if(file.size>IMAGE_LIMITS.bytes)throw new Error('La foto supera 8 MB.');active=true;
 let worker:Worker|undefined,bitmap:ImageBitmap|undefined;let timeout:ReturnType<typeof setTimeout>|undefined;
 try{
  options.signal.throwIfAborted();const bytes=new Uint8Array(await file.arrayBuffer()),metadata=inspectImage(bytes,file.type);options.signal.throwIfAborted();
  const digest=await crypto.subtle.digest('SHA-256',bytes);const sha256=[...new Uint8Array(digest)].map(n=>n.toString(16).padStart(2,'0')).join('');
  // Decodificación asíncrona y reducción acotada antes de entrar a WASM.
  try{bitmap=await createImageBitmap(new Blob([bytes],{type:metadata.mime}))}catch{throw new Error('No se pudo abrir la foto. Elegí una imagen PNG, JPEG o WebP válida.');}options.signal.throwIfAborted();
  if(!bitmap.width||!bitmap.height||bitmap.width!==metadata.width||bitmap.height!==metadata.height)throw new Error('Las dimensiones reales de la foto no coinciden con su cabecera.');
  if(bitmap.width*bitmap.height>IMAGE_LIMITS.pixels||Math.max(bitmap.width,bitmap.height)>IMAGE_LIMITS.side)throw new Error('La foto decodificada supera el tamaño permitido.');
  const ratio=Math.min(1,IMAGE_LIMITS.ocrSide/Math.max(bitmap.width,bitmap.height));const canvas=new OffscreenCanvas(Math.max(1,Math.round(bitmap.width*ratio)),Math.max(1,Math.round(bitmap.height*ratio)));const ctx=canvas.getContext('2d')!;ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();bitmap=undefined;const image=await canvas.convertToBlob({type:'image/png'});canvas.width=canvas.height=1;
  options.signal.throwIfAborted();worker=new Worker(new URL('./ocr.worker.js',import.meta.url),{type:'module'});
  const result=await new Promise<any>((resolve,reject)=>{
   const finish=(error?:Error,value?:any)=>{clearTimeout(timeout);options.signal.removeEventListener('abort',abort);worker?.terminate();error?reject(error):resolve(value)};
   const abort=()=>finish(new DOMException('Reconocimiento cancelado. Podés reintentar.','AbortError'));
   options.signal.addEventListener('abort',abort,{once:true});timeout=setTimeout(()=>finish(new Error('El reconocimiento superó dos minutos. Reducí la foto o dividí la carta.')),IMAGE_LIMITS.timeoutMs);
   worker!.onerror=()=>finish(new Error('El lector OCR no pudo iniciarse. Revisá los recursos locales de la aplicación.'));
   worker!.onmessage=({data})=>{if(data.type==='progress')options.onProgress?.(data);else if(data.type==='result')finish(undefined,data.result);else if(data.type==='error')finish(new Error(data.message))};worker!.postMessage({image});
  });
  return {...result,image:{...metadata,sha256}};
 }finally{clearTimeout(timeout);worker?.terminate();bitmap?.close();active=false;}
}
