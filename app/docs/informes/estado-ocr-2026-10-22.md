# Costa a la carta: OCR incorporado a la demo local

Estado verificado el 22/10/2026. Se continuó en `costa-a-la-carta-nuevo-proyecto`, conservando React/Vite, API Hono, D1/SQLite y motor Node. Contrato 1.0 con ampliaciones opcionales compatibles y cinco migraciones locales. [Estado anterior conservado](estado-local-2026-10-22-antes-ocr.md).

## Estado encontrado y preservado

La inspección confirmó importación HTML/JSON-LD/WordPress/WPPizza, cola persistente, checkpoints, revisión y borradores recuperables, comparación de cambios, correcciones protegidas, fuentes por ficha, cartas/versiones, publicación local por revisión y copias restaurables. Las **47 pruebas previas pasaron** con el permiso de conexión de loopback necesario para el servidor adversario. El fallo inicial `EACCES` era del entorno; no se contabilizó como prueba aprobada.

Tesseract no estaba instalado y el OCR no existía. La carpeta no tiene Git: no se puede afirmar un árbol limpio ni fechar cambios anteriores por commits. Antes de editar se guardó `.local/checkpoints/antes-ocr-20261022-100606.zip` con fuentes y documentación. Antes de migrar se obtuvo una copia SQLite consistente mediante su API de backup, con 207 páginas, en esa misma carpeta. Un intento previo de comprimir archivos abiertos falló y no se considera respaldo válido.

La ficha privada previa permanece y el portal conserva **cero publicaciones activas**. Las pruebas actuales no publicaron comercios ficticios ni aprobaron integrantes del piloto. La carpeta original, Supabase y los demás proyectos no se usaron ni modificaron.

## Implementado ahora

- **OCR gratuito en navegador:** Tesseract.js 7.0.0 y modelo español 1.0.0, con versiones fijadas. Worker, WASM y español se sirven desde `/ocr/` de la aplicación. Se preparan desde dependencias controladas al iniciar/construir y desde el lanzador. No se usa una API de reconocimiento externa.
- **Carga directa sin web:** Administración → Leer foto. Referencia de material legítimo, validación antes de previsualizar, progreso, cancelación, reintento y corrección del texto. El texto original se conserva por separado.
- **Detección de imágenes:** `img`, `src`, `srcset`, carga diferida, OpenGraph, JSON-LD y enlaces públicos. Clasificación heurística de carta, plato, establecimiento o desconocida; selección manual y prioridad por señales de carta/precios. Los enlaces de imagen no se recorren como HTML.
- **Descarga seleccionada:** una imagen descubierta solicitada por el administrador. Motor con SafeFetch, DNS/IP verificados, restricciones de dominio, redirecciones validadas, robots y límites. Segunda validación de contenido/dimensiones en servidor. KV local temporal, vencimiento de diez minutos y borrado al consumo/cancelación. No se crean medios publicables.
- **Carta y revisión existentes:** texto/líneas normalizados → `engine/menu/text.ts` → `MenuItem` existente → revisión habitual. Importes argentinos enteros, secciones conocidas, tamaños y algunas descripciones. Promociones, condiciones, múltiples precios por línea y partes no interpretadas quedan señaladas. `$` no confirma ARS.
- **Procedencia:** texto original/corregido, imagen y SHA-256, línea, confianza, URL cuando existe y referencia de acceso. Migración 0005 para lecturas y solicitudes temporales. Aprobar exige resolver el precio y confirmar comparación con el original. Publicar sigue siendo otra operación explícita.
- **Continuidad editorial:** leer otra foto no escribe en la ficha ni sustituye sus precios. Conserva correcciones y bloqueos; traslada ediciones en curso a la revisión OCR. Texto/procedencia entran en copias/restauraciones; objetos temporales quedan fuera.

Componentes delimitados: lector de navegador → contrato de texto → analizador → resultado de extracción → repositorios/revisión/publicación existentes. Un futuro lector PDF podrá entregar las mismas líneas. No se construyó una plataforma abstracta de plugins ni otra carta independiente. Geografía y categorías siguen siendo datos administrables.

## Pruebas y evidencia real

