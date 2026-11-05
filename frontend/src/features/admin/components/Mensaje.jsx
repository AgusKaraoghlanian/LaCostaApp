import { X } from 'lucide-react'

// El aviso de arriba del panel ("Borrador guardado", o el error en rojo). mensaje: { texto, error }.
const Mensaje = ({ mensaje, onCerrar }) => {
  if (!mensaje) return null

  return (
    <div className={`motor-message ${mensaje.error ? 'error' : ''}`} role={mensaje.error ? 'alert' : 'status'}>
      <span>{mensaje.texto}</span>
      <button type="button" aria-label="Cerrar mensaje" onClick={onCerrar}>
        <X size={16} />
      </button>
    </div>
  )
}

export default Mensaje
