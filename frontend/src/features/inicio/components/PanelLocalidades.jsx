import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { FOTOS_LOCALIDADES } from '../../../shared/costa.js'
import FondoLocalidad from './FondoLocalidad.jsx'

// Los colores de las tarjetas sin foto: arena, mar, atardecer y monte, uno tras otro.
const TONOS = ['arena', 'mar', 'atardecer', 'monte']

// "Tu próximo plan, en La Costa": todas las localidades una al lado de la otra (en el celular,
// en una fila que se desliza de costado). La elegida se agranda: con el mouse, mientras está
// arriba; tocando, el primer toque la agranda y el segundo entra a /explorar.
const PanelLocalidades = ({ localidades }) => {
  // Arrancan todas achicadas: ninguna se agranda hasta que se elige una (null = ninguna).
  const [activa, setActiva] = useState(null)
  // Si la tocada ya estaba agrandada al apoyar el dedo (el foco la agranda antes del clic).
  const yaEstabaRef = useRef(false)
  const listaRef = useRef(null)

  // En el celular la fila se desliza: la que se abre queda a la vista, alineada a la izquierda.
  // Las de antes están cerradas, así que su posición es (ancho cerrada + separación) × número.
  // El ancho sale de --ancho-cerrada (agregados.css) y no de medirlas, porque mientras se
  // abren y cierran todavía se están moviendo.
  useEffect(() => {
    const lista = listaRef.current
    if (activa === null || !lista || lista.scrollWidth <= lista.clientWidth) return
    const estilos = getComputedStyle(lista)
    const paso = parseFloat(estilos.getPropertyValue('--ancho-cerrada')) + parseFloat(estilos.columnGap)
    const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    lista.scrollTo({ left: activa * paso, behavior: sinMovimiento ? 'instant' : 'smooth' })
  }, [activa])

  // Para las flechitas del celular: si la fila está al principio o al final de lo que se desliza.
  const [bordes, setBordes] = useState({ alInicio: true, alFinal: false })
  const medirBordes = () => {
    const lista = listaRef.current
    if (!lista) return
    setBordes({
      alInicio: lista.scrollLeft <= 2,
      alFinal: lista.scrollLeft + lista.clientWidth >= lista.scrollWidth - 2,
    })
  }
  useEffect(() => {
    medirBordes()
    window.addEventListener('resize', medirBordes)
    return () => window.removeEventListener('resize', medirBordes)
  }, [localidades])

  // Con una abierta, las flechitas abren la anterior o la siguiente; con todas cerradas,
  // deslizan la fila casi una pantalla.
  const ultima = localidades.length - 1
  const hayAnterior = activa !== null ? activa > 0 : !bordes.alInicio
  const haySiguiente = activa !== null ? activa < ultima : !bordes.alFinal
  const mover = (direccion) => {
    if (activa !== null) {
      setActiva(Math.max(0, Math.min(ultima, activa + direccion)))
      return
    }
    const lista = listaRef.current
    const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    lista.scrollBy({ left: direccion * lista.clientWidth * 0.8, behavior: sinMovimiento ? 'instant' : 'smooth' })
  }

  if (!localidades.length) return null

  return (
    // Se vuelven a cerrar todas cuando el foco se va del panel (con el teclado, o tocando
    // fuera de las tarjetas). Va en el contenedor para que tocar una flechita no las cierre.
    <div className="panel-envoltura" onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setActiva(null)}>
      <ul
        ref={listaRef}
        className="panel-localidades"
        aria-label="Localidades de La Costa"
        // Con el mouse, se cierran todas al salir del panel.
        onPointerLeave={(e) => e.pointerType === 'mouse' && setActiva(null)}
        onScroll={medirBordes}
      >
        {localidades.map((l, i) => {
          const foto = FOTOS_LOCALIDADES[l.nombre]
          const esActiva = i === activa
          return (
            <li key={l.id} className={`panel-item${esActiva ? ' activa' : ''}`}>
              <Link
                to={`/explorar?localidad=${l.id}`}
                className={`localidad-tarjeta ${
                  foto ? `con-foto${foto.oscura ? ' tinta-oscura' : ''}` : `sin-foto tono-${TONOS[i % TONOS.length]}`
                }`}
                // Los colores de la capa que va sobre la foto.
                style={foto ? { '--arriba': foto.arriba, '--abajo': foto.abajo } : undefined}
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
                <FondoLocalidad foto={foto} />
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
      {/* Solo en el celular (en la compu entran todas): pasar a la anterior o a la siguiente. */}
      {hayAnterior && (
        <button type="button" className="panel-flechita izquierda" aria-label="Localidad anterior" onClick={() => mover(-1)}>
          <ChevronLeft size={22} />
        </button>
      )}
      {haySiguiente && (
        <button type="button" className="panel-flechita derecha" aria-label="Localidad siguiente" onClick={() => mover(1)}>
          <ChevronRight size={22} />
        </button>
      )}
    </div>
  )
}

export default PanelLocalidades
