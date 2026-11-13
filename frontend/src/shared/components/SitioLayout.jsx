import { RefreshCw } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigationType } from 'react-router'
import { useCatalogo } from '../hooks/useCatalogo.jsx'
import Cabecera from './Cabecera.jsx'
import Pie from './Pie.jsx'

// Hasta dónde se había bajado en cada entrada del historial (por location.key), para dejar
// la lista como estaba al volver atrás desde una ficha.
const posiciones = new Map()

// Vuelve a donde estaba. Los datos de la página llegan después, así que reintenta un rato
// hasta que la página es lo bastante alta (o hasta que la persona baja por su cuenta).
const restaurarPosicion = (y) => {
  let intentos = 0
  const probar = () => {
    window.scrollTo({ top: y, behavior: 'instant' })
    if (Math.abs(window.scrollY - y) > 2 && intentos++ < 30) setTimeout(probar, 50)
  }
  probar()
}

// El marco de todas las páginas: cabecera, contenido y pie. Si no se pudo cargar el catálogo
// (la API no responde), avisa arriba con la opción de reintentar.
const SitioLayout = () => {
  const { pathname, key, state } = useLocation()
  const tipoDeNavegacion = useNavigationType()
  // Una navegación con state.mantenerScroll (cambiar de categoría desde los filtros) cambia de
  // página pero no sube la pantalla, como cualquier otro filtro.
  const mantenerScroll = Boolean(state?.mantenerScroll)
  // La entrada del historial actual y cómo se llegó a ella (PUSH, REPLACE o POP = atrás/adelante).
  const actualRef = useRef({ key, tipo: tipoDeNavegacion, mantenerScroll })
  const { error, recargar } = useCatalogo()

  // El navegador no restaura solo: lo hace el efecto de abajo, cuando la página ya cargó.
  useEffect(() => {
    window.history.scrollRestoration = 'manual'
    const guardar = () => posiciones.set(actualRef.current.key, window.scrollY)
    window.addEventListener('scroll', guardar, { passive: true })
    // También al tocar cualquier cosa (antes de que un link cambie de página): así queda
    // anotada aunque el navegador todavía no haya avisado el último scroll.
    document.addEventListener('click', guardar, true)
    return () => {
      window.removeEventListener('scroll', guardar)
      document.removeEventListener('click', guardar, true)
    }
  }, [])

  // useLayoutEffect (y no useEffect): tiene que pasar antes de que el navegador avise el scroll
  // de la página nueva, que si no se anotaría en la entrada anterior y pisaría su posición.
  useLayoutEffect(() => {
    actualRef.current = { key, tipo: tipoDeNavegacion, mantenerScroll }
  }, [key, tipoDeNavegacion, mantenerScroll])

  // Al cambiar de página se vuelve arriba (cambiar un filtro no cambia la página: no sube).
  // Si se volvió atrás (o adelante), se vuelve a donde estaba.
  useLayoutEffect(() => {
    const { key: actual, tipo, mantenerScroll: mantener } = actualRef.current
    const guardada = tipo === 'POP' ? posiciones.get(actual) : undefined
    if (guardada) restaurarPosicion(guardada)
    else if (!mantener) window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return (
    <>
      <a className="saltar" href="#contenido">
        Saltar al contenido
      </a>
      <Cabecera />
      {error && (
        <div className="motor-api-error" role="alert">
          <span>No pudimos conectarnos con la guía: {error}</span>
          <button type="button" className="boton boton-borde" onClick={recargar}>
            <RefreshCw size={14} />
            Reintentar conexión
          </button>
        </div>
      )}
      <div id="contenido">
        <Outlet />
      </div>
      <Pie />
    </>
  )
}

export default SitioLayout
