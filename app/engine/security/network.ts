import { isIP } from 'node:net';
export class ExtractionError extends Error {
 code:string;retryable:boolean;retryAt?:number;origin?:string;
 constructor(code:string,message:string,retryable=false){super(message);this.name='ExtractionError';this.code=code;this.retryable=retryable;}
}
const v4ToNumber=(ip:string)=>ip.split('.').reduce((n,part)=>n*256+Number(part),0);
const v4Ranges:[string,number][]=[['0.0.0.0',8],['10.0.0.0',8],['100.64.0.0',10],['127.0.0.0',8],['169.254.0.0',16],['172.16.0.0',12],['192.0.0.0',24],['192.0.2.0',24],['192.88.99.0',24],['192.168.0.0',16],['198.18.0.0',15],['198.51.100.0',24],['203.0.113.0',24],['224.0.0.0',4],['240.0.0.0',4]];
function v6ToNumber(address:string){const [left,right]=address.toLowerCase().split('::');const l=left?left.split(':'):[];const r=right?right.split(':'):[];const groups=right!==undefined?[...l,...Array(8-l.length-r.length).fill('0'),...r]:l;if(groups.length!==8)throw new Error('IPv6 inválida');return groups.reduce((n,g)=>(n<<16n)+BigInt('0x'+g),0n);}
const inV6=(value:bigint,base:string,bits:number)=>value>>BigInt(128-bits)===v6ToNumber(base)>>BigInt(128-bits);
export function isGlobalAddress(raw:string):boolean {
 const ip=raw.replace(/^\[|\]$/g,'');const family=isIP(ip);
 if(family===4){const value=v4ToNumber(ip);return !v4Ranges.some(([base,bits])=>Math.floor(value/2**(32-bits))===Math.floor(v4ToNumber(base)/2**(32-bits)));}
 if(family!==6||ip.includes('%')||ip.includes('.'))return false;
 const value=v6ToNumber(ip);
 // Política conservadora: solo unicast global y sin mecanismos de traducción.
 return inV6(value,'2000::',3)&&!inV6(value,'2001::',23)&&!inV6(value,'2001:db8::',32)&&!inV6(value,'2002::',16)&&!inV6(value,'3fff::',20);
}
export function normalizeUrl(raw:string):URL {
 let url:URL;try{url=new URL(raw)}catch{throw new ExtractionError('URL_INVALIDA','Ingresá una dirección web completa, por ejemplo https://sitio.com.ar.');}
 if(!['http:','https:'].includes(url.protocol)||url.username||url.password||url.port||(url.hostname==='localhost')||url.hostname.endsWith('.localhost')||url.hostname.endsWith('.local')||!url.hostname.includes('.')&&!isIP(url.hostname.replace(/^\[|\]$/g,'')))throw new ExtractionError('URL_NO_PERMITIDA','La dirección debe ser HTTP o HTTPS pública, sin credenciales ni puertos especiales.');
 const host=url.hostname.replace(/^\[|\]$/g,'');if(isIP(host)&&!isGlobalAddress(host))throw new ExtractionError('DESTINO_PRIVADO','No se permiten direcciones internas, reservadas o de esta computadora.');
 url.hash='';for(const key of [...url.searchParams.keys()])if(/^utm_|^(fbclid|gclid|msclkid)$/i.test(key))url.searchParams.delete(key);url.searchParams.sort();return url;
}
export function validateResolvedAddresses(addresses:{address:string;family:number}[]){if(!addresses.length||addresses.some(a=>!isGlobalAddress(a.address)))throw new ExtractionError('DNS_NO_PUBLICO','El dominio resuelve a una dirección no pública. No se realizó la descarga.');return addresses;}
export function sameAddress(a:string,b:string){const clean=(v:string)=>v.toLowerCase().replace(/^::ffff:/,'');if(isIP(clean(a))===4&&isIP(clean(b))===4)return clean(a)===clean(b);try{return v6ToNumber(clean(a))===v6ToNumber(clean(b))}catch{return false}}
export function canFollow(from:URL,to:URL,approvedDomains:string[]){return from.origin===to.origin||(from.protocol==='http:'&&to.protocol==='https:'&&from.hostname===to.hostname)||approvedDomains.includes(to.hostname);}
export function safePublicLink(value:string,kind:'web'|'instagram'|'facebook'|'whatsapp'='web'){
 const u=normalizeUrl(value);const hosts={instagram:['instagram.com','www.instagram.com'],facebook:['facebook.com','www.facebook.com','m.facebook.com'],whatsapp:['wa.me','api.whatsapp.com','www.whatsapp.com','whatsapp.com']};if(kind!=='web'&&!hosts[kind].includes(u.hostname))throw new ExtractionError('ENLACE_INVALIDO','El enlace no corresponde al canal indicado.');if(kind==='facebook'&&/^\/(sharer|share(?:\.php)?|dialog|plugins|login)(?:\/|\.|$)/i.test(u.pathname))throw new ExtractionError('ENLACE_COMPARTIR','Un botón para compartir no identifica la página del negocio.');return u.href;
}
