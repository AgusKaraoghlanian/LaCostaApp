import { Navigate, Outlet } from 'react-router'
import { useSesion } from '../hooks/useSesion.js'

// Sin sesión de administrador va a /ingresar.
const RutaProtegida = () => {
  const { sesion } = useSesion()

  if (sesion?.rol !== 'ADMINISTRADOR') return <Navigate to="/ingresar" replace />

  return <Outlet />
}

export default RutaProtegida
