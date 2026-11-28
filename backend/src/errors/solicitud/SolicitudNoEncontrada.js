class SolicitudNoEncontrada extends Error {
  constructor() {
    super("No encontramos esa solicitud.");
    this.code = 404;
  }
}

export { SolicitudNoEncontrada };
