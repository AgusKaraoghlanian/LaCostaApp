// Línea base del HTML generado por el build de demostración (hito 0).
// Uso: node scripts/linea-base.mjs --guardar [directorio-build]
// Sin --guardar, compara el build con tests/linea-base/ y termina con error si difiere.
import { readFile, writeFile, mkdir, readdir, rm } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

export const DIRECTORIO_LINEA_BASE = 'tests/linea-base';
const ARCHIVOS_EXTRA = ['sitemap.xml', 'robots.txt', '404.html'];

// Quita lo que cambia entre builds sin cambiar lo visible: hashes de assets,
// el año del pie y el origen público (que pasará a ser configurable).
export function normalizar(contenido) {
  return contenido
    .replace(/\/assets\/([A-Za-z0-9_-]+?)-[A-Za-z0-9_-]{8}\.(js|css)/g, '/assets/$1.$2')
    .replace(/© \d{4}/g, '© {AÑO}')
    .replace(/https:\/\/costa-a-la-carta\.o4ftony10\.chatgpt\.site/g, '{ORIGEN}');
}

async function listarHtml(directorio) {
  const salida = [];
  async function recorrer(actual) {
    for (const entrada of await readdir(actual, { withFileTypes: true })) {
      const ruta = join(actual, entrada.name);
      if (entrada.isDirectory()) { if (entrada.name !== 'assets') await recorrer(ruta); }
      else if (entrada.name === 'index.html') salida.push(ruta);
    }
  }
  await recorrer(directorio);
  return salida;
}

// Nombre plano de archivo para cada ruta: / → inicio.html, /lugar/la-orilla → lugar__la-orilla.html
export function nombreParaRuta(rutaRelativa) {
  const partes = rutaRelativa.split(sep).slice(0, -1);
  return (partes.length ? partes.join('__') : 'inicio') + '.html';
}

export async function leerBuild(directorio = 'dist') {
  const paginas = new Map();
  for (const archivo of await listarHtml(directorio)) {
    paginas.set(nombreParaRuta(relative(directorio, archivo)), normalizar(await readFile(archivo, 'utf8')));
  }
  for (const extra of ARCHIVOS_EXTRA) {
    paginas.set(extra.replace('.html', '') === '404' ? 'no-encontrado.html' : extra, normalizar(await readFile(join(directorio, extra), 'utf8')));
  }
  return paginas;
}

export async function leerLineaBase() {
  const paginas = new Map();
  for (const nombre of await readdir(DIRECTORIO_LINEA_BASE)) {
    paginas.set(nombre, await readFile(join(DIRECTORIO_LINEA_BASE, nombre), 'utf8'));
  }
  return paginas;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const guardar = process.argv.includes('--guardar');
  const directorio = process.argv.slice(2).find(a => !a.startsWith('--')) || 'dist';
  const build = await leerBuild(directorio);
  if (guardar) {
    await rm(DIRECTORIO_LINEA_BASE, { recursive: true, force: true });
    await mkdir(DIRECTORIO_LINEA_BASE, { recursive: true });
    for (const [nombre, contenido] of build) await writeFile(join(DIRECTORIO_LINEA_BASE, nombre), contenido);
    console.log(`Línea base guardada: ${build.size} archivos en ${DIRECTORIO_LINEA_BASE}.`);
  } else {
    const base = await leerLineaBase();
    const diferencias = [...new Set([...base.keys(), ...build.keys()])].filter(n => base.get(n) !== build.get(n));
    if (diferencias.length) { console.error('Difieren de la línea base:\n' + diferencias.join('\n')); process.exit(1); }
    console.log(`El build coincide con la línea base (${base.size} archivos).`);
  }
}
