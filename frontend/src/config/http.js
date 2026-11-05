import { BASE_URL } from './api.js'

// Cliente HTTP centralizado (igual que en VPUG): arma headers, adjunta el token si existe,
// devuelve los errores del backend con su mensaje y limpia la sesión en un 401.
// query: los filtros de la URL ({ texto: 'café', prestacion: ['Reservas'] }). Los vacíos no se mandan.
export const apiFetch = async (path, { method = 'GET', body, query, auth = false } = {}) => {
  const headers = { 'Content-Type': 'application/json' }

  if (auth) {
    const token = localStorage.getItem('token')
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}${armarQuery(query)}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401 && auth) {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
  }

  // 204 (sin contenido) o una respuesta que no es JSON: data queda en null.
  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const message = data?.message || 'Ocurrió un error inesperado. Probá de nuevo.'
    // status: para distinguir, por ejemplo, un 404 (no existe) de un 409 (alguien más lo cambió).
    throw Object.assign(new Error(message), { status: res.status })
  }

  return data
}

// { texto: 'café', prestacion: ['A', 'B'], precio: '' } → "?texto=caf%C3%A9&prestacion=A&prestacion=B"
const armarQuery = (query) => {
  if (!query) return ''
  const params = new URLSearchParams()
  for (const [clave, valor] of Object.entries(query)) {
    for (const v of [valor].flat()) {
      if (v !== undefined && v !== null && v !== '') params.append(clave, v)
    }
  }
  return params.size ? `?${params}` : ''
}
