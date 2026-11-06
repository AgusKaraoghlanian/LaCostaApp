class SinPermiso extends Error {
  constructor() {
    super("No tenés permiso para hacer esto.");
    this.code = 403;
  }
}

export { SinPermiso };
