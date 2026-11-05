class PartidoNoEncontrado extends Error {
  constructor() {
    super("Elegí el partido antes de agregar una localidad.");
    this.code = 400;
  }
}

export { PartidoNoEncontrado };
