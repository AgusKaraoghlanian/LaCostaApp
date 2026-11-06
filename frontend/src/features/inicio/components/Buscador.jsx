import { ChevronDown, MapPin, Search } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useCatalogo } from '../../../shared/hooks/useCatalogo.jsx'

// El buscador grande de la portada: lleva a /explorar con lo que se buscó.
const Buscador = () => {
  const navigate = useNavigate()
  const { localidades } = useCatalogo()
  const [texto, setTexto] = useState('')
  const [localidad, setLocalidad] = useState('')

  const buscar = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (texto.trim()) params.set('q', texto.trim())
    if (localidad) params.set('localidad', localidad)
    navigate(`/explorar${params.size ? `?${params}` : ''}`)
  }

  return (
    <form className="buscador" onSubmit={buscar}>
      <div className="campo-buscar">
        <Search size={21} />
        <label>
          <span>¿Qué se te antoja?</span>
          <input
            aria-label="Qué querés comer"
            placeholder="Un café, una buena parrilla..."
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
        </label>
      </div>
      <div className="campo-localidad">
        <MapPin size={21} />
        <label>
          <span>¿Por dónde?</span>
          <select aria-label="Elegir localidad" value={localidad} onChange={(e) => setLocalidad(e.target.value)}>
            <option value="">Todas las localidades</option>
            {localidades.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nombre}
              </option>
            ))}
          </select>
        </label>
        <ChevronDown size={15} />
      </div>
      <button className="boton boton-naranja" type="submit">
        <Search size={17} />
        Buscar lugares
      </button>
    </form>
  )
}

export default Buscador
