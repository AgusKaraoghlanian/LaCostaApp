import { CircleHelp, RefreshCw, Utensils } from 'lucide-react'
import Vacio from './Vacio.jsx'

// Mientras cargan los datos, o el error con la opción de reintentar.
const EstadoCarga = ({ error, onReintentar }) => {
  if (error) {
    return (
      <div role="alert">
        <Vacio icono={CircleHelp} titulo="No pudimos cargar esta página" texto={error}>
          <button type="button" className="boton boton-borde" onClick={onReintentar}>
            <RefreshCw size={14} />
            Reintentar
          </button>
        </Vacio>
      </div>
    )
  }

  return (
    <div role="status" className="estado-cargando">
      <Utensils size={28} strokeWidth={1.4} />
      <span className="sr-only">Cargando…</span>
    </div>
  )
}

export default EstadoCarga
