import {Worker} from 'node:worker_threads';
import {ExtractionError} from '../security/network.ts';
import {PROCESS_LIMITS,LIMIT_MESSAGE} from '../security/limits.ts';
import type {extractHtml} from '../extractors/html.ts';
import {fileURLToPath} from 'node:url';
let code:Promise<string>|undefined;
async function parserCode(){
 // Empaquetar código local conocido una vez evita recargar cientos de módulos por página.
 // Nunca se compila HTML, JavaScript ni rutas procedentes de un sitio.
 code??=import('esbuild').then(async({build})=>(await build({entryPoints:[fileURLToPath(new URL('./parser-worker.ts',import.meta.url))],bundle:true,platform:'node',target:'node24',format:'cjs',write:false,logLevel:'silent'})).outputFiles[0].text);
 return code;
}
export async function parseResource(text:string,mime:string,context:Parameters<typeof extractHtml>[1],options:{signal?:AbortSignal;timeoutMs?:number}={}):Promise<ReturnType<typeof extractHtml>>{
 if(Buffer.byteLength(text)>2*1024*1024)return Promise.reject(new ExtractionError('LIMITE_PROCESAMIENTO',LIMIT_MESSAGE));
 options.signal?.throwIfAborted();
 const localCode=await new Promise<string>((resolve,reject)=>{
  const clean=()=>{clearTimeout(timer);options.signal?.removeEventListener('abort',abort)};
  const abort=()=>{clean();reject(new ExtractionError('CANCELADO','El análisis fue cancelado.'))};
  const timer=setTimeout(()=>{clean();reject(new ExtractionError('TIEMPO_PROCESAMIENTO',LIMIT_MESSAGE))},PROCESS_LIMITS.startupMs);
  options.signal?.addEventListener('abort',abort,{once:true});if(options.signal?.aborted){abort();return}
  parserCode().then(value=>{clean();resolve(value)},()=>{clean();reject(new ExtractionError('LIMITE_PROCESAMIENTO','No se pudo iniciar el lector. Reiniciá el motor y volvé a intentar.'))});
 });
 options.signal?.throwIfAborted();
 return new Promise((resolve,reject)=>{
  const worker=new Worker(localCode,{eval:true,execArgv:[],resourceLimits:{maxOldGenerationSizeMb:PROCESS_LIMITS.heapMb,maxYoungGenerationSizeMb:PROCESS_LIMITS.youngMb,stackSizeMb:4}});
  let done=false;
  const finish=(error?:Error,value?:ReturnType<typeof extractHtml>)=>{
   if(done)return;done=true;clearTimeout(timer);options.signal?.removeEventListener('abort',abort);
   // Esperar la terminación real también al cancelar o agotar memoria/tiempo.
   void worker.terminate().then(()=>error?reject(error):resolve(value!),()=>reject(error||new ExtractionError('LIMITE_PROCESAMIENTO',LIMIT_MESSAGE)));
  };
  const abort=()=>finish(new ExtractionError('CANCELADO','El análisis fue cancelado.'));
  let timer=setTimeout(()=>finish(new ExtractionError('TIEMPO_PROCESAMIENTO',LIMIT_MESSAGE)),PROCESS_LIMITS.startupMs);
  worker.on('message',data=>{if(done)return;if(data.ready){worker.postMessage({text,mime,context});return}if(data.started){clearTimeout(timer);timer=setTimeout(()=>finish(new ExtractionError('TIEMPO_PROCESAMIENTO',LIMIT_MESSAGE)),Math.min(options.timeoutMs??PROCESS_LIMITS.parserMs,PROCESS_LIMITS.parserMs));return}data.error?finish(new ExtractionError(data.error.code,data.error.message)):finish(undefined,data.result)});
  worker.once('error',error=>finish(new ExtractionError((error as any).code==='ERR_WORKER_OUT_OF_MEMORY'?'MEMORIA_PROCESAMIENTO':'LIMITE_PROCESAMIENTO',LIMIT_MESSAGE)));
  worker.once('exit',()=>{if(!done)finish(new ExtractionError('LIMITE_PROCESAMIENTO',LIMIT_MESSAGE))});
  options.signal?.addEventListener('abort',abort,{once:true});if(options.signal?.aborted)abort();
 });
}
