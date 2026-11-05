import { ArrowRight, CircleHelp, Waves } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate } from 'react-router'
import TituloDePagina from '../../../shared/components/TituloDePagina.jsx'
import { useSesion } from '../../../shared/hooks/useSesion.js'
import { login } from '../api/auth.api.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// El mensaje de error de un campo, abajo del input.
const ErrorDeCampo = ({ error }) => (error ? <small className="error-campo">{error.message}</small> : null)

// Por ahora solo entra el administrador (lo crea el seed del backend).
const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onBlur' })
  const { sesion, iniciar } = useSesion()
  const navigate = useNavigate()
  const [errorServidor, setErrorServidor] = useState('')

  const ingresar = async (datos) => {
    setErrorServidor('')
    try {
      const respuesta = await login(datos)
      iniciar(respuesta.token, respuesta.usuario)
      navigate('/administracion', { replace: true })
    } catch (error) {
      setErrorServidor(error.message)
    }
  }

  if (sesion) return <Navigate to="/administracion" replace />

  return (
    <main className="contenedor pagina acceso-pagina">
      <TituloDePagina titulo="Ingresá a tu cuenta" />
      <div className="acceso-presentacion">
        <span className="sobretitulo">UN LUGAR PARA TU LUGAR</span>
        <h1>
          La buena cocina
          <br />
          merece <em>encontrarse.</em>
        </h1>
        <p>Cargá y revisá las fichas de la guía, su carta y sus horarios antes de publicarlas.</p>
        <Waves size={70} strokeWidth={1} />
      </div>
      <div className="formulario">
        <h2>Qué bueno verte por acá.</h2>
        <p>Ingresá para administrar la guía.</p>
        {errorServidor && (
          <div className="aviso-demo" role="alert">
            <CircleHelp size={17} />
            {errorServidor}
          </div>
        )}
        <form onSubmit={handleSubmit(ingresar)} noValidate>
          <label>
            Correo electrónico
            <input
              type="email"
              autoComplete="email"
              placeholder="tu@correo.com"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.email)}
              {...register('email', {
                required: 'Completá tu correo.',
                pattern: { value: EMAIL_PATTERN, message: 'Ingresá un correo electrónico válido.' },
              })}
            />
            <ErrorDeCampo error={errors.email} />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              autoComplete="current-password"
              placeholder="Tu contraseña"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.password)}
              {...register('password', { required: 'Completá tu contraseña.' })}
            />
            <ErrorDeCampo error={errors.password} />
          </label>
          <button className="boton boton-naranja ancho" disabled={isSubmitting}>
            {isSubmitting ? 'Un momento...' : 'Ingresar'}
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </main>
  )
}

export default Login
