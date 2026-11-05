class NegocioNoEncontrado extends Error {
  constructor() {
    super("No encontramos ese negocio.");
    this.code = 404;
  }
}

export { NegocioNoEncontrado };
