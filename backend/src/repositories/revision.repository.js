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
    // Los favoritos se separan aparte (ver buscarPublicadas); cada grupo va por nombre.
    favoritos: [{ nombre: "asc" }, { id: "asc" }],
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
export const buscarPublicadas = async ({ categoriaId, localidadId, precio, prestaciones, destacado, plan, busqueda, orden = "recomendados", favoritos, saltear, cantidad }) => {
    const condiciones = condicionesDeBusqueda(busqueda);
    const where = {
        publicadaEn: { isNot: null },
        ...(categoriaId ? { categoriaId } : {}),
        ...(localidadId ? { localidadId } : {}),
        ...(precio ? { precio } : {}),
        ...(destacado !== undefined ? { destacado } : {}),
        ...(plan ? { plan } : {}),
        ...(prestaciones?.length ? { prestaciones: { hasEvery: prestaciones } } : {}),
        ...(condiciones.length ? { AND: condiciones } : {}),
    };
    if (orden === "favoritos" && favoritos?.length) {
        return buscarConFavoritosPrimero({ where, favoritos, saltear, cantidad });
    }
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

// orden=favoritos: primero los guardados (por nombre) y después el resto (por nombre). Se
// paginan como una sola lista: la página puede empezar en los guardados y seguir en el resto.
const buscarConFavoritosPrimero = async ({ where, favoritos, saltear, cantidad }) => {
    const deFavoritos = { negocio: { slug: { in: favoritos } } };
    const whereFavoritos = { AND: [where, deFavoritos] };
    const whereResto = { AND: [where, { NOT: deFavoritos }] };
    const consulta = (w, skip, take) =>
        take > 0
            ? prisma.revisionNegocio.findMany({
                where: w,
                orderBy: ORDENES.favoritos,
                skip,
                take,
                include: { negocio: { select: { slug: true } } },
            })
            : [];

    const [cantidadFavoritos, cantidadResto] = await Promise.all([
        prisma.revisionNegocio.count({ where: whereFavoritos }),
        prisma.revisionNegocio.count({ where: whereResto }),
    ]);
    const desdeFavoritos = Math.min(saltear, cantidadFavoritos);
    const tomarFavoritos = Math.min(cantidad, cantidadFavoritos - desdeFavoritos);
    const [primeros, resto] = await Promise.all([
        consulta(whereFavoritos, desdeFavoritos, tomarFavoritos),
        consulta(whereResto, Math.max(0, saltear - cantidadFavoritos), cantidad - tomarFavoritos),
    ]);
    return { revisiones: [...primeros, ...resto], total: cantidadFavoritos + cantidadResto };
};

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
