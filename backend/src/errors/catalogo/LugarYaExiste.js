class LugarYaExiste extends Error {
  constructor() {
    super("Ya existe un lugar con ese nombre ahí.");
    this.code = 409;
  }
}

export { LugarYaExiste };
