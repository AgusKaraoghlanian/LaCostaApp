import { DIAS } from './costa.js'

// Cómo se muestran los datos de un negocio.

// 2 → "$$". Sin precio informado, vacío.
export const signosDePrecio = (precio) => (precio ? '$'.repeat(precio) : '')

export const NOMBRES_DE_PRECIO = ['', 'Económico', 'Precio intermedio', 'Una ocasión especial']

// "2026-11-05T21:00:00Z" → "5/11/2026"
export const fechaCorta = (fecha) => new Date(fecha).toLocaleDateString('es-AR')

// "2026-12-25" → "25/12/2026" (sin pasar por Date, que la correría de día por la zona horaria).
const fechaDeTexto = (texto) => texto.split('-').reverse().join('/')

// Un producto de la carta: "ARS 12.500,00", el precio como lo publicó el negocio, o "Precio no informado".
export const precioDeProducto = (p) => {
  if (p.precioCentavos !== null && p.moneda) {
    return `${p.moneda} ${(p.precioCentavos / 100).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
  }
  return p.precioTexto || 'Precio no informado'
}

// Las franjas de un día: "12:00 a 15:30 y 19:30 a 02:00 (día siguiente) · Verano · Desde 1/12/2026"
const franjasDelDia = (franjas) =>
  franjas
    .map((h) =>
      [
        `${h.abre} a ${h.cierra}${h.alDiaSiguiente ? ' (día siguiente)' : ''}`,
        h.temporada,
        h.vigenteDesde && `Desde ${fechaDeTexto(h.vigenteDesde)}`,
        h.vigenteHasta && `Hasta ${fechaDeTexto(h.vigenteHasta)}`,
      ]
        .filter(Boolean)
        .join(' · '),
    )
    .join(' y ')

// Lunes primero, domingo al final.
const ORDEN_SEMANA = [1, 2, 3, 4, 5, 6, 0]

// "Martes a domingo · 12:00 a 15:30 y 19:30 a 23:30 · 25/12/2026: Cerrado". Los días seguidos con
// el mismo horario van juntos. Vacío si no hay horarios cargados.
export const resumenDeHorarios = (horarios = [], especiales = []) => {
  const grupos = []
  for (const dia of ORDEN_SEMANA) {
    const franjas = horarios.filter((h) => h.dia === dia).sort((a, b) => a.abre.localeCompare(b.abre))
    if (!franjas.length) continue
    const texto = franjasDelDia(franjas)
    const anterior = grupos.at(-1)
    const seguido = anterior && ORDEN_SEMANA.indexOf(anterior.hasta) === ORDEN_SEMANA.indexOf(dia) - 1
    if (seguido && anterior.texto === texto) anterior.hasta = dia
    else grupos.push({ desde: dia, hasta: dia, texto })
  }

  const lineas = grupos.map((g) => {
    const desde = DIAS[g.desde]
    const hasta = DIAS[g.hasta].toLowerCase()
    const pegados = ORDEN_SEMANA.indexOf(g.hasta) - ORDEN_SEMANA.indexOf(g.desde) === 1
    const dias = g.desde === g.hasta ? desde : `${desde} ${pegados ? 'y' : 'a'} ${hasta}`
    return `${dias} · ${g.texto}`
  })
  for (const e of especiales) {
    lineas.push(`${fechaDeTexto(e.fecha)}: ${e.cerrado ? 'Cerrado' : `${e.abre} a ${e.cierra}`}`)
  }
  return lineas.join(' · ')
}
