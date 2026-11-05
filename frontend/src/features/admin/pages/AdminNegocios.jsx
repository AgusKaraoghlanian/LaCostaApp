import { ArrowRight, Plus, Search, Store } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import EstadoCarga from '../../../shared/components/EstadoCarga.jsx'
import Paginacion from '../../../shared/components/Paginacion.jsx'
import { useCargarDatos } from '../../../shared/hooks/useCargarDatos.js'
import { listarNegocios } from '../api/admin.api.js'
import { SinNegocios } from '../components/Piezas.jsx'

// Todas las fichas (publicadas o no), buscando por nombre.
const AdminNegocios = () => {
  const [texto, setTexto] = useState('')
  const [pagina, setPagina] = useState(1)
  const { datos, error, recargar } = useCargarDatos(() => listarNegocios({ texto, pagina }), [texto, pagina])

  return (
    <>
      <div className="panel-subtitulo">
        <h2>Los lugares de nuestra Costa</h2>
        <Link to="/administracion/negocios/nuevo" className="boton boton-naranja">
          <Plus size={16} />
          Agregar negocio
        </Link>
      </div>
      <div className="buscador-listado">
        <Search size={18} />
        <input
          aria-label="Buscar negocio"
          placeholder="Buscar por nombre"
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value)
            setPagina(1)
          }}
        />
      </div>
      {!datos ? (
        <EstadoCarga error={error} onReintentar={recargar} />
      ) : (
        <>
          {datos.negocios.map((n) => (
            <div className="motor-list-row" key={n.id}>
              <span className="motor-row-icon">
                <Store size={22} />
              </span>
              <div>
                <strong>{n.nombre}</strong>
                <small>
                  {n.localidad} · {n.categoria}
                </small>
              </div>
              <span className={`estado ${n.publicado ? 'estado-aprobado' : 'estado-pendiente'}`}>
                {n.publicado ? 'Publicado' : 'Sin publicar'}
              </span>
              <Link to={`/administracion/negocios/${n.id}`} className="boton boton-borde">
                Abrir <ArrowRight size={14} />
              </Link>
            </div>
          ))}
          {!datos.negocios.length && (
            <SinNegocios
              titulo={texto ? 'No hay negocios con ese nombre' : 'Empezamos con datos reales'}
              texto={
                texto
                  ? 'Probá con otra parte del nombre.'
                  : 'Todavía no hay fichas. Agregá un lugar: queda como borrador hasta que lo apruebes y publiques.'
              }
            />
          )}
          <Paginacion pagina={datos.pagina} total={datos.total} porPagina={datos.porPagina} onCambiar={setPagina} />
        </>
      )}
    </>
  )
}

export default AdminNegocios
