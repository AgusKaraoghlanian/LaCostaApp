class NegocioSinAprobar extends Error {
  constructor() {
    super("Aprobá una revisión de la ficha antes de publicarla.");
    this.code = 409;
  }
}

export { NegocioSinAprobar };
