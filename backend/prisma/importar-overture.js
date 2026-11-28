// Carga como borradores (SIN_CONFIRMAR, sin publicar) los locales gastronómicos y boliches de
// Overture Maps (datos abiertos de Meta, Microsoft y Foursquare), salteando los que ya están en
// la base (a mano, de OpenStreetMap o de una corrida anterior). No necesita internet: lee
// prisma/overture/lugares-*.json, que se arma con prisma/overture/bajar.py.
//   node --env-file=.env.production.local prisma/importar-overture.js                 muestra qué haría (todos)
//   ... --localidad "Mar de Ajó"     solo esa localidad (sin importar tildes ni mayúsculas)
//   ... --categoria bares            solo esa categoría (la clave: restaurantes, cafeterias, bares...)
//   ... --limite 50                  como mucho 50 negocios nuevos en esta tanda
//   ... --confianza 0.7              solo los que Overture da como más seguros (de 0 a 1; por defecto 0.5)
//   ... --ver-repetidos              lista también los que saltea por estar ya cargados
//   ... --confirmar                  los crea como borradores (no se publican)
// Conviene correr antes prisma/importar-osm.js: así lo que ya vino de OpenStreetMap no se repite.
import "dotenv/config";
import { readdir, readFile } from "node:fs/promises";
import { CONFIANZA_MINIMA, lugarDe } from "./importar/overture.js";
import { cargarLugares, correr, leerOpciones } from "./importar/cargar.js";

const opciones = leerOpciones();
const confianzaMinima = Number(opciones.valorDe("--confianza")) || CONFIANZA_MINIMA;
const carpeta = new URL("./overture/", import.meta.url);

correr(async () => {
  // El más nuevo de overture/lugares-AAAA-MM-DD.json.
  const archivos = (await readdir(carpeta)).filter((a) => /^lugares-.*\.json$/.test(a)).sort();
  if (!archivos.length) throw new Error("No hay datos de Overture: corré python prisma/overture/bajar.py");
  const { version, lugares } = JSON.parse(await readFile(new URL(archivos.at(-1), carpeta), "utf8"));
  const fecha = new Date().toISOString().slice(0, 10);
  console.log(`Overture Maps ${version} (${archivos.at(-1)}).`);
  await cargarLugares({
    fuente: "Overture",
    lugares: lugares.map((l) => lugarDe(l, { version, fecha, confianzaMinima })),
    opciones,
  });
});
