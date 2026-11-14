import { SlidersHorizontal, Waves, X } from 'lucide-react'
import { PRESTACIONES } from '../../../shared/costa.js'
import { useCatalogo } from '../../../shared/hooks/useCatalogo.jsx'

// La columna de filtros. filtros sale de la URL; cambiar(clave, valor) la actualiza y
// elegirCategoria también pasa de una categoría a otra (en /categoria/:clave va en la dirección).
// En el celular se abre con el botón Filtros y se cierra con la cruz, con "Ver lugares" o con
// Esc (onCerrar).
const Filtros = ({ filtros, cambiar, elegirCategoria, alternarPrestacion, limpiar, visible, onCerrar, total }) => {
  const { categorias, localidades } = useCatalogo()

  return (
    <aside
      className={`filtros ${visible ? 'visible' : ''}`}
      aria-label="Filtros"
      onKeyDown={(e) => visible && e.key === 'Escape' && onCerrar()}
    >
      <div className="filtros-titulo">
        <h2>
          <SlidersHorizontal size={17} />
          Filtrá tu búsqueda
        </h2>
        <span className="filtros-titulo-acciones">
          <button type="button" className="boton-texto" onClick={limpiar}>
            Limpiar
          </button>
          <button type="button" className="filtros-cerrar" onClick={onCerrar} aria-label="Cerrar los filtros">
            <X size={18} />
          </button>
        </span>
      </div>
      <label className="etiqueta-campo">
        Localidad
        <select value={filtros.localidad} onChange={(e) => cambiar('localidad', e.target.value)}>
          <option value="">Toda La Costa</option>
          {localidades.map((l) => (
            <option key={l.id} value={l.id}>
              {l.nombre}
            </option>
          ))}
        </select>
      </label>
      <label className="etiqueta-campo">
        Categoría
        <select value={filtros.categoria} onChange={(e) => elegirCategoria(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.clave}>
              {c.nombre}
            </option>
          ))}
        </select>
      </label>
      <fieldset>
        <legend>Precio por persona</legend>
        <div className="precios">
          {['1', '2', '3'].map((n) => (
            <button
              type="button"
              key={n}
              className={filtros.precio === n ? 'activo' : ''}
              aria-pressed={filtros.precio === n}
              onClick={() => cambiar('precio', filtros.precio === n ? '' : n)}
            >
              {'$'.repeat(n)}
            </button>
          ))}
        </div>
        <small>$ Económico · $$$ Una ocasión especial</small>
      </fieldset>
      <fieldset>
        <legend>Para tu plan</legend>
        {PRESTACIONES.map((p) => (
          <label className="checkbox" key={p}>
            <input type="checkbox" checked={filtros.prestaciones.includes(p)} onChange={() => alternarPrestacion(p)} />
            {p}
          </label>
        ))}
      </fieldset>
      <button type="button" className="filtros-ver boton boton-naranja" onClick={onCerrar}>
        {total ? `Ver ${total} ${total === 1 ? 'lugar' : 'lugares'}` : 'Ver resultados'}
      </button>
      <div className="nota-filtros">
        <Waves size={23} />
        <p>
          Un buen plan empieza
          <br />
          por un buen lugar.
        </p>
      </div>
    </aside>
  )
}

export default Filtros
