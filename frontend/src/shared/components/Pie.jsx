import { Waves } from 'lucide-react'
import { Link } from 'react-router'
import Logo from './Logo.jsx'

const ANIO = new Date().getFullYear()

const Pie = () => (
  <footer className="pie">
    <div className="contenedor">
      <div className="pie-arriba">
        <div>
          <Logo />
          <p>
            Los sabores, las historias y los lugares
            <br />
            que hacen única a nuestra Costa.
          </p>
          <span className="hecho">
            <Waves size={15} />
            Hecho con amor por lo local.
          </span>
        </div>
        <div>
          <strong>A descubrir</strong>
          <Link to="/explorar">Todos los lugares</Link>
          <Link to="/categorias">Categorías</Link>
          <Link to="/guardados">Mis guardados</Link>
        </div>
        <div>
          <strong>Para tu negocio</strong>
          <Link to="/sumar-lugar">Sumar un lugar</Link>
          <Link to="/reclamar">Reclamar mi negocio</Link>
          <Link to="/administracion">Mi panel</Link>
        </div>
        <div>
          <strong>Conocenos</strong>
          <Link to="/sobre-la-costa">Nuestra Costa</Link>
          <Link to="/como-funciona">Cómo funciona</Link>
          <Link to="/administracion">Administración</Link>
        </div>
      </div>
      <div className="pie-abajo">
        <span>© {ANIO} Costa a la carta. Cada sabor, una historia.</span>
        <span>Información revisada, con fuentes y decisiones editoriales.</span>
      </div>
    </div>
  </footer>
)

export default Pie
