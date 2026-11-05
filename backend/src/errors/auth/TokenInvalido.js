class TokenInvalido extends Error {
  constructor() {
    super("Token inválido o expirado");
    this.code = 401;
  }
}

export { TokenInvalido };
