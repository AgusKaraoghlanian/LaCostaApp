# Costa a la carta — entrega para desarrollo

Fecha de preparación: 1 de noviembre de 2026 (Argentina).

Este paquete contiene el código actual de las DOS versiones del proyecto, sus archivos de bloqueo de dependencias, recursos, pruebas, migraciones, documentación y salidas de compilación existentes. No se modificó el código de la aplicación para preparar la entrega.

## Qué versión es cuál

- `costa-a-la-carta/`: demo original que el dueño está viendo, con 20 negocios ficticios del Partido de La Costa y fotografías ilustrativas. Es la referencia para conservar la apariencia, portada, fichas, buscador y filtros. Los cambios y favoritos se guardan por navegador; no constituyen un catálogo compartido.
- `costa-a-la-carta-nuevo-proyecto/`: evolución independiente, con frontend React/Vite, API Hono, contratos Zod, D1/SQLite local, motor Node, OCR de fotos en navegador, revisión editorial, cartas, fuentes, versiones, publicación LOCAL y copias. No reemplazarla con la demo ni mezclar los negocios ficticios en el catálogo real.
- Los cuatro documentos de arquitectura y prompts de la raíz son antecedentes completos. El `.tar.gz` de publicación anterior se incluye como antecedente, no como fuente autoritativa del código actual.
- `evidencia-entrega/`: salida de las pruebas ejecutadas al preparar este ZIP.

## Requisitos

Usar Node.js 24 o posterior y npm. Para el lanzador y la protección de la credencial del motor, Windows y PowerShell 7 (`pwsh`). Los archivos `.ts` del motor y las pruebas se ejecutan directamente con Node 24.

Se necesita acceso al registro de npm para reinstalar dependencias. Se conservan ambos `package-lock.json`; no sustituir una instalación reproducible por actualizaciones indiscriminadas. `node_modules` no se distribuye porque se reconstruye con npm y depende del sistema operativo.

## Abrir la demo con fotos

Desde `costa-a-la-carta/`:

```powershell
npm.cmd ci
npm.cmd run dev -- --port 5173 --strictPort
```

Abrir http://127.0.0.1:5173/ . Si npm ya funciona directamente en la terminal, se puede usar `npm` en lugar de `npm.cmd`.

Para verificar y compilar:

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run preview -- --port 5173 --strictPort
```

El `dist/` incluido es la compilación ya existente al preparar el paquete. Las fotografías ilustrativas, Google Fonts y algunos avatares son recursos externos referenciados por URL; no son una biblioteca local de fotos. Necesitan Internet y su disponibilidad depende de esos proveedores. Las URLs y referencias originales se conservan.

## Abrir la versión nueva

Desde `costa-a-la-carta-nuevo-proyecto/`:

```powershell
npm.cmd ci --ignore-scripts
npm.cmd run db:migrate
npm.cmd run dev:api
```

Mantener ese proceso abierto. En dos terminales adicionales, desde la misma carpeta:

```powershell
npm.cmd run dev
```

```powershell
npm.cmd run motor
```

Interfaz: http://127.0.0.1:5174/administracion . API: http://127.0.0.1:8787/api/v1/health . Entrar con el botón de administración local. Al crear una base nueva, las migraciones preparan la configuración inicial; no recuperan el catálogo privado que había en la PC del dueño.

El motor necesita una NUEVA vinculación en la PC del desarrollador: generar un código en Configuración del administrador y, desde el proyecto, ejecutar `node worker/main.ts --pair CODIGO` (reemplazar CODIGO por el código de un solo uso). Después volver a ejecutar `npm.cmd run motor`. No compartir ni guardar códigos/tokens en Git.

En Windows también está el lanzador `Costa a la carta - Motor.vbs`, que permite iniciar el sistema, abrir el administrador, vincular y detener el motor. Su credencial queda protegida para el usuario de Windows que la crea. La vinculación del dueño no se traslada en esta entrega.

Para verificar y compilar esta versión:

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run build:demo
```

`build` genera la interfaz real en `dist/`. `build:demo` genera la demostración en `dist-demo/`. Los recursos de Tesseract y español se conservan en `public/ocr/` y en las compilaciones incluidas, con sus licencias. El inicio/build puede regenerarlos desde las dependencias fijadas mediante `scripts/prepare-ocr.mjs`.

La prueba gráfica OCR requiere API e interfaz abiertas y Chromium preparado; ver `scripts/verificar-ocr-navegador.mjs`. Ese script escribe trabajos de prueba: usar un entorno aislado, no el catálogo del dueño.

## Mapa del código nuevo

| Carpeta | Responsabilidad |
| --- | --- |
| `src/` | UI, servicios de cliente, OCR y estilos |
| `server/api/` | Endpoints, permisos y operaciones |
| `server/repositories/` | Catálogo, revisión, trabajos, fuentes, publicación, OCR, copias |
| `shared/` | Contratos, validación y formatos compartidos |
| `engine/` | Descarga protegida, parsers, extracción y comparación de cambios |
| `worker/` | Ejecutor Node, emparejamiento y copias |
| `db/migrations/` | Las SEIS migraciones SQLite/D1 actuales |
| `tests/` | Pruebas, línea base y fotografías de evaluación con atribución |
| `docs/` | Requisitos, informes, auditorías y fuentes |
| `artifacts/` | Evidencias y arneses adicionales de auditoría/UX |

