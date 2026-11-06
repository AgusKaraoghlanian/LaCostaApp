import { ArrowRight, Store } from 'lucide-react'

// Piezas chicas del panel, como las de la versión anterior.

export const Metrica = ({ valor, texto, icono: Icono }) => (
  <div className="metrica">
    <span>
      <Icono size={22} />
    </span>
    <div>
      <strong>{valor}</strong>
      <small>{texto}</small>
    </div>
  </div>
)

export const TarjetaDeAccion = ({ icono: Icono, titulo, texto, onClick }) => (
  <button type="button" className="motor-action-card" onClick={onClick}>
    <span>
      <Icono size={24} />
    </span>
    <h3>{titulo}</h3>
    <p>{texto}</p>
    <ArrowRight size={19} />
  </button>
)

export const SinNegocios = ({ titulo, texto }) => (
  <div className="estado-vacio">
    <span>
      <Store size={30} />
    </span>
    <h2>{titulo}</h2>
    <p>{texto}</p>
  </div>
)