**59 pruebas aprobadas, cero fallas y cero omisiones**, incluidas las 47 previas. [Salida completa](pruebas-ocr-2026-10-22.txt). Build normal y demo correctos; comparación de los 42 archivos normalizados de línea base conservada. Lanzador `-SmokeTest` correcto; sus botones necesitan validación humana.

`scripts/verificar-ocr-navegador.mjs` usa Chromium y Tesseract reales, sin sustituir su salida. Bloquea solicitudes externas. Las tipografías heredadas intentan consultar Google Fonts y se bloquearon durante la prueba; worker, núcleo y español se cargaron localmente. Las fotografías no se enviaron a terceros para reconocerlas.

| Material / recorrido | Resultado observado |
| --- | --- |
| Imagen propia controlada de diez líneas | OCR real leyó cuatro variantes del ejemplo de pizzas y `Agua ARS 1.500,50`. Confianza global 94%. Cinco propuestas con importes/asociaciones esperados. Son píxeles reales con contenido ficticio, no una fotografía de un restaurante. |
| Cancelación/reintento | Abortó el reconocimiento; uno nuevo volvió a leer `NAPOLITANA`. |
| Respuesta del administrador | Contador de página avanzó 23 veces durante el OCR controlado, con intervalos programados de 20 ms. Evidencia local de respuesta, no benchmark ni prueba en celular físico. |
| Interfaz → revisión → corrección → guardar → recargar | Cinco productos. Se corrigió el primero a `Muzzarella revisada` y 9500 ARS; el borrador recuperó los cambios. Escritorio y ancho móvil de 390 px sin desbordamiento horizontal. |
| Café San Bernardo, nueva lectura HTML real | Ocho páginas; 115 URL de imágenes y 95 candidatas raster en el mismo origen. Es un comercio de CABA para evaluación técnica, fuera del piloto costero. |
| Una foto de hamburguesa de esa web | Descarga protegida real: WebP 576×1024, 63.840 bytes; consumida y eliminada. OCR real con ruido, confianza 33%; **cero productos**. Se eliminó también la copia temporal de verificación. |
| Pizarra de Los Morteros, Bernard Gagnon, CC BY-SA 4.0 | OCR real, confianza 34%, texto deficiente. No permite transcripción gastronómica fiable. No contiene precios; no se inventaron. |
| Cartel Tacos Jacky, Joss Mart GDL, CC BY-SA 4.0 | Texto parcial, confianza 68%; no recuperó de forma útil las columnas de importes. **No se declara extracción de precios reales aprobada.** |
| Otra pizarra fotografiada, michael clarke stuff, CC BY-SA 2.0 | Texto parcial, confianza 50%; no informa importes. No se dedujeron precios. |

Las atribuciones/enlaces primarios están en [material de prueba](../../tests/fixtures/ocr/ATRIBUCION.md). Las fotos con licencia permanecen como fixtures fuera de `public/`. La foto comercial sin permiso de republicación no se conserva como fixture público. Ningún material se incorporó al portal. La confianza de Tesseract no es un porcentaje demostrado de exactitud de platos/precios.

Evidencia gráfica, texto y red: `.local/ocr-verificacion/`. Capturas seleccionadas: `docs/capturas/ocr-*.png`. Los trabajos controlados son propuestas técnicas; no crearon fichas comerciales. Se cerraron tres repeticiones de la prueba, conservando su historial y el último borrador corregido. La base activa pasó `PRAGMA quick_check` y no presenta infracciones de claves foráneas.

## Matriz A–R solicitada

