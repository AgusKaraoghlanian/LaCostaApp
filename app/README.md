# Costa a la carta — proyecto local independiente

Directorio gastronómico en español argentino. Se conserva la interfaz React/Vite del proyecto original y se integra una API Hono, SQLite/D1 local persistente y un ejecutor Node para análisis y publicación. No se usa Supabase ni se modificó el sitio publicado.

**Estado: demo local parcial con OCR incorporado.** Importación HTML, detección/selección de imágenes, carga directa, OCR gratuito en navegador, revisión y guardado. Tesseract usa recursos/español servidos por esta aplicación, sin API externa de reconocimiento. La exactitud sobre fotografías reales necesita validación adicional: manuscritos, fondos y columnas produjeron resultados incompletos. Ingesta general restringida por auditoría pendiente. PDF y JavaScript externo deshabilitados; identidad y alojamiento online pendientes.

Para el dueño: [EMPEZAR-AQUI.md](EMPEZAR-AQUI.md). Para revisar la implementación: [informe vigente y matriz A–R](docs/informes/estado-ocr-2026-10-22.md).

## Desarrollo local

Requiere Node.js 24 o posterior, npm y PowerShell 7 para el almacén protegido de Windows. Dependencias ya preparadas en esta PC. No ejecutar scripts SQL de Supabase: son antecedentes de la copia.

```powershell
npm.cmd ci --ignore-scripts
npm.cmd run db:migrate
npm.cmd run dev:api
```

En procesos separados, una vez iniciada la API:

```powershell
npm.cmd run dev
npm.cmd run motor
```

Interfaz: `http://127.0.0.1:5174/administracion`. API: `http://127.0.0.1:8787`. El motor necesita vincularse una vez desde Configuración y el lanzador, o mediante su opción `--pair` para desarrollo. No publicar códigos ni tokens.

La configuración `wrangler.local.jsonc` es exclusivamente local, con D1 y KV emulados en `.local/state`. El wrapper impide despliegue y migración remota. El catálogo real no escribe en localStorage; solo los favoritos conservan preferencias. La carga directa/OCR no necesita motor Node conectado; descarga web y publicación sí. `dev`, builds y lanzador preparan `/public/ocr/` desde dependencias fijadas (Tesseract.js 7.0.0, español 1.0.0). Preparación explícita: `npm.cmd run ocr:prepare`. No se usa CDN de OCR.

## Construcción y pruebas

```powershell
npm.cmd run build:demo
npm.cmd run build
npm.cmd test
```

Resultado del 22/10/2026: 59 pruebas aprobadas, sin omisiones, incluidas las 47 previas. Demo conserva los 42 archivos normalizados de línea base. Build normal genera la aplicación real en `dist`. La prueba adversaria abre un servidor temporal de loopback y necesita ese permiso. Verificación gráfica adicional: `node scripts/verificar-ocr-navegador.mjs`, con API/interfaz abiertas y Chromium instalado; admite `COSTA_TEST_BROWSER`. Usa OCR real y no publica fichas. [Atribución de fixtures](tests/fixtures/ocr/ATRIBUCION.md).

El HTML real de fichas se prepara en el ejecutor y se activa por revisión en la API. Las rutas HTML de la API y los assets de Vite aún necesitan unificación en el alojamiento definitivo; no presentar este build aislado como despliegue SEO terminado.

## Estructura

| Carpeta | Responsabilidad |
| --- | --- |
| `src/features` y `src/data` | Interfaz real del directorio y administrador, servicios de aplicación |
| `src/services/ocr*`, `shared/media` | OCR en Workers y límites/validación de fotos |
| `shared/contracts` | Validación, contratos y entrada normalizada de texto reutilizable |
| `server/api`, `server/auth`, `server/repositories` | API, identidad local y persistencia |
| `server/publication` | Snapshot público, HTML seguro y plantilla versionada |
| `engine` | Descarga controlada, descubrimiento, extractores y adaptadores |
| `worker` | Trabajos, emparejamiento, publicación y copias locales |
| `db/migrations` | Cinco migraciones SQLite/D1 locales |
| `tests` | Unidades, integración, seguridad y registros controlados |
| `docs/fuentes` | Evidencia fechada y registro de derechos |
| `docs/informes` | Estado actual, matriz y resultado de pruebas |
| `docs/referencia` | Prompt activo y documentación histórica conservada |
| `.local` | Estado privado de desarrollo, copias, restauraciones y diagnóstico; no publicable |

[Copias y restauración](docs/guia-copias.md) · [Fuentes y derechos](docs/fuentes/registro-derechos.md) · [Auditoría pendiente](docs/auditorias/extraccion-1-pendiente.md) · [Propuesta de aislamiento](docs/plan-aislamiento-local.md)

La carpeta hermana original y otros proyectos no se modifican. No hay push, recursos remotos, despliegue ni facturación autorizados. El piloto de 10–20 negocios y la validación del dueño siguen pendientes.
