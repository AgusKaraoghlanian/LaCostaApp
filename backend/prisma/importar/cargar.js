// Lo que comparten los importadores (importar-osm.js, importar-overture.js): ubicar cada lugar
// en su localidad, saltear los que ya están en la base, mostrar qué haría y crear los
// borradores (SIN_CONFIRMAR, sin publicar).
//
// Un "lugar" es { idFuente, nombre, lat, lon, categoria, motivo, ficha }:
//   idFuente: texto que va en la referencia de verificación y reconoce al lugar si se vuelve a
//             importar (ej. "OpenStreetMap node/123 ").
//   categoria: la clave (restaurantes, bares...). motivo: por qué se descarta (null = se carga).
//   ficha: direccion, telefono, web, instagram, facebook, prestaciones, referenciaVerificacion.
import { prisma } from "../../src/config/prisma.js";
import * as negocioService from "../../src/services/negocio.service.js";
import { crearNegocioSchema } from "../../src/validators/negocio.validator.js";
import { claveDeTexto } from "../../src/utils/texto.js";
import { km, localidadDe } from "./geografia.js";

// Las opciones de la línea de comandos, iguales para todos los importadores.
export const leerOpciones = (args = process.argv.slice(2)) => {
  const valorDe = (flag) => {
    const i = args.indexOf(flag);
    return i >= 0 ? args[i + 1] : null;
  };
  return {
    confirmar: args.includes("--confirmar"),
    verRepetidos: args.includes("--ver-repetidos"),
    localidad: valorDe("--localidad"),
    categoria: valorDe("--categoria"),
    limite: Number(valorDe("--limite")) || Infinity,
    args,
    valorDe,
  };
};

// "Parrilla El Gaucho" y "El Gaucho" son el mismo: se compara sin las palabras del rubro.
const RUBRO = new RegExp(
  "\\b(" +
    [
      "restaurante?s?", "resto", "restobar", "parrilla", "parrillada", "pizzeria", "pizzas?", "heladeria", "helados",
      "cafeteria", "cafe", "bar", "pub", "cerveceria", "panaderia", "confiteria", "rotiseria", "marisqueria",
      "bodegon", "cantina", "comidas?", "rapidas?", "casa", "la", "el", "los", "las", "de", "del", "y",
    ].join("|") +
    ")\\b",
  "g",
);
const nucleo = (nombre) => claveDeTexto(nombre).replace(/[^a-z0-9 ]/g, " ").replace(RUBRO, " ").replace(/\s+/g, " ").trim();

const mismoNombre = (a, b) => {
  if (claveDeTexto(a) === claveDeTexto(b)) return true;
  const [x, y] = [nucleo(a), nucleo(b)];
  if (x.length < 4 || y.length < 4) return false;
  return x === y || (Math.min(x.length, y.length) >= 6 && (x.includes(y) || y.includes(x)));
};

// Comparten una palabra que no es del rubro ("Puerto Santa Bárbara" y "Santa Bárbara Resto").
const algunaPalabra = (a, b) => {
  const palabras = new Set(nucleo(a).split(" ").filter((p) => p.length >= 4));
  return nucleo(b).split(" ").some((p) => palabras.has(p));
};

// Los importados guardan la ubicación en la referencia ("Ubicación: -36.7, -56.6.").
const ubicacionDe = (referencia) => {
  const m = /Ubicación: (-?\d+(?:\.\d+)?), (-?\d+(?:\.\d+)?)/.exec(referencia || "");
  return m ? [Number(m[1]), Number(m[2])] : null;
};

// Cerca (menos de 120 m) y con alguna palabra en común, o mismo nombre en la localidad.
const esElMismo = (existente, lugar, localidadId) => {
  if (existente.localidadId === localidadId && mismoNombre(existente.nombre, lugar.nombre)) return true;
  const donde = existente.ubicacion;
  return Boolean(donde && km(donde[0], donde[1], lugar.lat, lugar.lon) < 0.12 && algunaPalabra(existente.nombre, lugar.nombre));
};

const contar = (lista, clave) => lista.reduce((acc, x) => ({ ...acc, [clave(x)]: (acc[clave(x)] || 0) + 1 }), {});
const enTexto = (cuenta) => Object.entries(cuenta).map(([k, n]) => `${n} ${k}`).join(", ");

