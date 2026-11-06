import { jwtDecode } from 'jwt-decode'
import { useEffect, useState } from 'react'

// La sesión del administrador (por ahora el único que tiene cuenta). Igual que en VPUG:
// el rol sale siempre del token; el usuario guardado es solo para mostrar el nombre.
const leerSesion = () => {
  const token = localStorage.getItem('token')
  if (!token) return null

  try {
    const payload = jwtDecode(token)
    if (payload.exp * 1000 < Date.now()) throw new Error('Sesión expirada')
    const usuario = JSON.parse(localStorage.getItem('usuario') ?? 'null')
    return { id: payload.id, rol: payload.rol, usuario }
  } catch {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    return null
  }
}

// Cuando se entra o se sale, se avisa con este evento para que el header se actualice.
const EVENTO = 'costa:sesion'

export function useSesion() {
  const [sesion, setSesion] = useState(leerSesion)

  useEffect(() => {
    const releer = () => setSesion(leerSesion())
    window.addEventListener(EVENTO, releer)
    return () => window.removeEventListener(EVENTO, releer)
  }, [])

  const iniciar = (token, usuario) => {
    localStorage.setItem('token', token)
    localStorage.setItem('usuario', JSON.stringify(usuario))
    window.dispatchEvent(new Event(EVENTO))
    return leerSesion()
  }

  const cerrar = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    window.dispatchEvent(new Event(EVENTO))
  }

  return { sesion, iniciar, cerrar }
}
