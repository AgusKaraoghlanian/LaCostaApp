import { ArrowUpRight, Clock, Facebook, Globe, Instagram, Mail, MapPin, Phone, Utensils } from 'lucide-react'
import { NOMBRES_DE_PRECIO, resumenDeHorarios, signosDePrecio } from '../../../shared/formato.js'

// Un canal del negocio (WhatsApp, web, redes) como botón-ícono, en otra pestaña. El nombre va
// en aria-label (lectores de pantalla) y en title (cartelito al pasar el mouse).
const CanalIcono = ({ href, nombre, Icono, clase = '', tamano = 20 }) => (
  <a
    className={`canal-icono ${clase}`.trim()}
    href={href}
    target="_blank"
    rel="noreferrer"
    aria-label={nombre}
    title={nombre}
  >
    <Icono size={tamano} aria-hidden="true" />
  </a>
)

// El logo de WhatsApp (globo verde con el tubo blanco, sobre su borde blanco), dibujado acá
// para no sumar una dependencia. Recibe size como los íconos de lucide.
const LogoWhatsApp = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
    <path
      d="M24 3C12.4 3 3 12.4 3 24c0 3.8 1 7.4 2.8 10.5L3 45l10.8-2.8A21 21 0 0 0 24 45c11.6 0 21-9.4 21-21S35.6 3 24 3z"
      fill="#fff"
      stroke="#e3e3e3"
      strokeWidth="1.5"
    />
    <path
      d="M24 6.5C14.3 6.5 6.5 14.3 6.5 24c0 3.4 1 6.6 2.7 9.3L7.6 40.4l7.3-1.9A17.4 17.4 0 0 0 24 41.5c9.7 0 17.5-7.8 17.5-17.5S33.7 6.5 24 6.5z"
      fill="#4cae50"
    />
    <path
      transform="translate(14.6 14.2) scale(0.8)"
      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
      fill="#fff"
    />
  </svg>
)

// WhatsApp del negocio: el que cargó o, si no, su teléfono (wa.me con el número argentino:
// sin el 0 de la característica y con 549 adelante).
const enlaceWhatsApp = (n) => {
  if (n.whatsapp) return n.whatsapp
  let numero = (n.telefono ?? '').replace(/\D/g, '')
  if (!numero) return null
  if (!numero.startsWith('54')) numero = `549${numero.replace(/^0/, '')}`
  return `https://wa.me/${numero}`
}

// Facebook del negocio: el que cargó o, si no, la búsqueda de su nombre en Facebook.
const enlaceFacebook = (n) =>
  n.facebook || `https://www.facebook.com/search/top?q=${encodeURIComponent(`${n.nombre} ${n.localidad.nombre}`)}`

// La columna de la derecha de la ficha: dónde está, horarios, contacto y precio. Sin el
// "Armá tu próximo plan" ni el "¿Este es tu negocio?" de la demo: la ficha informa, no invita
// a reservar ni a reclamarla. Llamar, web e Instagram aparecen si el negocio los publicó;
// WhatsApp (con su teléfono) y Facebook (con una búsqueda) van siempre que se pueda.
const Contacto = ({ negocio: n }) => {
  const horarios = resumenDeHorarios(n.horarios, n.horariosEspeciales)
  const partido = n.localidad.partido?.replace(/^Partido de /, '') ?? 'La Costa'
  // Google Maps en la dirección del negocio (si no la tiene, en la localidad).
  const lugarEnMapa = [n.direccion || n.zonaAtencion, n.localidad.nombre, n.localidad.partido, n.localidad.provincia]
    .filter(Boolean)
    .join(', ')
  const enlaceMapa = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lugarEnMapa)}`
  const whatsapp = enlaceWhatsApp(n)

  return (
    <aside>
      <div className="contacto-tarjeta">
        <div className="canales-contacto">
          {n.telefono && (
            <a className="boton boton-naranja canal-llamar" href={`tel:${n.telefono}`}>
              <Phone size={16} aria-hidden="true" />
              Llamar
            </a>
          )}
          {whatsapp && (
            <CanalIcono href={whatsapp} nombre="WhatsApp" Icono={LogoWhatsApp} clase="canal-whatsapp" tamano={30} />
          )}
          {n.web && <CanalIcono href={n.web} nombre="Sitio oficial" Icono={Globe} />}
          {n.instagram && <CanalIcono href={n.instagram} nombre="Instagram" Icono={Instagram} />}
          <CanalIcono href={enlaceFacebook(n)} nombre="Facebook" Icono={Facebook} />
        </div>
        <hr />
        {/* El ícono, el título y la dirección abren la dirección en Google Maps. */}
        <div className="dato-contacto">
          <a
            className="dato-mapa-icono"
            href={enlaceMapa}
            target="_blank"
            rel="noreferrer"
            aria-hidden="true"
            tabIndex={-1}
          >
            <MapPin size={22} />
          </a>
          <div>
            <a className="dato-mapa" href={enlaceMapa} target="_blank" rel="noreferrer" title="Ver en Google Maps">
              <strong>Dónde estamos</strong>
              <span>
                {n.direccion || n.zonaAtencion || 'Dirección no informada'}
                <br />
                {n.localidad.nombre}, {partido}
              </span>
            </a>
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
          <Clock size={22} />
          <div>
            <strong>Horarios informados</strong>
            <span>{horarios || 'No informados'}</span>
            {n.horariosTexto && <span>{n.horariosTexto}</span>}
          </div>
        </div>
        <div className="dato-contacto">
          <Mail size={22} />
          <div>
            <strong>Contacto</strong>
            <span>Usá los canales publicados por el negocio.</span>
          </div>
        </div>
        {n.precio && (
          <div className="dato-contacto">
            <Utensils size={22} />
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
