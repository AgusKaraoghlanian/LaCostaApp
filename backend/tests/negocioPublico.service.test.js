import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/repositories/revision.repository.js', () => ({
  buscarPublicadas: vi.fn(),
  obtenerPublicadaPorSlug: vi.fn(),
}));
vi.mock('../src/repositories/categoria.repository.js', () => ({ obtenerCategoriaPorClave: vi.fn() }));

import * as revisionRepository from '../src/repositories/revision.repository.js';
import * as categoriaRepository from '../src/repositories/categoria.repository.js';
import * as negocioPublicoService from '../src/services/negocioPublico.service.js';
import { NegocioNoEncontrado } from '../src/errors/negocio/NegocioNoEncontrado.js';

// Una revisión publicada como la devuelve el repository.
const revision = {
  aprobadaEn: new Date('2026-11-01T12:00:00Z'),
  negocio: { slug: 'la-orilla' },
  datos: {
    ficha: { nombre: 'La Orilla', descripcion: 'Cocina de estación', foto: null, precio: 3, prestaciones: [], estadoComercial: 'ACTIVO', referenciaVerificacion: 'Llamé al local', localidadId: 1, categoriaId: 2, telefono: '' },
    localidad: { id: 1, nombre: 'Costa del Este' },
    categoria: { id: 2, clave: 'restaurantes', nombre: 'Restaurantes' },
    horarios: [],
    horariosEspeciales: [],
    productos: [
      { nombre: 'Cortado', estado: 'APROBADO' },
      { nombre: 'Medialuna', estado: 'PROPUESTO' },
      { nombre: 'Tostado', estado: 'DESCARTADO' },
    ],
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  revisionRepository.buscarPublicadas.mockResolvedValue({ revisiones: [revision], total: 1 });
});

describe('listarPublicados', () => {
  it('busca sin tildes ni mayúsculas y pagina de a 24', async () => {
    await negocioPublicoService.listarPublicados({ texto: '  Café ', pagina: 2 });

    expect(revisionRepository.buscarPublicadas).toHaveBeenCalledWith(
      expect.objectContaining({ busqueda: 'cafe', saltear: 24, cantidad: 24 }),
    );
  });

  it('filtra por la categoría de la URL', async () => {
    categoriaRepository.obtenerCategoriaPorClave.mockResolvedValue({ id: 3 });

    await negocioPublicoService.listarPublicados({ categoria: 'parrillas', prestacion: ['Reservas'] });

    expect(revisionRepository.buscarPublicadas).toHaveBeenCalledWith(
      expect.objectContaining({ categoriaId: 3, prestaciones: ['Reservas'] }),
    );
  });

  it('una categoría que no existe no trae resultados', async () => {
    categoriaRepository.obtenerCategoriaPorClave.mockResolvedValue(null);

    const resultado = await negocioPublicoService.listarPublicados({ categoria: 'no-existe' });

    expect(resultado.negocios).toEqual([]);
    expect(revisionRepository.buscarPublicadas).not.toHaveBeenCalled();
  });
});

describe('obtenerPublicado', () => {
  it('muestra solo la carta aprobada y nada interno', async () => {
    revisionRepository.obtenerPublicadaPorSlug.mockResolvedValue(revision);

    const ficha = await negocioPublicoService.obtenerPublicado('la-orilla');

    expect(ficha.carta).toEqual([{ nombre: 'Cortado' }]);
    expect(ficha).not.toHaveProperty('referenciaVerificacion');
    expect(ficha).not.toHaveProperty('localidadId');
    expect(ficha.slug).toBe('la-orilla');
  });

  it('da 404 si no está publicado', async () => {
    revisionRepository.obtenerPublicadaPorSlug.mockResolvedValue(null);
    await expect(negocioPublicoService.obtenerPublicado('x')).rejects.toBeInstanceOf(NegocioNoEncontrado);
  });
});