| Caso | Verificación y alcance |
| --- | --- |
| A. Web con imágenes | Nueva lectura real y detección ampliada en Café San Bernardo. |
| B. Carta con platos/precios | OCR real de imagen controlada. **No se logró transcripción fiable de precios en las cartas reales probadas**; falta una foto legible del piloto para contrastar exactitud práctica. |
| C. Tamaños/variantes | Cuatro asociaciones exactas del ejemplo, en unidad y OCR real controlado. |
| D. Precio ilegible | Importe nulo y revisión obligatoria. Confianza muy baja no propone nombres ni precios. |
| E. Comida sin carta | Foto real de hamburguesa, OCR real, cero productos. |
| F. Sin web | Carga de dispositivo y revisión persistida sin exigir URL. |
| G. Sin API de IA | Recursos locales y red externa bloqueada durante reconocimiento real. |
| H. Interfaz responde | Worker real y contador activo durante OCR. |
| I. Cancelar/reintentar | Reconocimiento real cancelado y reintentado. |
| J. Grandes/inválidos | Bytes reales, firmas/MIME/dimensiones, formatos no admitidos y límite de stream. Validación previa al preview y decodificación. |
| K. Revisar/corregir | Nombre/precio corregidos en interfaz y recuperados al recargar. |
| L. Publicación controlada | API rechaza OCR sin revisión. SQLite real aislado recorre aprobación y publicación con clases de producción; sin publicar pruebas en catálogo activo. |
| M. Procedencia | Hash/imagen/línea/texto original/corregido, recurso y lectura persistidos; copia/restauración verificada. |
| N. Correcciones protegidas | Lecturas nuevas proponen sin sobrescribir; regresiones pasan. Falta cambio externo real de precio fechado en el piloto. |
| O. Derechos | Snapshot sin fotos/galería ni metadatos privados OCR; cero medios publicables creados. |
| P. Sin WSL | Windows/Node/navegador existentes, sin Linux/WSL/virtualización/reinicio. |
| Q. Otros proyectos | Cambios confinados a carpeta nueva; sin Supabase ni recursos/despliegues remotos. |
| R. PDF/JS | Deshabilitados. Reconocer fotos es distinto de ejecutar scripts de sitios externos. |

## Límites y criterios de cierre

El OCR está implementado y funciona con texto claro. **La demo completa sigue pendiente de cierre**: las fotografías reales revelan límites importantes en manuscritos, fondos y columnas. Validar una carta fotografiada legible del piloto, contrastar nombres/variantes/importes y completar una prueba con el dueño/persona no técnica. Puede hacer falta corregir manualmente incluso con confianza alta.

Una imagen por vez, 8 MB, 12 MP, 6000 px por lado, reducción temporal a 2400 px y dos minutos de reconocimiento. Hasta tres descargas temporales activas por administrador. Las alternativas de núcleo ocupan unos 45 MB en disco; cada lectura carga la variante compatible y español. No se demostró una cuota dura de memoria WASM para todo navegador. No se certificaron celulares físicos, Safari/iOS ni navegadores antiguos; se necesitan Workers, createImageBitmap y OffscreenCanvas. HEIC, SVG, GIF animado y PDF no están habilitados.

No hay corrección de perspectiva, editor gráfico de regiones/columnas, interpretación general de promociones ni reconocimiento manuscrito fiable. No se promete obtener fotografías autenticadas o galerías que solo aparecen al ejecutar JavaScript.

Auditoría independiente pendiente; ingesta web general restringida en servidor a las fuentes de evaluación. No abrir importación al público. La publicación de fotos con derechos, identidad online, piloto de 10–20 comercios y alojamiento público siguen en sus etapas existentes; este OCR no los certifica.

PDF queda postergado. El plan WSL anterior fue reemplazado por la decisión del usuario: no se instala. Sin servicios pagos, proyectos de Supabase ni despliegue público.

## Corrección del mensaje de importación y de la preparación de auditoría

Se eliminó de la interfaz la explicación que vinculaba la importación con el estado de una herramienta de programación externa. La API y el motor nunca consultaron cuentas ni cuotas para aplicar la restricción: la condición efectiva es la lista de fuentes de evaluación de server/application/extraction-policy.ts.

Se encontró y retiró también la integración del script auxiliar scripts/auditoria-local.mjs con un ejecutable externo. Ahora solo muestra la [guía propia de revisión independiente](../auditorias/extraccion-1-pendiente.md); no inicia servicios, escribe dictámenes ni cambia permisos. Se actualizó el encargo para el revisor. Los documentos históricos se conservan como antecedentes, no como requisitos operativos.

La importación general sigue bloqueada. Falta un dictamen independiente sobre el código vigente, con evidencia adversaria de red/archivos y cierre verificado de los hallazgos que condicionen su apertura. La corrección de textos no constituye ni sustituye esa revisión.
