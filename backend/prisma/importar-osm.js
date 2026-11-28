// Trae de OpenStreetMap los locales gastronómicos del Partido de La Costa y los carga como
// borradores (SIN_CONFIRMAR, sin publicar), salteando los que ya están en la base.
//   node --env-file=.env.production.local prisma/importar-osm.js                   muestra qué haría (todos)
//   ... --localidad "Mar de Ajó"     solo esa localidad (sin importar tildes ni mayúsculas)
//   ... --categoria heladerias       solo esa categoría (la clave: restaurantes, cafeterias, bares...)
//   ... --limite 50                  como mucho 50 negocios nuevos en esta tanda
//   ... --confirmar                  los crea como borradores (no se publican)
//   ... --descargar                  vuelve a bajar los datos aunque ya estén los de hoy
//   ... --ver-repetidos              lista también los que saltea por estar ya cargados
// La descarga queda en prisma/osm/descargas/ (no va a git) y se reusa en el día.
// No se repite nada: un negocio ya importado se reconoce por su id de OSM (va en la referencia
// de verificación) y uno cargado a mano o de otra fuente, por el nombre (ver importar/cargar.js).
// Los datos son © colaboradores de OpenStreetMap (ODbL): el pie del sitio lo menciona.
import "dotenv/config";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { CONSULTA, lugarDe } from "./importar/osm.js";
import { cargarLugares, correr, leerOpciones } from "./importar/cargar.js";

const opciones = leerOpciones();
const descargar = opciones.args.includes("--descargar");

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

correr(async () => {
  const osm = await datosDeOsm();
  await cargarLugares({ fuente: "OSM", lugares: osm.elements.map((el) => lugarDe(el, hoy)), opciones });
});
