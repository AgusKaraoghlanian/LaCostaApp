import { ArrowLeft, BookOpen, Check, Clock, Globe, History, ShieldCheck, Store } from 'lucide-react'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router'
import EstadoCarga from '../../../shared/components/EstadoCarga.jsx'
import { useCargarDatos } from '../../../shared/hooks/useCargarDatos.js'
import {
  aprobarRevision,
  crearNegocio,
  editarNegocio,
  obtenerNegocio,
  publicarNegocio,
  restaurarRevision,
  retirarNegocio,
} from '../api/admin.api.js'
import CamposFicha from '../components/CamposFicha.jsx'
import EditorCarta from '../components/EditorCarta.jsx'
import EditorHorarios from '../components/EditorHorarios.jsx'
import { FICHA_VACIA, aDatos, aFormulario } from '../components/fichaFormulario.js'
import Historial from '../components/Historial.jsx'
import Mensaje from '../components/Mensaje.jsx'
import { estadoDePublicacion } from '../components/publicacion.js'

const PESTANAS = [
  ['ficha', 'Ficha', Store],
  ['horarios', 'Horarios', Clock],
  ['carta', 'Carta', BookOpen],
  ['historial', 'Historial', History],
]

// El editor de una ficha. negocio es null si es nueva. Cada acción devuelve la ficha actualizada
// (onActualizado) y el formulario se vuelve a armar con ella. El mensaje vive en FichaAdmin para
// que no se pierda al rearmarse.
const EditorNegocio = ({ negocio, pestana, setPestana, mensaje, setMensaje, onActualizado }) => {
  const navigate = useNavigate()
  const [enviando, setEnviando] = useState(false)
  const [confirmarRetiro, setConfirmarRetiro] = useState(false)
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm({ defaultValues: negocio ? aFormulario(negocio) : FICHA_VACIA })
  const productos = useWatch({ control, name: 'productos' })

  // Corre una acción con los botones deshabilitados y muestra cómo salió.
  const ejecutar = async (accion, exito) => {
    setEnviando(true)
    setMensaje(null)
    try {
      const actualizado = await accion()
      setMensaje({ texto: exito })
      onActualizado(actualizado)
      return actualizado
    } catch (e) {
      setMensaje({ texto: e.message, error: true })
      return null
    } finally {
      setEnviando(false)
    }
  }

  // Guarda el borrador (lo crea si es nuevo) y, si se pidió, lo aprueba como revisión.
  const guardar = async (valores, aprobar) => {
    const datos = aDatos(valores)
    await ejecutar(
      async () => {
        const guardado = negocio ? await editarNegocio(negocio.id, datos, negocio.revisionBorrador) : await crearNegocio(datos)
        // Una ficha nueva pasa a tener su dirección (/administracion/negocios/12).
        if (!negocio) navigate(`/administracion/negocios/${guardado.id}`, { replace: true })
        if (!aprobar) return guardado
        try {
          return await aprobarRevision(guardado.id, guardado.revisionBorrador)
        } catch (e) {
          // El borrador sí se guardó: el formulario sigue con esa versión.
          onActualizado(guardado)
          throw Object.assign(new Error(`El borrador se guardó, pero no se aprobó: ${e.message}`), { status: e.status })
        }
      },
      aprobar
        ? 'Revisión aprobada. Para que se vea en el sitio, publicala.'
        : 'Borrador guardado. Todavía no cambia lo que se ve en el sitio.',
    )
  }

  const onSubmit = (e) => {
    const aprobar = e.nativeEvent.submitter?.value === 'aprobar'
    handleSubmit((valores) => guardar(valores, aprobar))(e)
  }

  const ultima = negocio?.revisiones[0]
  const yaPublicada = ultima && ultima.id === negocio.revisionPublicadaId

  return (
    <section className="motor-editor">
      <Link to="/administracion/negocios" className="boton-texto">
        <ArrowLeft size={16} />
        Volver
      </Link>
      <div className="panel-subtitulo">
        <div>
          <span className="sobretitulo">DATOS VERIFICADOS · EDICIÓN</span>
          <h2>{negocio ? 'La historia de tu lugar' : 'Un nuevo lugar para descubrir'}</h2>
        </div>
        {negocio && (
          <span className="estado">
            Borrador {negocio.revisionBorrador} · {estadoDePublicacion(negocio)}
          </span>
        )}
      </div>
      <Mensaje mensaje={mensaje} onCerrar={() => setMensaje(null)} />

      {confirmarRetiro && (
        <section role="alertdialog" aria-labelledby="retiro-titulo" className="formulario">
          <h2 id="retiro-titulo">Retirar ficha del sitio</h2>
          <p>La ficha dejará de mostrarse. Su borrador y su historial de revisiones se conservan.</p>
          <div className="botones-juntos">
            <button className="boton boton-borde" type="button" onClick={() => setConfirmarRetiro(false)}>
              Cancelar
            </button>
            <button
              className="boton boton-naranja"
              type="button"
              disabled={enviando}
              onClick={async () => {
                await ejecutar(
                  () => retirarNegocio(negocio.id, negocio.revisionBorrador),
                  'Ficha retirada del sitio. Se conservó todo el historial.',
                )
                setConfirmarRetiro(false)
              }}
            >
              Confirmar retiro
            </button>
          </div>
        </section>
      )}

      <div className="pestanas" role="tablist" aria-label="Secciones del negocio">
        {PESTANAS.filter(([id]) => negocio || id !== 'historial').map(([id, texto, Icono]) => (
          <button
            type="button"
            role="tab"
            aria-selected={pestana === id}
            className={pestana === id ? 'activa' : ''}
            onClick={() => setPestana(id)}
            key={id}
          >
            <Icono size={15} />
            {texto}
            {id === 'carta' && productos.length ? ` (${productos.length})` : ''}
          </button>
        ))}
      </div>

      <form className="formulario" onSubmit={onSubmit}>
        {/* Todas las pestañas quedan armadas (ocultas): así el navegador valida los campos de todas. */}
        <div hidden={pestana !== 'ficha'}>
          <CamposFicha register={register} />
        </div>
        <div hidden={pestana !== 'horarios'}>
          <EditorHorarios control={control} register={register} />
        </div>
        <div hidden={pestana !== 'carta'}>
          <EditorCarta control={control} register={register} errors={errors} />
        </div>
        {negocio && pestana === 'historial' && (
          <Historial
            negocio={negocio}
            enviando={enviando}
            onRestaurar={(revisionId) =>
              ejecutar(
                () => restaurarRevision(negocio.id, revisionId, negocio.revisionBorrador),
                'La revisión se copió al borrador. Todavía no reemplaza la publicación.',
              )
            }
          />
        )}
        <div className="formulario-pie">
          <span>
            <ShieldCheck size={16} />
            {isDirty ? 'Hay cambios sin guardar.' : 'Guardar no reemplaza la última publicación.'}
          </span>
          <div className="botones-juntos">
            <button className="boton boton-borde" name="accion" value="borrador" disabled={enviando}>
              Guardar borrador
            </button>
            <button className="boton boton-naranja" name="accion" value="aprobar" disabled={enviando}>
              <Check size={16} />
              {enviando ? 'Guardando...' : 'Guardar y aprobar revisión'}
            </button>
          </div>
        </div>
      </form>

      {negocio?.revisionPublicadaId && (
        <button type="button" className="boton-texto peligro" onClick={() => setConfirmarRetiro(true)}>
          Retirar ficha del sitio
        </button>
      )}
      {ultima && (
        <div className="motor-publish">
          <div>
            <h3>{yaPublicada ? 'La última revisión está publicada.' : `La revisión ${ultima.numero} está lista para publicar.`}</h3>
            <p>Publicar muestra en el sitio la última revisión aprobada. Lo que edites después no se ve hasta aprobarlo.</p>
          </div>
          <button
            type="button"
            className="boton boton-oscuro"
            disabled={enviando || yaPublicada}
            onClick={() =>
              ejecutar(() => publicarNegocio(negocio.id, negocio.revisionBorrador), 'Listo: la ficha ya se ve en el sitio.')
            }
          >
            <Globe size={16} />
            {yaPublicada ? 'Revisión publicada' : 'Publicar en el sitio'}
          </button>
        </div>
      )}
    </section>
  )
}

// /administracion/negocios/nuevo y /administracion/negocios/:id
// Es una sola ruta (:id puede ser "nuevo") para que al crear la ficha no se pierda el mensaje.
const FichaAdmin = () => {
  const { id: parametro } = useParams()
  const id = parametro === 'nuevo' ? null : Number(parametro)
  const [pestana, setPestana] = useState('ficha')
  const [mensaje, setMensaje] = useState(null)
  // La última versión que devolvió una acción (guardar, aprobar, publicar...).
  const [actualizado, setActualizado] = useState(null)
  const { datos, error, recargar } = useCargarDatos(async () => (id ? obtenerNegocio(id) : null), [id])

  if (id && !datos && !actualizado) return <EstadoCarga error={error} onReintentar={recargar} />

  const negocio = id && actualizado?.id === id ? actualizado : datos

  return (
    <EditorNegocio
      // Cada versión nueva del borrador vuelve a armar el formulario con lo guardado.
      key={negocio ? `${negocio.id}-${negocio.revisionBorrador}` : 'nuevo'}
      negocio={negocio}
      pestana={pestana}
      setPestana={setPestana}
      mensaje={mensaje}
      setMensaje={setMensaje}
      onActualizado={setActualizado}
    />
  )
}

export default FichaAdmin
