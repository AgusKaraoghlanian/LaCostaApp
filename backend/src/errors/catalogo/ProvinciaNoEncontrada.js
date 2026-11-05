class ProvinciaNoEncontrada extends Error {
  constructor() {
    super("Elegí la provincia antes de agregar un partido.");
    this.code = 400;
  }
}

export { ProvinciaNoEncontrada };
