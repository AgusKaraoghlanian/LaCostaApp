import { Beer, Coffee, Croissant, Fish, Flame, IceCream, Pizza, Utensils } from 'lucide-react'

// El ícono que se eligió para la categoría (Categoria.icono). Si no hay uno, cubiertos.
const ICONOS = {
  utensils: Utensils,
  coffee: Coffee,
  flame: Flame,
  pizza: Pizza,
  beer: Beer,
  icecream: IceCream,
  croissant: Croissant,
  fish: Fish,
}

const IconoCategoria = ({ icono, ...props }) => {
  const Icono = ICONOS[icono] ?? Utensils
  return <Icono {...props} />
}

export default IconoCategoria
