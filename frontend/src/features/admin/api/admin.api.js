import { apiFetch } from '../../../config/http.js'

// Todo lo del panel pide el token del administrador.
const conToken = (path, opciones = {}) => apiFetch(path, { ...opciones, auth: true })

// Las fichas, con su borrador (no solo las publicadas). Devuelve { negocios, total, pagina, porPagina }.
export const listarNegocios = ({ texto, pagina }) => conToken('/admin/negocios', { query: { texto, pagina } })

export const obtenerNegocio = (id) => conToken(`/admin/negocios/${id}`)

export const crearNegocio = (datos) => conToken('/admin/negocios', { method: 'POST', body: datos })

// revisionEsperada: la del borrador que se abrió. Si alguien guardó antes, el backend responde 409.
export const editarNegocio = (id, datos, revisionEsperada) =>
  conToken(`/admin/negocios/${id}`, { method: 'PUT', body: { ...datos, revisionEsperada } })

// Guarda una foto fija del borrador como revisión aprobada (todavía no se publica).
export const aprobarRevision = (id, revisionEsperada) =>
  conToken(`/admin/negocios/${id}/revisiones`, { method: 'POST', body: { revisionEsperada } })

// Pone en el sitio la última revisión aprobada.
export const publicarNegocio = (id, revisionEsperada) =>
  conToken(`/admin/negocios/${id}/publicar`, { method: 'POST', body: { revisionEsperada } })

export const retirarNegocio = (id, revisionEsperada) =>
  conToken(`/admin/negocios/${id}/retirar`, { method: 'POST', body: { revisionEsperada } })

// Copia una revisión del historial al borrador.
export const restaurarRevision = (id, revisionId, revisionEsperada) =>
  conToken(`/admin/negocios/${id}/restaurar`, { method: 'POST', body: { revisionId, revisionEsperada } })

export const crearCategoria = ({ nombre, descripcion }) =>
  conToken('/admin/categorias', { method: 'POST', body: { nombre, descripcion } })

export const crearProvincia = ({ nombre }) => conToken('/admin/provincias', { method: 'POST', body: { nombre } })

export const crearPartido = ({ nombre, provinciaId }) =>
  conToken('/admin/partidos', { method: 'POST', body: { nombre, provinciaId } })

export const crearLocalidad = ({ nombre, partidoId }) =>
  conToken('/admin/localidades', { method: 'POST', body: { nombre, partidoId } })
