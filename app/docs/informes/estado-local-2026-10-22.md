# Costa a la carta: estado comprobado al 22/10/2026

**Informe anterior a la incorporación de OCR.** El estado vigente y los nuevos criterios A–R están en [OCR incorporado a la demo local](estado-ocr-2026-10-22.md). Las menciones a OCR deshabilitado y al plan WSL que siguen describen el estado histórico, reemplazado por la actualización del usuario.

Entrega parcial local. Motor 0.1.0, contrato 1.0, esquema con cuatro migraciones y plantilla pública `ficha-2`. Se trabaja exclusivamente en `costa-a-la-carta-nuevo-proyecto`. El sitio publicado y la carpeta original se conservan. Los informes anteriores en `docs/referencia` describen antecedentes; este documento describe la implementación actual.

## Qué podés hacer hoy

Entrar al administrador local, cargar un negocio manualmente, pegar una URL de las fuentes de evaluación habilitadas, iniciar un trabajo real, revisar sus propuestas, corregirlas y guardar un borrador. Una revisión aprobada puede enviarse al motor para preparar y activar su publicación local. La información vive en D1 local persistente; no se guarda el catálogo real en el navegador.

El recorrido URL → análisis → revisión → aprobación → publicación se ejecutó realmente con La Gran Familia. Después se retiró esa ficha por una contradicción sobre su actividad actual. Se conserva como evidencia técnica, con una segunda revisión privada y una nueva importación pendiente de revisión. El portal tiene **cero fichas publicadas**; no contiene los veinte negocios ficticios de la demostración.

**Todavía no podés pegar cualquier pizzería y esperar una importación completa.** La API restringe la evaluación a tres dominios independientes: `lagranfamiliasb.com.ar` (también con www), `cafesanbernardo.com.ar` y `menu.fu.do`. Esta restricción está implementada en servidor mientras falta la auditoría independiente exigida en el encargo. No es una restricción cosmética de la pantalla.

## Implementado localmente y comprobado

- API Hono versionada, D1 local, cuatro migraciones, claves foráneas, validación Zod y selección explícita de backend. La vía de identidad local falla fuera del entorno autorizado de loopback.
- Alta y edición manual; datos obligatorios mínimos, dirección opcional, actividad sin confirmar, horarios nocturnos y excepciones con fechas válidas.
- Cola persistente con intentos, lease, cancelación, checkpoints, reanudación y rechazo de entregas tardías. Un tercer intento vencido termina con error explicado.
- SafeFetch con validación DNS de todos los destinos, IP fijada en conexión, comprobación de IP efectiva, redirecciones revalidadas y límites de descarga/descompresión. Parte se verifica con transportes controlados; existe además una prueba HTTP adversaria local real. Esto no certifica todas las formas de rebinding ni un navegador completo.
- Extracción HTML con LinkeDOM; JSON-LD/Schema.org con grafos y entidades separadas; descubrimiento de enlaces de carta/contacto/nosotros/galería; adaptador de WordPress para API pública anunciada y formato reutilizable WPPizza.
- Propuestas de carta, secciones, productos, variantes e importes enteros. La moneda no se deduce de `$`; un precio ambiguo no puede aprobarse como confirmado. El cero necesita evidencia.
- Revisión gráfica, correcciones guardadas al recargar, fuentes y procedencia, bloqueos manuales, comparación de tres vías y sugerencias de duplicados por nombre/teléfono sin fusión automática.
- Revisión histórica congelada, nueva revisión desde historial y publicación con activación atómica. Una falla conserva la publicación anterior. Retiro del portal con motivo e historial conservado.
- Configuración visual de fuentes, alta de categorías y de provincias/partidos/localidades. El cambio de nombre, eliminación y administración visual de alias todavía faltan.
- Copia de datos y HTML publicado, hash, exclusión de sesiones/dispositivos y restauración aislada. Copia diaria local activada cuando el motor está conectado.

## Implementado pero no verificado completamente

El lanzador de Windows tiene inicio/cierre, conexión, vinculación, reconexión, diagnóstico, acceso a copias y verificación de restauración. La comprobación `-SmokeTest` pasó con Node 24.20.0 y las dependencias instaladas. La herramienta de control de Windows no expuso su ventana; **no se certifican sus botones ni la experiencia de doble clic**. Falta la prueba del dueño.

Los permisos de propietarios se probaron con identidades controladas, incluyendo denegación de acceso a una ficha ajena; faltan cuentas online reales y prueba entre dispositivos. La programación diaria está guardada y su mecanismo existe; todavía no se observó un ciclo completo de 24 horas.

## Simulado o demostrativo

Los veinte comercios ficticios, fotos ilustrativas y reseñas de la versión original están separados en el modo `demo` y su construcción `dist-demo`. Los cambios de precios de las pruebas automáticas usan fuentes controladas, sin modificar webs ajenas. Las reproducciones de observaciones registradas no cuentan como nuevas descargas reales.

