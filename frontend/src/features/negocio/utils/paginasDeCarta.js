// Arma las páginas del "libro" de la carta.
//
// Los productos se agrupan por sección (en el orden en que vienen) y se reparten en páginas
// según lo que mide de verdad cada uno en pantalla (LibroCarta los mide antes de mostrar el
// libro). Una sección que no entra sigue en la página siguiente ("continúa"), y una sección
// nueva no arranca al pie de una página si no le entran el título y un par de productos.
// Las primeras páginas son el índice: las secciones con la página en la que empieza cada una.

// La carta en secciones: [{ clave, carta, nombre, productos }]. Cada producto lleva un id (su
// lugar en la carta) para medirlo. Si el negocio tiene varias cartas (por ejemplo "Carta" y
// "Bebidas"), la misma sección en cartas distintas va aparte.
export const seccionesDeCarta = (carta) => {
  const porClave = new Map()
  carta.forEach((p, id) => {
    const nombre = p.seccion?.trim() || 'Otros'
    const clave = `${p.carta ?? ''}|${nombre}`
    if (!porClave.has(clave)) porClave.set(clave, { clave, carta: p.carta ?? '', nombre, productos: [] })
    porClave.get(clave).productos.push({ ...p, id })
  })
  return [...porClave.values()]
}

// medidas (en px): disponible (alto útil de una hoja), titulo (título de sección con su margen),
// separacion (entre dos secciones de una misma hoja), producto[id], portadilla (el nombre del
// negocio arriba del índice), entradaIndice y cartaIndice (el nombre de cada carta en el índice).
// Devuelve { paginas, inicioDeSeccion }: cada página es { indice: [...] } o { bloques: [...] }, y
// inicioDeSeccion: clave de la sección → número de página (desde 0).
export const armarPaginas = (secciones, medidas) => {
  const { disponible, titulo, separacion, producto, portadilla, entradaIndice, cartaIndice } = medidas
  const variasCartas = new Set(secciones.map((s) => s.carta)).size > 1

  // El índice: la primera hoja lleva arriba el nombre del negocio.
  const paginasIndice = []
  let hoja = { indice: [], continua: false }
  let usado = portadilla + titulo
  let cartaAnterior = null
  for (const s of secciones) {
    const conCarta = variasCartas && s.carta !== cartaAnterior
    const alto = entradaIndice + (conCarta ? cartaIndice : 0)
    if (usado + alto > disponible && hoja.indice.length) {
      paginasIndice.push(hoja)
      hoja = { indice: [], continua: true }
      usado = titulo
    }
    hoja.indice.push({ seccion: s, conCarta })
    usado += alto
    cartaAnterior = s.carta
  }
  paginasIndice.push(hoja)

  // La carta.
  const paginasCarta = []
  let actual = { bloques: [] }
  usado = 0
  const cerrar = () => {
    if (actual.bloques.length) paginasCarta.push(actual)
    actual = { bloques: [] }
    usado = 0
  }
  for (const seccion of secciones) {
    let bloque = null
    for (const p of seccion.productos) {
      const alto = producto[p.id] ?? 0
      if (!bloque) {
        // Sección nueva: si no entran el título y un par de productos, a la página siguiente.
        const primeros = seccion.productos.slice(0, 2).reduce((suma, q) => suma + (producto[q.id] ?? 0), 0)
        if (usado > 0 && usado + separacion + titulo + primeros > disponible) cerrar()
        bloque = { seccion, continua: false, productos: [] }
        usado += (actual.bloques.length ? separacion : 0) + titulo
        actual.bloques.push(bloque)
      } else if (usado + alto > disponible) {
        cerrar()
        bloque = { seccion, continua: true, productos: [] }
        actual.bloques.push(bloque)
        usado += titulo
      }
      bloque.productos.push(p)
      usado += alto
    }
  }
  cerrar()

  const inicioDeSeccion = {}
  paginasCarta.forEach((pagina, i) => {
    for (const b of pagina.bloques) {
      if (!b.continua) inicioDeSeccion[b.seccion.clave] ??= paginasIndice.length + i
    }
  })

  return { paginas: [...paginasIndice, ...paginasCarta], inicioDeSeccion }
}
