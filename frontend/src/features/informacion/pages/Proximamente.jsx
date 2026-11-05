import { ArrowRight, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router'
import TituloDePagina from '../../../shared/components/TituloDePagina.jsx'

// "Sumá tu lugar" y "Reclamar mi negocio" todavía no están: por ahora las fichas las carga
// el administrador después de verificarlas.
const Proximamente = ({ titulo, pestana }) => (
  <main className="contenedor pagina">
    <TituloDePagina titulo={pestana} />
    <div className="estado-vacio">
      <span>
        <ShieldCheck size={30} />
      </span>
      <h2>{titulo}</h2>
      <p>
        Por ahora cada ficha la carga el equipo de la guía después de verificarla. Las propuestas de los
        negocios y las cuentas de propietarios se van a habilitar más adelante.
      </p>
      <Link to="/explorar" className="boton boton-naranja">
        Explorar lugares <ArrowRight size={15} />
      </Link>
    </div>
  </main>
)

export default Proximamente
