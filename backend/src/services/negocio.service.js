import * as negocioRepository from '../repositories/negocio.repository.js';
import * as revisionRepository from '../repositories/revision.repository.js';
import * as categoriaRepository from '../repositories/categoria.repository.js';
import * as geografiaRepository from '../repositories/geografia.repository.js';
import { enTransaccion } from '../repositories/transaccion.repository.js';
import { instantaneaDeNegocio, negocioAdminDto, negocioAdminResumenDto } from '../dtos/negocioDto.js';
import { NEGOCIOS_POR_PAGINA } from '../config/costa.js';
import { armarSlug, claveDeTexto } from '../utils/texto.js';
import { mismosDatos } from '../utils/comparar.js';
import { NegocioNoEncontrado } from '../errors/negocio/NegocioNoEncontrado.js';
import { RevisionCambio } from '../errors/negocio/RevisionCambio.js';
import { RevisionNoEncontrada } from '../errors/negocio/RevisionNoEncontrada.js';
import { NegocioSinAprobar } from '../errors/negocio/NegocioSinAprobar.js';
import { NegocioNoPublicado } from '../errors/negocio/NegocioNoPublicado.js';
import { NegocioSinCambios } from '../errors/negocio/NegocioSinCambios.js';
import { LocalidadNoEncontrada } from '../errors/catalogo/LocalidadNoEncontrada.js';
import { CategoriaNoEncontrada } from '../errors/catalogo/CategoriaNoEncontrada.js';

// Lo que hace el admin con las fichas: crearlas, editarlas (el borrador), aprobar una
// revisión, publicarla, retirarla del sitio y volver a una revisión anterior.
// Cada acción devuelve la ficha actualizada.

const exigirNegocio = async (id, db) => {
  const negocio = await negocioRepository.obtenerNegocioPorId(id, db);
  if (!negocio) { throw new NegocioNoEncontrado(); }
  return negocio;
};

// Que la localidad y la categoría elegidas existan.
const exigirLugarYCategoria = async ({ localidadId, categoriaId }) => {
  if (!await geografiaRepository.obtenerLocalidadPorId(localidadId)) { throw new LocalidadNoEncontrada(); }
  if (!await categoriaRepository.obtenerCategoriaPorId(categoriaId)) { throw new CategoriaNoEncontrada(); }
};

// "La Orilla" → "la-orilla"; si ya existe, "la-orilla-2", "la-orilla-3"...
const slugLibre = async (nombre) => {
  const base = armarSlug(nombre) || 'negocio';
  let slug = base;
  for (let numero = 2; await negocioRepository.existeSlug(slug); numero++) {
    slug = `${base}-${numero}`;
  }
  return slug;
};

// Separa lo que va en la tabla Negocio de los horarios y la carta (van en sus tablas).
const separarDatos = ({ horarios, horariosEspeciales, productos, revisionEsperada, ...ficha }) => ({
  ficha: { ...ficha, nombreClave: claveDeTexto(ficha.nombre) },
  horariosYCarta: { horarios, horariosEspeciales, productos },
});

// Lo que encuentra el buscador del sitio: nombre, descripción, localidad y categoría.
const textoDeBusqueda = (negocio) =>
  claveDeTexto([negocio.nombre, negocio.descripcion, negocio.localidad.nombre, negocio.categoria.nombre].join(' '));

// Listado del admin, buscando por nombre, de a una página.
const listarNegocios = async ({ texto, pagina = 1 }) => {
  const { negocios, total } = await negocioRepository.buscarNegocios({
    nombreClave: texto ? claveDeTexto(texto) : null,
    saltear: (pagina - 1) * NEGOCIOS_POR_PAGINA,
    cantidad: NEGOCIOS_POR_PAGINA,
  });
  return { negocios: negocios.map(negocioAdminResumenDto), total, pagina, porPagina: NEGOCIOS_POR_PAGINA };
};

const obtenerNegocio = async (id) => {
  return negocioAdminDto(await exigirNegocio(id));
};

