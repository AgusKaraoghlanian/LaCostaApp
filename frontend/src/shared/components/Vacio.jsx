import { Compass } from 'lucide-react'

// El cartel de "no hay nada acá" (sin resultados, sin guardados, página que no existe).
const Vacio = ({ icono: Icono = Compass, titulo, texto, children }) => (
  <div className="estado-vacio">
    <span>
      <Icono size={32} strokeWidth={1.4} />
    </span>
    <h2>{titulo}</h2>
    <p>{texto}</p>
    {children}
  </div>
)

export default Vacio
