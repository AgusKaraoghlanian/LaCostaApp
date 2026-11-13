import * as revisionRepository from '../repositories/revision.repository.js';
import * as categoriaRepository from '../repositories/categoria.repository.js';
import * as geografiaRepository from '../repositories/geografia.repository.js';
import { negocioPublicoDto, negocioResumenDto } from '../dtos/negocioDto.js';
import { NEGOCIOS_POR_PAGINA } from '../config/costa.js';
import { interpretarBusqueda } from '../utils/busqueda.js';
import { NegocioNoEncontrado } from '../errors/negocio/NegocioNoEncontrado.js';

// Lo que ve cualquier visitante: solo los negocios publicados, tal como se aprobaron.

const paginaVacia = (pagina) => ({ negocios: [], total: 0, pagina, porPagina: NEGOCIOS_POR_PAGINA });

// categoria es la clave de la URL ("parrillas"). Si no existe, no hay resultados.
// texto se entiende palabra por palabra: las comidas llevan a su categoría ("pizza" →
// pizzerías), los nombres de localidad a esa localidad y el resto se busca en cualquier orden.
const listarPublicados = async ({ categoria, localidadId, precio, prestacion, destacado, orden, texto, pagina = 1 }) => {
  let categoriaId;
  if (categoria) {
    const encontrada = await categoriaRepository.obtenerCategoriaPorClave(categoria);
    if (!encontrada) return paginaVacia(pagina);
    categoriaId = encontrada.id;
  }

  let busqueda = null;
  if (texto) {
    const [categorias, localidades] = await Promise.all([
      categoriaRepository.listarCategorias(),
      geografiaRepository.listarLocalidades(),
    ]);
    busqueda = interpretarBusqueda(texto, { categorias, localidades });
  }

  const { revisiones, total } = await revisionRepository.buscarPublicadas({
    categoriaId,
    localidadId,
    precio,
    prestaciones: prestacion,
    destacado,
    orden,
    busqueda,
    saltear: (pagina - 1) * NEGOCIOS_POR_PAGINA,
    cantidad: NEGOCIOS_POR_PAGINA,
  });
  return { negocios: revisiones.map(negocioResumenDto), total, pagina, porPagina: NEGOCIOS_POR_PAGINA };
};

const obtenerPublicado = async (slug) => {
  const revision = await revisionRepository.obtenerPublicadaPorSlug(slug);
  if (!revision) { throw new NegocioNoEncontrado(); }
  return negocioPublicoDto(revision);
};

export { listarPublicados, obtenerPublicado };