## No implementado o deliberadamente deshabilitado

- Lectura aislada de PDF, OCR de fotografías, procesamiento seguro de imágenes y navegador aislado con JavaScript. Detectar un PDF o una imagen no equivale a leerlo.
- Descarga, autorización editorial y publicación de medios; respaldo/restauración de objetos KV, retención y purga de copias.
- Conectores autorizados de Meta. Facebook/Instagram no se rastrean ni se usan sesiones personales. Pueden conservarse como referencias mediante Fuentes; la extracción general bloquea esas URL antes de crear el trabajo. El pipeline también las rechaza sin iniciar red.
- Google OIDC online, onboarding real de propietarios, titularidades, consultas y moderación real de reseñas. Persisten conceptos/tablas, pero no hay recorrido online habilitado.
- Identificación de duplicados por dirección/coordenadas y conciliación avanzada de sucursales; edición visual avanzada de regiones OCR y división/unión de filas de carta.
- Interpretación integral de sitemap/RSS/Atom y conectores adicionales. Los adaptadores actuales son extensibles, no demuestran universalidad.
- Respeto de `Retry-After` del origen: hay reintentos limitados con espera propia; falta interpretar esa cabecera antes de abrir ingesta general.
- Configuración y prueba de cuotas/CPU de Workers online, alertas presupuestarias reales, prueba con PC apagada y rutas SEO unificadas del alojamiento definitivo.
- Piloto de 10–20 negocios actuales de San Bernardo y prueba de uso del dueño y otra persona no técnica.

## Fuentes reales y mediciones

Fechas de registro en UTC; la interfaz muestra hora argentina. `complete` significa que terminó el recorrido permitido; no significa que encontró todos los datos ni que el comercio esté activo.

| Fuente | Registro UTC | Lectura real | Resultado y límites |
| --- | --- | --- | --- |
| La Gran Familia, San Bernardo | 22/10, 05:13:33 | 1 página, 45.076 bytes, 2.915 ms; 6 observaciones | Nombre, descripción, teléfono, web e Instagram; 7 URL de imágenes detectadas. Sin productos ni fotos descargadas. Actividad actual sin confirmar. |
| Café San Bernardo | 22/10, 06:29:44 | 6 recursos, 3.652.977 bytes, 20.136 ms; 720 observaciones | 249 propuestas de platos/variantes y precios, WordPress/WPPizza; 75 URL de imágenes detectadas entre páginas. Es de Villa Crespo, CABA: solo prueba técnica, no integrante del piloto costero. |
| La Cocina de Tuty, menú Fu.do | 22/10, 08:41:20 | 1 página, 2.518 bytes, 2.590 ms | HTML de aplicación Angular. Resultado parcial, cero platos. El título genérico «Menú Online» es una propuesta inútil para identificar el negocio y no se aceptó como nombre. JavaScript no ejecutado. |

Los JSON fechados están en `docs/fuentes`, con antecedentes en `docs/fuentes/historial`. No se descargaron archivos multimedia ni se concedieron derechos de republicación.

Se contrastaron 20 asociaciones de producto/variante/importe de Café San Bernardo contra su carta original y se registró la regresión en `tests/real-associations.test.ts`. Las 20 asociaciones numéricas coincidieron; las 20 monedas siguen pendientes porque la fuente usa `$`. **No son veinte precios completos aprobados** ni una medida de precisión universal.

Un registro histórico de La Gran Familia conservó inicialmente un botón de compartir como candidato Facebook. Se corrigió el extractor, se agregó una prueba y se excluyó ese enlace de la ficha; no se reescribió la evidencia histórica.

