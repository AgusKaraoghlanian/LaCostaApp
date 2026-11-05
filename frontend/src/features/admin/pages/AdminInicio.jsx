import { Eye, Globe, Plus, Settings, Store, Tags } from 'lucide-react'
import { useNavigate } from 'react-router'
import { buscarNegocios } from '../../../shared/api/negocios.api.js'
import EstadoCarga from '../../../shared/components/EstadoCarga.jsx'
import { useCargarDatos } from '../../../shared/hooks/useCargarDatos.js'
import { useCatalogo } from '../../../shared/hooks/useCatalogo.jsx'
import { listarNegocios } from '../api/admin.api.js'
import { Metrica, TarjetaDeAccion } from '../components/Piezas.jsx'

// Cuántas fichas hay en total y cuántas se ven en el sitio.
const cargarNumeros = async () => {
  const [todos, publicados] = await Promise.all([listarNegocios({}), buscarNegocios({})])
  return { total: todos.total, publicados: publicados.total }
}

const AdminInicio = () => {
  const navigate = useNavigate()
  const { categorias } = useCatalogo()
  const { datos, error, recargar } = useCargarDatos(cargarNumeros, [])

  if (!datos) return <EstadoCarga error={error} onReintentar={recargar} />

  return (
    <>
      <div className="metricas cuatro">
        <Metrica valor={datos.total} texto="Negocios cargados" icono={Store} />
        <Metrica valor={datos.publicados} texto="Fichas publicadas" icono={Globe} />
        <Metrica valor={datos.total - datos.publicados} texto="Sin publicar" icono={Eye} />
        <Metrica valor={categorias.length} texto="Categorías" icono={Tags} />
      </div>
      <div className="motor-actions">
        <TarjetaDeAccion
          icono={Plus}
          titulo="Agregar negocio"
          texto="Una ficha honesta, incluso sin carta, fotos o domicilio público."
          onClick={() => navigate('/administracion/negocios/nuevo')}
        />
        <TarjetaDeAccion
          icono={Settings}
          titulo="Categorías y localidades"
          texto="Sumá una categoría nueva o una localidad cuando la guía crezca."
          onClick={() => navigate('/administracion/configuracion')}
        />
        <TarjetaDeAccion
          icono={Eye}
          titulo="Ver el portal"
          texto="Solo se muestran revisiones que fueron aprobadas y publicadas."
          onClick={() => navigate('/explorar')}
        />
      </div>
    </>
  )
}

export default AdminInicio
