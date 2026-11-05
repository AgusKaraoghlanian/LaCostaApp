import {MenuItem,type Database,type MenuEntry,type Actor,type SqlStatement} from '../../shared/contracts/index.ts';
import {digest,uid,now,json} from '../application/common.ts';
const norm=(v:string)=>v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/\s+/g,' ');
export class MenuRepository{
 db:Database;constructor(db:Database){this.db=db}
 async prepare(listingId:string,revision:number,revisionId:string|null,input:MenuEntry[],actor:Actor,sourceId:string,lockedFields:string[]=[]){
  const entries=input.map(m=>MenuItem.parse(m));const statements:SqlStatement[]=[this.db.prepare('INSERT INTO listing_menu_drafts VALUES(?,?,?) ON CONFLICT(listing_id) DO UPDATE SET revision=excluded.revision,items_json=excluded.items_json').bind(listingId,revision,json(entries))];
  const timestamp=now();const stable=async(kind:string,key:string)=>kind+'-'+(await digest(listingId+'|'+key)).slice(0,32);
  for(const entry of entries){const observationId=uid(),path='menu.'+entry.key;statements.push(this.db.prepare('INSERT INTO observations(id,entity_type,entity_key,field_path,raw_json,normalized_json,source_id,observed_at,method,extractor_version,pointer,evidence,uncertainty,reason,created_by) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(observationId,'product',entry.key,'entry',json(entry),json(entry),sourceId,timestamp,'edicion-manual-carta','1.0',entry.pointer,entry.evidence,'media','Propuesta o corrección de carta guardada por la persona editora.',actor.id),this.db.prepare('INSERT INTO field_selections VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(listing_id,field_path) DO UPDATE SET observation_id=excluded.observation_id,revision=excluded.revision,selected_by=excluded.selected_by,selected_at=excluded.selected_at,reason=excluded.reason,locked=excluded.locked,lock_reason=excluded.lock_reason').bind(listingId,path,observationId,revision,actor.id,timestamp,'Selección editorial de carta.',lockedFields.includes(path)?1:0,lockedFields.includes(path)?'Corrección de carta protegida por la persona editora.':''))}
  if(!revisionId)return statements;
  for(const menuName of new Set(entries.map(e=>e.menuName))){
   const subset=entries.filter(e=>e.menuName===menuName),menuId=await stable('menu',norm(menuName)),versionId=uid();const previous=await this.db.prepare('SELECT id FROM menu_versions WHERE menu_id=? ORDER BY number DESC LIMIT 1').bind(menuId).first<any>();
   statements.push(this.db.prepare('INSERT OR IGNORE INTO menus VALUES(?,?,?,?,?,?)').bind(menuId,listingId,menuName,null,null,timestamp),this.db.prepare('INSERT INTO menu_versions VALUES(?,?,?,?,?,?,?,?,?,?)').bind(versionId,menuId,revision,'aprobada',sourceId,null,null,timestamp,previous?.id||null,json(subset)),this.db.prepare('INSERT INTO revision_menus VALUES(?,?)').bind(revisionId,versionId));
   const sections=new Set<string>();const products=new Set<string>();const variants=new Set<string>();
   for(const [order,entry] of subset.entries()){
    const sectionId=await stable('section',norm(menuName+'|'+entry.section)),logicalKey=norm(entry.section+'|'+entry.name),productId=await stable('product',logicalKey),variantId=await stable('variant',logicalKey+'|'+norm(entry.variant));
    if(!sections.has(sectionId)){sections.add(sectionId);statements.push(this.db.prepare('INSERT INTO menu_sections VALUES(?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,sort_order=excluded.sort_order').bind(sectionId,menuId,entry.section,order))}
    if(!products.has(productId)){products.add(productId);statements.push(this.db.prepare('INSERT INTO products VALUES(?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,description=excluded.description').bind(productId,listingId,logicalKey,entry.name,entry.description))}
    if(!variants.has(variantId)){variants.add(variantId);statements.push(this.db.prepare('INSERT OR IGNORE INTO product_variants(id,product_id,name) VALUES(?,?,?)').bind(variantId,productId,entry.variant))}
    const observationId=uid();statements.push(this.db.prepare('INSERT INTO observations(id,entity_type,entity_key,field_path,raw_json,normalized_json,source_id,observed_at,method,extractor_version,pointer,evidence,uncertainty,reason,created_by) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(observationId,'price',variantId,'price',json(entry.price.raw),json(entry.price),sourceId,timestamp,'revision-editorial-carta','1.0',entry.pointer,entry.evidence,'media','Asociación revisada por la persona editora; conserva el original y su referencia.',actor.id),this.db.prepare('INSERT INTO price_offers(id,variant_id,amount_minor,currency,raw_text,channel,observation_id,state) VALUES(?,?,?,?,?,?,?,?)').bind(uid(),variantId,entry.price.amountMinor,entry.price.currency,entry.price.raw,entry.price.channel,observationId,entry.status),this.db.prepare('INSERT INTO menu_version_entries VALUES(?,?,?,?,?,?)').bind(uid(),versionId,sectionId,productId,order,json(entry)));
   }
  }
  return statements;
 }
}
