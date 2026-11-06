import { useState } from 'react'

// Ejecuta una acción async (aceptar, guardar...) llevando el estado de "enviando" y el
// mensaje de error. Devuelve true si salió bien, para encadenar lo que sigue.
export function useAccion() {
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  const ejecutar = async (accion) => {
    setEnviando(true)
    setError('')
    try {
      await accion()
      return true
    } catch (e) {
      setError(e.message)
      return false
    } finally {
      setEnviando(false)
    }
  }

  return { ejecutar, enviando, error }
}
