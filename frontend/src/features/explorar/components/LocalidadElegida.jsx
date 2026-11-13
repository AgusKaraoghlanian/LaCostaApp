import { X } from 'lucide-react'
import SelectorLocalidad from '../../inicio/components/SelectorLocalidad.jsx'
import { useCatalogo } from '../../../shared/hooks/useCatalogo.jsx'

// En el celular los filtros están escondidos: esto muestra en qué localidad se está buscando
// (por ejemplo, después de tocar una tarjeta de la portada). Tocándolo se elige otra con el
// mismo selector que "¿Por dónde?" de la portada (la hoja que sube desde abajo); la cruz la
// quita y vuelve a "Toda La Costa".
const LocalidadElegida = ({ localidadId, onCambiar }) => {
  const { localidades } = useCatalogo()
  const localidad = localidades.find((l) => String(l.id) === localidadId)

  return (
    <div className="localidad-elegida">
      <SelectorLocalidad
        localidades={localidades}
        valor={localidadId}
        onCambiar={onCambiar}
        clase="localidad-elegida-selector"
        etiqueta="Buscando en"
        textoTodas="Toda La Costa"
      />
      {localidad && (
        <button
          type="button"
          className="localidad-elegida-quitar"
          onClick={() => onCambiar('')}
          aria-label={`Quitar ${localidad.nombre} y ver toda La Costa`}
        >
          <X size={15} />
        </button>
      )}
    </div>
  )
}

export default LocalidadElegida
