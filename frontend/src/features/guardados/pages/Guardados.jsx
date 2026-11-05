import { ArrowRight, Heart } from 'lucide-react'
import { Link } from 'react-router'
import { obtenerNegocio } from '../../../shared/api/negocios.api.js'
import EstadoCarga from '../../../shared/components/EstadoCarga.jsx'
import Migas from '../../../shared/components/Migas.jsx'
import Tarjeta from '../../../shared/components/Tarjeta.jsx'
import TituloDePagina from '../../../shared/components/TituloDePagina.jsx'
import Vacio from '../../../shared/components/Vacio.jsx'
import { useCargarDatos } from '../../../shared/hooks/useCargarDatos.js'
import { useFavoritos } from '../../../shared/hooks/useFavoritos.js'

// Las fichas guardadas. Las que ya no están publicadas (se retiraron) no aparecen.
const cargarGuardados = async (slugs) => {
  const fichas = await Promise.allSettled(slugs.map(obtenerNegocio))
  return fichas.filter((f) => f.status === 'fulfilled').map((f) => f.value)
}

const Guardados = () => {
  const { favoritos } = useFavoritos()
  const { datos, error, recargar } = useCargarDatos(() => cargarGuardados(favoritos), [favoritos.join()])

  // Al quitar un corazón la tarjeta desaparece enseguida, sin esperar la recarga.
  const guardados = datos?.filter((n) => favoritos.includes(n.slug))

  return (
    <main className="contenedor pagina">
      <TituloDePagina titulo="Mis guardados" />
      <Migas items={[{ texto: 'Mis guardados' }]} />
      <div className="encabezado-pagina">
        <span className="sobretitulo">PARA VOLVER CUANDO QUIERAS</span>
        <h1>Tu lista de buenos planes.</h1>
        <p>Esos lugares que te gustaron, todos juntos. Se guardan en este navegador.</p>
      </div>
      {!guardados ? (
        <EstadoCarga error={error} onReintentar={recargar} />
      ) : guardados.length ? (
        <div className="grilla-tarjetas">
          {guardados.map((n) => (
            <Tarjeta key={n.slug} negocio={n} />
          ))}
        </div>
      ) : (
        <Vacio
          icono={Heart}
          titulo="Tu próximo favorito te está esperando"
          texto="Tocá el corazón de un lugar para sumarlo a tu lista y encontrarlo fácilmente después."
        >
          <Link to="/explorar" className="boton boton-naranja">
            Descubrir lugares <ArrowRight size={16} />
          </Link>
        </Vacio>
      )}
    </main>
  )
}

export default Guardados
