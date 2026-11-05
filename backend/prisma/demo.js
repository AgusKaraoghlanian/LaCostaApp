// Datos de prueba: los 20 negocios ficticios de la demo, publicados, para ver el sitio con
// contenido. Pasan por el mismo camino que una ficha real (crear → aprobar → publicar).
//   node prisma/demo.js crear   (npm run demo)       los carga si no están
//   node prisma/demo.js borrar  (npm run demo:borrar) los borra. Hacerlo antes de abrir la guía.
// Necesita el seed (categorías, localidades y el administrador) ya corrido.
import "dotenv/config";
import { prisma } from "../src/config/prisma.js";
import * as negocioService from "../src/services/negocio.service.js";
import { NEGOCIOS_DEMO } from "./datos-demo.js";

// Así se reconocen los negocios de la demo para borrarlos (ninguna ficha real empieza así).
const MARCA_DEMO = "DEMO: negocio ficticio";

// "Martes a domingo · 12:00 a 15:30 y 19:30 a 23:30" (el horario de todos en la demo).
const HORARIOS_DEMO = [0, 2, 3, 4, 5, 6].flatMap((dia) => [
  { dia, abre: "12:00", cierra: "15:30" },
  { dia, abre: "19:30", cierra: "23:30" },
]);

const crear = async () => {
  if (await prisma.negocio.count({ where: { referenciaVerificacion: { startsWith: MARCA_DEMO } } })) {
    console.log("La demo ya está cargada. Para volver a crearla: npm run demo:borrar y npm run demo");
    return;
  }
  const admin = await prisma.usuario.findFirst({ where: { rol: "ADMINISTRADOR" } });
  if (!admin) {
    console.log("Primero corré npm run seed (crea el administrador, las categorías y las localidades)");
    return;
  }

  for (const negocio of NEGOCIOS_DEMO) {
    const categoria = await prisma.categoria.findUnique({ where: { clave: negocio.categoria } });
    const localidad = await prisma.localidad.findFirst({ where: { nombre: negocio.localidad } });
    const creado = await negocioService.crearNegocio(admin.id, {
      nombre: negocio.nombre,
      categoriaId: categoria.id,
      localidadId: localidad.id,
      estadoComercial: "ACTIVO",
      descripcion: negocio.descripcion,
      direccion: negocio.direccion,
      precio: negocio.precio,
      foto: negocio.foto,
      destacado: negocio.destacado,
      prestaciones: negocio.prestaciones,
      referenciaVerificacion: `${MARCA_DEMO} para probar el sitio.`,
      horarios: HORARIOS_DEMO.map((h) => ({ ...h, alDiaSiguiente: false, vigenteDesde: null, vigenteHasta: null, temporada: "" })),
      horariosEspeciales: [],
      productos: [],
    });
    const aprobado = await negocioService.aprobarRevision(admin.id, creado.id, creado.revisionBorrador);
    await negocioService.publicarNegocio(creado.id, aprobado.revisionBorrador);
  }
  console.log(`Demo: ${NEGOCIOS_DEMO.length} negocios ficticios publicados`);
};

const borrar = async () => {
  const where = { referenciaVerificacion: { startsWith: MARCA_DEMO } };
  // Primero se despublican: la revisión publicada no se puede borrar mientras el negocio la apunte.
  await prisma.negocio.updateMany({ where, data: { revisionPublicadaId: null } });
  const { count } = await prisma.negocio.deleteMany({ where });
  console.log(`Demo: ${count} negocios ficticios borrados`);
};

const acciones = { crear, borrar };
const accion = acciones[process.argv[2]];

if (!accion) {
  console.log("Uso: node prisma/demo.js crear | borrar");
} else {
  try {
    await accion();
  } finally {
    await prisma.$disconnect();
  }
}
