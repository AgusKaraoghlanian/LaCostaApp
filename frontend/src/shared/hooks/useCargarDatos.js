import { useCallback, useEffect, useState } from 'react'

// Estado de carga/error común a toda pantalla que pide datos. Al cambiar las
// dependencias mantiene los datos anteriores visibles mientras llegan los nuevos.
export function useCargarDatos(cargar, dependencias) {
  const [estado, setEstado] = useState({ datos: null, cargando: true, error: '' })
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    let vigente = true
    setEstado((previo) => ({ ...previo, cargando: true, error: '' }))

    cargar()
      .then((datos) => {
        if (vigente) setEstado({ datos, cargando: false, error: '' })
      })
      .catch((error) => {
        if (vigente) setEstado({ datos: null, cargando: false, error: error.message })
      })

    return () => {
      vigente = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencias, intento])

  const recargar = useCallback(() => setIntento((n) => n + 1), [])

  return { ...estado, recargar }
}
