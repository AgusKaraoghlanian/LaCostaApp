import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/repositories/negocio.repository.js', () => ({
  obtenerNegocioPorId: vi.fn(),
  existeSlug: vi.fn(),
  buscarNegocios: vi.fn(),
  crearNegocio: vi.fn(),
  actualizarBorrador: vi.fn(),
  guardarHorariosYCarta: vi.fn(),
  cambiarRevisionPublicada: vi.fn(),
}));
vi.mock('../src/repositories/revision.repository.js', () => ({
  crearRevision: vi.fn(),
  obtenerUltimaRevision: vi.fn(),
  obtenerRevisionPorId: vi.fn(),
}));
vi.mock('../src/repositories/categoria.repository.js', () => ({ obtenerCategoriaPorId: vi.fn() }));
vi.mock('../src/repositories/geografia.repository.js', () => ({ obtenerLocalidadPorId: vi.fn() }));
vi.mock('../src/repositories/transaccion.repository.js', () => ({
  enTransaccion: vi.fn((operaciones) => operaciones('tx')),
}));

import * as negocioRepository from '../src/repositories/negocio.repository.js';
import * as revisionRepository from '../src/repositories/revision.repository.js';
import * as categoriaRepository from '../src/repositories/categoria.repository.js';
import * as geografiaRepository from '../src/repositories/geografia.repository.js';
import * as negocioService from '../src/services/negocio.service.js';
import { RevisionCambio } from '../src/errors/negocio/RevisionCambio.js';
import { NegocioSinAprobar } from '../src/errors/negocio/NegocioSinAprobar.js';
import { NegocioNoPublicado } from '../src/errors/negocio/NegocioNoPublicado.js';
import { NegocioSinCambios } from '../src/errors/negocio/NegocioSinCambios.js';
import { NegocioNoEncontrado } from '../src/errors/negocio/NegocioNoEncontrado.js';
import { RevisionNoEncontrada } from '../src/errors/negocio/RevisionNoEncontrada.js';
import { LocalidadNoEncontrada } from '../src/errors/catalogo/LocalidadNoEncontrada.js';
import { CategoriaNoEncontrada } from '../src/errors/catalogo/CategoriaNoEncontrada.js';

// Una ficha como la devuelve obtenerNegocioPorId.
const negocio = (cambios = {}) => ({
  id: 7,
  slug: 'la-orilla',
  nombre: 'La Orilla',
  nombreClave: 'la orilla',
  localidadId: 1,
  categoriaId: 2,
  estadoComercial: 'ACTIVO',
  descripcion: 'Cocina de estación',
  direccion: '',
  zonaAtencion: '',
  telefono: '',
  whatsapp: '',
  web: '',
  instagram: '',
  facebook: '',
  horariosTexto: '',
  prestaciones: ['Reservas'],
  precio: 2,
  foto: null,
  referenciaVerificacion: 'Llamé al local',
  revisionBorrador: 3,
  revisionPublicadaId: null,
  localidad: { id: 1, nombre: 'Mar de Ajó', partido: { nombre: 'Partido de La Costa', provincia: { nombre: 'Buenos Aires' } } },
  categoria: { id: 2, clave: 'parrillas', nombre: 'Parrillas' },
  horarios: [],
  horariosEspeciales: [],
  productos: [],
  revisiones: [],
  creadoEn: new Date(),
  actualizadoEn: new Date(),
  ...cambios,
});

// Lo que llega validado del body.
const datos = (cambios = {}) => ({
  nombre: 'La Orilla',
  localidadId: 1,
  categoriaId: 2,
  referenciaVerificacion: 'Llamé al local',
  horarios: [],
  horariosEspeciales: [],
  productos: [{ nombre: 'Cortado' }],
  ...cambios,
});

beforeEach(() => {
  vi.clearAllMocks();
  geografiaRepository.obtenerLocalidadPorId.mockResolvedValue({ id: 1 });
  categoriaRepository.obtenerCategoriaPorId.mockResolvedValue({ id: 2 });
  negocioRepository.obtenerNegocioPorId.mockResolvedValue(negocio());
});

