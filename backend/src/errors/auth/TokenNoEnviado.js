class TokenNoEnviado extends Error {
  constructor() {
    super("Token no enviado");
    this.code = 401;
  }
}

export { TokenNoEnviado };
