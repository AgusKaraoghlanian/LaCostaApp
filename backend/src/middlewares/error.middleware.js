// Último middleware de app.js: toda excepción termina acá.
// - Errores propios (errors/): traen el status en .code y un mensaje pensado para el usuario.
// - JSON mal armado en el body: 400.
// - Choques con reglas de la base que se escaparon del service (dos requests al mismo
//   tiempo, por ejemplo): 409 con un mensaje genérico.
// - Cualquier otra cosa: 500 sin detalles (pueden ser datos internos) y se loguea en el
//   servidor para investigarlo. Nunca se loguea el body: puede traer contraseñas.
const errorMiddleware = (err, req, res, next) => {
  if (Number.isInteger(err.code)) {
    // Algunos errores propios traen un detalle técnico que no es para el usuario.
    if (err.detalle) console.error(`${req.method} ${req.originalUrl}: ${err.detalle}`);
    return res.status(err.code).json({ message: err.message });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'El archivo es demasiado pesado.' });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'El cuerpo de la request no es un JSON válido.' });
  }
  if (err.code === 'P2002') {
    return res.status(409).json({ message: 'Ya existe un registro con esos datos.' });
  }
  if (err.code === 'P2034') {
    return res.status(409).json({ message: 'Otro cambio se guardó al mismo tiempo. Probá de nuevo.' });
  }

  console.error(`Error no controlado en ${req.method} ${req.originalUrl}:`, err);
  res.status(500).json({ message: 'Error interno del servidor' });
};

export { errorMiddleware };
