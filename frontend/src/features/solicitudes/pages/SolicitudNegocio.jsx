import { ArrowRight, CircleCheck, CircleHelp, Waves } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import TituloDePagina from '../../../shared/components/TituloDePagina.jsx'
import { enviarSolicitud } from '../api/solicitudes.api.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Números, espacios, guiones, paréntesis y un + adelante (el backend además cuenta 8 a 15 dígitos).
const CELULAR_PATTERN = /^\+?[\d\s\-()]+$/

const TEXTOS = {
  SUMAR: {
    pestana: 'Sumá tu lugar',
    sobretitulo: 'PARA TU NEGOCIO',
    titulo: (
      <>
        Tu negocio merece
        <br />
        ser <em>descubierto.</em>
      </>
    ),
    bajada: 'Dejanos tus datos y te escribimos para armar la ficha de tu lugar en la guía de La Costa.',
    formulario: 'Sumá tu lugar a la guía',
    otro: { to: '/reclamar', pregunta: '¿Tu negocio ya aparece en la guía?', texto: 'Reclamá tu ficha' },
  },
  RECLAMAR: {
    pestana: 'Reclamar mi negocio',
    sobretitulo: 'PARA TU NEGOCIO',
    titulo: (
      <>
        Tu ficha,
        <br />
        en <em>buenas manos.</em>
      </>
    ),
    bajada: 'Si tu negocio ya está en la guía, dejanos tus datos: verificamos que seas vos y te ayudamos a mantenerla al día.',
    formulario: 'Reclamá tu negocio',
    otro: { to: '/sumar-lugar', pregunta: '¿Todavía no está en la guía?', texto: 'Sumá tu lugar' },
  },
}

const ErrorDeCampo = ({ error }) => (error ? <small className="error-campo">{error.message}</small> : null)

// "Sumá tu lugar" y "Reclamar mi negocio": nombre del negocio, celular y correo. Al enviar,
// el equipo de la guía recibe un correo y la solicitud queda en el panel de administración.
const SolicitudNegocio = ({ tipo }) => {
  const textos = TEXTOS[tipo]
  const [enviada, setEnviada] = useState(false)
  const [errorServidor, setErrorServidor] = useState('')
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onBlur', defaultValues: { nombreNegocio: '', celular: '', email: '', sitioWeb: '' } })

  const enviar = async (datos) => {
    setErrorServidor('')
    try {
      await enviarSolicitud({ ...datos, tipo })
      setEnviada(true)
      reset()
    } catch (error) {
      setErrorServidor(error.message)
    }
  }

  return (
    <main className="contenedor pagina acceso-pagina solicitud-pagina">
      <TituloDePagina titulo={textos.pestana} />
      <div className="acceso-presentacion">
        <span className="sobretitulo">{textos.sobretitulo}</span>
        <h1>{textos.titulo}</h1>
        <p>{textos.bajada}</p>
        <Waves size={70} strokeWidth={1} />
      </div>

      {enviada ? (
        <div className="formulario solicitud-enviada" role="status">
          <CircleCheck size={40} strokeWidth={1.5} />
          <h2>¡Gracias! Ya recibimos tus datos.</h2>
          <p>Te vamos a escribir en los próximos días para seguir con tu ficha.</p>
          <Link to="/explorar" className="boton boton-naranja ancho">
            Explorar lugares <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="formulario">
          <h2>{textos.formulario}</h2>
          <p>Completá los tres datos y te contactamos.</p>
          {errorServidor && (
            <div className="aviso-demo" role="alert">
              <CircleHelp size={17} />
              {errorServidor}
            </div>
          )}
          <form onSubmit={handleSubmit(enviar)} noValidate>
            <label>
              Nombre del negocio
              <input
                autoComplete="organization"
                placeholder="Ej. La Orilla"
                maxLength={150}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.nombreNegocio)}
                {...register('nombreNegocio', {
                  required: 'Completá el nombre del negocio.',
                  validate: (v) => v.trim().length >= 2 || 'Completá el nombre del negocio.',
                })}
              />
              <ErrorDeCampo error={errors.nombreNegocio} />
            </label>
            <label>
              Número de celular
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="Ej. 2257 123456"
                maxLength={30}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.celular)}
                {...register('celular', {
                  required: 'Completá el número de celular.',
                  validate: (v) => {
                    const digitos = v.replace(/\D/g, '').length
                    return (CELULAR_PATTERN.test(v.trim()) && digitos >= 8 && digitos <= 15) ||
                      'Ingresá un número de celular válido (ej. 2257 123456).'
                  },
                })}
              />
              <ErrorDeCampo error={errors.celular} />
            </label>
            <label>
              Correo electrónico
              <input
                type="email"
                autoComplete="email"
                placeholder="tu@correo.com"
                maxLength={200}
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.email)}
                {...register('email', {
                  required: 'Completá el correo electrónico.',
                  pattern: { value: EMAIL_PATTERN, message: 'Ingresá un correo electrónico válido.' },
                })}
              />
              <ErrorDeCampo error={errors.email} />
            </label>
            {/* Trampa para bots: una persona no lo ve ni lo completa. */}
            <label className="sr-only" aria-hidden="true">
              Sitio web
              <input tabIndex={-1} autoComplete="off" {...register('sitioWeb')} />
            </label>
            <button className="boton boton-naranja ancho" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Enviar'}
              <ArrowRight size={16} />
            </button>
          </form>
          <p className="solicitud-otro">
            {textos.otro.pregunta} <Link to={textos.otro.to}>{textos.otro.texto}</Link>
          </p>
        </div>
      )}
    </main>
  )
}

export default SolicitudNegocio
