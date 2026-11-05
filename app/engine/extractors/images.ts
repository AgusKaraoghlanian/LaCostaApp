import {safePublicLink} from '../security/network.ts';
export function detectImages(document:any,roots:any[],context:{url:string;resourceId:string}){
 const found=new Map<string,any>();
 const add=(raw:string,label='',pointer='')=>{if(!raw||found.size>=100)return;try{
  const url=safePublicLink(new URL(raw,context.url).href);if(url.length>2000)return;
  const text=(url+' '+label+' '+context.url).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();const signals=[];let score=0;
  if(/carta|menu|lista.de.precios|bebidas|precios/.test(text)){score+=65;signals.push('Nombre, contexto o enlace relacionado con cartas y precios.');}
  if(/carta|menu|precios/.test(label)){score+=25;signals.push('Texto cercano o alternativo de carta.');}
  const kind=score>=60?'carta':/plato|pizza|hamburguesa|comida|dish|food/.test(text)?'plato':/fachada|salon|local|restaurante|restaurant|interior/.test(text)?'establecimiento':'desconocida';
  const previous=found.get(url);if(!previous||previous.score<score)found.set(url,{url,kind,rights:'desconocido',resourceId:context.resourceId,pageUrl:context.url,label:label.replace(/\s+/g,' ').slice(0,500),score,signals:[...signals,pointer].filter(Boolean)});
 }catch{}};
 for(const img of [...document.querySelectorAll('img,source[srcset]')].slice(0,500)){
  const label=[img.getAttribute('alt'),img.getAttribute('title'),img.closest('figure')?.querySelector('figcaption')?.textContent,img.closest('a')?.textContent].filter(Boolean).join(' ').slice(0,500);
  for(const attribute of ['src','data-src','data-lazy-src','data-original'])add(img.getAttribute(attribute)||'',label,attribute);
  for(const attr of ['srcset','data-srcset']){const entries=String(img.getAttribute(attr)||'').split(',').map(v=>v.trim().split(/\s+/)).filter(v=>v[0]);entries.sort((a,b)=>(parseFloat(b[1])||0)-(parseFloat(a[1])||0));if(entries[0])add(entries[0][0],label,attr);}
 }
 for(const meta of document.querySelectorAll('meta[property="og:image"],meta[property="og:image:url"],meta[name="twitter:image"]'))add(meta.getAttribute('content')||'','Imagen principal del sitio','metadatos');
 for(const a of document.querySelectorAll('a[href]'))if(/\.(?:jpe?g|png|webp)(?:[?#]|$)/i.test(a.getAttribute('href')||''))add(a.getAttribute('href'),a.textContent||a.getAttribute('title')||'','enlace público');
 let visited=0;const walk=(node:any,depth=0)=>{if(!node||typeof node!=='object'||depth>8||visited++>1000)return;if(Array.isArray(node)){node.forEach(n=>walk(n,depth+1));return}for(const [key,value]of Object.entries(node)){if(['image','photo','thumbnailUrl','contentUrl'].includes(key)){for(const image of [value].flat())if(typeof image==='string')add(image,String(node.name||''),'datos estructurados');else if(image&&typeof image==='object')add((image as any).url||(image as any).contentUrl||'',String(node.name||''),'datos estructurados')}if(typeof value==='object')walk(value,depth+1)}};roots.forEach(r=>walk(r));
 return [...found.values()].sort((a,b)=>b.score-a.score).slice(0,80);
}
