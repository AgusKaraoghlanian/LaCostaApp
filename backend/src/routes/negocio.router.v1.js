import express from 'express';
import * as negocioController from '../controllers/negocio.controller.js';
import { validar } from '../middlewares/validacion.middleware.js';
import { listarNegociosSchema, slugSchema } from '../validators/negocio.validator.js';

const negocioRouterV1 = express.Router();

// Públicas: solo los negocios publicados.
negocioRouterV1.get('/', validar({ query: listarNegociosSchema }), negocioController.listarPublicados);
negocioRouterV1.get('/:slug', validar({ params: slugSchema }), negocioController.obtenerPublicado);

export { negocioRouterV1 };
