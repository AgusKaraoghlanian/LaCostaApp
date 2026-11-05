export const backend=import.meta.env.VITE_CATALOG_BACKEND;
if(!['local-api','demo'].includes(backend))throw new Error('Seleccioná un backend explícito para iniciar la aplicación.');
if(backend==='local-api'&&(import.meta.env.VITE_SUPABASE_URL||import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY))throw new Error('La configuración heredada de Supabase es incompatible con este proyecto local. No se realizó ninguna conexión.');
let csrf='';
const pendingOperations=new Map<string,string>();
export class ApiError extends Error{code:string;status:number;action:string;constructor(error:any,status:number){super(error?.message||'No pudimos completar la operación.');this.code=error?.code||'ERROR';this.status=status;this.action=error?.action||'Volvé a intentar.'}}
async function request(path:string,method='GET',data?:unknown){const signature=method+' '+path+' '+JSON.stringify(data),write=!['GET','HEAD'].includes(method);const operationKey=write?(pendingOperations.get(signature)||crypto.randomUUID()):'';if(write)pendingOperations.set(signature,operationKey);let response:Response;try{response=await fetch('/api/v1/'+path,{method,credentials:'same-origin',headers:{...(data?{'Content-Type':'application/json'}:{}),...(csrf?{'X-CSRF-Token':csrf}:{}),...(!['GET','HEAD'].includes(method)?{'Idempotency-Key':operationKey}:{})},...(data?{body:JSON.stringify(data)}:{})})}catch{throw new ApiError({code:'API_DESCONECTADA',message:'La API local no está conectada. Abrí «Costa a la carta — Motor» e iniciá el sistema.',action:'Revisá el estado en el lanzador.'},0)}let result:any;try{result=await response.json()}catch{throw new ApiError({code:'RESPUESTA_INVALIDA',message:'La API local respondió con un formato inesperado.'},response.status)}if(!response.ok){if(response.status<500&&![408,429].includes(response.status))pendingOperations.delete(signature);throw new ApiError(result.error,response.status)}if(write)pendingOperations.delete(signature);return result.data}
export const application={
 createOcr:(input:any)=>request('admin/ocr','POST',input),ocrReadings:(id:string)=>request('admin/imports/'+id+'/ocr'),
 requestImage:(id:string,url:string)=>request('admin/imports/'+id+'/images','POST',{url}),imageStatus:(id:string)=>request('admin/images/'+id),cancelImage:(id:string)=>request('admin/images/'+id+'/cancel','POST',{}),
 imageFile:async(id:string,signal?:AbortSignal)=>{const r=await fetch('/api/v1/admin/images/'+id+'/file',{credentials:'same-origin',signal});if(!r.ok){const e=await r.json();throw new ApiError(e.error,r.status)}return r.blob()},
 configuration:()=>request('config'),publicListings:()=>request('public/listings'),session:async()=>{const s=await request('auth/session');csrf=s?.csrf||'';return s},
 signIn:async()=>{const s=await request('auth/local','POST',{});csrf=s.csrf;return s},signOut:async()=>{await request('admin/logout','POST',{});csrf=''},
 listings:()=>request('admin/listings'),listing:(id:string)=>request('admin/listings/'+id),
 saveListing:(id:string|undefined,input:any)=>request('admin/listings'+(id?'/'+id:''),id?'PUT':'POST',input),
 withdraw:(id:string,expectedRevision:number,reason:string)=>request('admin/listings/'+id+'/withdraw','POST',{expectedRevision,reason}),
 publish:(id:string,expectedRevision:number)=>request('admin/listings/'+id+'/publish','POST',{expectedRevision}),revert:(id:string,revisionId:string,expectedRevision:number)=>request('admin/listings/'+id+'/revert','POST',{revisionId,expectedRevision}),
 imports:()=>request('admin/imports'),createImport:(input:any)=>request('admin/imports','POST',input),importDetail:(id:string)=>request('admin/imports/'+id),cancel:(id:string)=>request('admin/imports/'+id+'/cancel','POST',{}),retry:(id:string)=>request('admin/imports/'+id+'/retry','POST',{}),
 review:(id:string,listingId?:string)=>request('admin/reviews/'+id+(listingId?'?listingId='+encodeURIComponent(listingId):'')),decide:(id:string,input:any)=>request('admin/reviews/'+id+'/decisions','POST',input),
 saveReviewDraft:(id:string,decision:any,expectedVersion:number)=>request('admin/reviews/'+id+'/draft','PUT',{decision,expectedVersion}),
 backups:()=>request('admin/backups'),createBackup:()=>request('admin/backups','POST',{}),setBackupSchedule:(daily:boolean)=>request('admin/backups/schedule','PUT',{daily}),
 publications:()=>request('admin/publications'),sources:()=>request('admin/sources'),addSource:(id:string,input:any)=>request('admin/listings/'+id+'/sources','POST',input),updateSource:(id:string,input:any)=>request('admin/sources/'+id,'PUT',input),engine:()=>request('admin/engine'),pairing:()=>request('admin/pairing','POST',{}),revoke:(id:string)=>request('admin/devices/'+id+'/revoke','POST',{}),
 addGeography:(input:any)=>request('admin/geography','POST',input),
 addCategory:(nombre:string)=>request('admin/categories','POST',{nombre}),
};
