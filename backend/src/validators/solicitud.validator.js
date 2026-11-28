import Joi from 'joi';

const crearSolicitudSchema = Joi.object({
  tipo: Joi.string().valid('SUMAR', 'RECLAMAR').required().messages({
    'any.only': 'El tipo de solicitud no es válido.',
    'any.required': 'El tipo de solicitud es requerido.',
  }),
  nombreNegocio: Joi.string().trim().min(2).max(150).required().messages({
    'string.base': 'El nombre del negocio no es válido.',
    'string.empty': 'Completá el nombre del negocio.',
    'string.min': 'El nombre del negocio tiene que tener entre 2 y 150 caracteres.',
    'string.max': 'El nombre del negocio tiene que tener entre 2 y 150 caracteres.',
    'any.required': 'Completá el nombre del negocio.',
  }),
  // Números, espacios, guiones, paréntesis y un + adelante; entre 8 y 15 dígitos en total.
  celular: Joi.string()
    .trim()
    .max(30)
    .pattern(/^\+?[\d\s\-()]+$/)
    .custom((valor, helpers) => {
      const digitos = valor.replace(/\D/g, '').length;
      return digitos >= 8 && digitos <= 15 ? valor : helpers.error('string.pattern.base');
    })
    .required()
    .messages({
      'string.empty': 'Completá el número de celular.',
      'string.max': 'Ingresá un número de celular válido (ej. 2257 123456).',
      'string.pattern.base': 'Ingresá un número de celular válido (ej. 2257 123456).',
      'any.required': 'Completá el número de celular.',
    }),
  email: Joi.string().trim().lowercase().max(200).email({ tlds: { allow: false } }).required().messages({
    'string.empty': 'Completá el correo electrónico.',
    'string.email': 'Ingresá un correo electrónico válido.',
    'string.max': 'Ingresá un correo electrónico válido.',
    'any.required': 'Completá el correo electrónico.',
  }),
  // Trampa para bots (ver solicitud.service).
  sitioWeb: Joi.string().allow('').max(500).default(''),
});

const listarSolicitudesSchema = Joi.object({
  pagina: Joi.number().integer().min(1).default(1).messages({ 'number.base': 'La página tiene que ser un número.' }),
});

const idSolicitudSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({ 'number.base': 'La solicitud no es válida.' }),
});

const editarSolicitudSchema = Joi.object({
  atendida: Joi.boolean().required().messages({ 'any.required': 'Falta indicar si está atendida.' }),
});

export { crearSolicitudSchema, listarSolicitudesSchema, idSolicitudSchema, editarSolicitudSchema };
