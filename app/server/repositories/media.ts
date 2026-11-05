import type {Bindings,Actor} from '../../shared/contracts/index.ts';
import {AppError,uid,now,json,audit} from '../application/common.ts';
export class MediaStore {
 env:Bindings;constructor(env:Bindings){this.env=env}
 async list(listingId:string){return (await this.env.DB.prepare('SELECT a.id,a.mime,a.byte_count,a.technical_state,a.rights_state,m.kind,m.alt FROM media_assets a JOIN listing_media m ON m.asset_id=a.id WHERE m.listing_id=?').bind(listingId).all()).results;}
 async rights(actor:Actor,assetId:string,input:any){if(!['pendiente','autorizado','rechazado','revocado'].includes(input.state))throw new AppError(400,'DERECHO_INVALIDO','Elegí un estado de permisos válido.');if(input.state==='autorizado'&&(!input.holder||!input.basis||!input.reference))throw new AppError(400,'FALTA_PERMISO','Registrá el titular, el fundamento y una referencia verificable del permiso.');await this.env.DB.batch([this.env.DB.prepare('INSERT INTO media_rights VALUES(?,?,?,?,?,?,?,?,?,?,?,?)').bind(uid(),assetId,input.holder||null,input.authorizer||null,input.basis||null,input.reference||null,input.attribution||null,input.scope||null,input.expiresAt||null,input.state,actor.id,now()),this.env.DB.prepare('UPDATE media_assets SET rights_state=? WHERE id=?').bind(input.state,assetId),audit(this.env.DB,actor.id,'cambiar_derechos','media',assetId,{state:input.state})]);return {ok:true};}
}
