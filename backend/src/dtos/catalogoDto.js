// Categorías y geografía, para los filtros del sitio y los formularios del admin.

const categoriaCompletaDto = (categoria) => ({
  id: categoria.id,
  clave: categoria.clave,
  nombre: categoria.nombre,
  descripcion: categoria.descripcion,
  color: categoria.color,
  icono: categoria.icono,
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
