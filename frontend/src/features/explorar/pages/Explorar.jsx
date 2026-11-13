import { Search, SlidersHorizontal } from 'lucide-react'
import { useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { buscarNegocios } from '../../../shared/api/negocios.api.js'
import EstadoCarga from '../../../shared/components/EstadoCarga.jsx'
import Migas from '../../../shared/components/Migas.jsx'
import Paginacion from '../../../shared/components/Paginacion.jsx'
import Tarjeta from '../../../shared/components/Tarjeta.jsx'
import TituloDePagina from '../../../shared/components/TituloDePagina.jsx'
import Vacio from '../../../shared/components/Vacio.jsx'
import { useCargarDatos } from '../../../shared/hooks/useCargarDatos.js'
import { useCatalogo } from '../../../shared/hooks/useCatalogo.jsx'
import NoEncontrado from '../../informacion/pages/NoEncontrado.jsx'
import AtajosCategorias from '../components/AtajosCategorias.jsx'
import Filtros from '../components/Filtros.jsx'
import LocalidadElegida from '../components/LocalidadElegida.jsx'

// El buscador de arriba del listado.
const BuscadorListado = ({ inicial, onBuscar }) => {
  const [texto, setTexto] = useState(inicial)

  return (
    <form
      className="buscador-listado"
      onSubmit={(e) => {
        e.preventDefault()
        onBuscar(texto.trim())
      }}
    >
      <Search size={20} />
      <input
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Buscá por nombre, comida o localidad"
        aria-label="Buscar en el directorio"
      />
      <button className="boton boton-naranja">Buscar</button>
    </form>
  )
}

// /explorar y /categoria/:clave. Los filtros viven en la URL (?q=café&localidad=3&precio=2
// &prestacion=Reservas&orden=precio&pagina=2), así una búsqueda se puede compartir o volver atrás.
const Explorar = () => {
  const { clave } = useParams()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const { categorias } = useCatalogo()
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)
  const botonFiltrosRef = useRef(null)
  // Al cerrar los filtros (en el celular) se vuelve al botón Filtros: queda a la vista arriba
  // de los resultados y el foco del teclado no se pierde.
  const cerrarFiltros = () => {
    setFiltrosAbiertos(false)
    botonFiltrosRef.current?.focus()
  }

  const filtros = {
    q: params.get('q') ?? '',
    categoria: clave ?? params.get('categoria') ?? '',
    localidad: params.get('localidad') ?? '',
    precio: params.get('precio') ?? '',
    prestaciones: params.getAll('prestacion'),
    orden: params.get('orden') ?? 'recomendados',
    pagina: Number(params.get('pagina')) || 1,
  }

  const { datos, error, recargar } = useCargarDatos(
    () =>
      buscarNegocios({
        texto: filtros.q,
        categoria: filtros.categoria,
        localidadId: filtros.localidad,
        precio: filtros.precio,
        prestacion: filtros.prestaciones,
        orden: filtros.orden,
        pagina: filtros.pagina,
      }),
    [clave, params.toString()],
  )

  // Cambia la URL sin subir la pantalla. Cambiar un filtro vuelve a la primera página.
  const actualizar = (cambiarParams) => {
    const nuevos = new URLSearchParams(params)
    cambiarParams(nuevos)
    setParams(nuevos, { preventScrollReset: true })
  }
  const cambiar = (nombre, valor) =>
    actualizar((p) => {
      p.delete('pagina')
      if (valor) p.set(nombre, valor)
      else p.delete(nombre)
    })
  const alternarPrestacion = (prestacion) =>
    actualizar((p) => {
      p.delete('pagina')
      const elegidas = p.getAll('prestacion')
      p.delete('prestacion')
      const nuevas = elegidas.includes(prestacion) ? elegidas.filter((x) => x !== prestacion) : [...elegidas, prestacion]
      nuevas.forEach((x) => p.append('prestacion', x))
    })
  const irAPagina = (pagina) => {
    actualizar((p) => p.set('pagina', pagina))
    window.scrollTo({ top: 0, behavior: 'instant' })
  }
  const limpiar = () => setParams({}, { preventScrollReset: true })
  // La categoría elegida en los filtros. En /categoria/:clave va en la dirección: se pasa a
  // la otra (o a /explorar con "Todas") conservando los demás filtros y sin subir la pantalla.
  const elegirCategoria = (nueva) => {
    if (!clave) return cambiar('categoria', nueva)
    const resto = new URLSearchParams(params)
    resto.delete('categoria')
    resto.delete('pagina')
    const consulta = resto.toString() ? `?${resto}` : ''
    navigate(nueva ? `/categoria/${nueva}${consulta}` : `/explorar${consulta}`, { state: { mantenerScroll: true } })
  }

  const categoria = categorias.find((c) => c.clave === clave)
  // Con el catálogo ya cargado, una categoría que no existe es un 404.
  if (clave && categorias.length && !categoria) return <NoEncontrado />

  const cantidadFiltros = [filtros.localidad, filtros.precio, params.get('categoria')].filter(Boolean).length + filtros.prestaciones.length
  const total = datos?.total ?? 0

  return (
    <main className="contenedor pagina explorar">
      <TituloDePagina
        titulo={categoria ? `${categoria.nombre} en La Costa` : 'Descubrí lugares'}
        descripcion={
          categoria
            ? `Descubrí ${categoria.nombre.toLowerCase()} en el Partido de La Costa. Filtrá por localidad, precio y servicios.`
            : undefined
        }
      />
      <Migas items={[{ texto: categoria?.nombre ?? 'Descubrir lugares' }]} />
      <div className="encabezado-pagina">
        <span className="sobretitulo">{categoria ? 'SEGUÍ TU ANTOJO' : 'UN NUEVO FAVORITO TE ESPERA'}</span>
        <h1>{categoria ? `${categoria.nombre} en La Costa` : 'Encontrá tu próximo lugar favorito'}</h1>
        <p>
          {categoria
            ? `${categoria.descripcion || 'Propuestas para descubrir'}. Conocé las propuestas del Partido de La Costa.`
            : 'De un café al sol a una cena frente al mar. Elegí tu plan.'}
        </p>
      </div>
      {/* key: si la búsqueda cambia desde afuera (Limpiar, volver atrás), el input se actualiza. */}
      <BuscadorListado key={filtros.q} inicial={filtros.q} onBuscar={(texto) => cambiar('q', texto)} />
      {/* Solo en el celular (en la compu esto ya se ve en la columna de filtros): la localidad
          con el botón Filtros a la derecha y, abajo, las categorías. */}
      <div className="explorar-celular">
        <LocalidadElegida localidadId={filtros.localidad} onCambiar={(valor) => cambiar('localidad', valor)} />
        <button
          type="button"
          className="filtros-movil boton boton-borde"
          ref={botonFiltrosRef}
          aria-expanded={filtrosAbiertos}
          onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
        >
          <SlidersHorizontal size={15} />
          Filtros {cantidadFiltros ? `(${cantidadFiltros})` : ''}
        </button>
      </div>
      <AtajosCategorias elegida={filtros.categoria} params={params} />
      <div className="explorar-disposicion">
        <Filtros
          filtros={filtros}
          cambiar={cambiar}
          alternarPrestacion={alternarPrestacion}
          limpiar={limpiar}
          elegirCategoria={elegirCategoria}
          visible={filtrosAbiertos}
          onCerrar={cerrarFiltros}
          total={total}
        />
        <section className="resultados">
          <div className="barra-resultados">
            <span>
              <strong>{total}</strong> {total === 1 ? 'lugar para descubrir' : 'lugares para descubrir'}
            </span>
            <label>
              Ordenar por{' '}
              <select aria-label="Ordenar resultados" value={filtros.orden} onChange={(e) => cambiar('orden', e.target.value)}>
                <option value="recomendados">Recomendados</option>
                <option value="precio">Menor precio</option>
                <option value="nombre">Nombre</option>
              </select>
            </label>
          </div>
          {!datos ? (
            <EstadoCarga error={error} onReintentar={recargar} />
          ) : datos.negocios.length ? (
            <>
              <div className="grilla-tarjetas dos-columnas">
                {datos.negocios.map((n) => (
                  <Tarjeta key={n.slug} negocio={n} />
                ))}
              </div>
              <Paginacion pagina={datos.pagina} total={datos.total} porPagina={datos.porPagina} onCambiar={irAPagina} />
            </>
          ) : (
            <Vacio
              icono={Search}
              titulo="Todavía no encontramos ese sabor"
              texto="Probá con otra localidad o quitá algún filtro para descubrir más lugares."
            >
              <button type="button" className="boton boton-naranja" onClick={limpiar}>
                Ver todos los lugares
              </button>
            </Vacio>
          )}
        </section>
      </div>
    </main>
  )
}

export default Explorar
