import { ArrowRight, ArrowUpRight, Utensils } from 'lucide-react'
import { Link } from 'react-router'
import { buscarNegocios } from '../../../shared/api/negocios.api.js'
import IconoCategoria from '../../../shared/components/IconoCategoria.jsx'
import Tarjeta from '../../../shared/components/Tarjeta.jsx'
import TituloDePagina from '../../../shared/components/TituloDePagina.jsx'
import { useCargarDatos } from '../../../shared/hooks/useCargarDatos.js'
import { useCatalogo } from '../../../shared/hooks/useCatalogo.jsx'
import Buscador from '../components/Buscador.jsx'
import CarruselLocalidades from '../components/CarruselLocalidades.jsx'
import PanelLocalidades from '../components/PanelLocalidades.jsx'
import CarruselPortada from '../components/CarruselPortada.jsx'

// Cada parte de la portada con los negocios de su plan (lo que se elige en el admin): hasta 5 con
// foto en el carrusel de arriba, 3 en "Para poner en tu lista" y 3 en "Sabores para todos tus
// planes". Si nadie tiene el plan de "Sabores", esa sección muestra 3 cualquiera (como antes),
// para que la portada no quede vacía.
const cargarPortada = async () => {
  const [carrusel, lista, sabores] = await Promise.all([
    buscarNegocios({ plan: 'CARRUSEL' }),
    buscarNegocios({ plan: 'LISTA' }),
    buscarNegocios({ plan: 'SABORES' }),
  ])
  const otros = sabores.negocios.length ? sabores : await buscarNegocios({ destacado: false })
  return {
    carrusel: carrusel.negocios.filter((n) => n.foto).slice(0, 5),
    destacados: lista.negocios.slice(0, 3),
    otros: otros.negocios.slice(0, 3),
  }
}

// Un título de sección con su link a la derecha.
const TituloSeccion = ({ sobretitulo, titulo, bajada, link, children }) => (
  <div className="titulo-seccion">
    <div>
      <span className="sobretitulo">{sobretitulo}</span>
      <h2>{titulo}</h2>
      {bajada && <p>{bajada}</p>}
    </div>
    {link ? (
      <Link to={link.to} className="enlace-flecha">
        {link.texto} <ArrowRight size={17} />
      </Link>
    ) : (
      children
    )}
  </div>
)

const Inicio = () => {
  const { categorias, localidades } = useCatalogo()
  const { datos } = useCargarDatos(cargarPortada, [])

  return (
    <>
      <TituloDePagina />
      <section className="hero">
        <div className="contenedor hero-interior">
          <div className="hero-texto">
            <div className="etiqueta">
              <span />
              BUENOS PLANES, CERCA DEL MAR
            </div>
            <h1>
              La Costa tiene
              <br />
              mucho <em>sabor.</em>
            </h1>
            <p>
              Descubrí esos lugares a los que siempre querés volver.
              <br className="solo-escritorio" /> Buena comida, gente local y un poquito de mar.
            </p>
            <div className="hero-detalle">
              <span>
                Hecho para quienes disfrutan
                <br />
                <strong>comer bien y descubrir más.</strong>
              </span>
            </div>
          </div>
          <CarruselPortada locales={datos?.carrusel ?? []} />
          <div className="hero-buscador">
            <Buscador />
          </div>
        </div>
      </section>

      <section className="seccion categorias-inicio contenedor">
        <TituloSeccion
          sobretitulo="SEGUÍ TU ANTOJO"
          titulo="¿Qué tenés ganas de comer?"
          link={{ to: '/categorias', texto: 'Ver categorías' }}
        />
        <div className="fila-categorias">
          {categorias.map((c) => (
            <Link to={`/categoria/${c.clave}`} key={c.id} className="categoria-circulo">
              <span style={{ background: c.color }}>
                <IconoCategoria icono={c.icono} size={28} strokeWidth={1.45} />
              </span>
              <strong>{c.nombre}</strong>
              <small>{c.negocios} lugares</small>
            </Link>
          ))}
        </div>
      </section>

      {/* Sin negocios en "Para poner en tu lista" (plan LISTA), la sección no aparece. */}
      {datos?.destacados.length > 0 && (
        <section className="seccion destacados contenedor">
          <TituloSeccion
            sobretitulo="ESOS LUGARES QUE ENAMORAN"
            titulo={
              <>
                Para poner en tu lista <span className="estrellita">✳</span>
              </>
            }
            bajada="Una selección para comer rico y disfrutar sin apuro."
            link={{ to: '/explorar', texto: 'Explorar todos los lugares' }}
          />
          <div className="grilla-tarjetas">
            {datos.destacados.map((n) => (
              <Tarjeta key={n.slug} negocio={n} />
            ))}
          </div>
        </section>
      )}

      <section className="franja-localidades">
        <div className="contenedor">
          <TituloSeccion sobretitulo="CADA LOCALIDAD, UN NUEVO SABOR" titulo="Tu próximo plan, en La Costa." />
          <PanelLocalidades localidades={localidades} />
          <CarruselLocalidades localidades={localidades} />
        </div>
      </section>

      {datos?.otros.length > 0 && (
        <section className="seccion contenedor descubrimientos">
          <TituloSeccion
            sobretitulo="HAY MUCHO POR DESCUBRIR"
            titulo="Sabores para todos tus planes"
            link={{ to: '/explorar', texto: 'Encontrá tu lugar' }}
          />
          <div className="grilla-tarjetas">
            {datos.otros.map((n) => (
              <Tarjeta key={n.slug} negocio={n} />
            ))}
          </div>
        </section>
      )}

      <section className="contenedor">
        <div className="banner-negocio">
          <div className="ilustracion-plato">
            <Utensils size={45} strokeWidth={1} />
            <span>✳</span>
          </div>
          <div>
            <span className="sobretitulo">LOS BUENOS LUGARES MERECEN SER DESCUBIERTOS</span>
            <h2>¿Tu negocio tiene sabor a Costa?</h2>
            <p>Sumalo al directorio y conectá con quienes buscan su próximo lugar favorito.</p>
          </div>
          <Link to="/sumar-lugar" className="boton boton-oscuro">
            Sumá tu lugar <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
    </>
  )
}

export default Inicio
