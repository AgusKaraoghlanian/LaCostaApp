import express from 'express';
import * as fotoController from '../controllers/foto.controller.js';
import { authMiddleware, soloAdministrador } from '../middlewares/auth.middleware.js';
import { TAMANIO_MAXIMO } from '../services/foto.service.js';

const fotoAdminRouterV1 = express.Router();

fotoAdminRouterV1.use(authMiddleware, soloAdministrador);

// El frontend manda el archivo directo en el body (Content-Type: image/...), sin multipart.
// Lo que no sea image/* llega vacío y el service lo rechaza.
fotoAdminRouterV1.post('/', express.raw({ type: 'image/*', limit: TAMANIO_MAXIMO }), fotoController.subirFoto);

export { fotoAdminRouterV1 };
