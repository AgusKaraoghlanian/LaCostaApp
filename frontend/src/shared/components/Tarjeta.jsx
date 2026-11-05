import { ArrowUpRight, Leaf, MapPin, Sparkles, Store, Sun, Utensils } from 'lucide-react'
import { Link } from 'react-router'
import { signosDePrecio } from '../formato.js'
import BotonFavorito from './BotonFavorito.jsx'

// Lo que se destaca abajo de la tarjeta: al aire libre, vegetariano o, si no, sabores locales.
const Destacado = ({ prestaciones }) => {
  if (prestaciones.includes('Mesas al aire libre')) {
    return (
      <>
        <Sun size={13} />
        Al aire libre
      </>
    )
  }
  if (prestaciones.includes('Opciones vegetarianas')) {
    return (
      <>
        <Leaf size={13} />
        Opciones vegetarianas
      </>
    )
  }
  return (
    <>
      <Utensils size={13} />
      Sabores locales
    </>
  )
}

// Un negocio en los listados. negocio es lo que devuelve GET /negocios.
const Tarjeta = ({ negocio: n }) => {
  const ficha = `/lugar/${n.slug}`

  return (
    <article className="tarjeta">
      <Link to={ficha} className="tarjeta-foto">
        {n.foto ? (
          <img src={n.foto} alt={`${n.nombre}: ${n.categoria.nombre} en ${n.localidad.nombre}`} loading="lazy" />
        ) : (
          <div className="tarjeta-sin-foto">
            <Store size={35} strokeWidth={1.1} />
            <span>Un lugar para descubrir</span>
          </div>
        )}
        {n.destacado && (
          <span className="distintivo">
            <Sparkles size={12} /> Destacado
          </span>
        )}
      </Link>
      <BotonFavorito slug={n.slug} />
      <div className="tarjeta-cuerpo">
        <div className="tarjeta-meta">
          <Link to={`/categoria/${n.categoria.clave}`}>{n.categoria.nombre}</Link>
          <span>{signosDePrecio(n.precio)}</span>
        </div>
        <div className="tarjeta-titulo">
          <h3>
            <Link to={ficha}>{n.nombre}</Link>
          </h3>
        </div>
        <p className="ubicacion">
          <MapPin size={13} />
          {n.localidad.nombre}
        </p>
        <p className="tarjeta-descripcion">{n.descripcion}</p>
        <div className="tarjeta-pie">
          <span>
            <Destacado prestaciones={n.prestaciones} />
          </span>
          <Link to={ficha} aria-label={`Conocer ${n.nombre}`}>
            <ArrowUpRight size={19} />
          </Link>
        </div>
      </div>
    </article>
  )
}

export default Tarjeta
