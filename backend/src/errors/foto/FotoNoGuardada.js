class FotoNoGuardada extends Error {
  constructor(detalle) {
    super("No pudimos guardar la foto. Probá de nuevo en un rato.");
    this.code = 502;
    this.detalle = detalle;
  }
}

export { FotoNoGuardada };
