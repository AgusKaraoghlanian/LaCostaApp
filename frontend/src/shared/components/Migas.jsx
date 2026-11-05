import { ChevronRight } from 'lucide-react'
import { Fragment } from 'react'
import { Link } from 'react-router'

// "Inicio › Categoría › Negocio". items: [{ texto, to? }] (el último va sin link).
const Migas = ({ items }) => (
  <nav className="migas" aria-label="Ruta de navegación">
    <Link to="/">Inicio</Link>
    {items.map((item, i) => (
      <Fragment key={i}>
        <ChevronRight size={12} />
        {item.to ? <Link to={item.to}>{item.texto}</Link> : <span>{item.texto}</span>}
      </Fragment>
    ))}
  </nav>
)

export default Migas
