class FotoInvalida extends Error {
  constructor() {
    super("La foto tiene que ser una imagen JPG, PNG o WEBP de hasta 5 MB.");
    this.code = 400;
  }
}

export { FotoInvalida };
