import "dotenv/config";
import app from "./app.js";
import { validarEntorno } from "./config/entorno.js";

// Si falta una variable obligatoria, no levanta (y dice cuál falta).
try {
  validarEntorno();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
