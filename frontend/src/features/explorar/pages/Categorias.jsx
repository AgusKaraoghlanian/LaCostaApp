import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'
import IconoCategoria from '../../../shared/components/IconoCategoria.jsx'
import Migas from '../../../shared/components/Migas.jsx'
import TituloDePagina from '../../../shared/components/TituloDePagina.jsx'
import { useCatalogo } from '../../../shared/hooks/useCatalogo.jsx'

const Categorias = () => {
  const { categorias } = useCatalogo()

  return (
    <main className="contenedor pagina">
      <TituloDePagina titulo="Todos los sabores" />
      <Migas items={[{ texto: 'Categorías' }]} />
      <div className="encabezado-pagina">
        <span className="sobretitulo">PARA TODOS LOS ANTOJOS</span>
        <h1>Cada sabor tiene su lugar.</h1>
        <p>Descubrí La Costa por lo que más te gusta comer.</p>
      </div>
      <div className="grilla-categorias">
        {categorias.map((c) => (
          <Link to={`/categoria/${c.clave}`} key={c.id} className="categoria-grande" style={{ background: c.color }}>
            <IconoCategoria icono={c.icono} size={36} strokeWidth={1.3} />
            <h2>{c.nombre}</h2>
            <p>{c.descripcion || 'Propuestas para descubrir'}.</p>
            <span>
              {c.negocios} lugares para descubrir <ArrowUpRight size={18} />
            </span>
          </Link>
        ))}
      </div>
    </main>
  )
}

export default Categorias
