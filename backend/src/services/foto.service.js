import { randomUUID } from 'node:crypto';
import * as fotoRepository from '../repositories/foto.repository.js';
import { FotoInvalida } from '../errors/foto/FotoInvalida.js';

export const TAMANIO_MAXIMO = 5 * 1024 * 1024;

// El tipo se saca de los primeros bytes del archivo, no de lo que dice el navegador:
// así no se puede subir otra cosa con nombre o encabezado de imagen.
const tipoDe = (b) => {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { tipo: 'image/jpeg', ext: 'jpg' };
  if (b.length >= 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { tipo: 'image/png', ext: 'png' };
  }
  if (b.length >= 12 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    return { tipo: 'image/webp', ext: 'webp' };
  }
  return null;
};

// contenido: el archivo tal cual (Buffer). Devuelve { url } para usar en la ficha.
const subirFoto = async (contenido, origen) => {
  if (!Buffer.isBuffer(contenido) || contenido.length === 0 || contenido.length > TAMANIO_MAXIMO) throw new FotoInvalida();
  const formato = tipoDe(contenido);
  if (!formato) throw new FotoInvalida();
  const url = await fotoRepository.guardarFoto(`negocios/${randomUUID()}.${formato.ext}`, contenido, formato.tipo, origen);
  return { url };
};

export { subirFoto, tipoDe };
