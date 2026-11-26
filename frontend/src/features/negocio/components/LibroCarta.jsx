import { BookOpen, ChevronLeft, ChevronRight, List, X } from 'lucide-react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { CANALES } from '../../../shared/costa.js'
import { armarPaginas } from '../utils/paginasDeCarta.js'

// A partir de este ancho el libro se ve abierto, con dos páginas enfrentadas.
const ANCHO_DOBLE = 960

const tamañoDeVentana = () => ({ ancho: window.innerWidth, alto: window.innerHeight })

// El alto de un elemento con sus márgenes.
const altoCompleto = (el) => {
  const estilo = getComputedStyle(el)
  return el.offsetHeight + parseFloat(estilo.marginTop) + parseFloat(estilo.marginBottom)
}

// Sin precios: al público se le muestra qué ofrece el negocio, no cuánto sale.
const Producto = ({ p }) => (
  <li className="libro-producto" data-id={p.id}>
    <div className="libro-producto-linea">
      <span className="libro-producto-nombre">
        {p.nombre}
        {p.variante && p.variante !== 'Base' && <em> · {p.variante}</em>}
      </span>
    </div>
    {p.descripcion && <p>{p.descripcion}</p>}
    {p.canal && p.canal !== 'SIN_ESPECIFICAR' && <small>{CANALES[p.canal]}</small>}
  </li>
)

const Portadilla = ({ nombreNegocio }) => (
  <header className="libro-portadilla">
    <span className="sobretitulo">LA CARTA DE</span>
    <h3>{nombreNegocio}</h3>
  </header>
)

const EntradaIndice = ({ seccion, pagina, onClick }) => (
  <li>
    <button type="button" onClick={onClick}>
      <span>{seccion.nombre}</span>
      <span className="libro-puntos" aria-hidden="true" />
      <span className="libro-indice-pagina">{pagina}</span>
    </button>
  </li>
)

// Todo lo que puede ir en una hoja, invisible, para medir cuánto ocupa cada cosa con el ancho
// real de la hoja (los nombres largos y las descripciones ocupan más de un renglón).
const Medidor = ({ secciones, nombreNegocio, medidorRef }) => {
  const masLarga = secciones.reduce((a, b) => (b.nombre.length > a.nombre.length ? b : a))
  return (
    <div className="libro-medidor" ref={medidorRef} aria-hidden="true">
      <div data-m="portadilla">
        <Portadilla nombreNegocio={nombreNegocio} />
      </div>
      <h4 className="libro-titulo-seccion" data-m="titulo">
        <small className="libro-carta">Carta</small>
        {masLarga.nombre} <small>(continúa)</small>
      </h4>
      <ol className="libro-indice">
        <li className="libro-indice-carta" data-m="cartaIndice">
          Carta
        </li>
        <EntradaIndice seccion={masLarga} pagina={999} />
      </ol>
      <section className="libro-bloque" />
      <section className="libro-bloque" data-m="separacion" />
      <ul>
        {secciones.flatMap((s) => s.productos.map((p) => <Producto key={p.id} p={p} />))}
      </ul>
    </div>
  )
}

// Una hoja del libro: el índice o un tramo de la carta.
const Hoja = ({ pagina, numero, total, nombreNegocio, variasCartas, inicioDeSeccion, irA, lado, children }) => {
  if (!pagina && !children) return <div className={`libro-hoja vacia ${lado}`} aria-hidden="true" />
  return (
    <div className={`libro-hoja ${lado}`}>
      <div className="libro-hoja-contenido">
        {pagina?.indice && (
          <>
            {!pagina.continua && <Portadilla nombreNegocio={nombreNegocio} />}
            <h4 className="libro-titulo-seccion">Índice{pagina.continua && <small> (continúa)</small>}</h4>
            <ol className="libro-indice">
              {pagina.indice.map(({ seccion: s, conCarta }) => [
                conCarta && (
                  <li key={`carta-${s.clave}`} className="libro-indice-carta">
                    {s.carta}
                  </li>
                ),
                <EntradaIndice
                  key={s.clave}
                  seccion={s}
                  pagina={inicioDeSeccion[s.clave] + 1}
                  onClick={() => irA(inicioDeSeccion[s.clave])}
                />,
              ])}
            </ol>
          </>
        )}
        {pagina?.bloques?.map((b, i) => (
          <section key={`${b.seccion.clave}-${i}`} className="libro-bloque">
            <h4 className="libro-titulo-seccion">
              {variasCartas && b.seccion.carta && <small className="libro-carta">{b.seccion.carta}</small>}
              {b.seccion.nombre}
              {b.continua && <small> (continúa)</small>}
            </h4>
            <ul>
              {b.productos.map((p) => (
                <Producto key={p.id} p={p} />
              ))}
            </ul>
          </section>
        ))}
      </div>
      {pagina && (
        <span className="libro-numero">
          {numero + 1} / {total}
        </span>
      )}
      {children}
    </div>
  )
}

