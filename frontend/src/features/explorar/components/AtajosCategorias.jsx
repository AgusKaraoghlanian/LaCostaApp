import { Link } from 'react-router'
import IconoCategoria from '../../../shared/components/IconoCategoria.jsx'
import { useCatalogo } from '../../../shared/hooks/useCatalogo.jsx'

// En el celular, las categorías a mano arriba del listado: solo el ícono, en dos filas de
// cuatro (el nombre queda para lectores de pantalla y como globito). Tocar la elegida la
// quita. Cambiar de categoría conserva la localidad y los demás filtros.
const AtajosCategorias = ({ elegida, params }) => {
  const { categorias } = useCatalogo()

  if (!categorias.length) return null

  // Los filtros que se mantienen al cambiar de categoría (la página vuelve a la primera).
  const resto = new URLSearchParams(params)
  resto.delete('categoria')
  resto.delete('pagina')
  const consulta = resto.toString() ? `?${resto}` : ''

  return (
    <nav className="atajos-categorias" aria-label="Categorías">
      <ul>
        {categorias.map((c) => {
          const esElegida = elegida === c.clave
          return (
            <li key={c.id}>
              <Link
                to={esElegida ? `/explorar${consulta}` : `/categoria/${c.clave}${consulta}`}
                className="atajo-categoria"
                style={{ background: c.color }}
                aria-current={esElegida ? 'page' : undefined}
                aria-label={esElegida ? `${c.nombre} (tocá para ver todas las categorías)` : c.nombre}
                title={c.nombre}
              >
                <IconoCategoria icono={c.icono} size={19} strokeWidth={1.6} aria-hidden="true" />
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default AtajosCategorias
