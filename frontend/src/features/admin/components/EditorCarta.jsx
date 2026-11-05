import { useFieldArray } from 'react-hook-form'
import { CANALES, MONEDAS } from '../../../shared/costa.js'
import { PRECIO_VALIDO, PRODUCTO_VACIO } from './fichaFormulario.js'

const DECISIONES = {
  PROPUESTO: 'Revisar después',
  APROBADO: 'Aprobar producto',
  DESCARTADO: 'Descartar propuesta',
}

// La pestaña "Carta": cada producto con su precio. Solo los aprobados se publican.
const EditorCarta = ({ control, register, errors }) => {
  const productos = useFieldArray({ control, name: 'productos' })

  return (
    <section>
      <h2>La carta</h2>
      <p>
        Cargá cada producto con su precio tal como lo informa el negocio. Solo los aprobados se muestran en la
        ficha; un precio aprobado necesita su moneda.
      </p>
      {productos.fields.map((campo, i) => (
        <div className="motor-source" key={campo.id}>
          <div className="motor-menu-top">
            <label>
              Sección
              <input maxLength={200} placeholder="Principales" {...register(`productos.${i}.seccion`)} />
            </label>
            <label>
              Producto
              <input required maxLength={250} {...register(`productos.${i}.nombre`)} />
            </label>
            <label>
              Variante
              <input maxLength={200} placeholder="Base" {...register(`productos.${i}.variante`)} />
            </label>
          </div>
          <label>
            Descripción
            <textarea rows={2} maxLength={1500} {...register(`productos.${i}.descripcion`)} />
          </label>
          <div className="motor-menu-prices">
            <label>
              Precio
              <input
                inputMode="decimal"
                placeholder="Sin precio"
                maxLength={14}
                aria-invalid={Boolean(errors.productos?.[i]?.precio)}
                {...register(`productos.${i}.precio`, {
                  pattern: { value: PRECIO_VALIDO, message: 'Sin separadores de miles y hasta dos decimales (ej. 12500,50).' },
                })}
              />
              {errors.productos?.[i]?.precio && <small className="error-campo">{errors.productos[i].precio.message}</small>}
            </label>
            <label>
              Moneda
              <select {...register(`productos.${i}.moneda`)}>
                <option value="">Confirmar moneda</option>
                {MONEDAS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </label>
            <label>
              Canal
              <select {...register(`productos.${i}.canal`)}>
                {Object.entries(CANALES).map(([valor, texto]) => (
                  <option key={valor} value={valor}>
                    {texto}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Decisión
              <select {...register(`productos.${i}.estado`)}>
                {Object.entries(DECISIONES).map(([valor, texto]) => (
                  <option key={valor} value={valor}>
                    {texto}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button className="boton-texto" type="button" onClick={() => productos.remove(i)}>
            Quitar este producto
          </button>
        </div>
      ))}
      <button type="button" className="boton boton-borde" onClick={() => productos.append(PRODUCTO_VACIO)}>
        Agregar producto
      </button>
    </section>
  )
}

export default EditorCarta
