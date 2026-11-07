import app from "../src/app.js";
import { validarEntorno } from "../src/config/entorno.js";

// Entrada del backend en Vercel: cada pedido llega acá (ver vercel.json) y lo atiende la
// misma app de Express que en local. server.js no se usa en Vercel (no hay app.listen).
// Si falta una variable obligatoria, la función falla al arrancar y el log dice cuál.
validarEntorno();

export default app;
