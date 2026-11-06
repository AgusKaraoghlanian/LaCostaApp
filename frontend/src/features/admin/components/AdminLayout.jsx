import { Home, LogOut, Settings, Store } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router'
import { useSesion } from '../../../shared/hooks/useSesion.js'
import TituloDePagina from '../../../shared/components/TituloDePagina.jsx'

const SECCIONES = [
  { ruta: '/administracion', texto: 'Inicio', icono: Home, exacta: true },
  { ruta: '/administracion/negocios', texto: 'Negocios', icono: Store },
  { ruta: '/administracion/configuracion', texto: 'Configuración', icono: Settings },
]

// El panel del administrador: título, pestañas y la sección elegida.
const AdminLayout = () => {
  const { sesion, cerrar } = useSesion()
  const navigate = useNavigate()

  const salir = () => {
    cerrar()
    navigate('/')
  }

  return (
    <main className="contenedor pagina motor-admin">
      <TituloDePagina titulo="Administración" />
      <div className="panel-titulo">
        <div>
          <span className="sobretitulo">SABORES DE NUESTRA COSTA · ADMINISTRACIÓN</span>
          <h1>Tu mesa de trabajo.</h1>
          <p>Fuentes reales, decisiones tuyas y una historia para cada dato.</p>
        </div>
        <div className="motor-status">
          {sesion?.usuario?.nombre ?? 'Administración'}
          <button type="button" className="boton-texto" onClick={salir}>
            <LogOut size={15} />
            Cerrar sesión
          </button>
        </div>
      </div>
      <nav className="motor-tabs" aria-label="Secciones de administración">
        {SECCIONES.map(({ ruta, texto, icono: Icono, exacta }) => (
          <NavLink key={ruta} to={ruta} end={exacta} className={({ isActive }) => (isActive ? 'activo' : '')}>
            <Icono size={17} />
            {texto}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </main>
  )
}

export default AdminLayout
