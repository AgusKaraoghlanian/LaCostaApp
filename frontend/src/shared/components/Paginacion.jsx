import { ArrowLeft, ArrowRight } from 'lucide-react'

// "Anterior · Página 2 de 3 · Siguiente". No se muestra si entra todo en una página.
const Paginacion = ({ pagina, total, porPagina, onCambiar }) => {
  const paginas = Math.ceil(total / porPagina)
  if (paginas <= 1) return null

  return (
    <nav className="paginacion" aria-label="Páginas de resultados">
      <button type="button" className="boton boton-borde" disabled={pagina <= 1} onClick={() => onCambiar(pagina - 1)}>
        <ArrowLeft size={15} />
        Anterior
      </button>
      <span>
        Página {pagina} de {paginas}
      </span>
      <button type="button" className="boton boton-borde" disabled={pagina >= paginas} onClick={() => onCambiar(pagina + 1)}>
        Siguiente
        <ArrowRight size={15} />
      </button>
    </nav>
  )
}

export default Paginacion
