import { History } from 'lucide-react'

const fechaYHora = (fecha) =>
  new Date(fecha).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })

// La pestaña "Historial": las revisiones aprobadas, de la más nueva a la más vieja.
// Copiar una al borrador no cambia lo publicado: hay que aprobarla y publicarla de nuevo.
const Historial = ({ negocio, enviando, onRestaurar }) => (
  <section>
    <h2>Historial de revisiones</h2>
    {negocio.revisiones.map((r) => (
      <div className="motor-list-row" key={r.id}>
        <span className="motor-row-icon">
          <History size={20} />
        </span>
        <div>
          <strong>
            Revisión {r.numero}
            {r.id === negocio.revisionPublicadaId && ' · Publicada'}
          </strong>
          <small>
            Aprobada el {fechaYHora(r.aprobadaEn)}
            {r.aprobadaPor && ` por ${r.aprobadaPor}`}
          </small>
        </div>
        <button type="button" className="boton boton-borde" disabled={enviando} onClick={() => onRestaurar(r.id)}>
          Copiar al borrador
        </button>
      </div>
    ))}
    {!negocio.revisiones.length && <p>El historial comienza cuando aprobás la primera revisión.</p>}
  </section>
)

export default Historial
