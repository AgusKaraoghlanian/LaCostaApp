class RevisionCambio extends Error {
  constructor() {
    super("Otra persona cambió esta ficha mientras la editabas. Recargá antes de guardar.");
    this.code = 409;
  }
}

export { RevisionCambio };
