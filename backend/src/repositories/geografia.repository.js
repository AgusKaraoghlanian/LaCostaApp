import { prisma } from "../config/prisma.js";

// Todas las provincias con sus partidos y las localidades de cada uno. Las localidades van en
// el orden en que se cargaron: el seed las carga de norte a sur, como las muestra la portada.
export const obtenerGeografia = async () => {
    return await prisma.provincia.findMany({
        orderBy: { nombre: "asc" },
        include: {
            partidos: {
                orderBy: { nombre: "asc" },
                include: { localidades: { orderBy: { id: "asc" } } }
            }
        }
    });
}

export const obtenerProvinciaPorId = async (id) => {
    return await prisma.provincia.findUnique({ where: { id } });
}

export const obtenerPartidoPorId = async (id) => {
    return await prisma.partido.findUnique({ where: { id } });
}

// Todas las localidades (solo id y nombre): la búsqueda las usa para entender "pizza en san clemente".
export const listarLocalidades = async () => {
    return await prisma.localidad.findMany({ select: { id: true, nombre: true }, orderBy: { id: "asc" } });
}

// Con su partido y provincia: la ficha los muestra ("Mar de Ajó, Partido de La Costa").
export const obtenerLocalidadPorId = async (id) => {
    return await prisma.localidad.findUnique({ where: { id }, include: { partido: { include: { provincia: true } } } });
}

export const crearProvincia = async (nombre) => {
    return await prisma.provincia.create({ data: { nombre } });
}

export const crearPartido = async (provinciaId, nombre) => {
    return await prisma.partido.create({ data: { provinciaId, nombre } });
}

export const crearLocalidad = async (partidoId, nombre) => {
    return await prisma.localidad.create({ data: { partidoId, nombre } });
}
