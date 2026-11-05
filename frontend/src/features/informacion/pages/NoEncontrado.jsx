import { Compass } from 'lucide-react'
import { Link } from 'react-router'
import TituloDePagina from '../../../shared/components/TituloDePagina.jsx'
import Vacio from '../../../shared/components/Vacio.jsx'

const NoEncontrado = () => (
  <main className="contenedor pagina">
    <TituloDePagina titulo="Página no encontrada" />
    <Vacio
      icono={Compass}
      titulo="Por acá todavía no hay mesa"
      texto="No encontramos esa página. Volvé al directorio para seguir descubriendo lugares."
    >
      <Link to="/explorar" className="boton boton-naranja">
        Explorar lugares
      </Link>
    </Vacio>
  </main>
)

export default NoEncontrado
