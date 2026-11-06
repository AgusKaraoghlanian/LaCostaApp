import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/repositories/categoria.repository.js', () => ({
  listarCategorias: vi.fn(),
  obtenerCategoriaPorClave: vi.fn(),
  crearCategoria: vi.fn(),
}));
vi.mock('../src/repositories/geografia.repository.js', () => ({
  obtenerGeografia: vi.fn(),
  obtenerProvinciaPorId: vi.fn(),
  obtenerPartidoPorId: vi.fn(),
  crearProvincia: vi.fn(),
  crearPartido: vi.fn(),
  crearLocalidad: vi.fn(),
}));

vi.mock('../src/repositories/revision.repository.js', () => ({
  contarPublicadasPorCategoria: vi.fn().mockResolvedValue(new Map([[1, 5]])),
}));

import * as categoriaRepository from '../src/repositories/categoria.repository.js';
import * as geografiaRepository from '../src/repositories/geografia.repository.js';
import * as catalogoService from '../src/services/catalogo.service.js';
import { CategoriaYaExiste } from '../src/errors/catalogo/CategoriaYaExiste.js';
import { PartidoNoEncontrado } from '../src/errors/catalogo/PartidoNoEncontrado.js';
import { LugarYaExiste } from '../src/errors/catalogo/LugarYaExiste.js';

beforeEach(() => vi.clearAllMocks());

describe('listarCategorias', () => {
  it('suma cuántos negocios publicados tiene cada una', async () => {
    categoriaRepository.listarCategorias.mockResolvedValue([
      { id: 1, clave: 'restaurantes', nombre: 'Restaurantes' },
      { id: 2, clave: 'cafeterias', nombre: 'Cafeterías' },
    ]);

    const categorias = await catalogoService.listarCategorias();

    expect(categorias.map((c) => c.negocios)).toEqual([5, 0]);
  });
});

describe('crearCategoria', () => {
  it('arma la clave de la URL con el nombre', async () => {
    categoriaRepository.obtenerCategoriaPorClave.mockResolvedValue(null);
    categoriaRepository.crearCategoria.mockImplementation(async (datos) => ({ id: 9, color: '#e5eadc', icono: 'utensils', ...datos }));

    const categoria = await catalogoService.crearCategoria({ nombre: 'Bares y cervecerías', descripcion: '' });

    expect(categoria.clave).toBe('bares-y-cervecerias');
  });

  it('no deja dos categorías con la misma clave', async () => {
    categoriaRepository.obtenerCategoriaPorClave.mockResolvedValue({ id: 1 });
    await expect(catalogoService.crearCategoria({ nombre: 'Food Trucks' })).rejects.toBeInstanceOf(CategoriaYaExiste);
  });
});

describe('crearLocalidad', () => {
  it('pide un partido que exista', async () => {
    geografiaRepository.obtenerPartidoPorId.mockResolvedValue(null);
    await expect(catalogoService.crearLocalidad({ nombre: 'Lucila', partidoId: 9 })).rejects.toBeInstanceOf(PartidoNoEncontrado);
  });

  it('si la base dice que ya existe, avisa con un mensaje claro', async () => {
    geografiaRepository.obtenerPartidoPorId.mockResolvedValue({ id: 1 });
    geografiaRepository.crearLocalidad.mockRejectedValue(Object.assign(new Error('unique'), { code: 'P2002' }));
    await expect(catalogoService.crearLocalidad({ nombre: 'Mar de Ajó', partidoId: 1 })).rejects.toBeInstanceOf(LugarYaExiste);
  });
});
