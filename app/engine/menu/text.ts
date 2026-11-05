import {parseMoney,normalizeName} from '../normalize/values.ts';
import type {MenuDocumentText} from '../../shared/contracts/menu-text.ts';
import type {MenuEntry} from '../../shared/contracts/index.ts';
const sections=new Set(['pizzas','empanadas','entradas','platos principales','minutas','pastas','parrilla','postres','bebidas','cervezas','vinos','promociones','sandwiches','hamburguesas','ensaladas','cafeteria']);
const variant=/^(individual|chica|mediana|grande|familiar|porcion|porción|media porci[oó]n|(?:\d+\s*)?(?:ml|cc|litros?|l)|(?:6|12)\s*(?:unidades|u\.?))\b/i;
const condition=/\b(promoci[oó]n|promo|condiciones|v[aá]lid[oa]|efectivo|incluye|no incluye|cubierto|servicio de mesa|\d+\s*x\s*\d+)\b/i;
const hash=(s:string)=>{let h=14695981039346656037n;for(const c of s)h=BigInt.asUintN(64,(h^BigInt(c.charCodeAt(0)))*1099511628211n);return h.toString(16)};
export function parseMenuText(input:MenuDocumentText,readingId:string){
 const lines=(input.correctedText??input.text).split(/\r?\n/).slice(0,1000);const items:MenuEntry[]=[];const warnings:string[]=[];const unmatched:{line:number;text:string;reason:string}[]=[];let section='Carta',product='',description='';
 const doubtful=(line:number,text:string,reason:string)=>unmatched.push({line,text:text.slice(0,1000),reason});
 for(let i=0;i<lines.length;i++){
  const text=lines[i].trim().replace(/\s+/g,' ');if(!text)continue;const norm=normalizeName(text);
  if(sections.has(norm)){section=text;product='';description='';continue}
  if(/^(carta|men[uú]|lista de precios|precios en pesos|precios en ars)$/i.test(text)){product='';description='';continue}
  if(condition.test(text)){doubtful(i+1,text,'Promoción o condición: revisar manualmente; no se asignó como producto ni precio.');product='';description='';continue}
  const matches=[...text.matchAll(/(?:ARS\s*|USD\s*|EUR\s*|UYU\s*|BRL\s*|\$\s*|€\s*)[\d.,?xo-]+/gi)];
  const bare=text.match(/\s(\d{3,8}(?:[.,]\d{1,3})*|\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?)\s*$/);
  const priceText=matches.length===1?matches[0][0]:!matches.length&&bare?bare[1]:'';
  if(matches.length>1){doubtful(i+1,text,'Hay varios precios en una misma línea. Separá columnas antes de interpretar.');product='';description='';continue}
  if(priceText){
   const at=matches.length?matches[0].index!:text.lastIndexOf(priceText);const prefix=text.slice(0,at).replace(/[.·:—-]+\s*$/,'').trim();
   if(text.slice(at+priceText.length).trim()){doubtful(i+1,text,'El precio no termina la fila; no se atribuyó a ningún plato.');product='';continue}
   let name=prefix||product,size='Base';const sizeOnly=variant.test(prefix);
   if(sizeOnly){if(!product){doubtful(i+1,text,'Tamaño sin un producto inmediatamente anterior.');continue}name=product;size=prefix;}
   else {const sizeMatch=prefix.match(/\s+(individual|chica|mediana|grande|familiar|\d+\s*(?:ml|cc|litros?))$/i);if(sizeMatch){size=sizeMatch[1];name=prefix.slice(0,sizeMatch.index).trim()}if(!name||name.length>250){doubtful(i+1,text,'Nombre ausente o ilegible; no se inventó un producto.');product='';continue}product=name;description='';}
   let price=parseMoney(priceText);const confidence=input.lines.find(l=>l.text.trim()===text)?.confidence??input.confidence;
   if(confidence<35&&(input.correctedText===undefined||input.correctedText===input.text)){doubtful(i+1,text,'Texto de confianza muy baja. No se propuso nombre ni precio; requiere transcripción manual.');product='';description='';continue}
   if(confidence<55)price={...price,amountMinor:null,needsReview:true,reason:'Reconocimiento de baja confianza: el importe no se considera legible.'};
   price={...price,needsReview:true,reason:price.reason+' OCR: confirmá nombre, variante e importe con el original.'};
   items.push({key:'ocr-'+hash(normalizeName(section+'|'+name+'|'+size)),name,description,menuName:'Carta',section,variant:size,price,sourceUrl:input.source.url,evidence:text.slice(0,500),pointer:'ocr/'+readingId+'/line/'+(i+1),status:'propuesto',...(input.source.imageHash?{provenance:{readingId,imageHash:input.source.imageHash,imageName:input.source.name,line:i+1,confidence,reviewed:false}}:{})});
   if(items.length>=300){warnings.push('Se alcanzaron 300 propuestas. Dividí la carta para continuar.');break}continue;
  }
  if(/\$|\b(?:ARS|USD)\b|[?]{2,}/.test(text)){doubtful(i+1,text,'Precio o texto ilegible: corregilo consultando el original.');product='';description='';continue}
  if(/[a-záéíóúñ]/i.test(text)&&product&&/^(con |de |salsa |incluye |acompañado)/i.test(text)){description=(description+' '+text).trim().slice(0,1500);for(const item of items)if(item.name===product&&item.section===section)item.description=description;continue}
  if(/^[\p{L}\d ()&/+.,'-]+$/u.test(text)&&text.length<=150&&/\p{L}{3}/u.test(text)){if(product&&!items.some(m=>m.name===product))doubtful(i,product,'El encabezado anterior no tenía un precio asociado.');product=text;description='';}
  else {doubtful(i+1,text,'Línea no interpretada.');product='';description='';}
 }
 // Colisiones o repeticiones quedan visibles; nunca sobrescribir una variante con otra.
 const counts=new Map<string,number>();for(const item of items){const count=(counts.get(item.key)||0)+1;counts.set(item.key,count);if(count>1){item.key+='-repetido-'+count;warnings.push('Se repite un producto y variante. Revisá si corresponde a otra sección o promoción.')}}
 if(product&&!items.some(m=>m.name===product))doubtful(lines.length,product,'Texto sin un precio asociado.');
 if(!items.length)warnings.push('No se encontraron asociaciones legibles de platos y precios. La imagen puede no contener una carta o no informar precios.');
 if(unmatched.length)warnings.push(unmatched.length+' líneas necesitan interpretación manual.');
 return {items,warnings:[...new Set(warnings)],unmatched};
}
