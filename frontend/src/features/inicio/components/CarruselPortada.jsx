import { ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play, Sun, Waves } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { FOTO_PORTADA } from '../../../shared/costa.js'

// Cada cuánto pasa sola a la siguiente foto.
const INTERVALO = 10000

// El sello "Con gusto a Costa", siempre encima de la foto.
const Sello = () => (
  <span className="sello-costero" aria-hidden="true">
    <Waves size={22} />
    <span>
      CON GUSTO
      <br />A COSTA
    </span>
    <small>36° S · 56° O</small>
  </span>
)

// La foto grande de la portada. Con lugares para mostrar (hasta 5 del plan Carrusel, con foto) es un
// carrusel: pasa solo cada 10 segundos, con flechitas, puntitos y deslizando con el dedo, y se
// frena mientras se lo usa o con el botón de pausa (no arranca solo si se pidió menos
// movimiento). Toda la foto lleva a la ficha del lugar y abajo dice cómo se llama y dónde está.
// Sin lugares, la foto y la nota de siempre.
const CarruselPortada = ({ locales }) => {
  const [actual, setActual] = useState(0)
  const [pausado, setPausado] = useState(false)
  // Mientras el mouse o el foco del teclado están encima no pasa sola (sin tocar el botón de pausa).
  const [enUso, setEnUso] = useState(false)
  const inicioToqueRef = useRef(null)
  // Si el dedo deslizó, ese toque no entra a la ficha.
  const deslizoRef = useRef(false)
  const varios = locales.length > 1
  const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const irA = (indice) => setActual((indice + locales.length) % locales.length)
  // Desde la que se ve en ese momento (dos toques rápidos avanzan dos).
  const mover = (paso) => setActual((a) => (a + paso + locales.length) % locales.length)

  // Cada vez que cambia la foto se vuelve a contar desde cero (también después de tocar una flechita).
  useEffect(() => {
    if (!varios || pausado || enUso || sinMovimiento) return
    const reloj = setTimeout(() => setActual((a) => (a + 1) % locales.length), INTERVALO)
    return () => clearTimeout(reloj)
  }, [actual, varios, pausado, enUso, sinMovimiento, locales.length])

  if (!locales.length) {
    return (
      <div className="hero-visual">
        <img
          className="hero-imagen"
          src={FOTO_PORTADA}
          alt="Un restaurante cálido, lleno de plantas y luz natural"
          fetchPriority="high"
        />
        <Sello />
        <div className="hero-nota">
          <span>
            <Sun size={24} />
          </span>
          <div>
            El mejor plan<small>está a la vuelta de la esquina.</small>
          </div>
          <ArrowUpRight size={19} />
        </div>
      </div>
    )
  }

  const local = locales[actual]

  return (
    <div
      className="hero-visual hero-carrusel"
      role={varios ? 'region' : undefined}
      aria-roledescription={varios ? 'carrusel' : undefined}
      aria-label={varios ? 'Lugares recomendados' : undefined}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setEnUso(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setEnUso(false)}
      // Solo con el foco del teclado: un toque en una flechita no la deja frenada.
      onFocus={(e) => e.target.matches(':focus-visible') && setEnUso(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setEnUso(false)}
      // Deslizar con el dedo: más de 40px de costado pasa a la anterior o a la siguiente.
      onPointerDown={(e) => {
        deslizoRef.current = false
        if (e.pointerType !== 'mouse') inicioToqueRef.current = e.clientX
      }}
      onPointerUp={(e) => {
        if (inicioToqueRef.current === null || !varios) return
        const recorrido = e.clientX - inicioToqueRef.current
        inicioToqueRef.current = null
        if (Math.abs(recorrido) > 40) {
          deslizoRef.current = true
          mover(recorrido < 0 ? 1 : -1)
        }
      }}
    >
      <Link
        to={`/lugar/${local.slug}`}
        className="hero-enlace"
        onClick={(e) => deslizoRef.current && e.preventDefault()}
      >
        {locales.map((n, i) => (
          <img
            key={n.slug}
            className={`hero-imagen hero-diapositiva${i === actual ? ' visible' : ''}`}
            src={n.foto}
            alt=""
            fetchPriority={i === 0 ? 'high' : undefined}
            loading={i === 0 ? undefined : 'lazy'}
          />
        ))}
        {/* Cómo se llama y dónde está: es también el texto del link. */}
        <span className="hero-leyenda">
          <strong>{local.nombre}</strong>
          <small>
            {local.categoria.nombre} · {local.localidad.nombre}
          </small>
        </span>
      </Link>
      <Sello />
      <div className="hero-nota" aria-hidden="true">
        <span>
          <Sun size={16} />
        </span>
        <div>El mejor plan</div>
      </div>
      {varios && (
        <>
          <button type="button" className="hero-flecha anterior" aria-label="Lugar anterior" onClick={() => mover(-1)}>
            <ChevronLeft size={20} />
          </button>
          <button type="button" className="hero-flecha siguiente" aria-label="Lugar siguiente" onClick={() => mover(1)}>
            <ChevronRight size={20} />
          </button>
          <div className="hero-controles">
            {!sinMovimiento && (
              <button
                type="button"
                className="hero-pausa"
                onClick={() => setPausado(!pausado)}
                aria-label={pausado ? 'Seguir pasando las fotos' : 'Pausar las fotos'}
              >
                {pausado ? <Play size={11} /> : <Pause size={11} />}
              </button>
            )}
            {locales.map((n, i) => (
              <button
                type="button"
                key={n.slug}
                className="hero-punto"
                onClick={() => irA(i)}
                aria-label={`Ver ${n.nombre}`}
                aria-current={i === actual ? 'true' : undefined}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default CarruselPortada
