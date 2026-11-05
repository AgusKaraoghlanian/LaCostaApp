import { Utensils } from 'lucide-react'
import { Link } from 'react-router'

const Logo = () => (
  <Link to="/" className="marca" aria-label="Costa a la carta, inicio">
    <span className="marca-icono">
      <Utensils size={24} />
    </span>
    <span>
      Costa <em>a la carta</em>
      <small>SABORES DE NUESTRA COSTA</small>
    </span>
  </Link>
)

export default Logo
