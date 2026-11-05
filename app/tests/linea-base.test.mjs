import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { leerBuild, leerLineaBase, normalizar } from '../scripts/linea-base.mjs';

// Compara el build de demostración con la línea base del hito 0.
// Requiere un build previo (npm run build); sin dist/ la prueba se omite con aviso.
const directorio = process.env.DIRECTORIO_BUILD_DEMO || 'dist-demo';

test('La normalización ignora hashes de assets, año y origen', () => {
  assert.equal(normalizar('<script src="/assets/index-mlIIYLKW.js"></script>'), '<script src="/assets/index.js"></script>');
  assert.equal(normalizar('© 2031 Costa'), '© {AÑO} Costa');
});

test('El build de demostración coincide con la línea base', { skip: !existsSync(directorio) && `falta ${directorio}/: ejecutá npm run build` }, async () => {
  const [base, build] = await Promise.all([leerLineaBase(), leerBuild(directorio)]);
  assert.deepEqual([...build.keys()].sort(), [...base.keys()].sort(), 'Cambió el conjunto de páginas generadas');
  for (const [nombre, contenido] of base) assert.equal(build.get(nombre), contenido, `Cambió el HTML de ${nombre}`);
});
