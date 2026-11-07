// Variables de entorno del backend, validadas al arrancar (server.js). Si falta algo
// obligatorio el servidor no levanta y dice qué falta, en vez de fallar recién en el
// primer request que la use.

const esProduccion = () => process.env.NODE_ENV === 'production';

// En desarrollo, si no se configura nada, se acepta el frontend de Vite.
const ORIGENES_DE_DESARROLLO = ['http://localhost:5173'];

// Orígenes (sitios) que pueden llamar a la API desde el navegador (CORS).
// CORS_ORIGENES: lista separada por comas, ej. "https://costa-a-la-carta.onrender.com".
const origenesPermitidos = () => {
  const lista = (process.env.CORS_ORIGENES ?? '')
    .split(',')
    .map((origen) => origen.trim().replace(/\/+$/, ''))
    .filter(Boolean);
  if (lista.length > 0) return lista;
  return esProduccion() ? [] : ORIGENES_DE_DESARROLLO;
};

// En producción todo es obligatorio; en desarrollo algunas cosas solo avisan.
const validarEntorno = () => {
  const problemas = [];
  const avisos = [];

  if (!process.env.DATABASE_URL) problemas.push('DATABASE_URL falta');

  const secreto = process.env.JWT_SECRET ?? '';
  if (!secreto) {
    problemas.push('JWT_SECRET falta');
  } else if (secreto.length < 32) {
    // Un secreto corto se puede adivinar, y con él cualquiera arma sesiones (hasta de admin).
    (esProduccion() ? problemas : avisos).push('JWT_SECRET tiene menos de 32 caracteres: usá uno largo y al azar');
  }

  if (esProduccion() && !process.env.CORS_ORIGENES) {
    problemas.push('CORS_ORIGENES falta: la URL del frontend (ej. https://costa-a-la-carta.onrender.com)');
  }

  // Sin Supabase Storage las fotos van al disco del servidor, que en el hosting se borra.
  if (esProduccion() && !(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)) {
    avisos.push('SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY faltan: las fotos subidas se van a perder en cada deploy');
  }

  avisos.forEach((aviso) => console.warn(`Aviso: ${aviso}`));
  if (problemas.length > 0) {
    throw new Error(`Revisá las variables de entorno del backend:\n  - ${problemas.join('\n  - ')}`);
  }
};

export { esProduccion, origenesPermitidos, validarEntorno };
