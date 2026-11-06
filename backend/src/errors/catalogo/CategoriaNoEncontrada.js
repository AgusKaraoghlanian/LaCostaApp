class CategoriaNoEncontrada extends Error {
  constructor() {
    super("Elegí una categoría de la lista.");
    this.code = 400;
  }
}

export { CategoriaNoEncontrada };
