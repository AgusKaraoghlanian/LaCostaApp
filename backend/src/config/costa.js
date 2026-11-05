// Reglas fijas de la guía. Si algo de esto cambia, se cambia acá y vale para todo el backend.

// Negocios por página en el listado público y en el del admin.
export const NEGOCIOS_POR_PAGINA = 24;

// Productos que puede tener la carta de un negocio. Una carta más grande se divide.
export const PRODUCTOS_MAXIMOS = 300;

// Franjas de horario por negocio (semanales y especiales, cada una).
export const HORARIOS_MAXIMOS = 50;

// Prestaciones por negocio ("Mesas al aire libre", "Acepta mascotas"...).
export const PRESTACIONES_MAXIMAS = 30;

// Todas las horas de la guía son de Argentina.
export const ZONA_HORARIA = 'America/Argentina/Buenos_Aires';