describe('crearNegocio', () => {
  it('arma el slug con el nombre y le suma un número si ya existe', async () => {
    negocioRepository.existeSlug.mockImplementation(async (slug) => ['cafe-del-muelle', 'cafe-del-muelle-2'].includes(slug));
    negocioRepository.crearNegocio.mockResolvedValue({ id: 7 });

    await negocioService.crearNegocio(5, datos({ nombre: 'Café del Muelle' }));

    expect(negocioRepository.crearNegocio).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'cafe-del-muelle-3', nombreClave: 'cafe del muelle', creadoPorId: 5, editadoPorId: 5 }),
      'tx',
    );
  });

  it('guarda la carta aparte, en la misma transacción', async () => {
    negocioRepository.existeSlug.mockResolvedValue(false);
    negocioRepository.crearNegocio.mockResolvedValue({ id: 7 });

    await negocioService.crearNegocio(5, datos());

    const ficha = negocioRepository.crearNegocio.mock.calls[0][0];
    expect(ficha).not.toHaveProperty('productos');
    expect(negocioRepository.guardarHorariosYCarta).toHaveBeenCalledWith(
      7,
      { horarios: [], horariosEspeciales: [], productos: [{ nombre: 'Cortado' }] },
      'tx',
    );
  });

  it('el plan de portada decide si es destacado', async () => {
    negocioRepository.existeSlug.mockResolvedValue(false);
    negocioRepository.crearNegocio.mockResolvedValue({ id: 7 });

    await negocioService.crearNegocio(5, datos({ plan: 'CARRUSEL' }));
    await negocioService.crearNegocio(5, datos({ plan: 'LISTA' }));
    await negocioService.crearNegocio(5, datos({ plan: 'SABORES' }));
    await negocioService.crearNegocio(5, datos({ plan: 'NINGUNO' }));

    const fichas = negocioRepository.crearNegocio.mock.calls.map(([ficha]) => [ficha.plan, ficha.destacado]);
    expect(fichas).toEqual([['CARRUSEL', true], ['LISTA', true], ['SABORES', false], ['NINGUNO', false]]);
  });

  it('rechaza una localidad o una categoría que no existen', async () => {
    geografiaRepository.obtenerLocalidadPorId.mockResolvedValueOnce(null);
    await expect(negocioService.crearNegocio(5, datos())).rejects.toBeInstanceOf(LocalidadNoEncontrada);

    categoriaRepository.obtenerCategoriaPorId.mockResolvedValueOnce(null);
    await expect(negocioService.crearNegocio(5, datos())).rejects.toBeInstanceOf(CategoriaNoEncontrada);
    expect(negocioRepository.crearNegocio).not.toHaveBeenCalled();
  });
});

describe('editarNegocio', () => {
  it('avisa si otra persona guardó antes y no toca la carta', async () => {
    negocioRepository.actualizarBorrador.mockResolvedValue(false);

    await expect(negocioService.editarNegocio(5, 7, datos({ revisionEsperada: 2 }))).rejects.toBeInstanceOf(RevisionCambio);
    expect(negocioRepository.guardarHorariosYCarta).not.toHaveBeenCalled();
  });

  it('guarda con la revisión que se tenía y quién editó', async () => {
    negocioRepository.actualizarBorrador.mockResolvedValue(true);

    await negocioService.editarNegocio(5, 7, datos({ revisionEsperada: 3 }));

    expect(negocioRepository.actualizarBorrador).toHaveBeenCalledWith(
      7, 3, expect.objectContaining({ editadoPorId: 5, nombre: 'La Orilla' }), 'tx',
    );
  });

  it('da 404 si el negocio no existe', async () => {
    negocioRepository.obtenerNegocioPorId.mockResolvedValue(null);
    await expect(negocioService.editarNegocio(5, 99, datos({ revisionEsperada: 1 }))).rejects.toBeInstanceOf(NegocioNoEncontrado);
  });
});

