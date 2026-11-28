import * as solicitudRepository from '../repositories/solicitud.repository.js';
import * as correoRepository from '../repositories/correo.repository.js';
import { SolicitudNoEncontrada } from '../errors/solicitud/SolicitudNoEncontrada.js';
import { SOLICITUDES_POR_PAGINA, ZONA_HORARIA } from '../config/costa.js';

const QUE_PIDE = {
  SUMAR: 'quiere sumar su negocio',
  RECLAMAR: 'quiere hacerse cargo de su ficha',
};

const escaparHtml = (texto) =>
  String(texto).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const armarCorreo = (s) => {
  const fecha = s.creadaEn.toLocaleString('es-AR', { timeZone: ZONA_HORARIA, dateStyle: 'short', timeStyle: 'short' });
  const filas = [
    ['Negocio', s.nombreNegocio],
    ['Celular', s.celular],
    ['Correo', s.email],
    ['Fecha', fecha],
  ];
  return {
    asunto: `${s.tipo === 'RECLAMAR' ? 'Reclamo de ficha' : 'Nuevo negocio'}: ${s.nombreNegocio}`,
    texto: `${s.nombreNegocio} ${QUE_PIDE[s.tipo]} en Costa a la carta.\n\n${filas.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\nLa solicitud también quedó en el panel de administración, en "Solicitudes".`,
    html:
      `<p><strong>${escaparHtml(s.nombreNegocio)}</strong> ${QUE_PIDE[s.tipo]} en Costa a la carta.</p>` +
      `<table cellpadding="4">${filas.map(([k, v]) => `<tr><td><strong>${k}</strong></td><td>${escaparHtml(v)}</td></tr>`).join('')}</table>` +
      '<p>La solicitud también quedó en el panel de administración, en "Solicitudes".</p>',
  };
};

// Avisa por correo a SOLICITUDES_EMAIL (una o varias casillas, separadas por comas). Si falta
// configurarlo o el envío falla, la solicitud igual queda guardada para verla en el admin.
const avisarPorCorreo = async (solicitud) => {
  const para = (process.env.SOLICITUDES_EMAIL ?? '').split(',').map((c) => c.trim()).filter(Boolean);
  if (para.length === 0 || !correoRepository.correoConfigurado()) {
    console.warn(`Solicitud ${solicitud.id} guardada sin aviso por correo: faltan SOLICITUDES_EMAIL o RESEND_API_KEY`);
    return false;
  }
  try {
    await correoRepository.enviarCorreo({ para, responderA: solicitud.email, ...armarCorreo(solicitud) });
    await solicitudRepository.marcarCorreoEnviado(solicitud.id);
    return true;
  } catch (e) {
    console.error(`No salió el correo de la solicitud ${solicitud.id}: ${e.message}`);
    return false;
  }
};

// Lo que manda el formulario público. sitioWeb es una trampa para bots (el campo está oculto:
// una persona no lo completa): si viene con algo, se responde bien pero no se guarda nada.
const crearSolicitud = async ({ sitioWeb, ...datos }) => {
  if (sitioWeb) return { recibida: true };
  const solicitud = await solicitudRepository.crearSolicitud(datos);
  await avisarPorCorreo(solicitud);
  return { recibida: true };
};

const listarSolicitudes = async ({ pagina }) => {
  const [{ solicitudes, total }, pendientes] = await Promise.all([
    solicitudRepository.listarSolicitudes({ saltear: (pagina - 1) * SOLICITUDES_POR_PAGINA, cantidad: SOLICITUDES_POR_PAGINA }),
    solicitudRepository.contarPendientes(),
  ]);
  return { solicitudes, total, pendientes, pagina, porPagina: SOLICITUDES_POR_PAGINA };
};

const editarSolicitud = async (id, { atendida }) => {
  if (!(await solicitudRepository.obtenerSolicitudPorId(id))) throw new SolicitudNoEncontrada();
  return await solicitudRepository.editarSolicitud(id, { atendida });
};

export { crearSolicitud, listarSolicitudes, editarSolicitud, armarCorreo };
