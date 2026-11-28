import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import AdminLayout from './features/admin/components/AdminLayout.jsx'
import AdminConfiguracion from './features/admin/pages/AdminConfiguracion.jsx'
import AdminInicio from './features/admin/pages/AdminInicio.jsx'
import AdminNegocios from './features/admin/pages/AdminNegocios.jsx'
import AdminSolicitudes from './features/admin/pages/AdminSolicitudes.jsx'
import FichaAdmin from './features/admin/pages/FichaAdmin.jsx'
import Login from './features/auth/pages/Login.jsx'
import Categorias from './features/explorar/pages/Categorias.jsx'
import Explorar from './features/explorar/pages/Explorar.jsx'
import Guardados from './features/guardados/pages/Guardados.jsx'
import Informacion from './features/informacion/pages/Informacion.jsx'
import NoEncontrado from './features/informacion/pages/NoEncontrado.jsx'
import Inicio from './features/inicio/pages/Inicio.jsx'
import FichaNegocio from './features/negocio/pages/FichaNegocio.jsx'
import SolicitudNegocio from './features/solicitudes/pages/SolicitudNegocio.jsx'
import RutaProtegida from './shared/components/RutaProtegida.jsx'
import SitioLayout from './shared/components/SitioLayout.jsx'
import { CatalogoProvider } from './shared/hooks/useCatalogo.jsx'

function App() {
  return (
    <BrowserRouter>
      <CatalogoProvider>
        <Routes>
          <Route element={<SitioLayout />}>
            {/* Lo público: las mismas direcciones que la demo. */}
            <Route path="/" element={<Inicio />} />
            <Route path="/explorar" element={<Explorar />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/categoria/:clave" element={<Explorar />} />
            <Route path="/lugar/:slug" element={<FichaNegocio />} />
            <Route path="/guardados" element={<Guardados />} />
            <Route path="/sobre-la-costa" element={<Informacion tipo="costa" />} />
            <Route path="/como-funciona" element={<Informacion tipo="funciona" />} />
            {/* key: al pasar de uno al otro el formulario arranca de cero. */}
            <Route path="/sumar-lugar" element={<SolicitudNegocio key="SUMAR" tipo="SUMAR" />} />
            <Route path="/reclamar" element={<SolicitudNegocio key="RECLAMAR" tipo="RECLAMAR" />} />
            <Route path="/ingresar" element={<Login />} />
            <Route path="/mi-negocio" element={<Navigate to="/administracion" replace />} />

            {/* El panel: solo con sesión de administrador. */}
            <Route element={<RutaProtegida />}>
              <Route path="/administracion" element={<AdminLayout />}>
                <Route index element={<AdminInicio />} />
                <Route path="negocios" element={<AdminNegocios />} />
                <Route path="negocios/:id" element={<FichaAdmin />} />
                <Route path="solicitudes" element={<AdminSolicitudes />} />
                <Route path="configuracion" element={<AdminConfiguracion />} />
              </Route>
            </Route>

            <Route path="*" element={<NoEncontrado />} />
          </Route>
        </Routes>
      </CatalogoProvider>
    </BrowserRouter>
  )
}

export default App
