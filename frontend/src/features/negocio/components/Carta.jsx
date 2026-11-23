import { BookOpen } from 'lucide-react'
import { useMemo, useState } from 'react'
import { fechaCorta } from '../../../shared/formato.js'
import { seccionesDeCarta } from '../utils/paginasDeCarta.js'
import LibroCarta from './LibroCarta.jsx'

// Cuántas secciones se muestran como atajo debajo de la tapa.
const ATAJOS = 8

// La carta publicada: solo los productos aprobados (el backend ya filtra los demás). En la ficha
// se ve la tapa; al tocarla se abre como un libro (LibroCarta). Las secciones de abajo abren el
// libro directo en esa sección.
const Carta = ({ carta, revisadaEl, nombreNegocio }) => {
  const secciones = useMemo(() => seccionesDeCarta(carta), [carta])
  // null: cerrada; '' abre en el índice; una clave abre en esa sección.
  const [abierta, setAbierta] = useState(null)
  const sobran = secciones.length - ATAJOS

  return (
    <section className="detalle-seccion">
      <span className="sobretitulo">SU PROPUESTA GASTRONÓMICA</span>
      <h2>La carta</h2>
      <p className="real-date">
        Precios revisados el {fechaCorta(revisadaEl)}. La fuente puede no informar vigencia.
      </p>

      <div className="carta-tapa-zona">
        <button type="button" className="carta-tapa" onClick={() => setAbierta('')}>
          <span className="carta-tapa-lomo" aria-hidden="true" />
          <span className="carta-tapa-texto">
            <small>LA CARTA DE</small>
            <strong>{nombreNegocio}</strong>
            <span className="carta-tapa-cuenta">
              {carta.length} {carta.length === 1 ? 'producto' : 'productos'} · {secciones.length}{' '}
              {secciones.length === 1 ? 'sección' : 'secciones'}
            </span>
          </span>
          <span className="carta-tapa-abrir">
            <BookOpen size={18} />
            Abrir la carta
          </span>
        </button>

        {secciones.length > 1 && (
          <div className="carta-atajos" aria-label="Ir a una sección de la carta">
            {secciones.slice(0, ATAJOS).map((s) => (
              <button type="button" key={s.clave} onClick={() => setAbierta(s.clave)}>
                {s.nombre}
              </button>
            ))}
            {sobran > 0 && (
              <button type="button" className="mas" onClick={() => setAbierta('')}>
                y {sobran} más
              </button>
            )}
          </div>
        )}
      </div>

      {abierta !== null && (
        <LibroCarta
          secciones={secciones}
          nombreNegocio={nombreNegocio}
          seccionInicial={abierta}
          onCerrar={() => setAbierta(null)}
        />
      )}
    </section>
  )
}

export default Carta
