import { verificarToken } from '../utils/jwt.js';
import { TokenNoEnviado } from '../errors/auth/TokenNoEnviado.js';
import { TokenInvalido } from '../errors/auth/TokenInvalido.js';
import { SinPermiso } from '../errors/auth/SinPermiso.js';

// Lee el token de "Authorization: Bearer <token>" y deja el id y el rol en req.
const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new TokenNoEnviado());
  }

  const token = header.split(' ')[1];

  try {
    const payload = verificarToken(token);
    req.id = payload.id;
    req.rol = payload.rol;
    next();
  } catch (e) {
    next(new TokenInvalido());
  }
};

// Va después de authMiddleware: el rol sale del token ya verificado, nunca del body.
const soloAdministrador = (req, res, next) => {
  if (req.rol !== 'ADMINISTRADOR') return next(new SinPermiso());
  next();
};

export { authMiddleware, soloAdministrador };
