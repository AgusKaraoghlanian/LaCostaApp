import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FotoNoGuardada } from '../errors/foto/FotoNoGuardada.js';

// Dónde quedan los archivos de las fotos.
// - Con SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY: en Supabase Storage (bucket público
//   SUPABASE_BUCKET, "fotos" si no se indica). Es lo que se usa en producción: en Vercel o
//   Render el disco del servidor se borra en cada deploy.
// - Sin eso (desarrollo): en backend/uploads, que app.js sirve en /uploads.

export const CARPETA_LOCAL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../uploads');

const supabase = () => {
  const url = process.env.SUPABASE_URL?.replace(/\/+$/, '');
  const clave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !clave) return null;
  return { url, clave, bucket: process.env.SUPABASE_BUCKET || 'fotos' };
};

// nombre: "negocios/<uuid>.jpg". origen: "http://localhost:3001", para armar el link local.
// Devuelve el link público de la foto.
const guardarFoto = async (nombre, contenido, tipo, origen) => {
  const remoto = supabase();
  if (remoto) {
    const res = await fetch(`${remoto.url}/storage/v1/object/${remoto.bucket}/${nombre}`, {
      method: 'POST',
      headers: { apikey: remoto.clave, Authorization: `Bearer ${remoto.clave}`, 'Content-Type': tipo, 'Cache-Control': 'max-age=31536000' },
      body: contenido,
    }).catch((e) => {
      throw new FotoNoGuardada(`Supabase Storage no responde: ${e.message}`);
    });
    if (!res.ok) throw new FotoNoGuardada(`Supabase Storage respondió ${res.status}: ${await res.text().catch(() => '')}`);
    return `${remoto.url}/storage/v1/object/public/${remoto.bucket}/${nombre}`;
  }

  const destino = path.join(CARPETA_LOCAL, nombre);
  await mkdir(path.dirname(destino), { recursive: true });
  await writeFile(destino, contenido);
  return `${origen}/uploads/${nombre}`;
};

export { guardarFoto };
