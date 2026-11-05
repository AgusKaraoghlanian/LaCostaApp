import Joi from 'joi';
import { esEnlacePermitido } from '../utils/enlaces.js';
import { HORARIOS_MAXIMOS, PRESTACIONES_MAXIMAS, PRODUCTOS_MAXIMOS } from '../config/costa.js';

// Un id numérico (de la URL, del query o del body). "5" se convierte en 5.
const id = (nombre) => Joi.number().integer().positive().messages({
  'number.base': `${nombre} tiene que ser un número.`,
  'number.integer': `${nombre} tiene que ser un número entero.`,
  'number.positive': `${nombre} no es válido.`,
  'any.required': `${nombre} es requerido.`,
});

// Un texto opcional: si no viene queda vacío.
const texto = (nombre, maximo) => Joi.string().trim().max(maximo).allow('').default('').messages({
  'string.base': `${nombre} tiene que ser un texto.`,
  'string.max': `${nombre} puede tener hasta ${maximo} caracteres.`,
});

// Un link de la ficha (ver utils/enlaces.js). tipo: 'web', 'instagram', 'facebook' o 'whatsapp'.
const enlace = (nombre, tipo, maximo = 500) => texto(nombre, maximo)
  .custom((valor, helpers) => (esEnlacePermitido(valor, tipo) ? valor : helpers.error('enlace.invalido')))
  .messages({ 'enlace.invalido': `${nombre}: ingresá un link válido (que empiece con http o https).` });

// "HH:MM" de 00:00 a 23:59
const hora = Joi.string().pattern(/^(?:[01]\d|2[0-3]):[0-5]\d$/).messages({
  'string.pattern.base': 'Las horas van con el formato HH:MM (ej. 20:30).',
  'any.required': 'Falta una hora.',
});

// "AAAA-MM-DD" y que exista (no "2026-02-30"). Se guarda tal cual, como texto.
const fecha = Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/)
  .custom((valor, helpers) => {
    const dia = new Date(`${valor}T00:00:00Z`);
    return !Number.isNaN(dia.getTime()) && dia.toISOString().startsWith(valor) ? valor : helpers.error('fecha.invalida');
  })
  .messages({
    'string.pattern.base': 'Las fechas van con el formato AAAA-MM-DD.',
    'fecha.invalida': 'Esa fecha no existe.',
    'any.required': 'Falta una fecha.',
  });

// Una franja semanal. Si cierra antes de abrir tiene que ser al día siguiente (ej. 20:00 a 02:00).
const horario = Joi.object({
  dia: Joi.number().integer().min(0).max(6).required().messages({
    'number.base': 'El día va de 0 (domingo) a 6 (sábado).',
    'number.min': 'El día va de 0 (domingo) a 6 (sábado).',
    'number.max': 'El día va de 0 (domingo) a 6 (sábado).',
    'any.required': 'Falta el día del horario.',
  }),
  abre: hora.required(),
  cierra: hora.required(),
  alDiaSiguiente: Joi.boolean().default(false),
  vigenteDesde: fecha.allow(null).default(null),
  vigenteHasta: fecha.allow(null).default(null),
  temporada: texto('La temporada', 100),
}).custom((h, helpers) => {
  if (h.cierra < h.abre && !h.alDiaSiguiente) return helpers.error('horario.cierre');
  if (h.vigenteDesde && h.vigenteHasta && h.vigenteHasta < h.vigenteDesde) return helpers.error('horario.vigencia');
  return h;
}).messages({
  'horario.cierre': 'Si cierra después de la medianoche, marcá que cierra al día siguiente.',
  'horario.vigencia': 'La vigencia de un horario termina antes de empezar.',
});

// Un día especial: o está cerrado o tiene su horario.
const horarioEspecial = Joi.object({
  fecha: fecha.required(),
  cerrado: Joi.boolean().default(false),
  abre: hora.allow(null).default(null),
  cierra: hora.allow(null).default(null),
}).custom((h, helpers) => (h.cerrado || (h.abre && h.cierra) ? h : helpers.error('especial.horario')))
  .messages({ 'especial.horario': 'Completá el horario del día especial o marcá que cierra.' });

