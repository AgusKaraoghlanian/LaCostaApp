import { prisma } from "../config/prisma.js";

export const crearSolicitud = async (datos) => {
    return await prisma.solicitudNegocio.create({ data: datos });
}

export const marcarCorreoEnviado = async (id) => {
    return await prisma.solicitudNegocio.update({ where: { id }, data: { correoEnviado: true } });
}

// Las más nuevas primero. Devuelve { solicitudes, total }.
export const listarSolicitudes = async ({ saltear, cantidad }) => {
    const [solicitudes, total] = await prisma.$transaction([
        prisma.solicitudNegocio.findMany({ orderBy: { creadaEn: "desc" }, skip: saltear, take: cantidad }),
        prisma.solicitudNegocio.count(),
    ]);
    return { solicitudes, total };
}

export const contarPendientes = async () => {
    return await prisma.solicitudNegocio.count({ where: { atendida: false } });
}

export const obtenerSolicitudPorId = async (id) => {
    return await prisma.solicitudNegocio.findUnique({ where: { id } });
}

export const editarSolicitud = async (id, datos) => {
    return await prisma.solicitudNegocio.update({ where: { id }, data: datos });
}
