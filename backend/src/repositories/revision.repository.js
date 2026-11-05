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

// Cómo se ordena el listado público. El id al final desempata dos iguales: así ninguno se
// repite o se saltea entre páginas.
const ORDENES = {
    recomendados: [{ destacado: "desc" }, { nombre: "asc" }, { id: "asc" }],
    precio: [{ precio: { sort: "asc", nulls: "last" } }, { nombre: "asc" }, { id: "asc" }],
    nombre: [{ nombre: "asc" }, { id: "asc" }],
};

// Las revisiones que están en el sitio, con filtros. busqueda: lo buscado sin tildes (lo arma
// el service). prestaciones: tiene que tener todas.
export const buscarPublicadas = async ({ categoriaId, localidadId, precio, prestaciones, destacado, busqueda, orden = "recomendados", saltear, cantidad }) => {
    const where = {
        publicadaEn: { isNot: null },
        ...(categoriaId ? { categoriaId } : {}),
        ...(localidadId ? { localidadId } : {}),
        ...(precio ? { precio } : {}),
        ...(destacado !== undefined ? { destacado } : {}),
        ...(prestaciones?.length ? { prestaciones: { hasEvery: prestaciones } } : {}),
        ...(busqueda ? { busqueda: { contains: busqueda } } : {}),
    };
    const [revisiones, total] = await Promise.all([
        prisma.revisionNegocio.findMany({
            where,
            orderBy: ORDENES[orden],
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

// Cuántos negocios publicados tiene cada categoría: Map categoriaId → cantidad.
export const contarPublicadasPorCategoria = async () => {
    const grupos = await prisma.revisionNegocio.groupBy({
        by: ["categoriaId"],
        where: { publicadaEn: { isNot: null } },
        _count: { _all: true },
    });
    return new Map(grupos.map((g) => [g.categoriaId, g._count._all]));
}
