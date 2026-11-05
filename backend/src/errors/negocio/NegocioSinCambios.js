class NegocioSinCambios extends Error {
  constructor() {
    super("La ficha no cambió desde la última revisión aprobada.");
    this.code = 409;
  }
}

export { NegocioSinCambios };
