import { Check, ChevronDown, MapPin, Navigation, X } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'

// El "¿Por dónde?" del buscador: un desplegable propio (no el <select> del navegador) que
// sigue el patrón de combobox de solo selección de WAI-ARIA. El foco queda siempre en el
// botón y la opción activa se anuncia con aria-activedescendant.
// En el celular la lista se abre como una hoja desde abajo, más cómoda para el pulgar.
const SelectorLocalidad = ({ localidades, valor, onCambiar }) => {
  const idBase = useId()
  const [abierto, setAbierto] = useState(false)
  const [activa, setActiva] = useState(0)
  const contenedorRef = useRef(null)
  const botonRef = useRef(null)
  const listaRef = useRef(null)
  const tipeoRef = useRef({ texto: '', timer: null })

  // La lista plana de opciones: primero "Todas", después cada localidad.
  const opciones = useMemo(
    () => [{ id: '', nombre: 'Todas las localidades' }, ...localidades],
    [localidades],
  )

  // Las localidades agrupadas por partido (solo se muestran los títulos si hay más de uno).
  const grupos = useMemo(() => {
    const porPartido = new Map()
    localidades.forEach((localidad, i) => {
      const partido = localidad.partido ?? ''
      if (!porPartido.has(partido)) porPartido.set(partido, [])
      porPartido.get(partido).push({ ...localidad, indice: i + 1 })
    })
    return [...porPartido.entries()]
  }, [localidades])

  const indiceElegido = Math.max(
    0,
    opciones.findIndex((o) => String(o.id) === String(valor)),
  )
  const elegida = opciones[indiceElegido]
  const idOpcion = (i) => `${idBase}-opcion-${i}`

  // Abre la lista con la opción elegida (o la que se indique) marcada como activa.
  const abrir = (indice = indiceElegido) => {
    setActiva(indice)
    setAbierto(true)
  }

  // Cierra sin elegir (la cruz, el fondo oscuro o la barrita de la hoja en el celular) y
  // devuelve el foco al botón, para que el teclado no se pierda.
  const cerrar = () => {
    setAbierto(false)
    botonRef.current?.focus()
  }

  // Elige una opción, cierra la lista y avisa al buscador.
  const elegir = (indice) => {
    onCambiar(String(opciones[indice].id))
    setAbierto(false)
  }

  // Cierra si se toca o hace clic afuera.
  useEffect(() => {
    if (!abierto) return
    const alTocarAfuera = (e) => {
      if (!contenedorRef.current?.contains(e.target)) setAbierto(false)
    }
    document.addEventListener('pointerdown', alTocarAfuera)
    return () => document.removeEventListener('pointerdown', alTocarAfuera)
  }, [abierto])

  // Mantiene visible la opción activa cuando se recorre con el teclado.
  useEffect(() => {
    if (!abierto) return
    // Se mueve solo el scroll de la lista (scrollIntoView movería también la página).
    const lista = listaRef.current
    const nodo = lista?.querySelector(`[data-indice="${activa}"]`)
    if (!nodo) return
    const arriba = nodo.offsetTop - lista.offsetTop
    const abajo = arriba + nodo.offsetHeight
    if (arriba < lista.scrollTop) lista.scrollTop = arriba
    else if (abajo > lista.scrollTop + lista.clientHeight) lista.scrollTop = abajo - lista.clientHeight
  }, [abierto, activa])

  // Busca la próxima opción que empiece con lo que se viene tipeando (ej: "sa" → San Bernardo).
  const buscarPorTipeo = (letra) => {
    const tipeo = tipeoRef.current
    clearTimeout(tipeo.timer)
    tipeo.texto += letra.toLowerCase()
    tipeo.timer = setTimeout(() => (tipeo.texto = ''), 600)

    const desde = abierto ? activa : indiceElegido
    const orden = [...opciones.keys()].map((k) => (desde + 1 + k) % opciones.length)
    // Con la misma letra repetida ("sss") se avanza entre las que empiezan con esa letra.
    const repetida = [...tipeo.texto].every((c) => c === tipeo.texto[0])
    const busqueda = repetida ? tipeo.texto[0] : tipeo.texto
    const encontrada = orden.find((i) =>
      opciones[i].nombre.toLowerCase().startsWith(busqueda),
    )
    if (encontrada !== undefined) abrir(encontrada)
    else if (!abierto) abrir()
  }

  // Todo el manejo de teclado: flechas, Inicio/Fin, Enter, Escape, Tab y tipeo.
  const alPresionarTecla = (e) => {
    const ultimo = opciones.length - 1

    if (!abierto) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault()
        abrir()
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        buscarPorTipeo(e.key)
      }
      return
    }

    const mover = {
      ArrowDown: Math.min(activa + 1, ultimo),
      ArrowUp: Math.max(activa - 1, 0),
      Home: 0,
      End: ultimo,
      PageDown: Math.min(activa + 5, ultimo),
      PageUp: Math.max(activa - 5, 0),
    }
    if (e.key in mover) {
      e.preventDefault()
      if (e.key === 'ArrowUp' && e.altKey) elegir(activa)
      else setActiva(mover[e.key])
    } else if (e.key === 'Enter' || (e.key === ' ' && !tipeoRef.current.texto)) {
      e.preventDefault()
      elegir(activa)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setAbierto(false)
    } else if (e.key === 'Tab') {
      setAbierto(false)
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      buscarPorTipeo(e.key)
    }
  }

  // Una opción de la lista (se usa para "Todas" y para cada localidad).
  const renderOpcion = (opcion, indice, icono) => {
    const esElegida = indice === indiceElegido
    return (
      <li
        key={indice}
        id={idOpcion(indice)}
        role="option"
        aria-selected={esElegida}
        data-indice={indice}
        className={[
          'selector-opcion',
          esElegida && 'elegida',
          indice === activa && 'activa',
        ]
          .filter(Boolean)
          .join(' ')}
        onPointerMove={() => indice !== activa && setActiva(indice)}
        onClick={() => elegir(indice)}
      >
        <span className="selector-opcion-icono" aria-hidden="true">
          {icono}
        </span>
        <span className="selector-opcion-nombre">{opcion.nombre}</span>
        {esElegida && <Check size={15} strokeWidth={2.4} className="selector-check" aria-hidden="true" />}
      </li>
    )
  }

  const mostrarPartidos = grupos.length > 1

  return (
    <div
      className={`campo-localidad selector-localidad${abierto ? ' abierto' : ''}`}
      ref={contenedorRef}
    >
      <button
        type="button"
        role="combobox"
        ref={botonRef}
        className="selector-boton"
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-controls={`${idBase}-lista`}
        aria-labelledby={`${idBase}-etiqueta ${idBase}-valor`}
        aria-activedescendant={abierto ? idOpcion(activa) : undefined}
        onClick={() => (abierto ? setAbierto(false) : abrir())}
        onKeyDown={alPresionarTecla}
      >
        <MapPin size={21} className="selector-pin" aria-hidden="true" />
        <span className="selector-textos">
          <span className="selector-etiqueta" id={`${idBase}-etiqueta`}>
            ¿Por dónde?
          </span>
          <span className="selector-valor" id={`${idBase}-valor`}>
            {elegida.nombre}
          </span>
        </span>
        <ChevronDown size={16} className="selector-flecha" aria-hidden="true" />
      </button>

      {/* En el celular: tocar el fondo oscuro (arriba de la hoja) cierra. Está dentro del
          contenedor, así que "tocar afuera" no lo cuenta: se cierra acá. */}
      {abierto && <div className="selector-fondo" aria-hidden="true" onClick={cerrar} />}

      <div className="selector-panel" hidden={!abierto}>
        {/* La barrita de arriba de la hoja: también cierra al tocarla. */}
        <span className="selector-agarradera" aria-hidden="true" onClick={cerrar} />
        <div className="selector-cabecera">
          <p className="selector-titulo" aria-hidden="true">
            Elegí una localidad
          </p>
          <button type="button" className="selector-cerrar" onClick={cerrar} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>
        <ul
          className="selector-lista"
          id={`${idBase}-lista`}
          role="listbox"
          aria-labelledby={`${idBase}-etiqueta`}
          ref={listaRef}
          tabIndex={-1}
        >
          {renderOpcion(opciones[0], 0, <Navigation size={14} />)}
          {grupos.map(([partido, items], g) =>
            mostrarPartidos ? (
              <li key={partido} role="presentation">
                <p className="selector-grupo" id={`${idBase}-grupo-${g}`}>
                  {partido}
                </p>
                <ul role="group" aria-labelledby={`${idBase}-grupo-${g}`}>
                  {items.map((l) => renderOpcion(l, l.indice, <MapPin size={14} />))}
                </ul>
              </li>
            ) : (
              items.map((l) => renderOpcion(l, l.indice, <MapPin size={14} />))
            ),
          )}
        </ul>
      </div>
    </div>
  )
}

export default SelectorLocalidad
