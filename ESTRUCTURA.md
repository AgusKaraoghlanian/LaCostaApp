# Estructura de Costa a la carta

Mapa rápido de dónde está cada cosa. Se actualiza con cada cambio grande.

La app se está pasando al mismo stack y la misma forma de trabajar que VPUG. Mientras tanto conviven:

- `backend/`: **la API nueva** (Express + Prisma + PostgreSQL). Es la que hay que seguir.
- `app/`: la versión anterior (React + Hono + D1 de Cloudflare + motor Node). Queda como referencia hasta terminar la migración: de ahí sale el frontend (siguiente paso) y la importación de webs y OCR (después).
- `demo/`: la demo original con 20 negocios ficticios. Es la referencia de cómo se tiene que ver.
- `docs/entrega/`: los documentos de arquitectura de la entrega del 1 de noviembre de 2026.

## Cómo levantarlo

- Backend: `npm run dev --prefix backend` → http://localhost:3001 (se reinicia solo al guardar, con `node --watch`; necesita `backend/.env`, ver `backend/.env.example`).
- Base de datos: PostgreSQL (Supabase en producción; en local sirve cualquier Postgres). Las tablas se crean con `npx prisma migrate deploy --config prisma7.config.ts` desde `backend/`. **Después de cada migración** hay que correr `npx prisma generate --config prisma7.config.ts` y reiniciar el backend: en Prisma 7 el cliente no se regenera solo.
- Datos iniciales: `npm run seed` desde `backend/`. Crea Buenos Aires → Partido de La Costa → sus 10 localidades, las 8 categorías de la portada y el primer administrador con `ADMIN_EMAIL`, `ADMIN_PASSWORD` y `ADMIN_NOMBRE` del `.env` (si no están, saltea ese paso). Se puede correr varias veces: lo que ya existe no se cambia.
- **Datos de prueba (demo)**: `npm run demo` desde `backend/` (`prisma/demo.js`) carga los 20 negocios ficticios de la demo (`prisma/datos-demo.js`), ya publicados, pasando por el mismo camino que una ficha real (crear → aprobar → publicar). Se reconocen porque su referencia de verificación empieza con "DEMO: negocio ficticio". **Antes de abrir la guía al público: `npm run demo:borrar`**.
- Tests: `npm test` desde `backend/` (vitest, sin base: los repositories van simulados).

## Cómo funciona una ficha

1. El admin **crea** el negocio: queda como borrador y no se ve en el sitio.
2. Lo **edita** las veces que quiera. Cada guardado sube `revisionBorrador`. Al guardar se manda la que se tenía (`revisionEsperada`): si otra persona guardó antes, responde 409 en vez de pisar su cambio.
3. Cuando está conforme, **aprueba una revisión**: se guarda una foto fija de la ficha (datos, horarios y carta) en `RevisionNegocio`. No se modifica nunca y queda en el historial.
4. **Publica**: el sitio muestra la última revisión aprobada. Lo que se edite después no se ve hasta aprobar otra y volver a publicar.
5. Puede **retirarla** del sitio (el borrador y el historial quedan) o **restaurar** una revisión anterior al borrador (hay que aprobarla de nuevo para publicarla).

El público solo ve la revisión publicada, sin la referencia de verificación (es interna) y con la carta aprobada (los productos `PROPUESTO` o `DESCARTADO` no salen). Un producto con precio no se puede aprobar sin moneda: el `$` solo no dice si son pesos o dólares.

## Seguridad

- **Variables de entorno** (`config/entorno.js`): el servidor no arranca si falta `DATABASE_URL` o `JWT_SECRET`. En producción (`NODE_ENV=production`) además exige `JWT_SECRET` de 32 caracteres o más y `CORS_ORIGENES`; en desarrollo solo avisa.
- **CORS**: solo los sitios de `CORS_ORIGENES` (separados por comas) pueden llamar a la API desde el navegador. En desarrollo, sin configurar, se acepta `http://localhost:5173`.
- **Límite de pedidos por IP** (`express-rate-limit`): login, 10 intentos fallidos cada 15 minutos; toda la API, 3000 pedidos cada 15 minutos.
- **Headers de seguridad** (`helmet`).
- **Tokens**: firmados y verificados solo con HS256; duran 1 hora. El rol sale siempre del token verificado.
- **Links de las fichas** (`utils/enlaces.js`): solo http o https, sin usuario, contraseña ni puerto; Instagram, Facebook y WhatsApp tienen que ser de esa red.

## Backend (`backend/`)

Flujo de una request: `router → middlewares → controller → service → repository → Prisma → base de datos`.

