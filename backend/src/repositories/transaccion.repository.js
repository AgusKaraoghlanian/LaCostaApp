import { prisma } from "../config/prisma.js";

// Corre varias operaciones como una sola: se guardan todas o ninguna. `operaciones` recibe
// `tx`, que se le pasa a las funciones de los repositories (su último parámetro, `db`).
// Serializable: si dos cambios chocan (ej. dos altas que pasarían el cupo), uno falla con
// P2034 y el error middleware responde "probá de nuevo", en vez de dejar datos inválidos.
export const enTransaccion = async (operaciones) => {
    return await prisma.$transaction(operaciones, { isolationLevel: "Serializable" });
}