// Crea la ficha como borrador: no se ve en el sitio hasta aprobarla y publicarla.
const crearNegocio = async (usuarioId, datos) => {
  await exigirLugarYCategoria(datos);
  const { ficha, horariosYCarta } = separarDatos(datos);
  const slug = await slugLibre(ficha.nombre);

  const id = await enTransaccion(async (tx) => {
    const negocio = await negocioRepository.crearNegocio(
      { ...ficha, slug, creadoPorId: usuarioId, editadoPorId: usuarioId },
      tx,
    );
    await negocioRepository.guardarHorariosYCarta(negocio.id, horariosYCarta, tx);
    return negocio.id;
  });
  return obtenerNegocio(id);
};

// Guarda el borrador si nadie lo cambió desde que se abrió (si no, RevisionCambio).
const guardarBorrador = async (usuarioId, id, revisionEsperada, datos) => {
  await exigirLugarYCategoria(datos);
  const { ficha, horariosYCarta } = separarDatos(datos);

  await enTransaccion(async (tx) => {
    const guardado = await negocioRepository.actualizarBorrador(id, revisionEsperada, { ...ficha, editadoPorId: usuarioId }, tx);
    if (!guardado) { throw new RevisionCambio(); }
    await negocioRepository.guardarHorariosYCarta(id, horariosYCarta, tx);
  });
  return obtenerNegocio(id);
};

const editarNegocio = async (usuarioId, id, datos) => {
  await exigirNegocio(id);
  return guardarBorrador(usuarioId, id, datos.revisionEsperada, datos);
};

// Guarda una foto fija del borrador como la revisión siguiente. Todavía no se publica.
const aprobarRevision = async (usuarioId, id, revisionEsperada) => {
  await enTransaccion(async (tx) => {
    const negocio = await exigirNegocio(id, tx);
    if (negocio.revisionBorrador !== revisionEsperada) { throw new RevisionCambio(); }
    const ultima = await revisionRepository.obtenerUltimaRevision(id, tx);
    const datos = instantaneaDeNegocio(negocio);
    // Aprobar dos veces lo mismo solo llenaría el historial de revisiones iguales.
    if (ultima && mismosDatos(ultima.datos, datos)) { throw new NegocioSinCambios(); }
    await revisionRepository.crearRevision({
      negocioId: id,
      numero: (ultima?.numero ?? 0) + 1,
      datos,
      nombre: negocio.nombre,
      busqueda: textoDeBusqueda(negocio),
      precio: negocio.precio,
      prestaciones: negocio.prestaciones,
      categoriaId: negocio.categoriaId,
      localidadId: negocio.localidadId,
      aprobadaPorId: usuarioId,
    }, tx);
  });
  return obtenerNegocio(id);
};

// Pone en el sitio la última revisión aprobada (lo que se edite después no se ve hasta
// aprobar otra revisión y volver a publicar).
const publicarNegocio = async (id, revisionEsperada) => {
  await enTransaccion(async (tx) => {
    await exigirNegocio(id, tx);
    const ultima = await revisionRepository.obtenerUltimaRevision(id, tx);
    if (!ultima) { throw new NegocioSinAprobar(); }
    const publicado = await negocioRepository.cambiarRevisionPublicada(id, revisionEsperada, ultima.id, tx);
    if (!publicado) { throw new RevisionCambio(); }
  });
  return obtenerNegocio(id);
};

// Lo saca del sitio. El borrador y el historial quedan.
const retirarNegocio = async (id, revisionEsperada) => {
  const negocio = await exigirNegocio(id);
  if (negocio.revisionPublicadaId === null) { throw new NegocioNoPublicado(); }
  const retirado = await negocioRepository.cambiarRevisionPublicada(id, revisionEsperada, null);
  if (!retirado) { throw new RevisionCambio(); }
  return obtenerNegocio(id);
};

// Copia una revisión anterior al borrador (no borra nada del historial). Para publicarla
// hay que aprobarla de nuevo.
const restaurarRevision = async (usuarioId, id, { revisionId, revisionEsperada }) => {
  await exigirNegocio(id);
  const revision = await revisionRepository.obtenerRevisionPorId(revisionId);
  if (!revision || revision.negocioId !== id) { throw new RevisionNoEncontrada(); }
  const { ficha, horarios, horariosEspeciales, productos } = revision.datos;
  return guardarBorrador(usuarioId, id, revisionEsperada, { ...ficha, horarios, horariosEspeciales, productos });
};

export {
  listarNegocios,
  obtenerNegocio,
  crearNegocio,
  editarNegocio,
  aprobarRevision,
  publicarNegocio,
  retirarNegocio,
  restaurarRevision,
};
