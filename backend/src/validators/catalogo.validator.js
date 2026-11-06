import Joi from 'joi';

const nombre = (que, maximo) => Joi.string().trim().min(2).max(maximo).required().messages({
  'string.base': `El nombre de ${que} no es válido.`,
  'string.empty': `El nombre de ${que} es requerido.`,
  'string.min': `El nombre de ${que} tiene que tener entre 2 y ${maximo} caracteres.`,
  'string.max': `El nombre de ${que} tiene que tener entre 2 y ${maximo} caracteres.`,
  'any.required': `El nombre de ${que} es requerido.`,
});

const id = (que) => Joi.number().integer().positive().required().messages({
  'number.base': `${que} tiene que ser un número.`,
  'number.positive': `${que} no es válido.`,
  'any.required': `${que} es requerido.`,
});

const crearCategoriaSchema = Joi.object({
  nombre: nombre('la categoría', 80),
  descripcion: Joi.string().trim().max(300).allow('').default('').messages({
    'string.max': 'La descripción puede tener hasta 300 caracteres.',
  }),
});

const crearProvinciaSchema = Joi.object({ nombre: nombre('la provincia', 150) });

const crearPartidoSchema = Joi.object({ nombre: nombre('el partido', 150), provinciaId: id('La provincia') });

const crearLocalidadSchema = Joi.object({ nombre: nombre('la localidad', 150), partidoId: id('El partido') });

export { crearCategoriaSchema, crearProvinciaSchema, crearPartidoSchema, crearLocalidadSchema };
