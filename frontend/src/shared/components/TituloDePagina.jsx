import { useEffect } from 'react'

// El título de la pestaña ("Parrillas en La Costa · Costa a la carta") y la descripción
// que muestran los buscadores. Sin título, queda solo "Costa a la carta".
const DESCRIPCION = 'Descubrí restaurantes, cafés, bares y sabores locales del Partido de La Costa.'

const TituloDePagina = ({ titulo, descripcion = DESCRIPCION }) => {
  useEffect(() => {
    document.title = titulo ? `${titulo} · Costa a la carta` : 'Costa a la carta · Sabores de La Costa'
    document.querySelector('meta[name="description"]')?.setAttribute('content', descripcion)
  }, [titulo, descripcion])

  return null
}

export default TituloDePagina