```
prisma/schema.prisma        modelos de la base (usuarios, geografía, categorías, negocios, horarios, carta, revisiones)
prisma/migrations/          historial de cambios de la base
prisma/seed.js              geografía, categorías y admin inicial (npm run seed); los datos están en datos-iniciales.js
prisma/demo.js              los 20 negocios ficticios (npm run demo / demo:borrar); los datos están en datos-demo.js
src/app.js                  arma Express: middlewares globales y routers
src/server.js               arranca el servidor
src/config/prisma.js        conexión a la base
src/config/entorno.js       variables de entorno: se validan al arrancar y los orígenes de CORS
src/config/costa.js         reglas fijas: negocios por página (24), productos por carta (300), horarios (50)...
src/routes/                 endpoints (ver tabla de abajo)
src/controllers/            leen el request y responden
src/services/               reglas de negocio
  auth.service.js           login
  catalogo.service.js       categorías y geografía (provincias, partidos, localidades)
  negocio.service.js        lo del admin: crear, editar el borrador, aprobar, publicar, retirar, restaurar
  negocioPublico.service.js lo público: listado con filtros y ficha publicada
src/repositories/           único lugar que habla con Prisma (uno por tema)
  transaccion.repository.js varias operaciones como una sola (todas o ninguna)
src/validators/             validación de los datos que llegan (Joi, mensajes en español)
src/middlewares/            auth por token, rol (soloAdministrador), validar() genérico,
                            límites de pedidos por IP, manejo de errores, logger
src/dtos/                   qué datos se devuelven (el público nunca ve la referencia de verificación)
src/errors/                 errores propios con su código HTTP, por tema (auth, negocio, catalogo)
src/utils/jwt.js            crear y verificar tokens
src/utils/texto.js          slugs para las URLs y claves sin tildes para buscar
src/utils/enlaces.js        qué links se aceptan en una ficha
tests/                      tests de services, validadores y entorno (vitest, repositories simulados)
```

### Endpoints

Las rutas de `/v1/admin` piden `Authorization: Bearer <token>` de un administrador. Las acciones del admin devuelven la ficha actualizada.

| Método y ruta | Quién | Qué hace |
|---|---|---|
| `GET /salud` | cualquiera | `{ estado: "ok" }` (para el hosting) |
| `POST /v1/auth/login` | cualquiera | `{ email, password }` → `{ token, usuario }` |
| `GET /v1/categorias` | **público** | las categorías, en el orden de la portada |
| `GET /v1/geografia` | **público** | provincias → partidos → localidades |
| `GET /v1/negocios?categoria&localidadId&precio&prestacion&texto&pagina` | **público** | los publicados, de a 24. `categoria` es la clave de la URL (`parrillas`); `prestacion` se puede repetir (tienen que tener todas); `texto` busca en nombre, descripción, localidad y categoría sin importar tildes |
| `GET /v1/negocios/:slug` | **público** | la ficha publicada, con horarios y carta aprobada |
| `GET /v1/admin/negocios?texto&pagina` | admin | todas las fichas (publicadas o no), las editadas últimas primero |
| `POST /v1/admin/negocios` | admin | crea la ficha como borrador |
| `GET /v1/admin/negocios/:id` | admin | el borrador, `revisionBorrador`, cuál está publicada y el historial |
| `PUT /v1/admin/negocios/:id` | admin | guarda el borrador: los datos completos y `revisionEsperada` |
| `POST /v1/admin/negocios/:id/revisiones` | admin | aprueba una revisión con el borrador actual: `{ revisionEsperada }` |
| `POST /v1/admin/negocios/:id/publicar` | admin | publica la última revisión aprobada: `{ revisionEsperada }` |
| `POST /v1/admin/negocios/:id/retirar` | admin | lo saca del sitio: `{ revisionEsperada }` |
| `POST /v1/admin/negocios/:id/restaurar` | admin | copia una revisión al borrador: `{ revisionId, revisionEsperada }` |
| `POST /v1/admin/categorias` | admin | `{ nombre, descripcion }` (la clave sale del nombre) |
| `POST /v1/admin/provincias`, `/partidos`, `/localidades` | admin | `{ nombre }`, `{ nombre, provinciaId }`, `{ nombre, partidoId }` |

## Qué falta de la versión anterior

Se pasa en partes, en este orden:

1. **Frontend** (`frontend/`): React + Vite + Tailwind + react-router, separado por features como VPUG, llamando a esta API. Tiene que verse igual que `demo/`: se comparan capturas de cada pantalla antes y después.
2. **Importar webs y leer fotos de cartas (OCR)**: hoy viven en `app/engine`, `app/worker` y `app/src/features/importaciones`. Proponen datos que el admin revisa antes de guardar.
3. **Fotos en Supabase Storage** (hoy la foto de portada es una URL).
4. **Deploy** (`render.yaml`, como VPUG).

Lo que se deja de lado a propósito: las copias de seguridad propias de la versión anterior (Supabase ya hace backups de la base) y el motor que corría en una PC con Windows (lo reemplaza el backend).
