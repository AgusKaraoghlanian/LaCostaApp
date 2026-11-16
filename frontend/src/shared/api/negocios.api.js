import { apiFetch } from '../../config/http.js'

// Lo público: solo los negocios publicados.

// filtros: categoria (clave), localidadId, precio, prestacion (lista), destacado, plan (CARRUSEL,
// LISTA o SABORES), orden, texto, pagina.
// Devuelve { negocios, total, pagina, porPagina }.
export const buscarNegocios = (filtros) => apiFetch('/negocios', { query: filtros })

export const obtenerNegocio = (slug) => apiFetch(`/negocios/${slug}`)
