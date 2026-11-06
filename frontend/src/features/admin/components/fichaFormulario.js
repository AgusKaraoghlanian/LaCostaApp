import { PRESTACIONES } from '../../../shared/costa.js'

// El formulario de la ficha trabaja con textos (lo que tienen los inputs). Acá se pasa de
// lo que devuelve el backend a los valores del formulario, y de vuelta al guardar.

// "1250050" centavos → "12500,50". Sin precio, vacío.
const centavosATexto = (centavos) => (centavos === null ? '' : (centavos / 100).toFixed(2).replace('.', ','))

// "12500,5" → 1250050. Vacío → null. El formato ya lo validó el formulario (PRECIO_VALIDO).
const textoACentavos = (texto) => {
  if (!texto.trim()) return null
  const [enteros, decimales = ''] = texto.trim().replace(',', '.').split('.')
  return Number(enteros) * 100 + Number(decimales.padEnd(2, '0'))
}

export const PRECIO_VALIDO = /^\s*(\d+([,.]\d{1,2})?)?\s*$/

export const HORARIO_VACIO = {
  dia: '',
  abre: '',
  cierra: '',
  alDiaSiguiente: false,
  vigenteDesde: '',
  vigenteHasta: '',
  temporada: '',
}

export const ESPECIAL_VACIO = { fecha: '', cerrado: true, abre: '', cierra: '' }

export const PRODUCTO_VACIO = {
  carta: 'Carta',
  seccion: '',
  nombre: '',
  descripcion: '',
  variante: '',
  precio: '',
  moneda: 'ARS',
  precioTexto: '',
  canal: 'SIN_ESPECIFICAR',
  estado: 'PROPUESTO',
}

// Un negocio nuevo: todo vacío y con la actividad sin confirmar.
export const FICHA_VACIA = {
  nombre: '',
  localidadId: '',
  categoriaId: '',
  estadoComercial: 'SIN_CONFIRMAR',
  descripcion: '',
  direccion: '',
  zonaAtencion: '',
  telefono: '',
  whatsapp: '',
  web: '',
  instagram: '',
  facebook: '',
  horariosTexto: '',
  prestaciones: [],
  otrasPrestaciones: '',
  precio: '',
  foto: '',
  destacado: false,
  referenciaVerificacion: '',
  horarios: [],
  horariosEspeciales: [],
  productos: [],
}

// GET /admin/negocios/:id → valores del formulario.
export const aFormulario = (negocio) => {
  const { ficha } = negocio
  return {
    ...FICHA_VACIA,
    ...ficha,
    localidadId: String(ficha.localidadId),
    categoriaId: String(ficha.categoriaId),
    precio: ficha.precio ? String(ficha.precio) : '',
    foto: ficha.foto ?? '',
    // Las prestaciones conocidas son checkboxes; las demás van en un texto separado por comas.
    prestaciones: ficha.prestaciones.filter((p) => PRESTACIONES.includes(p)),
    otrasPrestaciones: ficha.prestaciones.filter((p) => !PRESTACIONES.includes(p)).join(', '),
    horarios: negocio.horarios.map((h) => ({
      ...h,
      dia: String(h.dia),
      vigenteDesde: h.vigenteDesde ?? '',
      vigenteHasta: h.vigenteHasta ?? '',
    })),
    horariosEspeciales: negocio.horariosEspeciales.map((h) => ({ ...h, abre: h.abre ?? '', cierra: h.cierra ?? '' })),
    productos: negocio.productos.map(({ precioCentavos, ...p }) => ({
      ...p,
      precio: centavosATexto(precioCentavos),
      moneda: p.moneda ?? '',
    })),
  }
}

// Valores del formulario → el body de POST/PUT /admin/negocios.
export const aDatos = ({ otrasPrestaciones, ...valores }) => {
  const otras = otrasPrestaciones.split(',').map((p) => p.trim()).filter(Boolean)
  return {
    ...valores,
    localidadId: Number(valores.localidadId),
    categoriaId: Number(valores.categoriaId),
    precio: valores.precio ? Number(valores.precio) : null,
    foto: valores.foto.trim() || null,
    prestaciones: [...new Set([...valores.prestaciones, ...otras])],
    horarios: valores.horarios.map((h) => ({
      ...h,
      dia: Number(h.dia),
      vigenteDesde: h.vigenteDesde || null,
      vigenteHasta: h.vigenteHasta || null,
    })),
    horariosEspeciales: valores.horariosEspeciales.map((h) => ({
      fecha: h.fecha,
      cerrado: h.cerrado,
      abre: h.cerrado ? null : h.abre || null,
      cierra: h.cerrado ? null : h.cierra || null,
    })),
    productos: valores.productos.map(({ precio, ...p }) => ({
      ...p,
      precioCentavos: textoACentavos(precio),
      moneda: p.moneda || null,
    })),
  }
}