export const cargarLugares = async ({ fuente, lugares, opciones }) => {
  const admin = await prisma.usuario.findFirst({ where: { rol: "ADMINISTRADOR" } });
  if (!admin) throw new Error("No hay ningún administrador: corré primero npm run seed");

  const [localidades, categorias, negocios] = await Promise.all([
    prisma.localidad.findMany(),
    prisma.categoria.findMany(),
    prisma.negocio.findMany({ select: { id: true, nombre: true, localidadId: true, referenciaVerificacion: true } }),
  ]);
  const localidadPorNombre = new Map(localidades.map((l) => [claveDeTexto(l.nombre), l]));
  const categoriaPorClave = new Map(categorias.map((c) => [c.clave, c]));
  const existentes = negocios.map((n) => ({ ...n, ubicacion: ubicacionDe(n.referenciaVerificacion) }));

  const descartes = [];
  const repetidos = [];
  const nuevos = [];
  for (const lugar of lugares) {
    if (lugar.motivo) { descartes.push(lugar.motivo); continue; }
    const nombreLocalidad = localidadDe(lugar.lat, lugar.lon);
    if (!nombreLocalidad) { descartes.push("fuera del Partido"); continue; }
    const localidad = localidadPorNombre.get(claveDeTexto(nombreLocalidad));
    if (!localidad) { descartes.push(`localidad ${nombreLocalidad} no está en la base`); continue; }
    const categoria = categoriaPorClave.get(lugar.categoria);
    if (!categoria) { descartes.push(`categoría ${lugar.categoria} no está en la base`); continue; }

    if (opciones.localidad && !claveDeTexto(localidad.nombre).includes(claveDeTexto(opciones.localidad))) continue;
    if (opciones.categoria && lugar.categoria !== opciones.categoria) continue;

    const igual =
      existentes.find((n) => n.referenciaVerificacion.includes(lugar.idFuente)) ||
      existentes.find((n) => esElMismo(n, lugar, localidad.id)) ||
      nuevos.find((n) => esElMismo(n, lugar, localidad.id));
    if (igual) {
      repetidos.push(`${lugar.nombre} (${localidad.nombre}) = ${igual.id ? `#${igual.id} ` : ""}${igual.nombre}`);
      continue;
    }

    nuevos.push({
      nombre: lugar.nombre.slice(0, 150),
      localidadId: localidad.id,
      localidad: localidad.nombre,
      categoria: lugar.categoria,
      categoriaId: categoria.id,
      ubicacion: [lugar.lat, lugar.lon],
      ficha: lugar.ficha,
    });
  }

  const tanda = nuevos.slice(0, opciones.limite);
  console.log(`${fuente}: ${lugares.length} lugares. Descartados: ${enTexto(contar(descartes, (d) => d)) || "ninguno"}.`);
  console.log(`Ya cargados (o repetidos en ${fuente}): ${repetidos.length}. Nuevos: ${nuevos.length}${tanda.length < nuevos.length ? ` (esta tanda: ${tanda.length})` : ""}.`);
  const porLocalidad = Object.groupBy(tanda, (n) => n.localidad);
  for (const [localidad, lista] of Object.entries(porLocalidad)) {
    console.log(`  ${localidad}: ${enTexto(contar(lista, (n) => n.categoria))}`);
  }

  if (!opciones.confirmar) {
    tanda.forEach((n) => console.log(`  · ${n.nombre} — ${n.categoria}, ${n.localidad}${n.ficha.direccion ? `, ${n.ficha.direccion}` : ""}`));
    if (opciones.verRepetidos && repetidos.length) {
      console.log("Salteados por estar ya cargados:");
      repetidos.forEach((r) => console.log(`  = ${r}`));
    }
    console.log(`Nada cambió.${repetidos.length && !opciones.verRepetidos ? " Para ver los salteados: --ver-repetidos." : ""} Para crearlos como borradores: agregá --confirmar`);
    return;
  }

  let creados = 0;
  const fallidos = [];
  for (const n of tanda) {
    const datos = {
      ...n.ficha,
      nombre: n.nombre,
      localidadId: n.localidadId,
      categoriaId: n.categoriaId,
      estadoComercial: "SIN_CONFIRMAR",
      direccion: (n.ficha.direccion || "").slice(0, 250),
      telefono: (n.ficha.telefono || "").slice(0, 80),
      referenciaVerificacion: `${n.ficha.referenciaVerificacion} Ubicación: ${n.ubicacion[0]}, ${n.ubicacion[1]}.`.slice(0, 1500),
    };
    let validado = crearNegocioSchema.validate(datos);
    // Un link mal cargado en la fuente no frena la ficha: se saca y se prueba de nuevo.
    if (validado.error) validado = crearNegocioSchema.validate({ ...datos, web: "", instagram: "", facebook: "" });
    if (validado.error) { fallidos.push(`${n.nombre}: ${validado.error.message}`); continue; }
    try {
      const negocio = await negocioService.crearNegocio(admin.id, validado.value);
      console.log(`  ✓ #${negocio.id} ${n.nombre} — ${n.categoria}, ${n.localidad}`);
      creados++;
    } catch (error) {
      fallidos.push(`${n.nombre}: ${error.message}`);
    }
  }
  console.log(`Creados como borradores: ${creados}. Con error: ${fallidos.length}.`);
  fallidos.forEach((f) => console.log(`  ✗ ${f}`));
  console.log("Están en el admin sin publicar. Completalos (foto, horarios) y publicalos desde ahí.");
};

export const correr = (tarea) =>
  tarea()
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
