// Solo enlaces navegables. La descarga usa, además, SafeFetch y sus controles de red.
export function allowedLink(value:string,kind='web'){
 if(!value)return true;
 try{const u=new URL(value);if(!['http:','https:'].includes(u.protocol)||u.username||u.password||u.port)return false;
  const host=u.hostname.toLowerCase().replace(/^www\./,'');
  if(kind==='instagram')return host==='instagram.com'&&!/^\/(accounts|oauth)\b/i.test(u.pathname);
  if(kind==='facebook')return ['facebook.com','m.facebook.com','fb.com'].includes(host)&&!/^\/(sharer|share\.php|dialog|plugins|login)(\/|\.|$)/i.test(u.pathname);
  if(kind==='whatsapp')return (host==='wa.me'&&/^\/\d{7,15}$/.test(u.pathname))||(['api.whatsapp.com','web.whatsapp.com'].includes(host)&&u.pathname==='/send'&&/^\+?\d{7,15}$/.test(u.searchParams.get('phone')||''));
  return true;
 }catch{return false}
}
