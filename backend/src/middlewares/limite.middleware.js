import { rateLimit } from 'express-rate-limit';

// Límites de pedidos por IP, para frenar a quien prueba contraseñas o crea cuentas en masa.
// Responden 429 con un mensaje como el resto de los errores ({ message }). En producción
// la IP real llega por el proxy de Render (ver "trust proxy" en app.js).

const limite = ({ minutos, maximo, mensaje, soloFallidos = false }) =>
  rateLimit({
    windowMs: minutos * 60 * 1000,
    limit: maximo,
    skipSuccessfulRequests: soloFallidos,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { message: mensaje },
  });

// Login: 10 intentos fallidos cada 15 minutos (los que salen bien no cuentan).
const limiteLogin = limite({
  minutos: 15,
  maximo: 10,
  soloFallidos: true,
  mensaje: 'Demasiados intentos para iniciar sesión. Probá de nuevo en 15 minutos.',
});

// Registro: 10 cuentas por hora desde la misma conexión.
const limiteRegistro = limite({
  minutos: 60,
  maximo: 10,
  mensaje: 'Demasiados registros desde esta conexión. Probá de nuevo en una hora.',
});

// Toda la API: 3000 pedidos cada 15 minutos por conexión. Cada pantalla hace varios pedidos
// y varias personas en el mismo wifi comparten la IP: 600 se quedaba corto para un grupo.
const limiteGeneral = limite({
  minutos: 15,
  maximo: 3000,
  mensaje: 'Demasiados pedidos seguidos. Esperá unos minutos y probá de nuevo.',
});

// Búsquedas en EA: 30 cada 15 minutos. Cada una es un pedido a EA, y EA pide pocos pedidos.
const limiteEa = limite({
  minutos: 15,
  maximo: 30,
  mensaje: 'Demasiadas búsquedas en EA. Probá de nuevo en unos minutos.',
});

export { limiteLogin, limiteRegistro, limiteGeneral, limiteEa };
