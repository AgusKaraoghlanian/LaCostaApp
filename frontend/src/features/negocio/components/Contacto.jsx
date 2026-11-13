import { ArrowUpRight, Clock, Mail, MapPin, Phone, Utensils } from 'lucide-react'
import { NOMBRES_DE_PRECIO, resumenDeHorarios, signosDePrecio } from '../../../shared/formato.js'

// Un botón a un canal del negocio (WhatsApp, web, redes), en otra pestaña.
const EnlaceExterno = ({ href, children }) => (
  <a className="boton boton-borde ancho" href={href} target="_blank" rel="noreferrer">
    {children} <ArrowUpRight size={15} />
  </a>
)

// La columna de la derecha de la ficha: dónde está, horarios, contacto y precio. Sin el
// "Armá tu próximo plan" ni el "¿Este es tu negocio?" de la demo: la ficha informa, no invita
// a reservar ni a reclamarla. Los botones (llamar, WhatsApp, redes) aparecen solo si el
// negocio publicó esos canales.
const Contacto = ({ negocio: n }) => {
  const horarios = resumenDeHorarios(n.horarios, n.horariosEspeciales)
  const partido = n.localidad.partido?.replace(/^Partido de /, '') ?? 'La Costa'
  const hayCanales = n.telefono || n.whatsapp || n.web || n.instagram || n.facebook

  return (
    <aside>
      <div className="contacto-tarjeta">
        {hayCanales && (
          <div className="botones-juntos">
            {n.telefono && (
              <a className="boton boton-naranja ancho" href={`tel:${n.telefono}`}>
                <Phone size={16} />
                Llamar al negocio
              </a>
            )}
            {n.whatsapp && <EnlaceExterno href={n.whatsapp}>WhatsApp</EnlaceExterno>}
            {n.web && <EnlaceExterno href={n.web}>Visitar sitio oficial</EnlaceExterno>}
            {n.instagram && <EnlaceExterno href={n.instagram}>Instagram</EnlaceExterno>}
            {n.facebook && <EnlaceExterno href={n.facebook}>Facebook</EnlaceExterno>}
          </div>
        )}
        {hayCanales && <hr />}
        <div className="dato-contacto">
          <MapPin size={19} />
          <div>
            <strong>Dónde estamos</strong>
            <span>
              {n.direccion || n.zonaAtencion || 'Dirección no informada'}
              <br />
              {n.localidad.nombre}, {partido}
            </span>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${n.localidad.nombre}, ${n.localidad.partido ?? ''}, ${n.localidad.provincia ?? ''}`,
              )}`}
              target="_blank"
              rel="noreferrer"
            >
              Explorar la localidad <ArrowUpRight size={12} />
            </a>
          </div>
        </div>
        <div className="dato-contacto">
          <Clock size={19} />
          <div>
            <strong>Horarios informados</strong>
            <span>{horarios || 'No informados'}</span>
            {n.horariosTexto && <span>{n.horariosTexto}</span>}
          </div>
        </div>
        <div className="dato-contacto">
          <Mail size={19} />
          <div>
            <strong>Contacto</strong>
            <span>{hayCanales ? 'Usá los canales publicados por el negocio.' : 'El negocio todavía no publicó un canal de contacto.'}</span>
          </div>
        </div>
        {n.precio && (
          <div className="dato-contacto">
            <Utensils size={19} />
            <div>
              <strong>Precio orientativo</strong>
              <span>
                {signosDePrecio(n.precio)} · {NOMBRES_DE_PRECIO[n.precio]}
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}

export default Contacto
