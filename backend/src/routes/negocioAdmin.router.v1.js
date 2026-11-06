import express from 'express';
import * as negocioAdminController from '../controllers/negocioAdmin.controller.js';
import { authMiddleware, soloAdministrador } from '../middlewares/auth.middleware.js';
import { validar } from '../middlewares/validacion.middleware.js';
import {
  crearNegocioSchema,
  editarNegocioSchema,
  idNegocioSchema,
  listarNegociosSchema,
  restaurarRevisionSchema,
  revisionEsperadaSchema,
} from '../validators/negocio.validator.js';

const negocioAdminRouterV1 = express.Router();

// Todo el router es del admin.
negocioAdminRouterV1.use(authMiddleware, soloAdministrador);

negocioAdminRouterV1.get('/', validar({ query: listarNegociosSchema }), negocioAdminController.listarNegocios);
negocioAdminRouterV1.post('/', validar({ body: crearNegocioSchema }), negocioAdminController.crearNegocio);
negocioAdminRouterV1.get('/:id', validar({ params: idNegocioSchema }), negocioAdminController.obtenerNegocio);
negocioAdminRouterV1.put('/:id', validar({ params: idNegocioSchema, body: editarNegocioSchema }), negocioAdminController.editarNegocio);

const accion = validar({ params: idNegocioSchema, body: revisionEsperadaSchema });
negocioAdminRouterV1.post('/:id/revisiones', accion, negocioAdminController.aprobarRevision);
negocioAdminRouterV1.post('/:id/publicar', accion, negocioAdminController.publicarNegocio);
negocioAdminRouterV1.post('/:id/retirar', accion, negocioAdminController.retirarNegocio);
negocioAdminRouterV1.post(
  '/:id/restaurar',
  validar({ params: idNegocioSchema, body: restaurarRevisionSchema }),
  negocioAdminController.restaurarRevision,
);

export { negocioAdminRouterV1 };
