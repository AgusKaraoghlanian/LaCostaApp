// Valida las partes de la request (params, query, body) con los schemas de Joi que se le
// pasen, y deja los valores ya convertidos (ej. "5" → 5) en req.validado. Se guardan aparte
// porque en Express 5 req.query es de solo lectura.
// Uso: validar({ params: idClubSchema, body: crearClubSchema })
const opciones = {
  errors: { wrap: { label: false } },
  messages: { 'object.unknown': 'El campo {#label} no está permitido.' },
};

const validar = (schemas) => (req, res, next) => {
  req.validado = {};
  for (const [parte, schema] of Object.entries(schemas)) {
    const { error, value } = schema.validate(req[parte] ?? {}, opciones);
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    req.validado[parte] = value;
  }
  next();
};

export { validar };
