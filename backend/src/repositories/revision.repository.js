import { prisma } from "../config/prisma.js";

export const crearRevision = async (datos, db = prisma) => {
    return await db.revisionNegocio.create({ data: datos });
}

// La última aprobada de un negocio (o null si nunca se aprobó).
export const obtenerUltimaRevision = async (negocioId, db = prisma) => {
    return await db.revisionNegocio.findFirst({ where: { negocioId }, orderBy: { numero: "desc" } });
}

export const obtenerRevisionPorId = async (id) => {
    return await prisma.revisionNegocio.findUnique({ where: { id } });
}

// Las revisiones que están en el sitio, con filtros. busqueda: lo buscado sin tildes (lo arma
// el service). prestaciones: tiene que tener todas.
export const buscarPublicadas = async ({ categoriaId, localidadId, precio, prestaciones, busqueda, saltear, cantidad }) => {
    const where = {
        publicadaEn: { isNot: null },
        ...(categoriaId ? { categoriaId } : {}),
        ...(localidadId ? { localidadId } : {}),
        ...(precio ? { precio } : {}),
        ...(prestaciones?.length ? { prestaciones: { hasEvery: prestaciones } } : {}),
        ...(busqueda ? { busqueda: { contains: busqueda } } : {}),
    };
    const [revisiones, total] = await Promise.all([
        prisma.revisionNegocio.findMany({
            where,
            // El id desempata dos con el mismo nombre: así ninguno se repite o se saltea entre páginas.
            orderBy: [{ nombre: "asc" }, { id: "asc" }],
            skip: saltear,
            take: cantidad,
            include: { negocio: { select: { slug: true } } },
        }),
        prisma.revisionNegocio.count({ where }),
    ]);
    return { revisiones, total };
}

// La revisión publicada del negocio con ese slug (o null si no existe o no está publicado).
export const obtenerPublicadaPorSlug = async (slug) => {
    const negocio = await prisma.negocio.findUnique({
        where: { slug },
        select: { slug: true, revisionPublicada: true },
    });
    return negocio?.revisionPublicada ? { ...negocio.revisionPublicada, negocio: { slug: negocio.slug } } : null;
}
