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

// Cómo se ordena el listado público. recomendados: los destacados primero y después en el orden
// en que se cargaron (como la demo). El último criterio no se repite entre dos negocios: así
// ninguno aparece dos veces o se saltea entre páginas.
const ORDENES = {
    recomendados: [{ destacado: "desc" }, { negocioId: "asc" }],
    precio: [{ precio: { sort: "asc", nulls: "last" } }, { nombre: "asc" }, { id: "asc" }],
    nombre: [{ nombre: "asc" }, { id: "asc" }],
};

// Lo buscado (ya interpretado por utils/busqueda.js) como condiciones que se tienen que cumplir
// todas: cada palabra suelta en el texto del negocio (nombre, descripción, localidad y
// categoría), alguna de las categorías nombradas (o esas palabras en el texto) y alguna de las
// localidades nombradas.
const condicionesDeBusqueda = (busqueda) => {
    if (!busqueda) return [];
    return [
        ...busqueda.palabras.map((palabra) => ({ busqueda: { contains: palabra } })),
        ...(busqueda.categoriaIds.length
            ? [{ OR: [
                { categoriaId: { in: busqueda.categoriaIds } },
                ...busqueda.palabrasDeCategoria.map((palabra) => ({ busqueda: { contains: palabra } })),
            ] }]
            : []),
        ...(busqueda.localidadIds.length ? [{ localidadId: { in: busqueda.localidadIds } }] : []),
    ];
}

// Las revisiones que están en el sitio, con filtros. busqueda: lo buscado ya interpretado (lo
// arma el service). prestaciones: tiene que tener todas.
export const buscarPublicadas = async ({ categoriaId, localidadId, precio, prestaciones, destacado, busqueda, orden = "recomendados", saltear, cantidad }) => {
    const condiciones = condicionesDeBusqueda(busqueda);
    const where = {
        publicadaEn: { isNot: null },
        ...(categoriaId ? { categoriaId } : {}),
        ...(localidadId ? { localidadId } : {}),
        ...(precio ? { precio } : {}),
        ...(destacado !== undefined ? { destacado } : {}),
        ...(prestaciones?.length ? { prestaciones: { hasEvery: prestaciones } } : {}),
        ...(condiciones.length ? { AND: condiciones } : {}),
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