describe('aprobarRevision', () => {
  it('crea la revisión siguiente con la foto del borrador y los datos para filtrar', async () => {
    revisionRepository.obtenerUltimaRevision.mockResolvedValue({ numero: 4 });

    await negocioService.aprobarRevision(5, 7, 3);

    const revision = revisionRepository.crearRevision.mock.calls[0][0];
    expect(revision).toMatchObject({
      negocioId: 7,
      numero: 5,
      aprobadaPorId: 5,
      precio: 2,
      prestaciones: ['Reservas'],
      busqueda: 'la orilla cocina de estacion mar de ajo parrillas',
    });
    expect(revision.datos.ficha.referenciaVerificacion).toBe('Llamé al local');
  });

  it('copia el plan de portada para filtrar la portada', async () => {
    negocioRepository.obtenerNegocioPorId.mockResolvedValue(negocio({ plan: 'CARRUSEL', destacado: true }));
    revisionRepository.obtenerUltimaRevision.mockResolvedValue(null);

    await negocioService.aprobarRevision(5, 7, 3);

    const revision = revisionRepository.crearRevision.mock.calls[0][0];
    expect(revision).toMatchObject({ plan: 'CARRUSEL', destacado: true });
    expect(revision.datos.ficha.plan).toBe('CARRUSEL');
  });

  it('la primera revisión es la 1', async () => {
    revisionRepository.obtenerUltimaRevision.mockResolvedValue(null);
    await negocioService.aprobarRevision(5, 7, 3);
    expect(revisionRepository.crearRevision.mock.calls[0][0].numero).toBe(1);
  });

  it('no aprueba de nuevo si nada cambió (aunque la base haya reordenado las claves)', async () => {
    revisionRepository.obtenerUltimaRevision.mockResolvedValue(null);
    await negocioService.aprobarRevision(5, 7, 3);
    const { datos } = revisionRepository.crearRevision.mock.calls[0][0];
    const reordenada = { productos: datos.productos, horariosEspeciales: datos.horariosEspeciales, horarios: datos.horarios,
      categoria: datos.categoria, localidad: datos.localidad, ficha: Object.fromEntries(Object.entries(datos.ficha).reverse()) };
    revisionRepository.obtenerUltimaRevision.mockResolvedValue({ numero: 1, datos: reordenada });

    await expect(negocioService.aprobarRevision(5, 7, 3)).rejects.toBeInstanceOf(NegocioSinCambios);
  });

  it('no aprueba si el borrador cambió desde que se abrió', async () => {
    await expect(negocioService.aprobarRevision(5, 7, 2)).rejects.toBeInstanceOf(RevisionCambio);
    expect(revisionRepository.crearRevision).not.toHaveBeenCalled();
  });
});

describe('publicarNegocio y retirarNegocio', () => {
  it('publica la última revisión aprobada', async () => {
    revisionRepository.obtenerUltimaRevision.mockResolvedValue({ id: 40, numero: 2 });
    negocioRepository.cambiarRevisionPublicada.mockResolvedValue(true);

    await negocioService.publicarNegocio(7, 3);

    expect(negocioRepository.cambiarRevisionPublicada).toHaveBeenCalledWith(7, 3, 40, 'tx');
  });

  it('no publica sin una revisión aprobada', async () => {
    revisionRepository.obtenerUltimaRevision.mockResolvedValue(null);
    await expect(negocioService.publicarNegocio(7, 3)).rejects.toBeInstanceOf(NegocioSinAprobar);
  });

  it('no retira uno que no está publicado', async () => {
    await expect(negocioService.retirarNegocio(7, 3)).rejects.toBeInstanceOf(NegocioNoPublicado);
  });

  it('retirar deja la revisión publicada en null', async () => {
    negocioRepository.obtenerNegocioPorId.mockResolvedValue(negocio({ revisionPublicadaId: 40 }));
    negocioRepository.cambiarRevisionPublicada.mockResolvedValue(true);

    await negocioService.retirarNegocio(7, 3);

    expect(negocioRepository.cambiarRevisionPublicada).toHaveBeenCalledWith(7, 3, null);
  });
});

describe('restaurarRevision', () => {
  it('copia la revisión al borrador', async () => {
    revisionRepository.obtenerRevisionPorId.mockResolvedValue({
      negocioId: 7,
      datos: { ficha: { ...datos(), descripcion: 'Vieja' }, horarios: [], horariosEspeciales: [], productos: [] },
    });
    negocioRepository.actualizarBorrador.mockResolvedValue(true);

    await negocioService.restaurarRevision(5, 7, { revisionId: 40, revisionEsperada: 3 });

    expect(negocioRepository.actualizarBorrador).toHaveBeenCalledWith(
      7, 3, expect.objectContaining({ descripcion: 'Vieja' }), 'tx',
    );
  });

  it('una revisión de antes de los planes que era destacada vuelve a "Para poner en tu lista"', async () => {
    revisionRepository.obtenerRevisionPorId.mockResolvedValue({
      negocioId: 7,
      datos: { ficha: { ...datos(), destacado: true }, horarios: [], horariosEspeciales: [], productos: [] },
    });
    negocioRepository.actualizarBorrador.mockResolvedValue(true);

    await negocioService.restaurarRevision(5, 7, { revisionId: 40, revisionEsperada: 3 });

    expect(negocioRepository.actualizarBorrador).toHaveBeenCalledWith(
      7, 3, expect.objectContaining({ plan: 'LISTA', destacado: true }), 'tx',
    );
  });

  it('no deja restaurar la revisión de otro negocio', async () => {
    revisionRepository.obtenerRevisionPorId.mockResolvedValue({ negocioId: 8, datos: {} });
    await expect(negocioService.restaurarRevision(5, 7, { revisionId: 40, revisionEsperada: 3 }))
      .rejects.toBeInstanceOf(RevisionNoEncontrada);
  });
});
