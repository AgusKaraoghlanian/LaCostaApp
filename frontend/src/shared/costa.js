// Datos fijos del sitio (los mismos de la demo).

// Las prestaciones que ofrecen los filtros. Un negocio puede tener otras: se muestran en su ficha.
export const PRESTACIONES = [
  'Mesas al aire libre',
  'Opciones vegetarianas',
  'Acepta mascotas',
  'Accesible',
  'Para llevar',
  'Reservas',
]

// La foto de la portada y de "Nuestra Costa" (ilustrativa, de Unsplash).
export const FOTO_PORTADA =
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1800&q=85'

// Domingo es 0, como en el backend.
export const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

// Dónde aparece un negocio en la portada (lo que contrató), del más visible al más barato.
// Carrusel y Para poner en tu lista llevan además el distintivo "Destacado" y van primero en
// Explorar (el backend lo calcula del plan).
export const PLANES_PORTADA = {
  NINGUNO: 'No aparece en la portada (solo en Explorar y en las búsquedas)',
  CARRUSEL: 'Carrusel de la foto principal (el más visible, hasta 5) · Destacado',
  LISTA: 'Para poner en tu lista (intermedio, hasta 3) · Destacado',
  SABORES: 'Sabores para todos tus planes (el más barato, hasta 3)',
}

export const ESTADOS_COMERCIALES = {
  SIN_CONFIRMAR: 'Actividad actual sin confirmar',
  ACTIVO: 'Activo, con evidencia revisada',
  TEMPORALMENTE_CERRADO: 'Cerrado temporalmente',
  CERRADO: 'Cierre confirmado',
}

export const CANALES = {
  SIN_ESPECIFICAR: 'No especificado',
  SALON: 'Salón',
  DELIVERY: 'Delivery',
  RETIRO: 'Retiro',
}

export const MONEDAS = ['ARS', 'USD', 'EUR', 'UYU', 'BRL']

// La foto de cada localidad para el carrusel de la portada, por nombre exacto de la localidad.
// Las que no tienen foto se muestran con una ilustración de colores de la Costa.
// Ejemplo: 'San Bernardo': 'https://.../san-bernardo.jpg'
export const FOTOS_LOCALIDADES = {}
