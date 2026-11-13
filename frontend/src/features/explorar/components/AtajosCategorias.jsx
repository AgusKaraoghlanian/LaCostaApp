import { Link } from 'react-router'
import IconoCategoria from '../../../shared/components/IconoCategoria.jsx'
import { useCatalogo } from '../../../shared/hooks/useCatalogo.jsx'

// En el celular, las categorías a mano arriba del listado: el ícono y el nombre chico debajo,
// en dos filas de cuatro. Tocar la elegida la quita. Cambiar de categoría conserva la
// localidad y los demás filtros, pero no lo escrito en el buscador.
const AtajosCategorias = ({ elegida, params }) => {
  const { categorias } = useCatalogo()

  if (!categorias.length) return null

  // Los filtros que se mantienen al cambiar de categoría (la página vuelve a la primera).
  // Lo escrito en el buscador se borra: tocar un ícono ya dice qué se quiere ver, y si quedaba
  // "pizza" escrito, Restaurantes mostraba 0 lugares sin que se entendiera por qué.
  const resto = new URLSearchParams(params)
  resto.delete('categoria')
  resto.delete('pagina')
  resto.delete('q')
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
                aria-label={esElegida ? `${c.nombre} (tocá para ver todas las categorías)` : undefined}
              >
                <IconoCategoria icono={c.icono} size={18} strokeWidth={1.6} aria-hidden="true" />
                <span className="atajo-nombre">{c.nombre}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default AtajosCategorias
