import { useForm } from 'react-hook-form'
import { useAccion } from '../../../shared/hooks/useAccion.js'
import { useCatalogo } from '../../../shared/hooks/useCatalogo.jsx'
import { crearCategoria } from '../api/admin.api.js'

// Las categorías que hay y el alta de una nueva (la clave de la URL sale del nombre).
const FormularioCategoria = () => {
  const { categorias, recargar } = useCatalogo()
  const { ejecutar, enviando, error } = useAccion()
  const { register, handleSubmit, reset } = useForm({ defaultValues: { nombre: '', descripcion: '' } })

  const agregar = async (datos) => {
    const ok = await ejecutar(() => crearCategoria(datos))
    if (ok) {
      reset()
      recargar()
    }
  }

  return (
    <section className="formulario">
      <h2>Categorías</h2>
      <p>Cada negocio va en una. Se muestran en la portada en el orden en que se crearon.</p>
      <div className="localidades-pastillas">
        {categorias.map((c) => (
          <span className="estado" key={c.id}>
            {c.nombre}
          </span>
        ))}
      </div>
      <form onSubmit={handleSubmit(agregar)}>
        <label>
          Nombre
          <input required minLength={2} maxLength={80} placeholder="Nueva categoría" {...register('nombre')} />
        </label>
        <label>
          Descripción corta
          <input maxLength={300} placeholder="Una porción y un encuentro" {...register('descripcion')} />
        </label>
        <button className="boton boton-borde" disabled={enviando}>
          Agregar categoría
        </button>
        {error && <div className="motor-notice error">{error}</div>}
      </form>
    </section>
  )
}

export default FormularioCategoria
