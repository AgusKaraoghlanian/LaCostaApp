import { ArrowRight, ChevronLeft, ChevronRight, Waves } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { FOTOS_LOCALIDADES } from '../../../shared/costa.js'

// Los colores de las tarjetas sin foto: arena, mar, atardecer y monte, uno tras otro.
const TONOS = ['arena', 'mar', 'atardecer', 'monte']

// "Tu próximo plan, en La Costa": las localidades en un carrusel que se desliza con el dedo
// (scroll-snap) y, en la compu, con las flechas. Cada tarjeta lleva a /explorar filtrado.
const CarruselLocalidades = ({ localidades }) => {
  const pistaRef = useRef(null)
  const [enInicio, setEnInicio] = useState(true)
  const [enFin, setEnFin] = useState(false)

  // Prende o apaga las flechas según dónde quedó el scroll.
  const actualizarFlechas = () => {
    const pista = pistaRef.current
    if (!pista) return
    setEnInicio(pista.scrollLeft <= 4)
    setEnFin(pista.scrollLeft + pista.clientWidth >= pista.scrollWidth - 4)
  }

  useEffect(() => {
    actualizarFlechas()
    window.addEventListener('resize', actualizarFlechas)
    return () => window.removeEventListener('resize', actualizarFlechas)
  }, [localidades])

  // Avanza o retrocede casi una "pantalla" de tarjetas.
  const mover = (direccion) => {
    const pista = pistaRef.current
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    pista.scrollBy({ left: direccion * pista.clientWidth * 0.85, behavior: reducido ? 'auto' : 'smooth' })
  }

  if (!localidades.length) return null

  return (
    <div className="carrusel" role="region" aria-roledescription="carrusel" aria-label="Localidades de La Costa">
      <ul className="carrusel-pista" ref={pistaRef} onScroll={actualizarFlechas}>
        {localidades.map((l, i) => {
          const foto = FOTOS_LOCALIDADES[l.nombre]
          return (
            <li key={l.id} className="carrusel-item">
              <Link
                to={`/explorar?localidad=${l.id}`}
                className={`localidad-tarjeta${foto ? '' : ` sin-foto tono-${TONOS[i % TONOS.length]}`}`}
              >
                {foto ? (
                  <img src={foto} alt="" loading="lazy" />
                ) : (
                  <span className="localidad-ilustracion" aria-hidden="true">
                    <Waves size={120} strokeWidth={0.8} />
                  </span>
                )}
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
      <div className="carrusel-flechas">
        <button type="button" onClick={() => mover(-1)} disabled={enInicio} aria-label="Localidades anteriores">
          <ChevronLeft size={20} />
        </button>
        <button type="button" onClick={() => mover(1)} disabled={enFin} aria-label="Más localidades">
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  )
}

export default CarruselLocalidades
