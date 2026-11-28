import * as solicitudService from '../services/solicitud.service.js';

// Los datos ya validados y convertidos vienen en req.validado (ver validacion.middleware).

const crearSolicitud = async (req, res, next) => {
  try {
    res.status(201).json(await solicitudService.crearSolicitud(req.validado.body));
  } catch (e) {
    next(e);
  }
};

const listarSolicitudes = async (req, res, next) => {
  try {
    res.status(200).json(await solicitudService.listarSolicitudes(req.validado.query));
  } catch (e) {
    next(e);
  }
};

const editarSolicitud = async (req, res, next) => {
  try {
    res.status(200).json(await solicitudService.editarSolicitud(req.validado.params.id, req.validado.body));
  } catch (e) {
    next(e);
  }
};

export { crearSolicitud, listarSolicitudes, editarSolicitud };
