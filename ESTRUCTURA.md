# Estructura de Costa a la carta

Mapa rápido de dónde está cada cosa. Se actualiza con cada cambio grande.

La app se está pasando al mismo stack y la misma forma de trabajar que VPUG. Mientras tanto conviven:

- `backend/`: **la API nueva** (Express + Prisma + PostgreSQL). Es la que hay que seguir.
- `frontend/`: **el sitio nuevo** (React + Vite + react-router), que usa esa API.
- `app/`: la versión anterior (React + Hono + D1 de Cloudflare + motor Node). Queda como referencia hasta terminar la migración: de ahí sale la importación de webs y OCR (siguiente paso).
- `demo/`: la demo original con 20 negocios ficticios. Es la referencia de cómo se tiene que ver.
- `docs/entrega/`: los documentos de arquitectura de la entrega del 1 de noviembre de 2026.

## Cómo levantarlo

- Frontend: `npm run dev --prefix frontend` → http://localhost:5173 (necesita `frontend/.env` con `VITE_API_BASE_URL`, ver `frontend/.env.example`). Abrirlo como `localhost`, no `127.0.0.1`: CORS solo acepta el origen exacto. `npm run lint` corre oxlint.
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
src/utils/comparar.js       si dos objetos tienen los mismos datos (Postgres reordena las claves de los Json)
tests/                      tests de services, validadores y entorno (vitest, repositories simulados)
```

### Endpoints

Las rutas de `/v1/admin` piden `Authorization: Bearer <token>` de un administrador. Las acciones del admin devuelven la ficha actualizada.

| Método y ruta | Quién | Qué hace |
|---|---|---|
| `GET /salud` | cualquiera | `{ estado: "ok" }` (para el hosting) |
| `POST /v1/auth/login` | cualquiera | `{ email, password }` → `{ token, usuario }` |
| `GET /v1/categorias` | **público** | las categorías, en el orden de la portada, cada una con cuántos negocios publicados tiene (`negocios`) |
| `GET /v1/geografia` | **público** | provincias → partidos → localidades (en el orden en que se cargaron: de norte a sur) |
| `GET /v1/negocios?categoria&localidadId&precio&prestacion&destacado&orden&texto&pagina` | **público** | los publicados, de a 24. `categoria` es la clave de la URL (`parrillas`); `prestacion` se puede repetir (tienen que tener todas); `texto` busca en nombre, descripción, localidad y categoría sin importar tildes; `orden`: `recomendados` (destacados primero, después en el orden en que se cargaron), `precio` o `nombre` |
| `GET /v1/negocios/:slug` | **público** | la ficha publicada, con horarios y carta aprobada |
| `GET /v1/admin/negocios?texto&pagina` | admin | todas las fichas (publicadas o no), las editadas últimas primero |
| `POST /v1/admin/negocios` | admin | crea la ficha como borrador |
| `GET /v1/admin/negocios/:id` | admin | el borrador, `revisionBorrador`, cuál está publicada y el historial |
| `PUT /v1/admin/negocios/:id` | admin | guarda el borrador: los datos completos y `revisionEsperada` |
| `POST /v1/admin/negocios/:id/revisiones` | admin | aprueba una revisión con el borrador actual: `{ revisionEsperada }` (409 si no cambió nada desde la última) |
| `POST /v1/admin/negocios/:id/publicar` | admin | publica la última revisión aprobada: `{ revisionEsperada }` |
| `POST /v1/admin/negocios/:id/retirar` | admin | lo saca del sitio: `{ revisionEsperada }` |
| `POST /v1/admin/negocios/:id/restaurar` | admin | copia una revisión al borrador: `{ revisionId, revisionEsperada }` |
| `POST /v1/admin/fotos` | admin | el archivo de la foto en el body (`Content-Type: image/jpeg`, `png` o `webp`, hasta 5 MB) → `{ url }`. El tipo se comprueba con los primeros bytes. Con `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` va a Supabase Storage (bucket público `SUPABASE_BUCKET`, `fotos` por defecto); sin eso, en desarrollo, a `backend/uploads` (servida en `/uploads`, fuera de git) |
| `POST /v1/admin/categorias` | admin | `{ nombre, descripcion }` (la clave sale del nombre) |
| `POST /v1/admin/provincias`, `/partidos`, `/localidades` | admin | `{ nombre }`, `{ nombre, provinciaId }`, `{ nombre, partidoId }` |

## Frontend (`frontend/`)

Mismas convenciones que el frontend de VPUG: carpetas por tema en `features/`, lo compartido en `shared/`, todo lo que habla con la API pasa por `config/http.js` (`apiFetch`), los datos se piden con `useCargarDatos` y los formularios usan react-hook-form. Las direcciones son las mismas que la demo (`/explorar`, `/categoria/parrillas`, `/lugar/la-orilla`...).

```
src/App.jsx                       las rutas
src/config/http.js                apiFetch: token, errores del backend con su mensaje, filtros en la URL
src/styles/estilos.css, motor.css los estilos de la demo y del panel anterior, tal cual (formateados)
src/styles/agregados.css          lo poco que se sumó (paginación, ficha con una sola foto, carga)
src/shared/api/                   lo público de la API: categorías, geografía, negocios
src/shared/hooks/                 useCargarDatos, useAccion, useSesion (como VPUG), useCatalogo
                                  (categorías y localidades, se piden una vez), useFavoritos (en el navegador)
