import express from 'express';
import { login } from '../controllers/auth.controller.js';
import { validar } from '../middlewares/validacion.middleware.js';
import { limiteLogin } from '../middlewares/limite.middleware.js';
import { loginSchema } from '../validators/auth.validator.js';

const authRouterV1 = express.Router();

// Pública, con límite de intentos por IP (ver limite.middleware).
authRouterV1.post('/auth/login', limiteLogin, validar({ body: loginSchema }), login);

export { authRouterV1 };
