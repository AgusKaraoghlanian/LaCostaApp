import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import AdminLayout from './features/admin/components/AdminLayout.jsx'
import AdminConfiguracion from './features/admin/pages/AdminConfiguracion.jsx'
import AdminInicio from './features/admin/pages/AdminInicio.jsx'
import AdminNegocios from './features/admin/pages/AdminNegocios.jsx'
import FichaAdmin from './features/admin/pages/FichaAdmin.jsx'
import Login from './features/auth/pages/Login.jsx'
import Categorias from './features/explorar/pages/Categorias.jsx'
import Explorar from './features/explorar/pages/Explorar.jsx'
import Guardados from './features/guardados/pages/Guardados.jsx'
import Informacion from './features/informacion/pages/Informacion.jsx'
import NoEncontrado from './features/informacion/pages/NoEncontrado.jsx'
import Proximamente from './features/informacion/pages/Proximamente.jsx'
import Inicio from './features/inicio/pages/Inicio.jsx'
import FichaNegocio from './features/negocio/pages/FichaNegocio.jsx'
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
            <Route
              path="/sumar-lugar"
              element={<Proximamente titulo="Tu negocio merece ser descubierto." pestana="Sumá tu lugar" />}
            />
            <Route
              path="/reclamar"
              element={<Proximamente titulo="Tu ficha, en buenas manos." pestana="Reclamar mi negocio" />}
            />
            <Route path="/ingresar" element={<Login />} />
            <Route path="/mi-negocio" element={<Navigate to="/administracion" replace />} />

            {/* El panel: solo con sesión de administrador. */}
            <Route element={<RutaProtegida />}>
              <Route path="/administracion" element={<AdminLayout />}>
                <Route index element={<AdminInicio />} />
                <Route path="negocios" element={<AdminNegocios />} />
                <Route path="negocios/:id" element={<FichaAdmin />} />
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
