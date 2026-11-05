// Datos iniciales (npm run seed): la provincia, el Partido de La Costa con sus localidades,
// las categorías y el primer administrador (ADMIN_EMAIL, ADMIN_PASSWORD y ADMIN_NOMBRE del
// .env; si no están, saltea ese paso). Se puede correr varias veces: lo que ya existe no se cambia.
import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/config/prisma.js";
import { CATEGORIAS, LOCALIDADES, PARTIDO, PROVINCIA } from "./datos-iniciales.js";

const cargarGeografia = async () => {
  const provincia = await prisma.provincia.upsert({
    where: { nombre: PROVINCIA },
    update: {},
    create: { nombre: PROVINCIA },
  });
  const partido = await prisma.partido.upsert({
    where: { provinciaId_nombre: { provinciaId: provincia.id, nombre: PARTIDO } },
    update: {},
    create: { provinciaId: provincia.id, nombre: PARTIDO },
  });
  for (const nombre of LOCALIDADES) {
    await prisma.localidad.upsert({
      where: { partidoId_nombre: { partidoId: partido.id, nombre } },
      update: {},
      create: { partidoId: partido.id, nombre },
    });
  }
  console.log(`Geografía: ${PROVINCIA} → ${PARTIDO} → ${LOCALIDADES.length} localidades`);
};

const cargarCategorias = async () => {
  for (const categoria of CATEGORIAS) {
    await prisma.categoria.upsert({ where: { clave: categoria.clave }, update: {}, create: categoria });
  }
  console.log(`Categorías: ${CATEGORIAS.length}`);
};

const cargarAdministrador = async () => {
  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NOMBRE } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_NOMBRE) {
    console.log("Administrador: falta ADMIN_EMAIL, ADMIN_PASSWORD o ADMIN_NOMBRE en el .env, no se crea");
    return;
  }
  if (ADMIN_PASSWORD.length < 8) {
    console.log("Administrador: ADMIN_PASSWORD tiene que tener al menos 8 caracteres, no se crea");
    return;
  }
  if (await prisma.usuario.findUnique({ where: { email: ADMIN_EMAIL } })) {
    console.log(`Administrador: ${ADMIN_EMAIL} ya existe`);
    return;
  }
  await prisma.usuario.create({
    data: { email: ADMIN_EMAIL, nombre: ADMIN_NOMBRE, password: await bcrypt.hash(ADMIN_PASSWORD, 10) },
  });
  console.log(`Administrador: ${ADMIN_EMAIL} creado`);
};

try {
  await cargarGeografia();
  await cargarCategorias();
  await cargarAdministrador();
} finally {
  await prisma.$disconnect();
}
