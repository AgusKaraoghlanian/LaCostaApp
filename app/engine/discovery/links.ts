import {normalizeUrl,canFollow} from '../security/network.ts';
const relevant=/men[uú]|carta|contact|nosotros|about|ubicaci[oó]n|galer[ií]a|gallery|bebidas|precios|horarios|comidas|gastronom|restaurant-menu/i;
export function discoverLinks(document:any,currentUrl:string,depth:number,allowedDomains:string[]=[]){const base=new URL(currentUrl);const found=new Map<string,any>();for(const a of document.querySelectorAll('a[href],link[rel="https://api.w.org/"],link[rel="sitemap"]')){const raw=a.getAttribute('href');const label=String(a.textContent||a.getAttribute('title')||'').trim().replace(/\s+/g,' ').slice(0,150);if(!raw||/[?&](?:add-to-cart|action|logout|delete|remove|cart|checkout)=/i.test(raw)||/\/(cart|checkout|wp-admin|wp-login)(\/|\?|$)/i.test(raw)||raw.startsWith('#')||!relevant.test(raw+' '+label)&&a.localName!=='link')continue;try{const url=normalizeUrl(new URL(raw,base).href);if(url.href===base.href)continue;const external=!canFollow(base,url,allowedDomains);const kind=/\.(?:jpe?g|png|webp)$/i.test(url.pathname)?'image':/\.pdf(?:\?|$)/i.test(url.href)?'pdf':a.getAttribute('rel')==='https://api.w.org/'?'wordpress':/galer|gallery/i.test(raw+' '+label)?'galeria':/contact|ubicaci/i.test(raw+' '+label)?'contacto':/men[uú]|carta/i.test(raw+' '+label)?'carta':'informacion';found.set(url.href,{url:url.href,kind,label:label||url.pathname,depth:depth+1,external})}catch{}}
return [...found.values()].sort((a,b)=>Number(b.kind==='carta')-Number(a.kind==='carta')).slice(0,50);}
function matchesRule(pattern:string,path:string){
 const end=pattern.endsWith('$');if(end)pattern=pattern.slice(0,-1);const parts=pattern.split('*');if(!path.startsWith(parts[0]))return false;let at=parts[0].length;
 if(parts.length===1)return !end||at===path.length;
 for(let i=1;i<parts.length;i++){const part=parts[i];if(end&&i===parts.length-1)return path.endsWith(part)&&path.length-part.length>=at;const found=path.indexOf(part,at);if(found<0)return false;at=found+part.length}return true;
}
export function robotsAllows(text:string,path:string,userAgent='CostaALaCartaBot'){
 if(text.length>128*1024||path.length>2000||text.split(/\r?\n/).length>1000)return false;
 const groups:{agents:string[];rules:{allow:boolean;path:string}[]}[]=[];let group:{agents:string[];rules:{allow:boolean;path:string}[]}|null=null;let rulesStarted=false;
 for(const raw of text.split(/\r?\n/)){const line=raw.split('#')[0].trim();const i=line.indexOf(':');if(i<0)continue;const k=line.slice(0,i).toLowerCase(),v=line.slice(i+1).trim();if(k==='user-agent'){if(!group||rulesStarted){group={agents:[],rules:[]};groups.push(group);rulesStarted=false}group.agents.push(v.toLowerCase())}else if(group&&['allow','disallow'].includes(k)){rulesStarted=true;if(v){if(v.length>2000)return false;group.rules.push({allow:k==='allow',path:v})}}}
 const agent=userAgent.toLowerCase(),explicit=groups.filter(g=>g.agents.some(a=>a!=='*'&&agent.includes(a))),selected=explicit.length?explicit:groups.filter(g=>g.agents.includes('*'));
 const matches=selected.flatMap(g=>g.rules).filter(rule=>matchesRule(rule.path,path)).sort((a,b)=>b.path.length-a.path.length||Number(b.allow)-Number(a.allow));return matches[0]?.allow??true;
}
