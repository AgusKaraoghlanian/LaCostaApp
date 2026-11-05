import { prisma } from "../config/prisma.js";

export const obtenerUsuarioPorEmail = async (email) => {
    return await prisma.usuario.findUnique({ where: { email } });
}

// La usa el seed para crear el primer administrador.
export const crearUsuario = async (datos) => {
    return await prisma.usuario.create({ data: datos });
}
