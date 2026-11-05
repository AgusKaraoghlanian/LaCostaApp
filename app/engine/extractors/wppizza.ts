import {parseMoney,normalizeName} from '../normalize/values.ts';import type {MenuEntry} from '../../shared/contracts/index.ts';import {createHash} from 'node:crypto';
import {PROCESS_LIMITS} from '../security/limits.ts';
const clean=(s:any,max=500)=>String(s||'').replace(/\s+/g,' ').trim().slice(0,max);
// Familia de CMS WPPizza: las opciones conservan el contenedor de precio y tamaño.
export function extractWppizza(document:any,url:string,businessKey:string){const items:MenuEntry[]=[];const warnings:string[]=[];let section='Carta';
 for(const node of [...document.querySelectorAll('h1,h2,h3,.wppizza-article')].slice(0,2000)){if(items.length>=PROCESS_LIMITS.menu){warnings.push('Se alcanzó el límite de propuestas de WPPizza por recurso.');break}
  if(!node.classList.contains('wppizza-article')){if(!node.closest('.wppizza-article'))section=clean(node.textContent,200)||section;continue}
  const name=clean(node.querySelector('.wppizza-article-title')?.textContent,250);if(!name)continue;const description=clean(node.querySelector('.wppizza-article-content')?.textContent,1500);
  const options=node.querySelectorAll('.wppizza-article-price');
  for(const [index,option] of [...options].slice(0,PROCESS_LIMITS.menu).entries()){
   if(items.length>=PROCESS_LIMITS.menu)break;
   const priceNode=option.querySelector('span');const raw=clean(priceNode?.textContent,250);if(!raw)continue;
   const remaining=option.cloneNode(true);remaining.querySelector('span')?.remove();const label=clean(remaining.textContent,200);const variant=label||'Base';
   if(options.length>1&&!label){if(warnings.length<PROCESS_LIMITS.warnings)warnings.push('Un producto de WPPizza tiene varios precios sin tamaño explícito; se omitió para evitar asociaciones falsas.');continue}
   // Adicionales como + crema no son tamaños alternativos: requieren revisión separada.
   if(/^\+/.test(variant)){warnings.push('Adicional separado pendiente: '+name+' · '+variant);continue}
   const key='product-'+createHash('sha256').update(normalizeName(businessKey+'|'+section+'|'+name+'|'+variant)).digest('hex').slice(0,20);
   items.push({key,businessKey,menuName:'Carta',name,description,section,variant,price:parseMoney(raw),sourceUrl:url,evidence:clean(name+' · '+variant+' · '+raw+' · '+description),pointer:'wppizza/'+(node.id||name)+'/option/'+index,status:'propuesto'});
  }
  if(options.length>PROCESS_LIMITS.menu)warnings.push('Se alcanzó el límite de propuestas de WPPizza por recurso.');
 }
 return {items,warnings};
}