// Un producto de la carta. Para aprobarlo, si tiene precio tiene que tener la moneda: el $ solo
// no dice si son pesos o dólares.
const producto = Joi.object({
  carta: texto('El nombre de la carta', 150).empty('').default('Carta'),
  seccion: texto('La sección', 200).empty('').default('Carta'),
  nombre: Joi.string().trim().min(1).max(250).required().messages({
    'string.empty': 'Cada producto necesita un nombre.',
    'string.max': 'El nombre de un producto puede tener hasta 250 caracteres.',
    'any.required': 'Cada producto necesita un nombre.',
  }),
  descripcion: texto('La descripción del producto', 1500),
  variante: texto('La variante', 200).empty('').default('Base'),
  precioCentavos: Joi.number().integer().min(0).allow(null).default(null).messages({
    'number.base': 'El precio tiene que ser un número (en centavos).',
    'number.min': 'El precio no puede ser negativo.',
  }),
  moneda: Joi.string().pattern(/^[A-Z]{3}$/).allow(null).default(null).messages({
    'string.pattern.base': 'La moneda va con su código de 3 letras (ARS, USD).',
  }),
  precioTexto: texto('El precio original', 250),
  canal: Joi.string().valid('SALON', 'DELIVERY', 'RETIRO', 'SIN_ESPECIFICAR').default('SIN_ESPECIFICAR').messages({
    'any.only': 'El canal tiene que ser SALON, DELIVERY, RETIRO o SIN_ESPECIFICAR.',
  }),
  estado: Joi.string().valid('PROPUESTO', 'APROBADO', 'DESCARTADO').default('PROPUESTO').messages({
    'any.only': 'El estado de un producto tiene que ser PROPUESTO, APROBADO o DESCARTADO.',
  }),
}).custom((p, helpers) => (
  p.estado === 'APROBADO' && p.precioCentavos !== null && !p.moneda ? helpers.error('producto.moneda') : p
)).messages({ 'producto.moneda': 'Confirmá la moneda del precio antes de aprobar el producto.' });

// Los datos de la ficha, iguales para crear y para editar.
const datosNegocio = {
  nombre: Joi.string().trim().min(2).max(150).required().messages({
    'string.empty': 'El nombre es requerido.',
    'string.min': 'El nombre tiene que tener entre 2 y 150 caracteres.',
    'string.max': 'El nombre tiene que tener entre 2 y 150 caracteres.',
    'any.required': 'El nombre es requerido.',
  }),
  localidadId: id('La localidad').required(),
  categoriaId: id('La categoría').required(),
  estadoComercial: Joi.string().valid('SIN_CONFIRMAR', 'ACTIVO', 'TEMPORALMENTE_CERRADO', 'CERRADO').default('SIN_CONFIRMAR').messages({
    'any.only': 'El estado tiene que ser SIN_CONFIRMAR, ACTIVO, TEMPORALMENTE_CERRADO o CERRADO.',
  }),
  descripcion: texto('La descripción', 1800),
  direccion: texto('La dirección', 250),
  zonaAtencion: texto('La zona de atención', 250),
  telefono: texto('El teléfono', 80),
  whatsapp: enlace('WhatsApp', 'whatsapp', 250),
  web: enlace('La web', 'web', 1000),
  instagram: enlace('Instagram', 'instagram'),
  facebook: enlace('Facebook', 'facebook'),
  horariosTexto: texto('Las aclaraciones de horario', 1500),
  prestaciones: Joi.array().items(Joi.string().trim().max(100)).max(PRESTACIONES_MAXIMAS).unique().default([]).messages({
    'array.max': `Se pueden cargar hasta ${PRESTACIONES_MAXIMAS} prestaciones.`,
    'array.unique': 'Hay una prestación repetida.',
  }),
  precio: Joi.number().integer().min(1).max(3).allow(null).default(null).messages({
    'number.base': 'El rango de precio va de 1 a 3.',
    'number.min': 'El rango de precio va de 1 a 3.',
    'number.max': 'El rango de precio va de 1 a 3.',
  }),
  foto: enlace('La foto', 'web', 1000).empty('').allow(null).default(null),
  referenciaVerificacion: Joi.string().trim().min(3).max(1500).required().messages({
    'string.empty': 'Contá qué verificaste del negocio y cómo.',
    'string.min': 'Contá qué verificaste del negocio y cómo.',
    'string.max': 'La referencia de verificación puede tener hasta 1500 caracteres.',
    'any.required': 'Contá qué verificaste del negocio y cómo.',
  }),
  horarios: Joi.array().items(horario).max(HORARIOS_MAXIMOS).default([]).messages({
    'array.max': `Se pueden cargar hasta ${HORARIOS_MAXIMOS} franjas de horario.`,
  }),
  horariosEspeciales: Joi.array().items(horarioEspecial).max(HORARIOS_MAXIMOS).default([]).messages({
    'array.max': `Se pueden cargar hasta ${HORARIOS_MAXIMOS} días especiales.`,
  }),
  productos: Joi.array().items(producto).max(PRODUCTOS_MAXIMOS).default([]).messages({
    'array.max': `La carta puede tener hasta ${PRODUCTOS_MAXIMOS} productos. Dividí una carta más grande.`,
  }),
};