Flujo principal: carga manual/importación/OCR → propuestas con procedencia → borrador y revisión humana → aprobación → solicitud de publicación → artefacto validado y activación de la revisión. Una importación no publica automáticamente. Las correcciones protegidas y los conflictos deben conservarse.

## Estado y pendientes que debe conocer quien continúe

1. La versión nueva está limitada a esta PC. `server/auth/identity.ts` bloquea entornos/hostnames públicos; `worker/main.ts` admite solo la API local. No basta con subir `dist/` para obtener un administrador online.
2. Falta completar identidad online, permisos, vinculación del motor por HTTPS y alojamiento/enrutamiento de frontend, API y HTML publicado.
3. La importación web general está restringida en `server/application/extraction-policy.ts` a dominios de evaluación. PDF y ejecución de JavaScript de terceros siguen deshabilitados.
4. El OCR reconoce texto claro, pero no garantiza exactitud en fotografías reales, manuscritos ni cartas con columnas. No inferir moneda o precios dudosos; mantener la revisión humana.
5. Las cuentas de propietarios, reseñas, consultas y altas de visitantes de la demo no equivalen a recorridos habilitados en el catálogo real.
6. Revisar el informe `docs/auditorias/segunda-extraccion-2026-10-22.md`: contiene un dictamen posterior a informes que todavía hablan de auditoría pendiente. Corrige seis hallazgos en el alcance probado, pero mantiene pendiente la capacidad online. No declarar producción lista basándose solo en tests.
7. Hay evidencia de auditoría UX en `artifacts/ux-real-2026-10-23/`; revisarla antes de dar por resuelto el recorrido de edición, cartas grandes y adaptación móvil.
8. Algunos README/informes antiguos hablan de cinco migraciones, esquema 5 o 59 tests. El código entregado tiene seis migraciones; la suite actual tiene 85 tests.
9. Los archivos SQL bajo `supabase/` son antecedentes preparados. No ejecutarlos automáticamente ni conectarse a proyectos externos. La versión nueva usa D1/SQLite local.

## Publicación de la demo

La versión original se puede alojar como sitio estático (por ejemplo Cloudflare Pages) usando `costa-a-la-carta/dist/`. Antes de publicar con otro dominio, ajustar el origen fijo en `scripts/prerender.mjs` y reconstruir para que canonical, OpenGraph, sitemap y robots apunten al dominio nuevo. La demo del proyecto nuevo tiene otro script `scripts/prerender-demo.mjs` con el mismo tipo de origen fijo.

No subir el ZIP completo al directorio público del hosting. Publicar solo la salida pertinente. Revisar rutas directas, filtros, fichas y recursos externos. Mantener visibles las aclaraciones de que son negocios ficticios y fotos ilustrativas. Los cambios hechos desde la administración demo se guardan en el navegador de quien los hace; no se sincronizan entre visitantes.

## Verificación realizada para esta entrega

- Demo original: 7 pruebas aprobadas, sin fallas ni omisiones.
- Versión nueva: 85 pruebas aprobadas, sin fallas ni omisiones. Las pruebas de red usan servidores locales temporales y requirieron acceso de loopback.
- Fecha: 1 de noviembre de 2026. Node v24.22.1. Logs completos en `evidencia-entrega/`.
- No se hizo un build nuevo ni una nueva certificación visual/online para preparar el ZIP; se conservan los builds existentes y las evidencias históricas.
- `MANIFIESTO-SHA256.json` registra tamaño y hash de cada archivo entregado, excepto el propio manifiesto. Ejecutar `node verificar-entrega.mjs` desde la raíz del paquete para comprobar integridad después de extraerlo.

## Exclusiones deliberadas

Se entrega todo el código y los recursos seleccionados sin cambios de contenido. Se excluyen únicamente dependencias reinstalables (`node_modules`), historial Git (`.git`), cachés/intermedios (`.prerender`, `.wrangler`), identidad del alojamiento anterior (`.openai`), estado privado de ejecución (`.local`), bases/sesiones/copias privadas y posibles archivos de credenciales o configuración local secreta. `.env.example` sí está incluido.

La lista exacta de rutas omitidas está en `EXCLUSIONES.json`. La base privada activa y los cambios guardados en localStorage del navegador no forman parte de este paquete de código. En otra PC se inicia una base nueva; si se necesita transferir contenido comercial real, hacerlo mediante una copia de contenido revisada por el dueño, no copiando tokens o credenciales de Windows.

Los README originales se conservan intactos como antecedentes; sus referencias a datos, vinculación y dependencias de la PC original no describen una instalación nueva.
