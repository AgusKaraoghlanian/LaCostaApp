import { apiFetch } from '../../../config/http.js'

// tipo: 'SUMAR' o 'RECLAMAR'. Guarda la solicitud y avisa por correo al equipo de la guía.
// sitioWeb es la trampa para bots: una persona lo deja vacío (el campo no se ve).
export const enviarSolicitud = ({ tipo, nombreNegocio, celular, email, sitioWeb }) =>
  apiFetch('/solicitudes', { method: 'POST', body: { tipo, nombreNegocio, celular, email, sitioWeb } })
