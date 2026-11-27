// Trae de OpenStreetMap los locales gastronómicos del Partido de La Costa y los carga como
// borradores (SIN_CONFIRMAR, sin publicar), salteando los que ya están en la base.
//   node --env-file=.env.production.local prisma/importar-osm.js                   muestra qué haría (todos)
//   ... --localidad "Mar de Ajó"     solo esa localidad (sin importar tildes ni mayúsculas)
//   ... --categoria heladerias       solo esa categoría (la clave: restaurantes, cafeterias, bares...)
//   ... --limite 50                  como mucho 50 negocios nuevos en esta tanda
//   ... --confirmar                  los crea como borradores (no se publican)
//   ... --descargar                  vuelve a bajar los datos aunque ya estén los de hoy
// La descarga queda en prisma/osm/descargas/ (no va a git) y se reusa en el día.
// No se repite nada: un negocio ya importado se reconoce por su id de OSM (va en la referencia
// de verificación) y uno cargado a mano, por el nombre en la misma localidad.
// Los datos son © colaboradores de OpenStreetMap (ODbL): el pie del sitio lo menciona.
import "dotenv/config";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { prisma } from "../src/config/prisma.js";
import * as negocioService from "../src/services/negocio.service.js";
import { crearNegocioSchema } from "../src/validators/negocio.validator.js";
import { claveDeTexto } from "../src/utils/texto.js";
import { CONSULTA, categoriaDe, coordenadas, fichaDe, localidadDe, motivoDescarte } from "./osm/clasificar.js";

const args = process.argv.slice(2);
const valorDe = (flag) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : null;
};
const confirmar = args.includes("--confirmar");
const descargar = args.includes("--descargar");
const soloLocalidad = valorDe("--localidad");
const soloCategoria = valorDe("--categoria");
const limite = Number(valorDe("--limite")) || Infinity;

// Overpass tiene varios servidores; si uno no responde (o rechaza), se prueba el siguiente.
const SERVIDORES = [
  "https://overpass-api.de/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const hoy = new Date().toISOString().slice(0, 10);
const carpeta = new URL("./osm/descargas/", import.meta.url);
const archivo = new URL(`osm-${hoy}.json`, carpeta);

const bajarDeOverpass = async () => {
  for (const servidor of SERVIDORES) {
    try {
      const respuesta = await fetch(servidor, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "CostaALaCarta/1.0 (guia gastronomica)" },
        body: new URLSearchParams({ data: CONSULTA }),
        signal: AbortSignal.timeout(180_000),
      });
      const texto = await respuesta.text();
      if (respuesta.ok && texto.startsWith("{")) {
        console.log(`Datos bajados de ${new URL(servidor).host}.`);
        return texto;
      }
      console.log(`${new URL(servidor).host} respondió ${respuesta.status}, pruebo otro.`);
    } catch (error) {
      console.log(`${new URL(servidor).host} no respondió (${error.message}), pruebo otro.`);
    }
  }
  throw new Error("Ningún servidor de Overpass respondió. Probá de nuevo en un rato.");
};

const datosDeOsm = async () => {
  if (!descargar) {
    try {
      return JSON.parse(await readFile(archivo, "utf8"));
    } catch {
      // No hay descarga de hoy: se baja.
    }
  }
  const texto = await bajarDeOverpass();
  await mkdir(carpeta, { recursive: true });
  await writeFile(archivo, texto);
  return JSON.parse(texto);
};

// "Parrilla El Gaucho" y "El Gaucho" son el mismo: se compara sin las palabras del rubro.
const RUBRO = /\b(restaurante?|resto|parrilla|pizzeria|heladeria|cafeteria|cafe|bar|cerveceria|panaderia|confiteria|rotiseria|bodegon|cantina|la|el|los|las|de|del)\b/g;
const nucleo = (nombre) => claveDeTexto(nombre).replace(RUBRO, " ").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

const mismoNombre = (a, b) => {
  if (claveDeTexto(a) === claveDeTexto(b)) return true;
  const [x, y] = [nucleo(a), nucleo(b)];
  if (x.length < 4 || y.length < 4) return false;
  return x === y || (Math.min(x.length, y.length) >= 6 && (x.includes(y) || y.includes(x)));
};

