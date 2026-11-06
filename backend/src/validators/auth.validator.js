import Joi from 'joi';

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'El email debe tener un formato válido.',
    'string.empty': 'El email es requerido.',
    'any.required': 'El email es requerido.'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'La contraseña es requerida.',
    'any.required': 'La contraseña es requerida.'
  })
});

export { loginSchema };
