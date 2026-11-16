// Qué datos de un negocio se devuelven. El público solo ve lo que está en la revisión
// publicada, sin la referencia de verificación (es interna) y con la carta aprobada.

// Los datos de la ficha que se copian al aprobar una revisión y se pueden restaurar.
const CAMPOS_FICHA = [
  'nombre', 'localidadId', 'categoriaId', 'estadoComercial', 'descripcion', 'direccion',
  'zonaAtencion', 'telefono', 'whatsapp', 'web', 'instagram', 'facebook', 'horariosTexto',
  'prestaciones', 'precio', 'foto', 'plan', 'destacado', 'referenciaVerificacion',
];

const elegir = (objeto, campos) => Object.fromEntries(campos.map((campo) => [campo, objeto[campo]]));

const localidadDto = (localidad) => ({
  id: localidad.id,
  nombre: localidad.nombre,
  partido: localidad.partido?.nombre ?? null,
  provincia: localidad.partido?.provincia?.nombre ?? null,
});

const categoriaDto = (categoria) => ({ id: categoria.id, clave: categoria.clave, nombre: categoria.nombre });

const horarioDto = (h) => ({
  dia: h.dia, abre: h.abre, cierra: h.cierra, alDiaSiguiente: h.alDiaSiguiente,
  vigenteDesde: h.vigenteDesde, vigenteHasta: h.vigenteHasta, temporada: h.temporada,
});

const horarioEspecialDto = (h) => ({ fecha: h.fecha, cerrado: h.cerrado, abre: h.abre, cierra: h.cierra });

const productoDto = (p) => ({
  carta: p.carta, seccion: p.seccion, nombre: p.nombre, descripcion: p.descripcion, variante: p.variante,
  precioCentavos: p.precioCentavos, moneda: p.moneda, precioTexto: p.precioTexto, canal: p.canal, estado: p.estado,
});

// La foto fija que se guarda al aprobar (RevisionNegocio.datos): la ficha completa del borrador.
const instantaneaDeNegocio = (negocio) => ({
  ficha: elegir(negocio, CAMPOS_FICHA),
  localidad: localidadDto(negocio.localidad),
  categoria: categoriaDto(negocio.categoria),
  horarios: negocio.horarios.map(horarioDto),
  horariosEspeciales: negocio.horariosEspeciales.map(horarioEspecialDto),
  productos: negocio.productos.map(productoDto),
});

// La ficha en el listado público (tarjeta). revision trae negocio.slug.
const negocioResumenDto = (revision) => {
  const { ficha, localidad, categoria } = revision.datos;
  return {
    slug: revision.negocio.slug,
    nombre: ficha.nombre,
    descripcion: ficha.descripcion,
    foto: ficha.foto,
    precio: ficha.precio,
    prestaciones: ficha.prestaciones,
    destacado: ficha.destacado ?? false,
    // Las revisiones de antes de los planes no lo traen: las destacadas estaban en "Para poner en tu lista".
    plan: ficha.plan ?? (ficha.destacado ? 'LISTA' : 'NINGUNO'),
    estadoComercial: ficha.estadoComercial,
    localidad,
    categoria,
  };
};

// La ficha pública completa: la carta solo con los productos aprobados.
const negocioPublicoDto = (revision) => {
  const { ficha, horarios, horariosEspeciales, productos } = revision.datos;
  const { referenciaVerificacion, localidadId, categoriaId, ...publico } = ficha;
  return {
    ...negocioResumenDto(revision),
    ...publico,
    horarios,
    horariosEspeciales,
    carta: productos.filter((p) => p.estado === 'APROBADO').map(({ estado, ...p }) => p),
    actualizadoEn: revision.aprobadaEn,
  };
};

// Una fila del listado del admin.
const negocioAdminResumenDto = (negocio) => ({
  id: negocio.id,
  slug: negocio.slug,
  nombre: negocio.nombre,
  localidad: negocio.localidad.nombre,
  categoria: negocio.categoria.nombre,
  estadoComercial: negocio.estadoComercial,
  publicado: negocio.revisionPublicadaId !== null,
  actualizadoEn: negocio.actualizadoEn,
});

// La ficha que edita el admin: el borrador, la revisión que tiene que mandar al guardar,
// cuál está publicada y el historial.
const negocioAdminDto = (negocio) => ({
  id: negocio.id,
  slug: negocio.slug,
  ...instantaneaDeNegocio(negocio),
  revisionBorrador: negocio.revisionBorrador,
  revisionPublicadaId: negocio.revisionPublicadaId,
  revisiones: negocio.revisiones.map((r) => ({
    id: r.id, numero: r.numero, aprobadaEn: r.aprobadaEn, aprobadaPor: r.aprobadaPor?.nombre ?? null,
  })),
  creadoEn: negocio.creadoEn,
  actualizadoEn: negocio.actualizadoEn,
});

export {
  CAMPOS_FICHA,
  instantaneaDeNegocio,
  negocioResumenDto,
  negocioPublicoDto,
  negocioAdminResumenDto,
  negocioAdminDto,
  localidadDto,
  categoriaDto,
};
