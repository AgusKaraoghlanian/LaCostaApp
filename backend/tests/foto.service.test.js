import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/repositories/foto.repository.js', () => ({ guardarFoto: vi.fn() }));

import * as fotoRepository from '../src/repositories/foto.repository.js';
import { subirFoto, TAMANIO_MAXIMO } from '../src/services/foto.service.js';
import { FotoInvalida } from '../src/errors/foto/FotoInvalida.js';

const JPG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0x10]);
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
const WEBP = Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBPVP8 ')]);
const ORIGEN = 'http://localhost:3001';

beforeEach(() => {
  vi.clearAllMocks();
  fotoRepository.guardarFoto.mockImplementation(async (nombre) => `${ORIGEN}/uploads/${nombre}`);
});

describe('subirFoto', () => {
  it.each([
    [JPG, 'image/jpeg', 'jpg'],
    [PNG, 'image/png', 'png'],
    [WEBP, 'image/webp', 'webp'],
  ])('guarda la imagen con un nombre al azar y su extensión real', async (archivo, tipo, ext) => {
    const { url } = await subirFoto(archivo, ORIGEN);
    const [nombre, contenido, tipoGuardado] = fotoRepository.guardarFoto.mock.calls[0];
    expect(nombre).toMatch(new RegExp(`^negocios/[0-9a-f-]{36}\\.${ext}$`));
    expect(contenido).toBe(archivo);
    expect(tipoGuardado).toBe(tipo);
    expect(url).toBe(`${ORIGEN}/uploads/${nombre}`);
  });

  it('rechaza lo que no es imagen aunque diga serlo', async () => {
    await expect(subirFoto(Buffer.from('<svg onload="alert(1)">'), ORIGEN)).rejects.toThrow(FotoInvalida);
    expect(fotoRepository.guardarFoto).not.toHaveBeenCalled();
  });

  it('rechaza un body vacío (otro Content-Type) o demasiado pesado', async () => {
    await expect(subirFoto({}, ORIGEN)).rejects.toThrow(FotoInvalida);
    await expect(subirFoto(Buffer.alloc(0), ORIGEN)).rejects.toThrow(FotoInvalida);
    const enorme = Buffer.concat([JPG, Buffer.alloc(TAMANIO_MAXIMO)]);
    await expect(subirFoto(enorme, ORIGEN)).rejects.toThrow(FotoInvalida);
  });
});
