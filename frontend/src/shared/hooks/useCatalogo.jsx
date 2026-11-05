import { createContext, useContext } from 'react'
import { obtenerCategorias, obtenerGeografia } from '../api/catalogo.api.js'
import { useCargarDatos } from './useCargarDatos.js'

// Las categorías y las localidades: las usan el buscador, los filtros, las tarjetas y el admin.
// Se piden una sola vez al abrir el sitio. recargar() después de agregar una desde el admin.
const CatalogoContext = createContext(null)

const cargarCatalogo = async () => {
  const [categorias, geografia] = await Promise.all([obtenerCategorias(), obtenerGeografia()])
  // Todas las localidades juntas, con su partido (el buscador no distingue partidos todavía).
  const localidades = geografia.flatMap((provincia) =>
    provincia.partidos.flatMap((partido) =>
      partido.localidades.map((localidad) => ({ ...localidad, partido: partido.nombre })),
    ),
  )
  return { categorias, geografia, localidades }
}

const VACIO = { categorias: [], geografia: [], localidades: [] }

export const CatalogoProvider = ({ children }) => {
  const { datos, error, recargar } = useCargarDatos(cargarCatalogo, [])
  return (
    <CatalogoContext.Provider value={{ ...(datos ?? VACIO), error, recargar }}>
      {children}
    </CatalogoContext.Provider>
  )
}

export const useCatalogo = () => useContext(CatalogoContext)
