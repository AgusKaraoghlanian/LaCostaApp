# Correcciones de la primera auditoría de extracción

22 de octubre de 2026. **Correcciones implementadas y verificadas; cierre independiente pendiente. La importación general sigue bloqueada.**

Se trabajó únicamente en Costa a la carta, sin reconstruir la aplicación, conectar bases externas, instalar programas, desplegar ni modificar otros proyectos. Se consultó el informe y las evidencias de la primera auditoría. Esta entrega es la implementación de las correcciones, no una nueva aprobación independiente.

## Qué se corrigió

| Hallazgo | Corrección |
| --- | --- |
| Alto: CPU, memoria y amplificación | El parser y los adaptadores puros corren en un Worker Node separado del coordinador del motor. El coordinador impone tiempo y termina realmente el Worker; también espera su terminación al cancelar. Se eliminaron las búsquedas repetidas de WPPizza, se limitaron las opciones dentro del producto y se deduplicaron ofertas por producto/variante. Hay límites de observaciones y tamaño antes del checkpoint y en el servidor. Un 413 o un límite determinista no provoca reintento automático; se conserva el resultado anterior válido. |
| Medio: dominios editados | Cada trabajo guarda la revisión de su fuente. El servidor comprueba revisión, estado y lista de evaluación al crear, reclamar, reintentar y autorizar cada solicitud, incluidas robots y redirecciones. Una edición invalida inmediatamente trabajos y fotos pendientes/en ejecución. Los checkpoints, heartbeat y resultados también verifican la revisión, con condiciones atómicas. |
| Medio: Retry-After | Se interpretan segundos y las tres representaciones HTTP-date. Se propaga la espera para 429/503 y redirecciones; se conserva por origen en la base local y entre instancias del motor. No se hace la siguiente consulta durante esa espera. Una espera que supera la ventana del trabajo no se acorta: el trabajo termina sin reintento automático. Se mantienen tres intentos como máximo. |
| Medio: robots y redirecciones | SafeFetch comprueba robots de la URL que va a obtener en cada salto, incluido otro origen asociado. Se vuelven a validar URL, dominio, DNS e IP. Las consultas de robots también consumen presupuesto. La comparación de reglas evita ejecutar expresiones regulares derivadas del sitio. |
| Medio: cantidad de consultas | Presupuesto persistente de 24 consultas por análisis, compartido por reintentos y fotografías seleccionadas. Cuenta errores, robots, saltos y reservas cuyo DNS falla. La reserva se hace atómicamente en el servidor antes de obtener el recurso. La pausa por origen se comparte entre trabajos/dispositivos. |
| Bajo: imagen dañada | PNG sin IDAT útil se rechaza en la inspección inicial. Además, antes de crear el Worker OCR se exige decodificación real y dimensiones positivas/coincidentes con la cabecera. Se conserva Tesseract, sus límites y la revisión humana. |

El motor anuncia protocolo 2; un proceso anterior debe reiniciarse y no puede reclamar trabajos omitiendo las verificaciones nuevas. No necesita volver a vincularse. El empaquetado del Worker usa esbuild **ya instalado**, ahora declarado explícitamente en el manifiesto y lockfile. Solo empaqueta código local fijo en memoria, una vez por proceso; nunca compila ni ejecuta scripts del sitio.

## Límites efectivos

