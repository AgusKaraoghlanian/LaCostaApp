import { prisma } from "../config/prisma.js";

// Todo lo que muestra la ficha del admin: dónde queda, la categoría, los horarios, la carta
// (en su orden) y el historial de revisiones aprobadas.
const conFicha = {
    localidad: { include: { partido: { include: { provincia: true } } } },
    categoria: true,
    horarios: { orderBy: [{ dia: "asc" }, { abre: "asc" }] },
    horariosEspeciales: { orderBy: { fecha: "asc" } },
    productos: { orderBy: { orden: "asc" } },
    revisiones: { orderBy: { numero: "desc" }, select: { id: true, numero: true, aprobadaEn: true, aprobadaPor: { select: { nombre: true } } } },
};

export const obtenerNegocioPorId = async (id, db = prisma) => {
    return await db.negocio.findUnique({ where: { id }, include: conFicha });
}

export const existeSlug = async (slug) => {
    return (await prisma.negocio.count({ where: { slug } })) > 0;
}

// Listado del admin: todos (publicados o no), los editados últimos primero.
// nombreClave es el texto buscado sin tildes ni mayúsculas (lo arma el service).
export const buscarNegocios = async ({ nombreClave, saltear, cantidad }) => {
    const where = nombreClave ? { nombreClave: { contains: nombreClave } } : {};
    const [negocios, total] = await Promise.all([
        prisma.negocio.findMany({
            where,
            orderBy: { actualizadoEn: "desc" },
            skip: saltear,
            take: cantidad,
            include: { localidad: true, categoria: true },
        }),
        prisma.negocio.count({ where }),
    ]);
    return { negocios, total };
}

// Los horarios y la carta se guardan aparte (ver guardarHorariosYCarta).
export const crearNegocio = async (datos, db = prisma) => {
    return await db.negocio.create({ data: datos });
}

// Guarda el borrador solo si nadie lo cambió desde que se abrió (revisionEsperada) y sube la
// revisión. Devuelve false si otra persona guardó antes.
export const actualizarBorrador = async (id, revisionEsperada, datos, db = prisma) => {
    const { count } = await db.negocio.updateMany({
        where: { id, revisionBorrador: revisionEsperada },
        data: { ...datos, revisionBorrador: { increment: 1 } },
    });
    return count === 1;
}

// Reemplaza los horarios, los días especiales y la carta del borrador por los que vienen.
export const guardarHorariosYCarta = async (negocioId, { horarios, horariosEspeciales, productos }, db = prisma) => {
    await db.horario.deleteMany({ where: { negocioId } });
    await db.horarioEspecial.deleteMany({ where: { negocioId } });
    await db.productoCarta.deleteMany({ where: { negocioId } });
    await db.horario.createMany({ data: horarios.map((h) => ({ ...h, negocioId })) });
    await db.horarioEspecial.createMany({ data: horariosEspeciales.map((h) => ({ ...h, negocioId })) });
    await db.productoCarta.createMany({ data: productos.map((p, orden) => ({ ...p, orden, negocioId })) });
}

// Cambia la revisión que está en el sitio (null = lo saca), si el borrador sigue siendo el
// que se tenía. Devuelve false si otra persona lo cambió antes.
export const cambiarRevisionPublicada = async (id, revisionEsperada, revisionPublicadaId, db = prisma) => {
    const { count } = await db.negocio.updateMany({
        where: { id, revisionBorrador: revisionEsperada },
        data: { revisionPublicadaId },
    });
    return count === 1;
}
