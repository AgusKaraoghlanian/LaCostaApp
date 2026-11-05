import * as negocioPublicoService from '../services/negocioPublico.service.js';

// Lo público: el listado y la ficha de los negocios publicados.

const listarPublicados = async (req, res, next) => {
  try {
    res.status(200).json(await negocioPublicoService.listarPublicados(req.validado.query));
  } catch (e) {
    next(e);
  }
};

const obtenerPublicado = async (req, res, next) => {
  try {
    res.status(200).json(await negocioPublicoService.obtenerPublicado(req.validado.params.slug));
  } catch (e) {
    next(e);
  }
};

export { listarPublicados, obtenerPublicado };
