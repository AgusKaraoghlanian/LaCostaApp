import { ArrowUpRight, Heart, Menu, Plus, Users, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { useSesion } from '../hooks/useSesion.js'
import Logo from './Logo.jsx'

// NavLink marca "seleccionado" la sección en la que se está.
const claseSeccion = ({ isActive }) => (isActive ? 'seleccionado' : '')

const Cabecera = () => {
  const { pathname } = useLocation()
  const { sesion } = useSesion()
  const [menu, setMenu] = useState(false)

  return (
    <header className="cabecera">
      <div className="contenedor cabecera-interior">
        <Logo />
        {/* En el celular, el menú se cierra al elegir una sección. */}
        <nav
          className={menu ? 'navegacion abierta' : 'navegacion'}
          aria-label="Navegación principal"
          onClick={() => setMenu(false)}
        >
          <NavLink to="/explorar" className={claseSeccion}>
            Descubrir lugares
          </NavLink>
          {/* /categorias y /categoria/parrillas marcan la misma sección. */}
          <Link to="/categorias" className={pathname.startsWith('/categoria') ? 'seleccionado' : ''}>
            Categorías
          </Link>
          <Link to="/sobre-la-costa">
            Nuestra Costa <ArrowUpRight size={13} />
          </Link>
        </nav>
        <div className="acciones-cabecera">
          <Link to="/guardados" className="enlace-guardados" aria-label="Mis guardados">
            <Heart size={17} />
            <span>Mis guardados</span>
          </Link>
          <Link to="/sumar-lugar" className="boton boton-oscuro boton-chico">
            <Plus size={15} />
            Sumá tu lugar
          </Link>
          <Link
            to={sesion ? '/administracion' : '/ingresar'}
            className="acceso"
            aria-label={sesion ? 'Ir a la administración' : 'Ingresar a mi cuenta'}
          >
            <Users size={18} />
          </Link>
          <button
            type="button"
            className="menu-movil"
            aria-label="Abrir menú"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Cabecera
