class LocalidadNoEncontrada extends Error {
  constructor() {
    super("Elegí una localidad de la lista.");
    this.code = 400;
  }
}

export { LocalidadNoEncontrada };
