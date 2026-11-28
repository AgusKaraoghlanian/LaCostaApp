import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../src/repositories/solicitud.repository.js', () => ({
  crearSolicitud: vi.fn(),
  marcarCorreoEnviado: vi.fn(),
  listarSolicitudes: vi.fn(),
  contarPendientes: vi.fn(),
  obtenerSolicitudPorId: vi.fn(),
  editarSolicitud: vi.fn(),
}));
vi.mock('../src/repositories/correo.repository.js', () => ({
  correoConfigurado: vi.fn(),
  enviarCorreo: vi.fn(),
}));

import * as solicitudRepository from '../src/repositories/solicitud.repository.js';
import * as correoRepository from '../src/repositories/correo.repository.js';
import * as solicitudService from '../src/services/solicitud.service.js';
import { crearSolicitudSchema } from '../src/validators/solicitud.validator.js';
import { SolicitudNoEncontrada } from '../src/errors/solicitud/SolicitudNoEncontrada.js';

const datos = { tipo: 'SUMAR', nombreNegocio: 'La <Orilla>', celular: '2257 123456', email: 'dueno@orilla.com' };
const guardada = { id: 7, ...datos, creadaEn: new Date('2026-11-28T18:00:00Z'), correoEnviado: false, atendida: false };

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  solicitudRepository.crearSolicitud.mockResolvedValue(guardada);
  process.env.SOLICITUDES_EMAIL = 'avisos@costa.com, otro@costa.com';
  correoRepository.correoConfigurado.mockReturnValue(true);
});
afterEach(() => delete process.env.SOLICITUDES_EMAIL);

describe('crearSolicitud', () => {
  it('la guarda, avisa por correo a todas las casillas y la marca como avisada', async () => {
    const respuesta = await solicitudService.crearSolicitud({ ...datos, sitioWeb: '' });

    expect(respuesta).toEqual({ recibida: true });
    expect(solicitudRepository.crearSolicitud).toHaveBeenCalledWith(datos);
    const correo = correoRepository.enviarCorreo.mock.calls[0][0];
    expect(correo.para).toEqual(['avisos@costa.com', 'otro@costa.com']);
    expect(correo.responderA).toBe('dueno@orilla.com');
    expect(correo.texto).toContain('2257 123456');
    expect(correo.html).toContain('La &lt;Orilla&gt;');
    expect(solicitudRepository.marcarCorreoEnviado).toHaveBeenCalledWith(7);
  });

  it('si el correo falla la solicitud igual queda guardada y responde bien', async () => {
    correoRepository.enviarCorreo.mockRejectedValue(new Error('Resend respondió 500'));

    await expect(solicitudService.crearSolicitud(datos)).resolves.toEqual({ recibida: true });
    expect(solicitudRepository.crearSolicitud).toHaveBeenCalled();
    expect(solicitudRepository.marcarCorreoEnviado).not.toHaveBeenCalled();
  });

  it('sin casilla configurada la guarda sin intentar mandar el correo', async () => {
    delete process.env.SOLICITUDES_EMAIL;

    await solicitudService.crearSolicitud(datos);

    expect(solicitudRepository.crearSolicitud).toHaveBeenCalled();
    expect(correoRepository.enviarCorreo).not.toHaveBeenCalled();
  });

  it('si viene el campo trampa (un bot) no guarda ni manda nada', async () => {
    await expect(solicitudService.crearSolicitud({ ...datos, sitioWeb: 'http://spam.com' })).resolves.toEqual({ recibida: true });
    expect(solicitudRepository.crearSolicitud).not.toHaveBeenCalled();
    expect(correoRepository.enviarCorreo).not.toHaveBeenCalled();
  });

  it('el asunto dice si es un reclamo de ficha', () => {
    expect(solicitudService.armarCorreo({ ...guardada, tipo: 'RECLAMAR' }).asunto).toBe('Reclamo de ficha: La <Orilla>');
  });
});

describe('editarSolicitud', () => {
  it('404 si no existe', async () => {
    solicitudRepository.obtenerSolicitudPorId.mockResolvedValue(null);
    await expect(solicitudService.editarSolicitud(99, { atendida: true })).rejects.toBeInstanceOf(SolicitudNoEncontrada);
  });
});

describe('crearSolicitudSchema', () => {
  const validar = (cambios) => crearSolicitudSchema.validate({ ...datos, ...cambios });

  it('acepta un celular con espacios, guiones o +54', () => {
    expect(validar({ celular: '+54 9 2257-123456' }).error).toBeUndefined();
  });

  it('rechaza un celular sin suficientes números', () => {
    expect(validar({ celular: '1234' }).error.message).toMatch(/celular válido/);
  });

  it('rechaza letras en el celular', () => {
    expect(validar({ celular: 'llamame al 2257' }).error.message).toMatch(/celular válido/);
  });

  it('rechaza un correo mal escrito', () => {
    expect(validar({ email: 'dueno@' }).error.message).toBe('Ingresá un correo electrónico válido.');
  });

  it('pide el nombre del negocio', () => {
    expect(validar({ nombreNegocio: '' }).error.message).toBe('Completá el nombre del negocio.');
  });
});
