import { ArrowLeft, ArrowRight, CircleHelp, MapPin, Sparkles, Store } from 'lucide-react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { buscarNegocios, obtenerNegocio } from '../../../shared/api/negocios.api.js'
import BotonFavorito from '../../../shared/components/BotonFavorito.jsx'
import EstadoCarga from '../../../shared/components/EstadoCarga.jsx'
import Migas from '../../../shared/components/Migas.jsx'
import Tarjeta from '../../../shared/components/Tarjeta.jsx'
import TituloDePagina from '../../../shared/components/TituloDePagina.jsx'
import { fechaCorta, signosDePrecio } from '../../../shared/formato.js'
import { useCargarDatos } from '../../../shared/hooks/useCargarDatos.js'
import NoEncontrado from '../../informacion/pages/NoEncontrado.jsx'
import Carta from '../components/Carta.jsx'
import Contacto from '../components/Contacto.jsx'
import GaleriaFotos from '../components/GaleriaFotos.jsx'
import Prestaciones from '../components/Prestaciones.jsx'

// Lo que se avisa arriba de la ficha si el negocio no está abierto como siempre.
const AVISOS_DE_ESTADO = {
  CERRADO: 'Cierre informado y verificado editorialmente.',
  TEMPORALMENTE_CERRADO: 'Cerrado temporalmente según la fuente revisada.',
  SIN_CONFIRMAR: 'La actividad actual del negocio necesita confirmación. Consultá la fuente antes de acercarte.',
}

// La ficha y hasta tres de la misma categoría para "También te pueden gustar".
// Si no existe (o no está publicada), noExiste: se muestra la página de "no encontrado".
const cargarFicha = async (slug) => {
  const negocio = await obtenerNegocio(slug).catch((e) => {
    if (e.status === 404) return null
    throw e
  })
  if (!negocio) return { slug, noExiste: true }
  const parecidos = await buscarNegocios({ categoria: negocio.categoria.clave })
  return { negocio, relacionados: parecidos.negocios.filter((n) => n.slug !== slug).slice(0, 3) }
}

const FichaNegocio = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  // Si se llegó desde otra página del sitio (key distinta de 'default'), "Volver" va atrás y
  // deja la lista como estaba (localidad, filtros y lugar); si se entró directo, va a la categoría.
  const vieneDelSitio = useLocation().key !== 'default'
  const { datos, error, recargar } = useCargarDatos(() => cargarFicha(slug), [slug])

  // Mientras llega otra ficha (al tocar un "También te pueden gustar") no se muestra la anterior.
  const vigente = datos && (datos.slug ?? datos.negocio.slug) === slug
  if (!vigente) return <EstadoCarga error={error} onReintentar={recargar} />
  if (datos.noExiste) return <NoEncontrado />

  const { negocio: n, relacionados } = datos
  // Varias fotos si la ficha las trae (fotos); si no, la única de siempre (foto).
  const fotos = n.fotos?.length ? n.fotos : n.foto ? [n.foto] : []

  return (
    <main className="contenedor pagina detalle">
      <TituloDePagina
        titulo={`${n.nombre} en ${n.localidad.nombre}`}
        descripcion={`${n.descripcion} Descubrí su propuesta en ${n.localidad.nombre}, La Costa.`}
      />
      <Migas items={[{ to: `/categoria/${n.categoria.clave}`, texto: n.categoria.nombre }, { texto: n.nombre }]} />
      <div className="detalle-encabezado">
        <div>
          <span className="sobretitulo">
            {n.categoria.nombre}
            {n.precio && ` · ${signosDePrecio(n.precio)}`}
          </span>
          <h1>
            {n.nombre}{' '}
            {n.destacado && (
              <span className="distintivo">
                <Sparkles size={12} />
                Destacado
              </span>
            )}
          </h1>
          <p className="detalle-localidad">
            <MapPin size={16} />
            {n.localidad.nombre}
            {/* Solo en el celular, a la derecha de la localidad (las migas ahí son chiquitas). */}
            <Link
              to={`/categoria/${n.categoria.clave}`}
              className="volver"
              onClick={(e) => {
                if (!vieneDelSitio) return
                e.preventDefault()
                navigate(-1)
              }}
            >
              <ArrowLeft size={14} />
              Volver
            </Link>
          </p>
        </div>
        <BotonFavorito slug={n.slug} grande />
      </div>

      {fotos.length ? (
        <GaleriaFotos key={n.slug} fotos={fotos} nombre={n.nombre} />
      ) : (
        <div className="real-no-gallery">
          <Store size={38} strokeWidth={1.1} />
          <span>La ficha todavía no tiene fotografías autorizadas.</span>
        </div>
      )}

      <div className="detalle-disposicion">
        <div>
          {AVISOS_DE_ESTADO[n.estadoComercial] && (
            <div className="motor-notice">
              <CircleHelp size={20} />
              <p>{AVISOS_DE_ESTADO[n.estadoComercial]}</p>
            </div>
          )}
          <section className="detalle-seccion">
            <span className="sobretitulo">UN LUGAR CON HISTORIA</span>
            <h2>El gusto de estar acá</h2>
            <p>{n.descripcion}</p>
            <p className="real-date">
              Información revisada el {fechaCorta(n.actualizadoEn)}. Solo se muestran datos aprobados.
            </p>
          </section>
          {n.prestaciones.length > 0 && <Prestaciones prestaciones={n.prestaciones} />}
          {n.carta.length > 0 && <Carta carta={n.carta} revisadaEl={n.actualizadoEn} />}
        </div>
        <Contacto negocio={n} />
      </div>

      {relacionados.length > 0 && (
        <section className="seccion">
          <div className="titulo-seccion">
            <div>
              <span className="sobretitulo">SEGUÍ DESCUBRIENDO</span>
              <h2>También te pueden gustar</h2>
            </div>
            <Link to={`/categoria/${n.categoria.clave}`} className="enlace-flecha">
              Ver más <ArrowRight size={17} />
            </Link>
          </div>
          <div className="grilla-tarjetas">
            {relacionados.map((r) => (
              <Tarjeta key={r.slug} negocio={r} />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

export default FichaNegocio
