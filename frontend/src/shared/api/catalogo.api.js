import { apiFetch } from '../../config/http.js'

// Las categorías, cada una con cuántos negocios publicados tiene (negocios).
export const obtenerCategorias = () => apiFetch('/categorias')

// provincia → partidos → localidades
export const obtenerGeografia = () => apiFetch('/geografia')
