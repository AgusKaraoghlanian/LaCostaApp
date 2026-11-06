import { useEffect, useState } from 'react'

// Los lugares guardados (el corazón), por slug. Se guardan solo en este navegador, como en
// la demo. Si el navegador no deja guardar (modo privado), funcionan igual hasta recargar.
const CLAVE = 'costa-favoritos-v2'
const EVENTO = 'costa:favoritos'

const leer = () => {
  try {
    const guardados = JSON.parse(localStorage.getItem(CLAVE) ?? '[]')
    return Array.isArray(guardados) ? guardados.filter((slug) => typeof slug === 'string') : []
  } catch {
    return []
  }
}

let enMemoria = leer()

export const useFavoritos = () => {
  const [favoritos, setFavoritos] = useState(enMemoria)

  // Todas las tarjetas de la pantalla se enteran cuando cambia uno.
  useEffect(() => {
    const releer = () => setFavoritos(enMemoria)
    window.addEventListener(EVENTO, releer)
    return () => window.removeEventListener(EVENTO, releer)
  }, [])

  const alternar = (slug) => {
    enMemoria = enMemoria.includes(slug) ? enMemoria.filter((s) => s !== slug) : [...enMemoria, slug]
    try {
      localStorage.setItem(CLAVE, JSON.stringify(enMemoria))
    } catch {
      // Sin localStorage: queda guardado hasta recargar la página.
    }
    window.dispatchEvent(new Event(EVENTO))
  }

  return { favoritos, alternar }
}
