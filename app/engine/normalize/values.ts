export const normalizeName=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export const stableSlug=(s:string)=>normalizeName(s).replace(/ /g,'-').slice(0,100);
export function normalizePhone(raw:string){const compact=raw.replace(/[^\d+]/g,'');return compact.startsWith('+')?'+'+compact.slice(1).replace(/\D/g,''):compact.replace(/\D/g,'');}
export function parseMoney(raw:string,currency:string|null=null){
 const original=raw;const explicit=raw.match(/\b(ARS|USD|EUR|BRL|UYU)\b/i)?.[1]?.toUpperCase()||currency;let text=raw.replace(/\b(ARS|USD|EUR|BRL|UYU)\b/gi,'').replace(/[$€\s]/g,'');
 const fail=(reason:string)=>({raw:original,amountMinor:null,currency:explicit,channel:'sin_especificar' as const,needsReview:true,reason});
 if(!/^\d[\d.,]*$/.test(text)||text.length>16)return fail('El importe no tiene un formato numérico inequívoco.');
 let integer='',decimal='';
 if(/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(text)){const parts=text.split(',');integer=parts[0].replaceAll('.','');decimal=parts[1]||'';}
 else if(/^\d+(,\d{1,2})$/.test(text)){[integer,decimal]=text.split(',');}
 else if(/^\d+$/.test(text)){integer=text;}
 else if(/^\d+\.\d{1,2}$/.test(text)){[integer,decimal]=text.split('.');}
 else return fail('Los separadores son ambiguos; revisá el importe junto al original.');
 const amount=BigInt(integer)*100n+BigInt(decimal.padEnd(2,'0')||'0');if(amount>BigInt(Number.MAX_SAFE_INTEGER))return fail('El importe excede el límite permitido.');
 return {raw:original,amountMinor:Number(amount),currency:explicit,channel:'sin_especificar' as const,needsReview:!explicit,reason:explicit?'Importe interpretado sin usar decimales de punto flotante.':'La fuente usa un símbolo sin moneda explícita. Elegí la moneda antes de aprobar.'};
}
const DAYS:Record<string,number>={Sunday:0,Monday:1,Tuesday:2,Wednesday:3,Thursday:4,Friday:5,Saturday:6,Su:0,Mo:1,Tu:2,We:3,Th:4,Fr:5,Sa:6};
export function normalizeOpeningPeriod(day:string,opens:string,closes:string){const key=day.split('/').at(-1)||'';if(!(key in DAYS)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(opens)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(closes))return null;return {day:DAYS[key],opens,closes,nextDay:closes<opens,timezone:'America/Argentina/Buenos_Aires'};}
