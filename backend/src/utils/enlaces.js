// Reglas de los links de una ficha. Solo se aceptan links que se puedan abrir en el navegador
// (http o https, sin usuario, contraseña ni puerto) y, en las redes, que sean de esa red.

const HOSTS_FACEBOOK = ['facebook.com', 'm.facebook.com', 'fb.com'];
const HOSTS_WHATSAPP = ['api.whatsapp.com', 'web.whatsapp.com'];

// "https://www.instagram.com/x" → "instagram.com"
const hostDe = (url) => url.hostname.toLowerCase().replace(/^www\./, '');

const esInstagram = (url) =>
  hostDe(url) === 'instagram.com' && !/^\/(accounts|oauth)\b/i.test(url.pathname);

// Que sea la página del negocio y no un botón de compartir o el login.
const esFacebook = (url) =>
  HOSTS_FACEBOOK.includes(hostDe(url)) &&
  !/^\/(sharer|share\.php|dialog|plugins|login)(\/|\.|$)/i.test(url.pathname);

// wa.me/5492255123456 o api.whatsapp.com/send?phone=5492255123456
const esWhatsapp = (url) => {
  const host = hostDe(url);
  if (host === 'wa.me') return /^\/\d{7,15}$/.test(url.pathname);
  return HOSTS_WHATSAPP.includes(host) && url.pathname === '/send' &&
    /^\+?\d{7,15}$/.test(url.searchParams.get('phone') || '');
};

const REGLAS = { instagram: esInstagram, facebook: esFacebook, whatsapp: esWhatsapp };

// tipo: 'web' (cualquier sitio), 'instagram', 'facebook' o 'whatsapp'. Vacío vale (no tiene).
export const esEnlacePermitido = (valor, tipo = 'web') => {
  if (!valor) return true;
  let url;
  try {
    url = new URL(valor);
  } catch {
    return false;
  }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.port) return false;
  const regla = REGLAS[tipo];
  return regla ? regla(url) : true;
};
