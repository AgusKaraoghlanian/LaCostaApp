import { Waves } from 'lucide-react'

// Lo que va detrás del texto en una tarjeta de localidad (PanelLocalidades): la foto con la
// capa de color encima o, si no tiene foto, solo la ilustración.
// foto es la de FOTOS_LOCALIDADES (costa.js).
const FondoLocalidad = ({ foto }) => (
  <>
    {foto && (
      <>
        <img src={foto.foto} alt="" loading="lazy" style={{ objectPosition: foto.posicion }} />
        <span className="localidad-tinte" aria-hidden="true" />
      </>
    )}
    <span className="localidad-ilustracion" aria-hidden="true">
      <Waves size={120} strokeWidth={0.8} />
    </span>
  </>
)

export default FondoLocalidad
