import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef, useState } from 'react'

// Las fotos de la ficha. Con una sola se ve como siempre; con varias es un carrusel: se pasa
// deslizando (celular), con las flechitas, con los puntitos o con las flechas del teclado.
const GaleriaFotos = ({ fotos, nombre }) => {
  const pistaRef = useRef(null)
  const [actual, setActual] = useState(0)
  const varias = fotos.length > 1

  // Cuál se ve, según cuánto se deslizó la pista (sirve igual con el dedo y con las flechas).
  const alDeslizar = () => {
    const pista = pistaRef.current
    setActual(Math.round(pista.scrollLeft / pista.clientWidth))
  }

  const irA = (indice) => {
    const pista = pistaRef.current
    const destino = Math.max(0, Math.min(fotos.length - 1, indice))
    const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    pista.scrollTo({ left: destino * pista.clientWidth, behavior: sinMovimiento ? 'instant' : 'smooth' })
    // Las flechitas y los puntitos se actualizan ya, sin esperar a que termine de deslizarse.
    setActual(destino)
  }

  return (
    <section
      className={`galeria una-foto${varias ? ' galeria-carrusel' : ''}`}
      aria-roledescription={varias ? 'carrusel' : undefined}
      aria-label={`Fotos de ${nombre}`}
      onKeyDown={(e) => {
        if (!varias) return
        if (e.key === 'ArrowLeft') irA(actual - 1)
        if (e.key === 'ArrowRight') irA(actual + 1)
      }}
    >
      <ul className="galeria-pista" ref={pistaRef} onScroll={varias ? alDeslizar : undefined}>
        {fotos.map((foto, i) => (
          <li
            key={foto}
            aria-roledescription={varias ? 'foto' : undefined}
            aria-label={varias ? `${i + 1} de ${fotos.length}` : undefined}
            aria-hidden={varias && i !== actual ? 'true' : undefined}
          >
            <img
              src={foto}
              alt={i === 0 ? `Interior y propuesta de ${nombre}` : `${nombre}, foto ${i + 1}`}
              loading={i === 0 ? undefined : 'lazy'}
            />
          </li>
        ))}
      </ul>
      {varias && (
        <>
          <button
            type="button"
            className="galeria-flecha anterior"
            onClick={() => irA(actual - 1)}
            disabled={actual === 0}
            aria-label="Foto anterior"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            className="galeria-flecha siguiente"
            onClick={() => irA(actual + 1)}
            disabled={actual === fotos.length - 1}
            aria-label="Foto siguiente"
          >
            <ChevronRight size={22} />
          </button>
          {/* span y no div: estilos.css le da otra forma a los div de .galeria (y los oculta en el celular). */}
          <span className="galeria-puntos" role="group" aria-label="Elegir foto">
            {fotos.map((foto, i) => (
              <button
                type="button"
                key={foto}
                onClick={() => irA(i)}
                aria-label={`Ver la foto ${i + 1} de ${fotos.length}`}
                aria-current={i === actual ? 'true' : undefined}
              />
            ))}
          </span>
        </>
      )}
    </section>
  )
}

export default GaleriaFotos
