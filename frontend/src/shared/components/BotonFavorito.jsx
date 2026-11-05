import { Heart } from 'lucide-react'
import { useFavoritos } from '../hooks/useFavoritos.js'

// El corazón para guardar un lugar. grande: el de la ficha, con texto.
const BotonFavorito = ({ slug, grande = false }) => {
  const { favoritos, alternar } = useFavoritos()
  const activo = favoritos.includes(slug)

  return (
    <button
      type="button"
      className={`favorito ${grande ? 'grande' : ''} ${activo ? 'activo' : ''}`}
      onClick={() => alternar(slug)}
      aria-label={activo ? 'Quitar de mis guardados' : 'Guardar lugar'}
      aria-pressed={activo}
    >
      <Heart size={19} fill={activo ? 'currentColor' : 'none'} />
      {grande && (activo ? 'Guardado' : 'Guardar')}
    </button>
  )
}

export default BotonFavorito
