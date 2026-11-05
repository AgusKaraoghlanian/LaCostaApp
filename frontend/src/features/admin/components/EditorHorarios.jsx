import { useFieldArray, useWatch } from 'react-hook-form'
import { DIAS } from '../../../shared/costa.js'
import { ESPECIAL_VACIO, HORARIO_VACIO } from './fichaFormulario.js'

// La pestaña "Horarios": las franjas de cada día y los días especiales (feriados, cierres).
const EditorHorarios = ({ control, register }) => {
  const horarios = useFieldArray({ control, name: 'horarios' })
  const especiales = useFieldArray({ control, name: 'horariosEspeciales' })
  const valoresEspeciales = useWatch({ control, name: 'horariosEspeciales' })

  return (
    <section>
      <h2>Horarios por día y temporada</h2>
      <p>
        Hora local de Argentina. Si cierra de madrugada, marcá el día siguiente. La vigencia puede quedar sin
        informar.
      </p>
      {horarios.fields.map((campo, i) => (
        <div className="motor-source" key={campo.id}>
          <div className="dos-campos">
            <label>
              Día
              <select required {...register(`horarios.${i}.dia`)}>
                <option value="">Elegí el día</option>
                {DIAS.map((dia, numero) => (
                  <option value={numero} key={dia}>
                    {dia}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Apertura
              <input type="time" required {...register(`horarios.${i}.abre`)} />
            </label>
            <label>
              Cierre
              <input type="time" required {...register(`horarios.${i}.cierra`)} />
            </label>
            <label className="checkbox">
              <input type="checkbox" {...register(`horarios.${i}.alDiaSiguiente`)} />
              Cierra al día siguiente
            </label>
            <label>
              Desde
              <input type="date" {...register(`horarios.${i}.vigenteDesde`)} />
            </label>
            <label>
              Hasta
              <input type="date" {...register(`horarios.${i}.vigenteHasta`)} />
            </label>
            <label>
              Temporada informada
              <input maxLength={100} placeholder="Verano" {...register(`horarios.${i}.temporada`)} />
            </label>
          </div>
          <button className="boton-texto" type="button" onClick={() => horarios.remove(i)}>
            Quitar este horario del borrador
          </button>
        </div>
      ))}
      <button type="button" className="boton boton-borde" onClick={() => horarios.append(HORARIO_VACIO)}>
        Agregar horario
      </button>

      <h3>Excepciones por fecha</h3>
      {especiales.fields.map((campo, i) => {
        const cerrado = valoresEspeciales[i]?.cerrado
        return (
          <div className="motor-source" key={campo.id}>
            <div className="dos-campos">
              <label>
                Fecha
                <input type="date" required {...register(`horariosEspeciales.${i}.fecha`)} />
              </label>
              <label className="checkbox">
                <input type="checkbox" {...register(`horariosEspeciales.${i}.cerrado`)} />
                Cerrado ese día
              </label>
              {!cerrado && (
                <>
                  <label>
                    Apertura
                    <input type="time" required {...register(`horariosEspeciales.${i}.abre`)} />
                  </label>
                  <label>
                    Cierre
                    <input type="time" required {...register(`horariosEspeciales.${i}.cierra`)} />
                  </label>
                </>
              )}
            </div>
            <button className="boton-texto" type="button" onClick={() => especiales.remove(i)}>
              Quitar esta excepción
            </button>
          </div>
        )
      })}
      <button type="button" className="boton boton-borde" onClick={() => especiales.append(ESPECIAL_VACIO)}>
        Agregar excepción
      </button>
    </section>
  )
}

export default EditorHorarios