const main = async () => {
  const admin = await prisma.usuario.findFirst({ where: { rol: "ADMINISTRADOR" } });
  if (!admin) throw new Error("No hay ningún administrador: corré primero npm run seed");

  const [localidades, categorias, existentes] = await Promise.all([
    prisma.localidad.findMany(),
    prisma.categoria.findMany(),
    prisma.negocio.findMany({ select: { id: true, nombre: true, localidadId: true, referenciaVerificacion: true } }),
  ]);
  const localidadPorNombre = new Map(localidades.map((l) => [claveDeTexto(l.nombre), l]));
  const categoriaPorClave = new Map(categorias.map((c) => [c.clave, c]));

  const osm = await datosDeOsm();
  const descartes = {};
  const sumarDescarte = (motivo) => { descartes[motivo] = (descartes[motivo] || 0) + 1; };
  const nuevos = [];
  const repetidos = [];

  for (const el of osm.elements) {
    const motivo = motivoDescarte(el);
    if (motivo) { sumarDescarte(motivo); continue; }
    const [lat, lon] = coordenadas(el);
    const nombreLocalidad = localidadDe(lat, lon);
    if (!nombreLocalidad) { sumarDescarte("fuera del Partido"); continue; }
    const localidad = localidadPorNombre.get(claveDeTexto(nombreLocalidad));
    if (!localidad) { sumarDescarte(`localidad ${nombreLocalidad} no está en la base`); continue; }
    const clave = categoriaDe(el.tags);
    const categoria = categoriaPorClave.get(clave);
    if (!categoria) { sumarDescarte(`categoría ${clave} no está en la base`); continue; }

    if (soloLocalidad && !claveDeTexto(localidad.nombre).includes(claveDeTexto(soloLocalidad))) continue;
    if (soloCategoria && clave !== soloCategoria) continue;

    const osmId = `${el.type}/${el.id}`;
    const yaImportado = existentes.find((n) => n.referenciaVerificacion.includes(`OpenStreetMap ${osmId} `));
    const cargadoAMano = existentes.find((n) => n.localidadId === localidad.id && mismoNombre(n.nombre, el.tags.name));
    const enEstaTanda = nuevos.find((n) => n.localidadId === localidad.id && mismoNombre(n.nombre, el.tags.name));
    if (yaImportado || cargadoAMano || enEstaTanda) {
      const igual = yaImportado || cargadoAMano || enEstaTanda;
      repetidos.push(`${el.tags.name} (${localidad.nombre}) = ${igual.id ? `#${igual.id} ` : ""}${igual.nombre}`);
      continue;
    }

    const ficha = fichaDe(el, { localidad: localidad.nombre, categoria: clave, fecha: hoy });
    nuevos.push({ ...ficha, localidadId: localidad.id, categoriaId: categoria.id });
  }

  const tanda = nuevos.slice(0, limite);
  console.log(`OSM: ${osm.elements.length} lugares. Descartados: ${Object.entries(descartes).map(([m, n]) => `${n} ${m}`).join(", ") || "ninguno"}.`);
  console.log(`Ya cargados (o repetidos en OSM): ${repetidos.length}. Nuevos: ${nuevos.length}${tanda.length < nuevos.length ? ` (esta tanda: ${tanda.length})` : ""}.`);

  // Resumen por localidad y categoría.
  const resumen = {};
  for (const n of tanda) {
    resumen[n._localidad] ??= {};
    resumen[n._localidad][n._categoria] = (resumen[n._localidad][n._categoria] || 0) + 1;
  }
  for (const [loc, cats] of Object.entries(resumen)) {
    console.log(`  ${loc}: ${Object.entries(cats).map(([c, k]) => `${k} ${c}`).join(", ")}`);
  }

  if (!confirmar) {
    tanda.forEach((n) => console.log(`  · ${n.nombre} — ${n._categoria}, ${n._localidad}${n.direccion ? `, ${n.direccion}` : ""}`));
    if (repetidos.length) {
      console.log("Salteados por estar ya cargados:");
      repetidos.forEach((r) => console.log(`  = ${r}`));
    }
    console.log("Nada cambió. Para crearlos como borradores: agregá --confirmar");
    return;
  }

  let creados = 0;
  const fallidos = [];
  for (const n of tanda) {
    const { _osmId, _localidad, _categoria, ...datos } = n;
    let validado = crearNegocioSchema.validate(datos, { abortEarly: false });
    // Un link mal cargado en OSM no frena la ficha: se saca y se prueba de nuevo.
    if (validado.error) validado = crearNegocioSchema.validate({ ...datos, web: "", instagram: "", facebook: "" });
    if (validado.error) { fallidos.push(`${n.nombre}: ${validado.error.message}`); continue; }
    if (await crear(admin.id, validado.value, n, fallidos)) creados++;
  }
  console.log(`Creados como borradores: ${creados}. Con error: ${fallidos.length}.`);
  fallidos.forEach((f) => console.log(`  ✗ ${f}`));
  console.log("Están en el admin sin publicar. Completalos (foto, horarios, teléfono) y publicalos desde ahí.");
};

const crear = async (adminId, datos, n, fallidos) => {
  try {
    const negocio = await negocioService.crearNegocio(adminId, datos);
    console.log(`  ✓ #${negocio.id} ${n.nombre} — ${n._categoria}, ${n._localidad}`);
    return true;
  } catch (error) {
    fallidos.push(`${n.nombre}: ${error.message}`);
    return false;
  }
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