src/shared/components/            cabecera, pie, tarjeta, migas, paginación, ruta protegida...
src/shared/formato.js             precios, horarios ("Martes a domingo · 12:00 a 15:30 y 19:30 a 23:30")
src/shared/costa.js               datos fijos: prestaciones de los filtros, días, estados, monedas
src/features/inicio/              la portada y su buscador
src/features/explorar/            el listado con filtros (viven en la URL: ?q=&localidad=&precio=&prestacion=&orden=&pagina=) y las categorías
src/features/negocio/             la ficha pública: descripción, prestaciones, carta, contacto y horarios
src/features/guardados/           los lugares con corazón (se guardan en el navegador, por slug)
src/features/informacion/         Nuestra Costa, Cómo funciona, "próximamente" y la página de no encontrado
src/features/auth/                el ingreso del administrador
src/features/admin/               el panel: inicio con números, lista de negocios, editor de la ficha
                                  (ficha, horarios, carta, historial; guardar, aprobar, publicar, retirar,
                                  restaurar) y configuración (categorías y geografía)
```

Comparado con la demo, a propósito no están las valoraciones, las reseñas ni el formulario de consulta (no hay datos reales de eso todavía; la versión anterior también los ocultaba en modo real). "Sumá tu lugar" y "Reclamar mi negocio" muestran que se habilitan más adelante. La ficha tiene una sola foto en vez de galería (el backend guarda una).

**Por qué todavía sin Tailwind** (VPUG lo usa):

1. *Problema*: tiene que verse igual que la demo, y la demo ya tiene todos sus estilos escritos en CSS (`estilos.css`, ~3500 líneas, más `motor.css` del panel).
2. *Por qué ahora no*: pasarlos a clases de Tailwind al mismo tiempo que se cambia todo el código hace imposible saber si una diferencia visual viene del código nuevo o de la traducción de estilos.
3. *Alternativa simple (la elegida)*: usar esos mismos archivos CSS y las mismas clases. Se comparó cada pantalla con capturas de la demo y quedan iguales.
4. *Cuándo sí*: en un PR aparte, pantalla por pantalla, comparando capturas antes y después. Ahí Tailwind sirve para que los estilos nuevos sigan el mismo sistema que VPUG.

**Dependencia nueva respecto de VPUG: `lucide-react`.** La demo usa sus íconos (unos 40). Alternativa: copiar cada SVG a mano, como hace VPUG con los suyos; con tantos íconos es más código para mantener y más fácil equivocarse. Con lucide quedan exactamente los mismos íconos y solo se incluyen los que se usan.

## Deploy (Vercel + Supabase)

Dos proyectos de Vercel del mismo repo: uno con Root Directory `backend` y otro con `frontend`.

- **Backend**: corre en São Paulo (`gru1`, cerca de Supabase). `api/index.js` exporta la app de Express y `vercel.json` manda todos los pedidos ahí (no usa `server.js`). En el build corre `npm run vercel-build` (genera el cliente de Prisma). Variables: `DATABASE_URL` (pooler de transacciones, puerto 6543), `JWT_SECRET`, `NODE_ENV=production`, `CORS_ORIGENES` (la URL del frontend), `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_BUCKET`. Las migraciones no corren en el deploy: se corren a mano con `DIRECT_URL` (`npx prisma migrate deploy --config prisma7.config.ts`).
- **Frontend**: Vite, con `vercel.json` para que las rutas de React (`/lugar/...`) no den 404. Variable: `VITE_API_BASE_URL` = URL del backend + `/v1`.
- **Fotos**: bucket público `fotos` en Supabase Storage.

## Qué falta de la versión anterior

Se pasa en partes, en este orden (el frontend ya está):

1. **Importar webs y leer fotos de cartas (OCR)**: hoy viven en `app/engine`, `app/worker` y `app/src/features/importaciones`. Proponen datos que el admin revisa antes de guardar.
2. **Estilos con Tailwind**, pantalla por pantalla (ver arriba por qué no se hizo junto con el frontend).

Lo que se deja de lado a propósito: las copias de seguridad propias de la versión anterior (Supabase ya hace backups de la base) y el motor que corría en una PC con Windows (lo reemplaza el backend).
