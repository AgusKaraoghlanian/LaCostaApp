import { RefreshCw } from 'lucide-react'
import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { useCatalogo } from '../hooks/useCatalogo.jsx'
import Cabecera from './Cabecera.jsx'
import Pie from './Pie.jsx'

// El marco de todas las páginas: cabecera, contenido y pie. Si no se pudo cargar el catálogo
// (la API no responde), avisa arriba con la opción de reintentar.
const SitioLayout = () => {
  const { pathname } = useLocation()
  const { error, recargar } = useCatalogo()

  // Al cambiar de página se vuelve arriba (cambiar un filtro no cambia la página: no sube).
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
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
