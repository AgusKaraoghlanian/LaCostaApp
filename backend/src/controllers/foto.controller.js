import * as fotoService from '../services/foto.service.js';

// El body es el archivo de la imagen tal cual (ver fotoAdmin.router).
const subirFoto = async (req, res, next) => {
  try {
    res.status(201).json(await fotoService.subirFoto(req.body, `${req.protocol}://${req.get('host')}`));
  } catch (e) {
    next(e);
  }
};

export { subirFoto };
