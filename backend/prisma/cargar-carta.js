// Carga la carta de un negocio desde un archivo de prisma/cartas/ (transcripta de fotos de la
// carta: Google Maps, Instagram, la web del local). Reemplaza los productos del borrador.
//   node --env-file=.env.production.local prisma/cargar-carta.js                     muestra qué haría (todas)
//   node --env-file=.env.production.local prisma/cargar-carta.js carlo-bar-de-pasta  solo esa
//   ... --confirmar   los guarda en el borrador como PROPUESTOS (se revisan en el admin)
//   ... --confirmar --publicar   los guarda APROBADOS, aprueba la revisión y la publica
// Si el negocio ya tiene carta, no la toca salvo que se agregue --reemplazar.
// Ojo: --publicar publica todo el borrador del negocio, no solo la carta.
import "dotenv/config";
import { readdir, readFile } from "node:fs/promises";
import { prisma } from "../src/config/prisma.js";
import { enTransaccion } from "../src/repositories/transaccion.repository.js";
import * as negocioService from "../src/services/negocio.service.js";
import { NegocioSinCambios } from "../src/errors/negocio/NegocioSinCambios.js";
import { claveDeTexto } from "../src/utils/texto.js";

const args = process.argv.slice(2);
const confirmar = args.includes("--confirmar");
const publicar = args.includes("--publicar");
const reemplazar = args.includes("--reemplazar");
const elegidos = args.filter((a) => !a.startsWith("--"));
const carpeta = new URL("./cartas/", import.meta.url);

// 18000 → "$ 18.000"
const pesos = (n) => `$ ${n.toLocaleString("es-AR")}`;

const aProducto = (p, estado) => ({
  carta: p.carta || "Carta",
  seccion: p.seccion || "Carta",
  nombre: p.nombre,
  descripcion: p.descripcion || "",
  variante: p.variante || "Base",
  precioCentavos: p.precio == null ? null : Math.round(p.precio * 100),
  moneda: p.precio == null ? null : "ARS",
  // Queda a la vista en el admin de cuándo es el precio (la foto puede ser vieja).
  precioTexto: p.precio == null ? "" : `${pesos(p.precio)} (carta ${p.foto})`,
  canal: "SIN_ESPECIFICAR",
  estado,
});

const buscarNegocio = async ({ negocio, localidad }) => {
  const candidatos = await prisma.negocio.findMany({
    where: { nombreClave: claveDeTexto(negocio) },
    include: { localidad: true, _count: { select: { productos: true } } },
  });
  return candidatos.filter((n) => claveDeTexto(n.localidad.nombre).includes(claveDeTexto(localidad)));
};

const cargar = async (adminId, archivo) => {
  const datos = JSON.parse(await readFile(new URL(archivo, carpeta), "utf8"));
  const encontrados = await buscarNegocio(datos);
  const titulo = `${datos.negocio} (${datos.localidad}), ${datos.productos.length} productos`;
  if (encontrados.length !== 1) {
    console.log(`✗ ${titulo}: ${encontrados.length === 0 ? "no está en la base" : "hay más de uno con ese nombre"}`);
    return;
  }
  const negocio = encontrados[0];
  const yaTiene = negocio._count.productos;
  if (yaTiene > 0 && !reemplazar) {
    console.log(`✗ #${negocio.id} ${titulo}: ya tiene ${yaTiene} productos (agregá --reemplazar)`);
    return;
  }
  console.log(`${confirmar ? "✓" : "·"} #${negocio.id} ${titulo}${yaTiene ? ` (reemplaza ${yaTiene})` : ""}`);
  if (!confirmar) return;

  const estado = publicar ? "APROBADO" : "PROPUESTO";
  const productos = datos.productos.map((p) => aProducto(p, estado));
  await enTransaccion(async (tx) => {
    const { count } = await tx.negocio.updateMany({
      where: { id: negocio.id, revisionBorrador: negocio.revisionBorrador },
      data: { editadoPorId: adminId, revisionBorrador: { increment: 1 } },
    });
    if (count !== 1) throw new Error("Alguien editó el negocio recién: volvé a correrlo");
    await tx.productoCarta.deleteMany({ where: { negocioId: negocio.id } });
    await tx.productoCarta.createMany({ data: productos.map((p, orden) => ({ ...p, orden, negocioId: negocio.id })) });
  });

  if (publicar) {
    const revision = negocio.revisionBorrador + 1;
    try {
      await negocioService.aprobarRevision(adminId, negocio.id, revision);
    } catch (error) {
      if (!(error instanceof NegocioSinCambios)) throw error;
    }
    await negocioService.publicarNegocio(negocio.id, revision);
    console.log("  publicado en el sitio");
  }
};

const main = async () => {
  const admin = await prisma.usuario.findFirst({ where: { rol: "ADMINISTRADOR" } });
  if (!admin) throw new Error("No hay ningún administrador: corré primero npm run seed");
  const archivos = (await readdir(carpeta))
    .filter((a) => a.endsWith(".json"))
    .filter((a) => elegidos.length === 0 || elegidos.some((e) => a.startsWith(e)));
  for (const archivo of archivos) await cargar(admin.id, archivo);
  if (!confirmar) console.log("Nada cambió. Para cargarlas: agregá --confirmar (y --publicar para que se vean)");
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
