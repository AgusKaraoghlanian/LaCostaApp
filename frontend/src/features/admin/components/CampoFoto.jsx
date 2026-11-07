import { useState } from 'react'
import { useController } from 'react-hook-form'
import { subirFoto } from '../api/admin.api.js'

const TIPOS = 'image/jpeg,image/png,image/webp'
const TAMANIO_MAXIMO = 5 * 1024 * 1024

// La foto de la ficha: se elige un archivo, se sube al momento y en el formulario queda su link.
const CampoFoto = ({ control }) => {
  const { field } = useController({ control, name: 'foto' })
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState(null)

  const elegir = async (evento) => {
    const archivo = evento.target.files?.[0]
    evento.target.value = ''
    if (!archivo) return
    setError(null)
    if (!TIPOS.split(',').includes(archivo.type) || archivo.size > TAMANIO_MAXIMO) {
      setError('La foto tiene que ser JPG, PNG o WEBP y pesar hasta 5 MB.')
      return
    }
    setSubiendo(true)
    try {
      const { url } = await subirFoto(archivo)
      field.onChange(url)
    } catch (e) {
      setError(e.message)
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <div className="motor-field campo-foto">
      <span>Foto</span>
      {field.value ? <img src={field.value} alt="Foto actual de la ficha" /> : <p className="campo-foto-vacio">Sin foto</p>}
      <div className="campo-foto-acciones">
        <label className="boton boton-borde">
          {subiendo ? 'Subiendo…' : field.value ? 'Cambiar foto' : 'Subir foto'}
          <input className="sr-only" type="file" accept={TIPOS} disabled={subiendo} onChange={elegir} />
        </label>
        {field.value && !subiendo && (
          <button className="boton-texto" type="button" onClick={() => field.onChange('')}>
            Quitar
          </button>
        )}
      </div>
      {error && <p className="campo-foto-error" role="alert">{error}</p>}
    </div>
  )
}

export default CampoFoto
