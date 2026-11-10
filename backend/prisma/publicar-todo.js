// Publica de una vez todos los negocios que no están en el sitio (o que tienen cambios sin
// publicar), por el mismo camino que el admin: aprobar la revisión → publicarla.
//   node --env-file=.env.production.local prisma/publicar-todo.js             muestra qué haría
//   node --env-file=.env.production.local prisma/publicar-todo.js --confirmar lo hace
// Se publican "así como están", aunque tengan la actividad sin confirmar.
import "dotenv/config";
import { prisma } from "../src/config/prisma.js";
import * as negocioService from "../src/services/negocio.service.js";
import { NegocioSinCambios } from "../src/errors/negocio/NegocioSinCambios.js";

const confirmar = process.argv.includes("--confirmar");

// Aprueba el borrador (si ya estaba aprobado tal cual, sigue) y publica la última revisión.
const publicar = async (adminId, negocio) => {
  try {
    await negocioService.aprobarRevision(adminId, negocio.id, negocio.revisionBorrador);
  } catch (error) {
    // NegocioSinCambios: la última revisión ya es igual al borrador, se publica esa.
    if (!(error instanceof NegocioSinCambios)) throw error;
  }
  await negocioService.publicarNegocio(negocio.id, negocio.revisionBorrador);
};

const main = async () => {
  const admin = await prisma.usuario.findFirst({ where: { rol: "ADMINISTRADOR" } });
  if (!admin) throw new Error("No hay ningún administrador: corré primero npm run seed");

  const negocios = await prisma.negocio.findMany({
    select: { id: true, nombre: true, revisionBorrador: true, revisionPublicadaId: true },
    orderBy: { id: "asc" },
  });

  // Los que no están publicados, o cuya revisión publicada no es la última.
  const pendientes = [];
  for (const negocio of negocios) {
    const ultima = await prisma.revisionNegocio.findFirst({
      where: { negocioId: negocio.id },
      orderBy: { numero: "desc" },
      select: { id: true },
    });
    if (negocio.revisionPublicadaId === null || negocio.revisionPublicadaId !== ultima?.id) {
      pendientes.push(negocio);
    }
  }

  console.log(`${negocios.length} negocios en total, ${pendientes.length} para publicar.`);
  if (!confirmar) {
    pendientes.forEach((n) => console.log(`  #${n.id} ${n.nombre}`));
    console.log("Nada cambió. Para publicarlos: agregá --confirmar");
    return;
  }

  let publicados = 0;
  const fallidos = [];
  for (const negocio of pendientes) {
    try {
      await publicar(admin.id, negocio);
      publicados++;
    } catch (error) {
      fallidos.push(`#${negocio.id} ${negocio.nombre}: ${error.message}`);
    }
  }
  console.log(`Publicados: ${publicados}. Con error: ${fallidos.length}.`);
  fallidos.forEach((f) => console.log(`  ${f}`));
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
