import type {Database,Actor,Fields,MenuEntry,SqlStatement} from '../../shared/contracts/index.ts';import {uid,json,parse,now} from '../application/common.ts';import {compareField} from '../../engine/diff/three-way.ts';
export class ChangeRepository{
 db:Database;constructor(db:Database){this.db=db}
 async prepare(actor:Actor,job:any,listingId:string,revision:number,fields:Fields,menu:MenuEntry[],locks:string[],rejected:string[],candidateKey?:string){
  const observations=job.result?.observations||[],latest=new Map<string,any>();for(const o of observations)if(o.entityType==='business'||o.fieldPath==='price')latest.set(o.entityKey+'|'+o.fieldPath,o);
  const previous=(await this.db.prepare('SELECT * FROM(SELECT o.*,row_number() OVER(PARTITION BY entity_key,field_path ORDER BY observed_at DESC,rowid DESC) AS position FROM observations o WHERE source_id=? AND run_id<>? AND observed_at<?) WHERE position=1').bind(job.source_id,job.result.runId,observations[0]?.observedAt||now()).all<any>()).results;
  const old=await this.db.prepare('SELECT data_json FROM listing_drafts WHERE listing_id=?').bind(listingId).first<any>();const editorial=parse(old?.data_json,{});const setId=uid();const statements:SqlStatement[]=[this.db.prepare('INSERT INTO change_sets VALUES(?,?,?,?,?,?)').bind(setId,job.id,listingId,revision,'revisado',now())];
  for(const o of latest.values()){
   const isBusiness=o.entityType==='business';if(isBusiness&&candidateKey&&o.entityKey!==candidateKey)continue;const entry=menu.find(m=>m.key===o.entityKey);if(!isBusiness&&!entry)continue;if(isBusiness&&!(o.fieldPath in fields))continue;
   const prior=previous.find(p=>p.entity_key===o.entityKey&&p.field_path===o.fieldPath),base=parse(prior?.normalized_json),selected=isBusiness?fields[o.fieldPath]:entry!.price;
   const path=isBusiness?o.fieldPath:'menu.'+o.entityKey+'.price',lockPath=isBusiness?o.fieldPath:'menu.'+o.entityKey;
   const comparison=compareField(base,isBusiness?editorial[o.fieldPath]:selected,o.normalizedValue,locks.includes(lockPath));const decision=rejected.includes(o.id)?'rechazado':json(selected)===json(o.normalizedValue)?'aceptado':locks.includes(lockPath)?'correccion_protegida':'corregido';
   statements.push(this.db.prepare('INSERT INTO change_items VALUES(?,?,?,?,?,?,?,?,?,?,?,?)').bind(uid(),setId,path,prior?.id||null,o.id,json(base),json(isBusiness?editorial[o.fieldPath]:selected),json(o.normalizedValue),decision,comparison.conflict?1:0,actor.id,now()));
  }
  return statements;
 }
}
