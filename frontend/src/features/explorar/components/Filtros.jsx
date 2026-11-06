import { SlidersHorizontal, Waves } from 'lucide-react'
import { PRESTACIONES } from '../../../shared/costa.js'
import { useCatalogo } from '../../../shared/hooks/useCatalogo.jsx'

// La columna de filtros. filtros sale de la URL; cambiar(clave, valor) la actualiza.
// En la página de una categoría no se ofrece elegir otra.
const Filtros = ({ filtros, cambiar, alternarPrestacion, limpiar, conCategoria, visible }) => {
  const { categorias, localidades } = useCatalogo()

  return (
    <aside className={`filtros ${visible ? 'visible' : ''}`}>
      <div className="filtros-titulo">
        <h2>
          <SlidersHorizontal size={17} />
          Filtrá tu búsqueda
        </h2>
        <button type="button" className="boton-texto" onClick={limpiar}>
          Limpiar
        </button>
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
      {!conCategoria && (
        <label className="etiqueta-campo">
          Categoría
          <select value={filtros.categoria} onChange={(e) => cambiar('categoria', e.target.value)}>
            <option value="">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.clave}>
                {c.nombre}
              </option>
            ))}
          </select>
        </label>
      )}
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
