import { CircleHelp } from 'lucide-react'
import { ESTADOS_COMERCIALES, PRESTACIONES } from '../../../shared/costa.js'
import { NOMBRES_DE_PRECIO } from '../../../shared/formato.js'
import { useCatalogo } from '../../../shared/hooks/useCatalogo.jsx'
import CampoFoto from './CampoFoto.jsx'

// Los links de la ficha. El backend revisa que cada uno sea del sitio que corresponde.
const ENLACES = [
  ['web', 'Sitio web', 'https://www.ejemplo.com'],
  ['instagram', 'Instagram', 'https://instagram.com/tu-negocio'],
  ['facebook', 'Facebook', 'https://facebook.com/tu-negocio'],
  ['whatsapp', 'WhatsApp', 'https://wa.me/5492255123456'],
]

// Un input de texto con su etiqueta. registro: lo que devuelve register('campo').
const Texto = ({ etiqueta, registro, ...props }) => (
  <div className="motor-field">
    <label>
      {etiqueta}
      <input {...props} {...registro} />
    </label>
  </div>
)

// La pestaña "Ficha": los datos del negocio.
const CamposFicha = ({ register, control }) => {
  const { categorias, localidades } = useCatalogo()

  return (
    <>
      <div className="motor-notice">
        <CircleHelp size={18} />
        <div>
          Nombre, localidad, categoría y referencia de verificación son obligatorios. Los demás datos pueden quedar
          vacíos. No publiques el domicilio privado de un comercio que solo atiende a domicilio.
        </div>
      </div>
      <div className="motor-fields">
        <Texto etiqueta="Nombre" required minLength={2} maxLength={150} registro={register('nombre')} />
        <div className="motor-field">
          <label>
            Localidad
            <select required {...register('localidadId')}>
              <option value="">Confirmá la localidad</option>
              {localidades.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nombre}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="motor-field">
          <label>
            Categoría
            <select required {...register('categoriaId')}>
              <option value="">Elegí una categoría</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="motor-field">
          <label>
            Estado comercial
            <select {...register('estadoComercial')}>
              {Object.entries(ESTADOS_COMERCIALES).map(([valor, texto]) => (
                <option key={valor} value={valor}>
                  {texto}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="motor-field">
          <label>
            Descripción
            <textarea rows={4} maxLength={1800} {...register('descripcion')} />
          </label>
        </div>
        <Texto etiqueta="Dirección" maxLength={250} registro={register('direccion')} />
        <Texto
          etiqueta="Zona de atención (si no atiende al público)"
          maxLength={250}
          registro={register('zonaAtencion')}
        />
        <Texto etiqueta="Teléfono" maxLength={80} registro={register('telefono')} />
        {ENLACES.map(([campo, etiqueta, ejemplo]) => (
          <Texto key={campo} etiqueta={etiqueta} type="url" placeholder={ejemplo} registro={register(campo)} />
        ))}
        <div className="motor-field">
          <label>
            Precio orientativo
            <select {...register('precio')}>
              <option value="">Sin informar</option>
              {[1, 2, 3].map((n) => (
                <option key={n} value={n}>
                  {'$'.repeat(n)} · {NOMBRES_DE_PRECIO[n]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <CampoFoto control={control} />
        <div className="motor-field">
          <label>
            Aclaraciones de horario
            <textarea rows={2} maxLength={1500} {...register('horariosTexto')} />
          </label>
        </div>
        <div className="motor-field">
          <label>
            Referencia de verificación (interna, no se publica)
            <textarea
              rows={2}
              required
              minLength={3}
              maxLength={1500}
              placeholder="Qué verificaste del negocio y cómo"
              {...register('referenciaVerificacion')}
            />
          </label>
        </div>
      </div>
      <fieldset className="motor-source">
        <legend>Prestaciones</legend>
        {PRESTACIONES.map((p) => (
          <label className="checkbox" key={p}>
            <input type="checkbox" value={p} {...register('prestaciones')} />
            {p}
          </label>
        ))}
        <label>
          Otras (separadas por coma)
          <input maxLength={500} {...register('otrasPrestaciones')} />
        </label>
      </fieldset>
      <label className="checkbox">
        <input type="checkbox" {...register('destacado')} />
        Destacado: aparece primero y en “Para poner en tu lista” de la portada
      </label>
    </>
  )
}

export default CamposFicha