La noticia de julio de 2024 sobre el incendio y futuro incierto de La Gran Familia contradice la apariencia de su web histórica: [archivo de San Bernardo Info](https://www.sanbernardoinfo.com.ar/2024/07/). No demuestra por sí sola el estado actual. Se retiró la publicación y se dejó la actividad sin confirmar hasta obtener evidencia nueva del titular.

## Verificación y artefactos

- `npm.cmd run build`: correcto, bundle real de aproximadamente 306,55 KB / 91,56 KB gzip.
- `npm.cmd run build:demo`: correcto, 39 páginas de ejemplo; comparación de los 42 archivos normalizados de línea base correcta.
- `npm.cmd test`: **47 pruebas aprobadas, cero fallas y cero omisiones**. Salida íntegra: `docs/informes/pruebas-2026-10-22.txt`. No incluye auditoría independiente ni certificación de producción.
- API/D1 real en Wrangler, recorrido visual, relectura real y persistencia tras recarga comprobados. Registro vigente: una ficha privada, una revisión de importación pendiente, cero fichas públicas.
- Escritorio y ancho móvil de 390 px: importador y revisión sin desbordamiento horizontal detectado. En esas pantallas, ancho medido del documento: 375 px. Capturas reales en `docs/capturas`; no equivalen a una prueba humana de facilidad de uso.
- Copia reciente `b5c2c351-5b22-4fc3-a0a9-475fe4c7bf1e.json`: 96 filas, restauración en SQLite vacío, relaciones e integridad de HTML verificadas; una ficha, cero fichas activas en el portal, una revisión de importación guardada, cero sesiones y cero dispositivos. Contiene un artefacto histórico de publicación, que no reactiva la ficha retirada.

Las copias y las bases restauradas quedan en `.local`, fuera del código publicable. Son copias locales sin cifrado del contenido comercial: guardarlas en el mismo disco no protege contra pérdida física de la PC. Las credenciales del motor permanecen protegidas por Windows y no forman parte de esos paquetes.

## Matriz A–R

| Caso | Estado real | Evidencia y falta pendiente |
| --- | --- | --- |
| A. Alta manual | Implementado y comprobado localmente | API, SQLite y validación con dirección opcional; GUI disponible. |
| B. URL real útil | Comprobado con fuentes limitadas | La Gran Familia; extracción real y ciclo editorial. No generalizado. |
| C. Páginas internas | Comprobado parcial | Carta/bebidas y API pública WordPress de Café San Bernardo; límites de profundidad y dominio. |
| D. Platos y precios | Comprobado parcial | 249 propuestas; 20 asociaciones numéricas contrastadas; moneda/canal aún requieren revisión. |
| E. PDF y foto/OCR | No implementado; deshabilitado | Falta aislamiento de sistema operativo, lectores y pruebas adversarias. |
| F. Revisión gráfica | Implementado y comprobado | Corrección guardada y recuperada al recargar. |
| G. Otra fuente sin duplicar | Implementado; prueba parcial | Asociación visual y contrato; relectura real sobre la misma ficha y pruebas controladas. Falta segundo dominio real asociado editorialmente. |
| H. Cambio de precio | Comprobado con fuente controlada | Dos lecturas mutables propuestas, sin tocar sitios ajenos. |
| I. Corrección protegida | Comprobado con fuente controlada | Tres vías y bloqueo conservan corrección; falta caso real fechado de cambio de precio. |
| J. Búsqueda pública | Implementado y comprobado parcial | Publicación real temporal y búsqueda/filtrado; hoy no hay fichas públicas por retiro editorial. |
| K. Ficha móvil y contactos | Parcial | Diseño y revisión móvil inspeccionados; contacto extraído no confirma vigencia actual. Falta piloto con contactos actuales verificados. |
| L. Estructuras distintas | Parcial | Tres dominios: HTML, WordPress/WPPizza y detección de aplicación JS sin extraer su menú. JSON-LD probado con fixtures; PDF/OCR faltan. |
| M. Error explicado | Implementado y comprobado | Límite previo a auditoría, JS parcial, acceso restringido, cancelación y reintentos. |
| N. Persistencia y dispositivos online | Local comprobado; online pendiente | D1, recarga y restauración local. No hay prueba entre dispositivos online. |
| O. Privacidad y permisos | Pruebas locales aprobadas | CSRF, acceso a ficha ajena, roles, salida pública; identidad online y auditoría 2 pendientes. |
| P. Proyectos externos | Respetado | No se crearon/conectaron recursos remotos ni se usaron bases ajenas. |
| Q. Costos | Respetado | Sin APIs pagas, facturación ni servicios contratados. La auditoría con la suscripción existente quedó bloqueada por cuota. |
| R. Dueño sin programar | Pendiente de prueba humana | Interfaz y lanzador implementados; no declarar aprobado por automatización. |

## Cómo completar la aplicación sin reconstruirla

El siguiente componente es un `DocumentReader` aislado que entregue texto, posiciones y observaciones al mismo pipeline. OCR y navegador aislado se ejecutarán como tareas del motor, no en una petición de la API ni en el navegador del dueño. No recibirán credenciales, acceso a discos personales ni red directa. El plan previo está en `docs/plan-aislamiento-local.md`; su instalación requiere autorización puntual.

Después se incorpora el flujo visual de medios al `MediaStore` existente: derechos por archivo, autorización, variantes procesadas, enlaces a ficha/carta y copia/restauración de objetos. Las mismas propuestas se revisan, aprueban y publican mediante los repositorios y el historial ya presentes.

La auditoría 1 debe revisar esos límites antes de habilitar sitios arbitrarios. La ejecución de Claude Code no produjo informe por límite semanal; no se considera aprobada. Más adelante, con autorización separada, se integra Google OIDC y recursos dedicados, se unifican rutas HTML/assets, se miden las cuotas reales y se realiza auditoría 2. Al final se valida el piloto y el uso sin comandos.

**Hito 1:** recorrido principal local demostrado, con límites de seguridad explícitos. **Hito 2:** parcial. **Hitos 3 y 4:** pendientes. El encargo completo aún no está terminado.