- Descarga: HTML 2 MiB, robots 128 KiB y foto 8 MiB; cinco redirecciones, profundidad de navegación dos y ocho páginas HTML procesadas. Permanecen los tiempos de DNS/descarga de 30 segundos y la ventana de análisis de diez minutos.
- Análisis de cada documento: 30.000 elementos, 300 propuestas, 1.200 observaciones por resultado, 20 negocios, 100 enlaces y 80 medios; JSON-LD conserva los límites de profundidad de grafo ocho y carta seis. También se acotan listas internas y advertencias.
- Worker: hasta dos segundos de procesamiento desde su aviso de inicio; límite externo y cancelación con `terminate()`. Preparación del código local y arranque tienen plazos separados de 15 segundos. Ninguna de esas esperas bloquea el hilo del coordinador.
- Memoria: límites V8 de 64 MiB de generación vieja, 16 MiB joven y 4 MiB de pila; entrada limitada a 2 MiB y salida acotada. Estos límites **no constituyen un límite del RSS total del proceso ni de toda memoria nativa**, como distingue [la documentación de Node](https://nodejs.org/docs/latest-v24.x/api/worker_threads.html#new-workerfilename-options). No se promete aislamiento de sistema operativo.
- Resultado acumulado: 1.280 KiB. Checkpoint: 1.536 KiB, con margen para el sobre de transporte. La API continúa con su máximo de 2 MiB; no se elevó para aceptar la amplificación. Los límites conservan la reproducción del piloto de 249 productos y 720 observaciones.
- Red: 24 reservas y 40 MiB **reservados** por análisis. Para garantizar un máximo antes de descargar, cada reserva carga el tamaño máximo autorizado, sin devolverlo por respuestas pequeñas o fallidas. Es conservador y puede detener antes una fuente legítima. Las fotos comparten ese saldo; tienen además su vencimiento propio.

El manejo de fechas/esperas se contrastó con [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html#name-retry-after).

## Pruebas y evidencia

**`npm.cmd test`: 85 aprobadas, cero fallidas, cero omitidas.** Se conservaron las 59 pruebas existentes y se agregaron 26. En tres archivos de pruebas existentes se sustituyó el hostname de fixture por una fuente de evaluación autorizada, porque esa restricción ahora también se aplica en el repositorio. No se retiraron sus aserciones de permisos, procedencia, recuperación o publicación.

| Caso | Último resultado registrado |
| --- | --- |
| HTML WPPizza de 1.814.004 bytes | Rechazo controlado en 467 ms; 29 avances del temporizador del coordinador durante el ensayo. |
| Terminación externa | Plazo de prueba de 1 ms después del aviso de inicio del Worker ocupado, terminación esperada y otro análisis posterior correcto; recorrido completo 175 ms. También pasó cancelar y volver a analizar. |
| HTML de 60.155 bytes y 5.000 ofertas | Un producto, cinco observaciones y checkpoint de 4.870 bytes; sin error de persistencia ni reintento. |
| Muchos enlaces 404 | Corte en 24 conexiones contando robots; conserva la primera página útil como resultado parcial. |
| Fuente editada/pausada | Rechazo de la siguiente descarga y fotos; prueba directa por API confirma invalidación del lease y contador sin incremento. |
| Retry-After | Segundos, HTTP-date actual/obsoleta, fecha pasada, inválidos y magnitudes enormes; dos horas no se convierten en 30 segundos. La espera persiste para otro trabajo. |
| Fotos/OCR real | Imagen con cabecera pero píxeles dañados rechazada antes de OCR; archivo mayor de 8 MiB rechazado; cancelación en 104 ms; reintento con lectura de las cuatro variantes y agua, confianza 94, sin Workers restantes. |
| Persistencia/publicación | Pasaron borradores, historial, correcciones protegidas, separación pública/privada, recuperación y copias. También restauró una copia de esquema 5 sin las columnas nuevas en una base de prueba vacía. |

Resultados completos: [pruebas finales](D:/Incoming/Videos/Proyectos/Gastronomia/costa-a-la-carta-nuevo-proyecto/artifacts/correcciones-auditoria-1/pruebas-finales.log), [navegador](D:/Incoming/Videos/Proyectos/Gastronomia/costa-a-la-carta-nuevo-proyecto/artifacts/correcciones-auditoria-1/navegador.json), [reproducción del navegador](D:/Incoming/Videos/Proyectos/Gastronomia/costa-a-la-carta-nuevo-proyecto/artifacts/correcciones-auditoria-1/verificar-navegador.mjs). Los tiempos son mediciones de esta máquina, no garantías de rendimiento universales.

La primera ejecución detectó dos ajustes necesarios: el límite provisional de resultado era demasiado pequeño para el piloto registrado y el caso de espera sin reserva inicial podía reprogramarse. Se corrigieron ambos. La prueba nativa inicialmente recibió EACCES del entorno de ejecución; se repitió con conexiones de loopback permitidas, sin saltarla. Se conserva ese log inicial y el log final que lo reemplaza como resultado vigente.

## Verificación nativa y su límite

Se añadieron pruebas reproducibles con **DNS UDP real y HTTP sobre sockets reales**, además de conservar las simuladas:

1. Un servidor DNS exclusivamente de loopback responde primero `8.8.8.8` y después `127.0.0.1`; SafeFetch recibe el segundo resultado mediante el resolver nativo y lo bloquea antes de leer contenido. La primera IP es un dato del fixture: no se conecta a ella.
2. Resolución del sistema de localhost, sin puerto especial en la URL examinada: rechazo por DNS privado.
3. Transporte nativo: fijación de lookup, Host, verificación de la IP efectiva, lectura de respuesta, redirección real a metadata y corte durante descompresión gzip.

Para probar el transporte HTTP sin abrir la política de producción se invoca **solo en el test** su frontera privada sobre un servidor de loopback. `get()` sigue rechazando esa IP; no se añadió un interruptor que permita redes privadas. La prueba de redirección compone la respuesta nativa con el rechazo normal del destino privado. Las discrepancias de IP efectiva, DNS mixto y diversas cadenas adversarias siguen teniendo además cobertura simulada. El transporte nativo probado es IPv4/HTTP; no se certifica con ello una matriz integral de IPv6/TLS público.

**Limitación pendiente para el auditor:** no se certifica una cadena integral adversaria HTTPS/DNS sobre una IP pública propia ni todas las rutas de red/TLS de Windows a partir de estos ensayos de loopback. No se crearon recursos públicos ni se atacaron sitios ajenos para suplir esa evidencia. La importación general permanece bloqueada y la suficiencia de esta cobertura debe decidirse en la nueva revisión independiente.

## Archivos y operación local

La lista exacta de archivos agregados/modificados, huellas anteriores/nuevas y la comprobación de que la política de evaluación no cambió está en [cambios.json](D:/Incoming/Videos/Proyectos/Gastronomia/costa-a-la-carta-nuevo-proyecto/artifacts/correcciones-auditoria-1/cambios.json). Abarca el parser/extractores/adaptadores, SafeFetch/robots, coordinador del motor, API y repositorios de autorización/trabajos/fotos, contratos/límites, validación de imagen/OCR, migración y compatibilidad de copias, package/lock y pruebas. Se actualizaron esta entrega y el procedimiento pendiente. Se regeneraron los directorios de build existentes.

Se respaldaron las dos bases SQLite locales del directorio D1 del proyecto en su directorio privado de copias. Después se aplicó **solo la migración 0006** a la base local configurada: seis instrucciones correctas, sin editar fichas ni publicaciones. [Registro de migración](D:/Incoming/Videos/Proyectos/Gastronomia/costa-a-la-carta-nuevo-proyecto/artifacts/correcciones-auditoria-1/migracion-local.log).

Los trabajos antiguos sin revisión de fuente registrada no reciben una autorización nueva implícita: sus resultados/historial permanecen, pero requieren un análisis nuevo para volver a obtener URLs. No se borraron borradores ni publicaciones.

`npm.cmd run build` y `npm.cmd run build:demo` finalizaron correctamente; la demo reconstruida generó sus 39 páginas y pasó su línea base. En Chromium mostró 20 fichas y cero errores de página o llamadas a la API. Las imágenes externas de demostración se bloquearon únicamente en el arnés para no generar tráfico ajeno.

También compiló la API y arrancó el servidor real de Wrangler local después de migrar: configuración 200, modo `evaluacion-limitada`, cuatro dominios, PDF/JavaScript externo/online deshabilitados e importación sin sesión rechazada con 401. [Evidencia de API local](D:/Incoming/Videos/Proyectos/Gastronomia/costa-a-la-carta-nuevo-proyecto/artifacts/correcciones-auditoria-1/api-local.json). El servidor temporal de comprobación fue detenido; se usa el lanzador habitual para abrir la aplicación y cargar el motor corregido.

## Qué debe revisar el auditor independiente

Repetir los casos de estrés, terminación y recuperación; comprobar las reservas atómicas y sus carreras, la invalidación de fuentes/fotos, las esperas persistentes y robots en redirecciones. Revisar los límites V8 frente al alcance de memoria que se quiera autorizar, la suficiencia de las pruebas nativas y los falsos cortes por presupuesto conservador. El OCR puede equivocarse y sigue exigiendo revisión contra el original; datos extraídos y fotografías no se publican automáticamente.

Los casos se ejecutan con `npm.cmd test` desde la raíz del proyecto. El arnés de navegador del enlace anterior utiliza exclusivamente el navegador instalado, builds locales y fixtures propios. No debe sustituirse por pruebas con escrituras en el catálogo activo.

**No se emite APTO ni se habilitan URLs arbitrarias.** La lista de evaluación está intacta. Faltan el cierre independiente de los hallazgos/cobertura nativa y la autorización expresa del usuario para considerar cualquier desbloqueo. PDF y JavaScript externo siguen fuera de alcance.
