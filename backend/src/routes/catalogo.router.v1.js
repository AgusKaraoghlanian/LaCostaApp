import express from 'express';
import * as catalogoController from '../controllers/catalogo.controller.js';
import { authMiddleware, soloAdministrador } from '../middlewares/auth.middleware.js';
import { validar } from '../middlewares/validacion.middleware.js';
import {
  crearCategoriaSchema,
  crearProvinciaSchema,
  crearPartidoSchema,
  crearLocalidadSchema,
} from '../validators/catalogo.validator.js';

const catalogoRouterV1 = express.Router();

// Públicas: las usan los filtros del sitio.
catalogoRouterV1.get('/categorias', catalogoController.listarCategorias);
catalogoRouterV1.get('/geografia', catalogoController.obtenerGeografia);

// Altas del admin.
const admin = [authMiddleware, soloAdministrador];
catalogoRouterV1.post('/admin/categorias', ...admin, validar({ body: crearCategoriaSchema }), catalogoController.crearCategoria);
catalogoRouterV1.post('/admin/provincias', ...admin, validar({ body: crearProvinciaSchema }), catalogoController.crearProvincia);
catalogoRouterV1.post('/admin/partidos', ...admin, validar({ body: crearPartidoSchema }), catalogoController.crearPartido);
catalogoRouterV1.post('/admin/localidades', ...admin, validar({ body: crearLocalidadSchema }), catalogoController.crearLocalidad);

export { catalogoRouterV1 };
