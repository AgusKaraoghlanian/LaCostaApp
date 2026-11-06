import { useState } from 'react'
import { useAccion } from '../../../shared/hooks/useAccion.js'
import { useCatalogo } from '../../../shared/hooks/useCatalogo.jsx'
import { crearLocalidad, crearPartido, crearProvincia } from '../api/admin.api.js'

// Qué se puede agregar y dentro de qué va cada cosa.
const TIPOS = {
  localidad: { texto: 'Localidad', padre: 'Partido' },
  partido: { texto: 'Partido', padre: 'Provincia' },
  provincia: { texto: 'Provincia', padre: null },
}

// Provincias, partidos y localidades: la guía crece desde acá, sin tocar el programa.
const FormularioGeografia = () => {
  const { geografia, localidades, recargar } = useCatalogo()
  const { ejecutar, enviando, error } = useAccion()
  const [tipo, setTipo] = useState('localidad')
  const [padre, setPadre] = useState('')
  const [nombre, setNombre] = useState('')

  const partidos = geografia.flatMap((p) => p.partidos.map((partido) => ({ ...partido, nombre: `${partido.nombre} (${p.nombre})` })))
  const opcionesDePadre = tipo === 'localidad' ? partidos : geografia

  const agregar = async (e) => {
    e.preventDefault()
    const id = Number(padre)
    const ok = await ejecutar(() => {
      if (tipo === 'provincia') return crearProvincia({ nombre })
      if (tipo === 'partido') return crearPartido({ nombre, provinciaId: id })
      return crearLocalidad({ nombre, partidoId: id })
    })
    if (ok) {
      setNombre('')
      recargar()
    }
  }

  return (
    <section className="formulario">
      <h2>Provincias, partidos y localidades</h2>
      <p>La expansión se administra desde acá. No hace falta modificar el programa.</p>
      <div className="localidades-pastillas">
        {localidades.map((l) => (
          <span className="estado" key={l.id}>
            {l.nombre}
          </span>
        ))}
      </div>
      <form onSubmit={agregar}>
        <label>
          Qué querés agregar
          <select
            value={tipo}
            onChange={(e) => {
              setTipo(e.target.value)
              setPadre('')
            }}
          >
            {Object.entries(TIPOS).map(([valor, { texto }]) => (
              <option key={valor} value={valor}>
                {texto}
              </option>
            ))}
          </select>
        </label>
        {TIPOS[tipo].padre && (
          <label>
            {TIPOS[tipo].padre}
            <select required value={padre} onChange={(e) => setPadre(e.target.value)}>
              <option value="">Elegí una opción</option>
              {opcionesDePadre.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </label>
        )}
        <label>
          Nombre
          <input required minLength={2} maxLength={150} value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </label>
        <button className="boton boton-borde" disabled={enviando}>
          Agregar al catálogo geográfico
        </button>
        {error && <div className="motor-notice error">{error}</div>}
      </form>
    </section>
  )
}

export default FormularioGeografia
