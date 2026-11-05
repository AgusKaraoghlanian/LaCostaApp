import * as authService from '../services/auth.service.js';

const login = async (req, res, next) => {
  try {
    res.status(200).json(await authService.login(req.validado.body));
  } catch (e) {
    next(e);
  }
};

export { login };
