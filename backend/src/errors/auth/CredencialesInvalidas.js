class CredencialesInvalidas extends Error {
  constructor() {
    super("Email o contraseña incorrectos");
    this.code = 401;
  }
}

export { CredencialesInvalidas };
