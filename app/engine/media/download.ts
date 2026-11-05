import {SafeFetch,type AccessHooks} from '../fetch/safe-fetch.ts';
import {IMAGE_LIMITS,inspectImage} from '../../shared/media/image.ts';
export async function downloadMenuImage(job:{url:string;source:{url:string;allowedDomains:string[]}},signal?:AbortSignal,access:AccessHooks={}){
 const fetcher=new SafeFetch({approvedDomains:job.source.allowedDomains,signal,respectRobots:true,...access});
 const image=await fetcher.get(job.url,{base:job.source.url,maxBytes:IMAGE_LIMITS.bytes});if(image.status!==200)throw new Error('La foto no está disponible.');inspectImage(image.body,image.mime);return image;
}
