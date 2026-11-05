import * as categoriaRepository from '../repositories/categoria.repository.js';
import * as geografiaRepository from '../repositories/geografia.repository.js';
import { categoriaCompletaDto, geografiaDto } from '../dtos/catalogoDto.js';
import { armarSlug } from '../utils/texto.js';
import { CategoriaYaExiste } from '../errors/catalogo/CategoriaYaExiste.js';
import { ProvinciaNoEncontrada } from '../errors/catalogo/ProvinciaNoEncontrada.js';
import { PartidoNoEncontrado } from '../errors/catalogo/PartidoNoEncontrado.js';
import { LugarYaExiste } from '../errors/catalogo/LugarYaExiste.js';

// Si la base rechaza el alta porque el nombre ya existe (P2002), se avisa con un mensaje claro.
const siYaExiste = (ErrorPropio) => (error) => {
  if (error.code === 'P2002') throw new ErrorPropio();
  throw error;
};

const listarCategorias = async () => {
  const categorias = await categoriaRepository.listarCategorias();
  return categorias.map(categoriaCompletaDto);
};

// La clave (para la URL) sale del nombre: "Bares y cervecerías" → "bares-y-cervecerias".
const crearCategoria = async ({ nombre, descripcion }) => {
  const clave = armarSlug(nombre);
  if (await categoriaRepository.obtenerCategoriaPorClave(clave)) { throw new CategoriaYaExiste(); }
  const categoria = await categoriaRepository
    .crearCategoria({ clave, nombre, descripcion })
    .catch(siYaExiste(CategoriaYaExiste));
  return categoriaCompletaDto(categoria);
};

const obtenerGeografia = async () => {
  return geografiaDto(await geografiaRepository.obtenerGeografia());
};

const crearProvincia = async ({ nombre }) => {
  const provincia = await geografiaRepository.crearProvincia(nombre).catch(siYaExiste(LugarYaExiste));
  return { id: provincia.id, nombre: provincia.nombre };
};

const crearPartido = async ({ nombre, provinciaId }) => {
  if (!await geografiaRepository.obtenerProvinciaPorId(provinciaId)) { throw new ProvinciaNoEncontrada(); }
  const partido = await geografiaRepository.crearPartido(provinciaId, nombre).catch(siYaExiste(LugarYaExiste));
  return { id: partido.id, nombre: partido.nombre, provinciaId };
};

const crearLocalidad = async ({ nombre, partidoId }) => {
  if (!await geografiaRepository.obtenerPartidoPorId(partidoId)) { throw new PartidoNoEncontrado(); }
  const localidad = await geografiaRepository.crearLocalidad(partidoId, nombre).catch(siYaExiste(LugarYaExiste));
  return { id: localidad.id, nombre: localidad.nombre, partidoId };
};

export { listarCategorias, crearCategoria, obtenerGeografia, crearProvincia, crearPartido, crearLocalidad };
