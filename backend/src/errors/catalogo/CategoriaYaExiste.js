class CategoriaYaExiste extends Error {
  constructor() {
    super("Ya hay una categoría con ese nombre.");
    this.code = 409;
  }
}

export { CategoriaYaExiste };
