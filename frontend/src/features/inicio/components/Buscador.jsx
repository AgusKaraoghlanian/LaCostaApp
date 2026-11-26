import { Search, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import IconoCategoria from '../../../shared/components/IconoCategoria.jsx'
import { useCatalogo } from '../../../shared/hooks/useCatalogo.jsx'
import SelectorLocalidad from './SelectorLocalidad.jsx'

// El buscador grande de la portada. "¿Qué se te antoja?" y "¿Por dónde?" son los dos
// selectores de lista (no se escribe: en el celular no abre el teclado y la lista sube como una
// hoja desde abajo). Con una categoría elegida lleva a su página; si no, a /explorar. En los dos
// casos respeta la localidad.
const Buscador = () => {
  const navigate = useNavigate()
  const { categorias, localidades } = useCatalogo()
  const [categoria, setCategoria] = useState('')
  const [localidad, setLocalidad] = useState('')

  const opcionesDeCategoria = categorias.map((c) => ({ ...c, id: c.clave }))

  const buscar = (e) => {
    e.preventDefault()
    const params = localidad ? `?localidad=${localidad}` : ''
    navigate(categoria ? `/categoria/${categoria}${params}` : `/explorar${params}`)
  }

  return (
    <form className="buscador" onSubmit={buscar}>
      <SelectorLocalidad
        clase="campo-buscar selector-antojo"
        localidades={opcionesDeCategoria}
        valor={categoria}
        onCambiar={setCategoria}
        etiqueta="¿Qué se te antoja?"
        textoTodas="De todo un poco"
        textoVacio="Café, parrilla, pizza…"
        titulo="Seguí tu antojo"
        Icono={Search}
        iconoDeOpcion={(c, i) =>
          i === 0 ? (
            <span className="selector-opcion-icono" aria-hidden="true">
              <Sparkles size={14} />
            </span>
          ) : (
            <span className="antojo-icono" style={{ background: c.color }} aria-hidden="true">
              <IconoCategoria icono={c.icono} size={17} strokeWidth={1.6} />
            </span>
          )
        }
        detalleDeOpcion={(c) =>
          c.negocios !== undefined && (
            <small className="antojo-cantidad">
              {c.negocios} {c.negocios === 1 ? 'lugar' : 'lugares'}
            </small>
          )
        }
      />
      <SelectorLocalidad localidades={localidades} valor={localidad} onCambiar={setLocalidad} />
      <button className="boton boton-naranja" type="submit">
        <Search size={17} />
        Buscar lugares
      </button>
    </form>
  )
}

export default Buscador
