import { prisma } from "../config/prisma.js";

// En el orden en que se cargaron (la portada las muestra así).
export const listarCategorias = async () => {
    return await prisma.categoria.findMany({ orderBy: { id: "asc" } });
}

export const obtenerCategoriaPorId = async (id) => {
    return await prisma.categoria.findUnique({ where: { id } });
}

// clave es la de la URL (ej. "parrillas")
export const obtenerCategoriaPorClave = async (clave) => {
    return await prisma.categoria.findUnique({ where: { clave } });
}

export const crearCategoria = async (datos) => {
    return await prisma.categoria.create({ data: datos });
}
