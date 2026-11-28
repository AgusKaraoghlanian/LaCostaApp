import express from 'express';
import * as solicitudController from '../controllers/solicitud.controller.js';
import { authMiddleware, soloAdministrador } from '../middlewares/auth.middleware.js';
import { validar } from '../middlewares/validacion.middleware.js';
import { limiteSolicitudes } from '../middlewares/limite.middleware.js';
import {
  crearSolicitudSchema,
  editarSolicitudSchema,
  idSolicitudSchema,
  listarSolicitudesSchema,
} from '../validators/solicitud.validator.js';

const solicitudRouterV1 = express.Router();

// Pública: el formulario de "Sumá tu lugar" y "Reclamar mi negocio".
solicitudRouterV1.post('/solicitudes', limiteSolicitudes, validar({ body: crearSolicitudSchema }), solicitudController.crearSolicitud);

const admin = [authMiddleware, soloAdministrador];
solicitudRouterV1.get('/admin/solicitudes', ...admin, validar({ query: listarSolicitudesSchema }), solicitudController.listarSolicitudes);
solicitudRouterV1.patch(
  '/admin/solicitudes/:id',
  ...admin,
  validar({ params: idSolicitudSchema, body: editarSolicitudSchema }),
  solicitudController.editarSolicitud,
);

export { solicitudRouterV1 };