// La revisión del borrador que se tenía al abrir la ficha (ver Negocio.revisionBorrador).
const revisionEsperada = Joi.number().integer().positive().required().messages({
  'number.base': 'Falta la revisión de la ficha que estabas editando.',
  'any.required': 'Falta la revisión de la ficha que estabas editando.',
});

const crearNegocioSchema = Joi.object(datosNegocio);

const editarNegocioSchema = Joi.object({ ...datosNegocio, revisionEsperada });

const revisionEsperadaSchema = Joi.object({ revisionEsperada });

const restaurarRevisionSchema = Joi.object({ revisionEsperada, revisionId: id('La revisión').required() });

const idNegocioSchema = Joi.object({ id: id('El negocio').required() });

const slugSchema = Joi.object({
  slug: Joi.string().pattern(/^[a-z0-9-]{1,120}$/).required().messages({
    'string.pattern.base': 'La dirección del negocio no es válida.',
    'any.required': 'Falta la dirección del negocio.',
  }),
});

// Filtros de los listados (el admin usa solo texto y pagina). pagina empieza en 1.
const listarNegociosSchema = Joi.object({
  categoria: Joi.string().pattern(/^[a-z0-9-]{1,100}$/).messages({
    'string.pattern.base': 'La categoría no es válida.',
  }),
  localidadId: id('La localidad'),
  precio: Joi.number().integer().min(1).max(3).messages({
    'number.base': 'El rango de precio va de 1 a 3.',
    'number.min': 'El rango de precio va de 1 a 3.',
    'number.max': 'El rango de precio va de 1 a 3.',
  }),
  // ?prestacion=Reservas&prestacion=Accesible: los que tengan todas.
  prestacion: Joi.array().items(Joi.string().trim().max(100)).single().max(10).messages({
    'array.max': 'Se puede filtrar por hasta 10 prestaciones.',
  }),
  texto: Joi.string().trim().max(100).allow('').messages({
    'string.max': 'La búsqueda puede tener hasta 100 caracteres.',
  }),
  pagina: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'La página tiene que ser un número.',
    'number.min': 'La página empieza en 1.',
  }),
});

export {
  crearNegocioSchema,
  editarNegocioSchema,
  revisionEsperadaSchema,
  restaurarRevisionSchema,
  idNegocioSchema,
  slugSchema,
  listarNegociosSchema,
};
