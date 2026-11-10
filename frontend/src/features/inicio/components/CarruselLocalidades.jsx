import { ArrowRight, ChevronLeft, ChevronRight, Waves } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { FOTOS_LOCALIDADES } from '../../../shared/costa.js'

// El número de la tarjeta que está más cerca del centro de la pista.
const centralActual = (pista) => {
  const centro = pista.scrollLeft + pista.clientWidth / 2
  let masCerca = 0
  let menorDistancia = Infinity
  ;[...pista.children].forEach((item, i) => {
    const distancia = Math.abs(item.offsetLeft + item.offsetWidth / 2 - centro)
    if (distancia < menorDistancia) {
      menorDistancia = distancia
      masCerca = i
    }
  })
  return masCerca
}

// Los colores de las tarjetas sin foto: arena, mar, atardecer y monte, uno tras otro.
const TONOS = ['arena', 'mar', 'atardecer', 'monte']

// "Tu próximo plan, en La Costa": las localidades en un carrusel que se desliza con el dedo
// (scroll-snap) y, en la compu, con las flechas. La tarjeta del medio se ve grande y las de
// los costados se achican; al deslizar, la que llega al centro se agranda.
// Tocar una tarjeta del costado la trae al centro; tocar la del medio lleva a /explorar.
const CarruselLocalidades = ({ localidades }) => {
  const pistaRef = useRef(null)
  const cuadroRef = useRef(0)
  // A dónde va el carrusel mientras se mueve (así dos clics seguidos en la flecha avanzan dos).
  const destinoRef = useRef(0)
  const [central, setCentral] = useState(0)

  // Achica cada tarjeta según lo lejos que está del centro (--cercania: 1 en el medio, 0 lejos)
  // y anota cuál es la del medio.
  const actualizar = () => {
    const pista = pistaRef.current
    if (!pista) return
    const centro = pista.scrollLeft + pista.clientWidth / 2
    for (const item of pista.children) {
      const distancia = Math.abs(item.offsetLeft + item.offsetWidth / 2 - centro)
      const cercania = Math.max(0, 1 - distancia / item.offsetWidth)
      item.style.setProperty('--cercania', cercania.toFixed(3))
    }
    setCentral(centralActual(pista))
  }

  // Un solo cálculo por cuadro mientras se desliza.
  const alDeslizar = () => {
    cancelAnimationFrame(cuadroRef.current)
    cuadroRef.current = requestAnimationFrame(actualizar)
  }

  useEffect(() => {
    actualizar()
    window.addEventListener('resize', alDeslizar)
    return () => {
      window.removeEventListener('resize', alDeslizar)
      cancelAnimationFrame(cuadroRef.current)
    }
  }, [localidades])

  // Centra la tarjeta número i.
  const irA = (i) => {
    const pista = pistaRef.current
    const item = pista?.children[i]
    if (!item) return
    destinoRef.current = i
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    pista.scrollTo({
      left: item.offsetLeft + item.offsetWidth / 2 - pista.clientWidth / 2,
      behavior: reducido ? 'auto' : 'smooth',
    })
  }

  const mover = (direccion) =>
    irA(Math.min(Math.max(destinoRef.current + direccion, 0), localidades.length - 1))

  // Cuando se termina de deslizar (con el dedo o la rueda), el destino es la del medio.
  const alTerminarDeDeslizar = () => {
    actualizar()
    destinoRef.current = centralActual(pistaRef.current)
  }

  if (!localidades.length) return null

  return (
    <div className="carrusel" role="region" aria-roledescription="carrusel" aria-label="Localidades de La Costa">
      <ul className="carrusel-pista" ref={pistaRef} onScroll={alDeslizar} onScrollEnd={alTerminarDeDeslizar}>
        {localidades.map((l, i) => {
          const foto = FOTOS_LOCALIDADES[l.nombre]
          return (
            <li key={l.id} className={`carrusel-item${i === central ? ' central' : ''}`}>
              <Link
                to={`/explorar?localidad=${l.id}`}
                aria-current={i === central ? 'true' : undefined}
                onClick={(e) => {
                  // Una del costado primero viene al centro.
                  if (i !== central) {
                    e.preventDefault()
                    irA(i)
                  }
                }}
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
        <button type="button" onClick={() => mover(-1)} disabled={central === 0} aria-label="Localidad anterior">
          <ChevronLeft size={20} />
        </button>
        <button type="button" onClick={() => mover(1)} disabled={central === localidades.length - 1} aria-label="Localidad siguiente">
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  )
}

export default CarruselLocalidades
