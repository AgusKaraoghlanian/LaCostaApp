import express from "express";
import cors from "cors";
import helmet from "helmet";
import { esProduccion, origenesPermitidos } from "./config/entorno.js";
import { limiteGeneral } from "./middlewares/limite.middleware.js";
import { authRouterV1 } from "./routes/auth.router.v1.js";
import { catalogoRouterV1 } from "./routes/catalogo.router.v1.js";
import { negocioRouterV1 } from "./routes/negocio.router.v1.js";
import { negocioAdminRouterV1 } from "./routes/negocioAdmin.router.v1.js";
import { fotoAdminRouterV1 } from "./routes/fotoAdmin.router.v1.js";
import { CARPETA_LOCAL } from "./repositories/foto.repository.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { logMiddleware } from "./middlewares/logger.middleware.js";

const app = express();

// En producción el servidor está detrás de un proxy: así req.ip es la IP real de quien pide
// (la usa el límite de pedidos) y no la del proxy.
if (esProduccion() || process.env.VERCEL) app.set("trust proxy", 1);

// Headers de seguridad (sin "X-Powered-By: Express", no dejar embeber la API, etc.).
app.use(helmet());

// Solo el frontend (CORS_ORIGENES) puede llamar a la API desde el navegador. Los pedidos
// sin origen (el hosting revisando /salud, curl) pasan: CORS es una protección del navegador.
app.use(cors({ origin: (origen, listo) => listo(null, !origen || origenesPermitidos().includes(origen)) }));
// La carta de un negocio puede tener hasta 300 productos: el límite por defecto (100 kb) queda corto.
app.use(express.json({ limit: "1mb" }));

app.use(logMiddleware);

app.get("/", (req, res) => {
  res.json({ mensaje: "Costa a la carta API funcionando" });
});

// Para el hosting (sabe si el servidor anda). Va antes del límite de pedidos: no cuenta.
app.get("/salud", (req, res) => {
  res.json({ estado: "ok" });
});

// Fotos guardadas en disco (solo en desarrollo, sin Supabase Storage). Las muestra el
// frontend desde otro puerto, así que se permite cargarlas desde otro origen.
app.use(
  "/uploads",
  (req, res, next) => {
    res.set("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(CARPETA_LOCAL, { index: false }),
);

app.use("/v1", limiteGeneral);

// Rutas de la API v1. Cada router declara su propia protección (sesión y rol) en sus
// rutas, así no depende del orden en que se registran acá.
app.use("/v1", authRouterV1);
app.use("/v1", catalogoRouterV1);
app.use("/v1/negocios", negocioRouterV1);
app.use("/v1/admin/negocios", negocioAdminRouterV1);
app.use("/v1/admin/fotos", fotoAdminRouterV1);

// Middleware de manejo de errores
app.use(errorMiddleware);

export default app;
