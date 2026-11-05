class RevisionNoEncontrada extends Error {
  constructor() {
    super("No encontramos esa revisión de la ficha.");
    this.code = 404;
  }
}

export { RevisionNoEncontrada };
