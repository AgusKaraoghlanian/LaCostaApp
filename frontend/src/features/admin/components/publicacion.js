// "Publicación vigente", "Revisión aprobada sin publicar" o "Sin publicar", según el negocio.
export const estadoDePublicacion = (negocio) => {
  if (!negocio.revisionPublicadaId) return 'Sin publicar'
  return negocio.revisiones[0]?.id === negocio.revisionPublicadaId ? 'Publicación vigente' : 'Revisión aprobada sin publicar'
}
