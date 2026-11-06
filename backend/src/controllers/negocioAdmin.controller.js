import * as negocioService from '../services/negocio.service.js';

// Las fichas vistas por el admin. req.id es el usuario del token (ver auth.middleware).
// Cada acción devuelve la ficha actualizada.

const listarNegocios = async (req, res, next) => {
  try {
    res.status(200).json(await negocioService.listarNegocios(req.validado.query));
  } catch (e) {
    next(e);
  }
};

const obtenerNegocio = async (req, res, next) => {
  try {
    res.status(200).json(await negocioService.obtenerNegocio(req.validado.params.id));
  } catch (e) {
    next(e);
  }
};

const crearNegocio = async (req, res, next) => {
  try {
    res.status(201).json(await negocioService.crearNegocio(req.id, req.validado.body));
  } catch (e) {
    next(e);
  }
};

const editarNegocio = async (req, res, next) => {
  try {
    res.status(200).json(await negocioService.editarNegocio(req.id, req.validado.params.id, req.validado.body));
  } catch (e) {
    next(e);
  }
};

const aprobarRevision = async (req, res, next) => {
  try {
    const { id } = req.validado.params;
    res.status(201).json(await negocioService.aprobarRevision(req.id, id, req.validado.body.revisionEsperada));
  } catch (e) {
    next(e);
  }
};

const publicarNegocio = async (req, res, next) => {
  try {
    const { id } = req.validado.params;
    res.status(200).json(await negocioService.publicarNegocio(id, req.validado.body.revisionEsperada));
  } catch (e) {
    next(e);
  }
};

const retirarNegocio = async (req, res, next) => {
  try {
    const { id } = req.validado.params;
    res.status(200).json(await negocioService.retirarNegocio(id, req.validado.body.revisionEsperada));
  } catch (e) {
    next(e);
  }
};

const restaurarRevision = async (req, res, next) => {
  try {
    res.status(200).json(await negocioService.restaurarRevision(req.id, req.validado.params.id, req.validado.body));
  } catch (e) {
    next(e);
  }
};

export {
  listarNegocios,
  obtenerNegocio,
  crearNegocio,
  editarNegocio,
  aprobarRevision,
  publicarNegocio,
  retirarNegocio,
  restaurarRevision,
};
