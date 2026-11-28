import { Check, Inbox, Mail, MailWarning, Phone, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import EstadoCarga from '../../../shared/components/EstadoCarga.jsx'
import Paginacion from '../../../shared/components/Paginacion.jsx'
import { useAccion } from '../../../shared/hooks/useAccion.js'
import { useCargarDatos } from '../../../shared/hooks/useCargarDatos.js'
import { listarSolicitudes, marcarSolicitud } from '../api/admin.api.js'
import { SinNegocios } from '../components/Piezas.jsx'

const TIPOS = { SUMAR: 'Quiere sumarse', RECLAMAR: 'Reclama su ficha' }

const fecha = (iso) =>
  new Date(iso).toLocaleString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

// WhatsApp con el celular tal como lo escribieron: si no trae código de país, se asume Argentina.
const whatsapp = (celular) => {
  const digitos = celular.replace(/\D/g, '')
  return `https://wa.me/${celular.trim().startsWith('+') || digitos.startsWith('54') ? digitos : `549${digitos}`}`
}

// Lo que llega del formulario "Sumá tu lugar" / "Reclamar mi negocio" del sitio.
const AdminSolicitudes = () => {
  const [pagina, setPagina] = useState(1)
  const { datos, error, recargar } = useCargarDatos(() => listarSolicitudes({ pagina }), [pagina])
  const { ejecutar, enviando, error: errorAccion } = useAccion()

  const marcar = async (id, atendida) => {
    if (await ejecutar(() => marcarSolicitud(id, atendida))) recargar()
  }

  return (
    <div className="solicitudes-admin">
      <div className="panel-subtitulo">
        <h2>Negocios que quieren sumarse</h2>
        {datos && <span className="estado estado-pendiente">{datos.pendientes} sin atender</span>}
      </div>
      {errorAccion && <div className="motor-notice error">{errorAccion}</div>}
      {!datos ? (
        <EstadoCarga error={error} onReintentar={recargar} />
      ) : (
        <>
          {datos.solicitudes.map((s) => (
            <div className={`motor-list-row ${s.atendida ? 'solicitud-atendida' : ''}`} key={s.id}>
              <span className="motor-row-icon">
                <Inbox size={22} />
              </span>
              <div>
                <strong>{s.nombreNegocio}</strong>
                <small>
                  {TIPOS[s.tipo]} · {fecha(s.creadaEn)}
                  {!s.correoEnviado && (
                    <span className="solicitud-sin-correo" title="El aviso por correo no salió">
                      <MailWarning size={14} /> sin aviso por correo
                    </span>
                  )}
                </small>
                <span className="solicitud-contacto">
                  <a href={whatsapp(s.celular)} target="_blank" rel="noreferrer">
                    <Phone size={14} /> {s.celular}
                  </a>
                  <a href={`mailto:${s.email}`}>
                    <Mail size={14} /> {s.email}
                  </a>
                </span>
              </div>
              <span className={`estado ${s.atendida ? 'estado-aprobado' : 'estado-pendiente'}`}>
                {s.atendida ? 'Atendida' : 'Sin atender'}
              </span>
              <button
                type="button"
                className="boton boton-borde"
                disabled={enviando}
                onClick={() => marcar(s.id, !s.atendida)}
              >
                {s.atendida ? <RotateCcw size={14} /> : <Check size={14} />}
                {s.atendida ? 'Volver a pendiente' : 'Marcar atendida'}
              </button>
            </div>
          ))}
          {!datos.solicitudes.length && (
            <SinNegocios
              titulo="Todavía no llegaron solicitudes"
              texto='Cuando un negocio complete "Sumá tu lugar" o "Reclamar mi negocio", aparece acá (y te llega un correo).'
            />
          )}
          <Paginacion pagina={datos.pagina} total={datos.total} porPagina={datos.porPagina} onCambiar={setPagina} />
        </>
      )}
    </div>
  )
}

export default AdminSolicitudes
