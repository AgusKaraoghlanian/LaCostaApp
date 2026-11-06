import { CANALES } from '../../../shared/costa.js'
import { fechaCorta, precioDeProducto } from '../../../shared/formato.js'

// La carta publicada: solo los productos aprobados (el backend ya filtra los demás).
const Carta = ({ carta, revisadaEl }) => (
  <section className="detalle-seccion">
    <span className="sobretitulo">SU PROPUESTA GASTRONÓMICA</span>
    <h2>La carta</h2>
    <p className="real-date">
      Precios revisados el {fechaCorta(revisadaEl)}. La fuente puede no informar vigencia.
    </p>
    <div className="real-menu">
      {carta.map((p, i) => (
        <article className="real-menu-item" key={i}>
          <small>{p.seccion}</small>
          <h3>
            {p.nombre}
            {p.variante !== 'Base' && ` · ${p.variante}`}
          </h3>
          {p.descripcion && <p>{p.descripcion}</p>}
          <strong>{precioDeProducto(p)}</strong>
          {p.canal !== 'SIN_ESPECIFICAR' && <p>{CANALES[p.canal]}</p>}
        </article>
      ))}
    </div>
  </section>
)

export default Carta
