class NegocioNoPublicado extends Error {
  constructor() {
    super("La ficha no está publicada.");
    this.code = 409;
  }
}

export { NegocioNoPublicado };