// La carta como un libro, en una ventana encima de la ficha. Se pasa de página con las flechas
// (en pantalla o del teclado), deslizando el dedo en el celular o tocando una sección del índice.
// En la compu se ven dos páginas enfrentadas y en el celular una.
const LibroCarta = ({ secciones, nombreNegocio, seccionInicial, onCerrar }) => {
  const dialogoRef = useRef(null)
  const medidorRef = useRef(null)
  const toqueRef = useRef(null)
  const [tamaño, setTamaño] = useState(tamañoDeVentana)
  const [medidas, setMedidas] = useState(null)
  const doble = tamaño.ancho >= ANCHO_DOBLE
  const variasCartas = new Set(secciones.map((s) => s.carta)).size > 1

  // Se vuelve a medir si cambia el tamaño de la ventana (o se gira el celular) y cuando terminan
  // de cargar las letras (cambian lo que ocupa cada renglón).
  useEffect(() => {
    const alCambiar = () => setTamaño(tamañoDeVentana())
    window.addEventListener('resize', alCambiar)
    document.fonts?.ready.then(alCambiar)
    return () => window.removeEventListener('resize', alCambiar)
  }, [])

  useLayoutEffect(() => {
    const medidor = medidorRef.current
    const contenido = medidor.parentElement.querySelector('.libro-hoja-contenido')
    const de = (nombre) => medidor.querySelector(`[data-m="${nombre}"]`)
    const producto = {}
    for (const li of medidor.querySelectorAll('.libro-producto')) {
      // +1 por la rayita que separa un producto del anterior.
      producto[li.dataset.id] = altoCompleto(li) + 1
    }
    setMedidas({
      // Un poquito de aire para que no quede nada cortado por redondeos.
      disponible: contenido.clientHeight - 6,
      titulo: altoCompleto(de('titulo')),
      separacion: parseFloat(getComputedStyle(de('separacion')).marginTop) || 0,
      portadilla: altoCompleto(de('portadilla')),
      entradaIndice: altoCompleto(de('cartaIndice').nextElementSibling) + 2,
      cartaIndice: altoCompleto(de('cartaIndice')),
      producto,
    })
  }, [secciones, tamaño, doble])

  const armado = useMemo(() => medidas && armarPaginas(secciones, medidas), [secciones, medidas])
  const paginas = armado?.paginas ?? []
  const inicioDeSeccion = armado?.inicioDeSeccion ?? {}

  const paso = doble ? 2 : 1
  const ajustar = (n) => {
    const limitado = Math.max(0, Math.min(paginas.length - 1, n))
    return doble ? limitado - (limitado % 2) : limitado
  }
  // null hasta que se arma el libro: entonces se abre en la sección elegida (o en el índice).
  const [pagina, setPagina] = useState(null)
  // La hoja que se está dando vuelta: { desde, hacia } (páginas), o null.
  const [giro, setGiro] = useState(null)
  // Si cambia el tamaño de la ventana cambian las páginas: la actual se acomoda al nuevo armado.
  const vigente = ajustar(pagina ?? inicioDeSeccion[seccionInicial] ?? 0)

  const irA = (n) => {
    const destino = ajustar(n)
    if (destino === vigente) return
    const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setGiro(sinMovimiento ? null : { desde: vigente, hacia: destino })
    setPagina(destino)
  }
  const hayAnterior = vigente > 0
  const haySiguiente = vigente + paso < paginas.length

  useEffect(() => {
    const dialogo = dialogoRef.current
    dialogo.showModal()
    // Mientras está abierta, la página de atrás no se mueve.
    const html = document.documentElement
    const antes = html.style.overflow
    html.style.overflow = 'hidden'
    return () => {
      html.style.overflow = antes
      if (dialogo.open) dialogo.close()
    }
  }, [])

  const alTocar = (e) => {
    const t = e.touches[0]
    toqueRef.current = { x: t.clientX, y: t.clientY }
  }
  const alSoltar = (e) => {
    const inicio = toqueRef.current
    toqueRef.current = null
    if (!inicio) return
    const t = e.changedTouches[0]
    const dx = t.clientX - inicio.x
    const dy = t.clientY - inicio.y
    // Un deslizamiento de costado claro (no un scroll para abajo).
    if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy) * 1.3) return
    irA(dx < 0 ? vigente + paso : vigente - paso)
  }

  const total = paginas.length

  // Qué se ve mientras se da vuelta una hoja. En la compu, la hoja gira sobre el lomo: hacia
  // adelante se levanta la de la derecha (por el dorso trae la nueva de la izquierda) y abajo ya
  // están la izquierda vieja y la derecha nueva; hacia atrás, al revés. En el celular la hoja
  // actual se levanta desde el borde izquierdo y deja ver la siguiente (o vuelve la anterior).
  const hoja = (n, lado) => ({ pagina: paginas[n], numero: n, lado })
  let base = { izquierda: vigente, derecha: vigente + 1 }
  let hojaQueGira = null
  if (giro) {
    const { desde, hacia } = giro
    const adelante = hacia > desde
    if (doble && adelante) {
      base = { izquierda: desde, derecha: hacia + 1 }
      hojaQueGira = { clase: 'doble adelante', frente: hoja(desde + 1, 'derecha'), dorso: hoja(hacia, 'izquierda') }
    } else if (doble) {
      base = { izquierda: hacia, derecha: desde + 1 }
      hojaQueGira = { clase: 'doble atras', frente: hoja(desde, 'izquierda'), dorso: hoja(hacia + 1, 'derecha') }
    } else if (adelante) {
      base = { izquierda: hacia }
      hojaQueGira = { clase: 'simple adelante', frente: hoja(desde, 'izquierda') }
    } else {
      base = { izquierda: desde }
      hojaQueGira = { clase: 'simple atras', frente: hoja(hacia, 'izquierda') }
    }
  }
  const hojaProps = { total, nombreNegocio, variasCartas, inicioDeSeccion, irA }
  const textoPagina = doble && vigente + 1 < total ? `${vigente + 1}–${vigente + 2}` : `${vigente + 1}`

  return (
    <dialog
      ref={dialogoRef}
      className="libro-dialogo"
      aria-label={`Carta de ${nombreNegocio}`}
      onCancel={(e) => {
        e.preventDefault()
        onCerrar()
      }}
      onClick={(e) => {
        // Tocar afuera del libro (en el fondo oscuro) lo cierra.
        if (e.target === e.currentTarget) onCerrar()
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') irA(vigente - paso)
        if (e.key === 'ArrowRight') irA(vigente + paso)
      }}
    >
      <div className="libro-marco">
        <div className="libro-barra">
          <span className="libro-barra-titulo">
            <BookOpen size={18} />
            {nombreNegocio}
          </span>
          <button type="button" className="libro-cerrar" onClick={onCerrar} aria-label="Cerrar la carta">
            <X size={22} />
          </button>
        </div>

        <div className="libro-escena">
          <button
            type="button"
            className="libro-flecha anterior"
            onClick={() => irA(vigente - paso)}
            disabled={!hayAnterior}
            aria-label="Página anterior"
          >
            <ChevronLeft size={26} />
          </button>
          <div
            className={`libro${doble ? ' doble' : ''}`}
            onTouchStart={alTocar}
            onTouchEnd={alSoltar}
            aria-live="polite"
          >
            <div className="libro-paginas">
              <Hoja {...hojaProps} pagina={paginas[base.izquierda]} numero={base.izquierda} lado="izquierda">
                <Medidor secciones={secciones} nombreNegocio={nombreNegocio} medidorRef={medidorRef} />
              </Hoja>
              {doble && (
                <Hoja {...hojaProps} pagina={paginas[base.derecha]} numero={base.derecha} lado="derecha" />
              )}
              {hojaQueGira && (
                <div
                  key={`${giro.desde}-${giro.hacia}`}
                  className={`libro-giro ${hojaQueGira.clase}`}
                  aria-hidden="true"
                  onAnimationEnd={(e) => {
                    if (e.target === e.currentTarget) setGiro(null)
                  }}
                >
                  <div className="libro-cara frente">
                    <Hoja {...hojaProps} {...hojaQueGira.frente} />
                  </div>
                  {hojaQueGira.dorso && (
                    <div className="libro-cara dorso">
                      <Hoja {...hojaProps} {...hojaQueGira.dorso} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            className="libro-flecha siguiente"
            onClick={() => irA(vigente + paso)}
            disabled={!haySiguiente}
            aria-label="Página siguiente"
          >
            <ChevronRight size={26} />
          </button>
        </div>

        <div className="libro-pie">
          <button type="button" className="libro-boton" onClick={() => irA(vigente - paso)} disabled={!hayAnterior}>
            <ChevronLeft size={18} />
            <span>Anterior</span>
          </button>
          <button type="button" className="libro-boton indice" onClick={() => irA(0)} disabled={vigente === 0}>
            <List size={17} />
            <span>
              <span className="libro-boton-palabra">Página </span>
              {textoPagina} de {total}
            </span>
          </button>
          <button type="button" className="libro-boton" onClick={() => irA(vigente + paso)} disabled={!haySiguiente}>
            <span>Siguiente</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </dialog>
  )
}

export default LibroCarta
