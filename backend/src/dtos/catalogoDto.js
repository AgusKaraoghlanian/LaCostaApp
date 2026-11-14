import { PALABRAS_DE_CATEGORIAS } from '../config/costa.js';

// Categorías y geografía, para los filtros del sitio y los formularios del admin.

// palabras: las que llevan a la categoría en la búsqueda; el buscador de la portada las usa para
// sugerirla ("helado" → Heladerías).
const categoriaCompletaDto = (categoria) => ({
  id: categoria.id,
  clave: categoria.clave,
  nombre: categoria.nombre,
  descripcion: categoria.descripcion,
  color: categoria.color,
  icono: categoria.icono,
  palabras: PALABRAS_DE_CATEGORIAS[categoria.clave] ?? [],
});

// provincia → partidos → localidades
const geografiaDto = (provincias) => provincias.map((provincia) => ({
  id: provincia.id,
  nombre: provincia.nombre,
  partidos: provincia.partidos.map((partido) => ({
    id: partido.id,
    nombre: partido.nombre,
    localidades: partido.localidades.map((localidad) => ({ id: localidad.id, nombre: localidad.nombre })),
  })),
}));

export { categoriaCompletaDto, geografiaDto };
