import jwt from "jsonwebtoken";

// Siempre HS256: al verificar se rechaza cualquier otro algoritmo que venga en el token.
const ALGORITMO = "HS256";

const generarToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    algorithm: ALGORITMO,
    expiresIn: "1h"
  });
};

const verificarToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET, { algorithms: [ALGORITMO] });
};

export {
  generarToken,
  verificarToken
};
