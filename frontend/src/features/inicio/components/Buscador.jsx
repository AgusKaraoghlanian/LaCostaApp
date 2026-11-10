import { Search } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import IconoCategoria from '../../../shared/components/IconoCategoria.jsx'
import { useCatalogo } from '../../../shared/hooks/useCatalogo.jsx'
import SelectorLocalidad from './SelectorLocalidad.jsx'

// "Café" y "cafe" tienen que encontrar lo mismo.
const normalizar = (texto) =>
  texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()

// El buscador grande de la portada: lleva a /explorar con lo que se buscó.
// Al tocar "¿Qué se te antoja?" sugiere las categorías (las mismas de "¿Qué tenés ganas de
// comer?") y las va filtrando mientras se escribe. Sigue el patrón de combobox con lista de
// WAI-ARIA: el foco queda en el campo y la sugerencia activa se anuncia con aria-activedescendant.
const Buscador = () => {
  const navigate = useNavigate()
  const { categorias, localidades } = useCatalogo()
  const idBase = useId()
  const [texto, setTexto] = useState('')
  const [localidad, setLocalidad] = useState('')
  const [abierto, setAbierto] = useState(false)
  const [activa, setActiva] = useState(-1)
  const campoRef = useRef(null)

  // Las categorías que coinciden con lo escrito (todas si no se escribió nada).
  const sugerencias = useMemo(() => {
    const buscado = normalizar(texto)
    if (!buscado) return categorias
    return categorias.filter((c) => normalizar(c.nombre).includes(buscado))
  }, [categorias, texto])

  const mostrarLista = abierto && sugerencias.length > 0
  const idSugerencia = (i) => `${idBase}-sugerencia-${i}`

  // Cierra las sugerencias si se toca o hace clic afuera del campo.
  useEffect(() => {
    if (!abierto) return
    const alTocarAfuera = (e) => {
      if (!campoRef.current?.contains(e.target)) setAbierto(false)
    }
    document.addEventListener('pointerdown', alTocarAfuera)
    return () => document.removeEventListener('pointerdown', alTocarAfuera)
  }, [abierto])

  // Va a la página de la categoría elegida (respeta la localidad si se eligió una).
  const irACategoria = (categoria) => {
    setAbierto(false)
    const params = localidad ? `?localidad=${localidad}` : ''
    navigate(`/categoria/${categoria.clave}${params}`)
  }

  const buscar = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (texto.trim()) params.set('q', texto.trim())
    if (localidad) params.set('localidad', localidad)
    navigate(`/explorar${params.size ? `?${params}` : ''}`)
  }

  // Flechas para recorrer las sugerencias, Enter para elegir y Escape para cerrar.
  // Con ninguna sugerencia activa, Enter busca el texto como siempre.
  const alPresionarTecla = (e) => {
    const ultima = sugerencias.length - 1
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setAbierto(true)
      setActiva((a) => (mostrarLista ? Math.min(a + 1, ultima) : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiva((a) => Math.max(a - 1, -1))
    } else if (e.key === 'Enter' && mostrarLista && activa >= 0) {
      e.preventDefault()
      irACategoria(sugerencias[activa])
    } else if (e.key === 'Escape' && abierto) {
      e.preventDefault()
      setAbierto(false)
      setActiva(-1)
    } else if (e.key === 'Tab') {
      setAbierto(false)
    }
  }

  return (
    <form className="buscador" onSubmit={buscar}>
      <div className={`campo-buscar${mostrarLista ? ' abierto' : ''}`} ref={campoRef}>
        <Search size={21} />
        <label>
          <span>¿Qué se te antoja?</span>
          <input
            role="combobox"
            aria-label="Qué querés comer"
            aria-autocomplete="list"
            aria-expanded={mostrarLista}
            aria-controls={`${idBase}-sugerencias`}
            aria-activedescendant={mostrarLista && activa >= 0 ? idSugerencia(activa) : undefined}
            autoComplete="off"
            placeholder="Un café, una buena parrilla..."
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value)
              setAbierto(true)
              setActiva(-1)
            }}
            onFocus={() => setAbierto(true)}
            onClick={() => setAbierto(true)}
            onKeyDown={alPresionarTecla}
          />
        </label>

        <div className="selector-panel antojo-panel" hidden={!mostrarLista}>
          <p className="selector-grupo" aria-hidden="true">
            {texto.trim() ? 'Categorías que coinciden' : 'Seguí tu antojo'}
          </p>
          <ul className="selector-lista" id={`${idBase}-sugerencias`} role="listbox" aria-label="Categorías">
            {sugerencias.map((c, i) => (
              <li
                key={c.id}
                id={idSugerencia(i)}
                role="option"
                aria-selected={i === activa}
                className={`selector-opcion${i === activa ? ' activa' : ''}`}
                onPointerMove={() => i !== activa && setActiva(i)}
                // pointerdown + preventDefault: el campo no pierde el foco antes del clic.
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => irACategoria(c)}
              >
                <span className="antojo-icono" style={{ background: c.color }} aria-hidden="true">
                  <IconoCategoria icono={c.icono} size={17} strokeWidth={1.6} />
                </span>
                <span className="selector-opcion-nombre">{c.nombre}</span>
                <small className="antojo-cantidad">
                  {c.negocios} {c.negocios === 1 ? 'lugar' : 'lugares'}
                </small>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <SelectorLocalidad localidades={localidades} valor={localidad} onCambiar={setLocalidad} />
      <button className="boton boton-naranja" type="submit">
        <Search size={17} />
        Buscar lugares
      </button>
    </form>
  )
}

export default Buscador
