import * as catalogoService from '../services/catalogo.service.js';

// Los datos ya validados y convertidos vienen en req.validado (ver validacion.middleware).

const listarCategorias = async (req, res, next) => {
  try {
    res.status(200).json(await catalogoService.listarCategorias());
  } catch (e) {
    next(e);
  }
};

const crearCategoria = async (req, res, next) => {
  try {
    res.status(201).json(await catalogoService.crearCategoria(req.validado.body));
  } catch (e) {
    next(e);
  }
};

const obtenerGeografia = async (req, res, next) => {
  try {
    res.status(200).json(await catalogoService.obtenerGeografia());
  } catch (e) {
    next(e);
  }
};

const crearProvincia = async (req, res, next) => {
  try {
    res.status(201).json(await catalogoService.crearProvincia(req.validado.body));
  } catch (e) {
    next(e);
  }
};

const crearPartido = async (req, res, next) => {
  try {
    res.status(201).json(await catalogoService.crearPartido(req.validado.body));
  } catch (e) {
    next(e);
  }
};

const crearLocalidad = async (req, res, next) => {
  try {
    res.status(201).json(await catalogoService.crearLocalidad(req.validado.body));
  } catch (e) {
    next(e);
  }
};

export { listarCategorias, crearCategoria, obtenerGeografia, crearProvincia, crearPartido, crearLocalidad };
