import { MapPin, X } from 'lucide-react'
import { useCatalogo } from '../../../shared/hooks/useCatalogo.jsx'

// En el celular los filtros están escondidos: esto muestra en qué localidad se está buscando
// (por ejemplo, después de tocar una tarjeta de la portada) y deja quitarla con la cruz.
// Sin ninguna elegida, dice "Toda La Costa".
const LocalidadElegida = ({ localidadId, onQuitar }) => {
  const { localidades } = useCatalogo()
  const localidad = localidades.find((l) => String(l.id) === localidadId)

  return (
    <p className="localidad-elegida">
      <span className="localidad-elegida-texto">
        <MapPin size={15} aria-hidden="true" />
        <span>
          <span className="sr-only">Buscando en </span>
          {localidad?.nombre ?? 'Toda La Costa'}
        </span>
      </span>
      {localidad && (
        <button type="button" onClick={onQuitar} aria-label={`Quitar ${localidad.nombre} y ver toda La Costa`}>
          <X size={15} />
        </button>
      )}
    </p>
  )
}

export default LocalidadElegida
