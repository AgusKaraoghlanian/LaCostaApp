import { ArrowRight, Waves } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { FOTOS_LOCALIDADES } from '../../../shared/costa.js'

// Los colores de las tarjetas sin foto: arena, mar, atardecer y monte, uno tras otro.
const TONOS = ['arena', 'mar', 'atardecer', 'monte']

// "Tu próximo plan, en La Costa": todas las localidades a la vista, una al lado de la otra
// (una debajo de la otra en el celular). La elegida se agranda: con el mouse, mientras está
// arriba; tocando, el primer toque la agranda y el segundo entra a /explorar.
const PanelLocalidades = ({ localidades }) => {
  // Arrancan todas achicadas: ninguna se agranda hasta que se elige una (null = ninguna).
  const [activa, setActiva] = useState(null)
  // Si la tocada ya estaba agrandada al apoyar el dedo (el foco la agranda antes del clic).
  const yaEstabaRef = useRef(false)

  if (!localidades.length) return null

  return (
    <ul
      className="panel-localidades"
      aria-label="Localidades de La Costa"
      // Se vuelven a cerrar todas cuando el mouse sale del panel o el foco se va a otro lado
      // (con el teclado, o tocando fuera de las tarjetas).
      onPointerLeave={(e) => e.pointerType === 'mouse' && setActiva(null)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setActiva(null)}
    >
      {localidades.map((l, i) => {
        const foto = FOTOS_LOCALIDADES[l.nombre]
        const esActiva = i === activa
        return (
          <li key={l.id} className={`panel-item${esActiva ? ' activa' : ''}`}>
            <Link
              to={`/explorar?localidad=${l.id}`}
              className={`localidad-tarjeta${foto ? '' : ` sin-foto tono-${TONOS[i % TONOS.length]}`}`}
              aria-current={esActiva ? 'true' : undefined}
              // Solo el mouse agranda al pasar; en pantallas táctiles lo hace el primer toque.
              onPointerEnter={(e) => e.pointerType === 'mouse' && setActiva(i)}
              onPointerDown={() => (yaEstabaRef.current = esActiva)}
              onFocus={() => setActiva(i)}
              onClick={(e) => {
                // Con el teclado (detail 0) el foco ya la agrandó: Enter entra directo.
                const yaEstaba = e.detail === 0 || yaEstabaRef.current
                if (!yaEstaba) {
                  e.preventDefault()
                  setActiva(i)
                }
              }}
            >
              {foto ? (
                <img src={foto} alt="" loading="lazy" />
              ) : (
                <span className="localidad-ilustracion" aria-hidden="true">
                  <Waves size={120} strokeWidth={0.8} />
                </span>
              )}
              {/* Achicada solo se ve el nombre (vertical en la compu). */}
              <span className="localidad-nombre-corto" aria-hidden="true">
                {l.nombre}
              </span>
              <span className="localidad-texto">
                <small>{l.partido ? `Partido de ${l.partido}` : 'La Costa'}</small>
                <strong>{l.nombre}</strong>
                <span className="localidad-ver">
                  Ver lugares <ArrowRight size={15} />
                </span>
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export default PanelLocalidades
