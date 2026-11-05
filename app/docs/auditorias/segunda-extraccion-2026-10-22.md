# Segunda auditoría independiente — Costa a la carta

22 de octubre de 2026, America/Buenos_Aires. Revisión del código vigente, separada de la implementación. Carpeta exclusiva: `D:\Incoming\Videos\Proyectos\Gastronomia\costa-a-la-carta-nuevo-proyecto`.

**DICTAMEN GLOBAL: NO APTO PARA HABILITAR la importación como capacidad de la aplicación web publicada.**

Los seis hallazgos anteriores quedan verificados como corregidos en el alcance local ensayado. El bloqueo decisivo de esta revisión es funcional y de compatibilidad de publicación: el ejecutor sigue siendo Node local, no puede vincularse a una API online y la API actual rechaza el uso público. Compilar la interfaz o la API no demuestra una importación operativa en Cloudflare. La demo local de evaluación puede conservar su alcance actual; este informe no abre la importación general.

## Alcance, integridad y evidencia

Se leyeron `extraccion-1-pendiente.md`, `correcciones-extraccion-1.md`, los módulos de extracción, seguridad, coordinación, permisos, persistencia, fotos/OCR y las pruebas actuales. Se contrastó también el plan de arquitectura del 21/10 y la actualización del 22/10 sobre OCR en navegador.

No se ejecutó el motor vinculado al catálogo activo, no se leyeron sus credenciales, no se migró esa base, no se importaron sitios ajenos, no se instalaron herramientas y no se desplegó. Las bases de pruebas fueron nuevas y aisladas. Los servidores adversarios usaron únicamente loopback. La clave/certificado TLS del fixture se generó en memoria y no se instaló como CA del equipo.

Se agregaron únicamente este informe y evidencias/arneses de auditoría; los comandos de build regeneraron sus salidas habituales. Se compararon SHA-256 antes/después de **145 archivos de aplicación, contratos, migraciones, scripts, pruebas, manifiesto, lockfile y configuración: cero diferencias**. No hay Git en esta carpeta. [Integridad y hash de la política](../../artifacts/segunda-auditoria-2026-10-22/integridad.json), [huellas iniciales](../../artifacts/segunda-auditoria-2026-10-22/huellas-antes.json), [huellas finales](../../artifacts/segunda-auditoria-2026-10-22/huellas-despues.json).

La lista de evaluación conserva cuatro hostnames; su SHA-256 es `8F41C94A4F80EF4B18092AA71FBFF5FD3B6EDD063EC50D7451D454655CB06783`. No se habilitaron PDF, JavaScript externo ni acceso online.

## A. Seguridad de la extracción

**Resultado: las seis correcciones superan la reproducción y regresión local. No se encontraron hallazgos críticos o altos de extracción en los casos ejecutados.** Esto no certifica cualquier sitio ni una futura implementación de transporte diferente.

| Hallazgo anterior | Verificación independiente | Resultado |
| --- | --- | --- |
| CPU/memoria y amplificación | HTML de 1.814.004 bytes; límite externo de 1 ms; cancelación y lectura posterior; 60.155 bytes/5.000 ofertas; 413; conservación de checkpoint anterior y revisión aprobada | Corregido en el alcance probado |
| Edición de dominios | Trabajo pendiente, fuente pausada, trabajo en ejecución, foto pendiente y edición mediante API | No amplía permisos del trabajo antiguo |
| Retry-After | Segundos, tres formatos HTTP-date, valores inválidos/enormes, 429/503/302, otra instancia y espera persistente | Corregido |
| Robots tras redirecciones | Mismo origen y origen asociado, HTML y fotos; destino asociado que prohíbe la ruta | Contenido prohibido no solicitado |
| Presupuesto total | 404, DNS fallido, saltos, reintento, fotos, reserva concurrente y 40 MiB reservados | No excede 24 reservas del análisis |
| Imagen dañada | PNG sin IDAT útil y PNG con cabecera/IDAT pero píxeles inválidos; reconocimiento real en Chromium | Rechazada antes del OCR |

### Procesamiento excesivo, parada y recuperación

Reproducción con Node **v24.20.0**, suite completa actual:

- **1.814.004 bytes:** rechazo controlado en **497 ms**, con **31 avances** del temporizador del coordinador. El hilo principal siguió atendiendo eventos.
- **Terminación externa:** límite de prueba de 1 ms después de `started`; rechazo `TIEMPO_PROCESAMIENTO`, terminación y análisis válido posterior. Recorrido completo: **168 ms**. También pasó cancelar y volver a analizar.
- **60.155 bytes y 5.000 ofertas:** **un producto, cinco observaciones, checkpoint de 4.870 bytes**, sin error de persistencia ni reintento.
- Un checkpoint rechazado con 413 termina de forma permanente. Si una página anterior ya estaba confirmada, se conserva como resultado parcial.
- El ensayo independiente añadió una revisión aprobada y protegida, provocó un fallo `TIEMPO_PROCESAMIENTO` con `retryable:true` y comprobó que la ficha/revisión permanecía idéntica y el trabajo quedaba `failed`.
- La recuperación de lease conserva observaciones de intentos anteriores y rechaza resultados tardíos. El tercer intento interrumpido termina en `INTENTOS_AGOTADOS`; no se reclama indefinidamente.

Código: `engine/core/bounded-parser.ts:25` crea el hilo con límites V8; `:30` espera `terminate()`; `:34` impone el plazo externo. `engine/core/pipeline.ts:49` convierte 413 en error permanente y `:51` restaura el resultado anterior. `server/repositories/jobs.ts:19` limita reclamaciones y `:34` solo reprograma errores transitorios expresamente admitidos, hasta tres intentos y dentro de la ventana.

Los números medidos son reproducciones en esta máquina, no garantías universales de latencia ni de RSS.

### Permisos, espera y presupuesto compartido

`server/api/index.ts:54` incrementa la revisión de fuente, invalida generación/lease de trabajos pendientes o activos y detiene fotos pendientes/activas. `server/repositories/extraction-access.ts:10` verifica revisión/estado y `:15` aplica la política de evaluación a cada URL. Heartbeat, checkpoint y finalización comprueban la revisión y usan condiciones atómicas (`server/repositories/jobs.ts:12`, `:26`, `:27`, `:33`).

Las pruebas mediante API demostraron que cambiar dominios invalida el permiso existente sin aumentar el contador de solicitudes. Un dominio agregado a la fuente requiere un trabajo nuevo; no cambia retroactivamente el alcance del anterior.

`engine/security/retry-after.ts:3` interpreta segundos; `:5` a `:13` cubre IMF-fixdate, RFC 850 y asctime, validación de fecha y fechas pasadas. La suite y el arnés independiente verificaron encabezados HTTP-date en respuestas 429/503/302, sin una segunda conexión anticipada. Una espera de dos horas permanece en la base y no se reduce a 30 segundos ni a la ventana restante del trabajo.

`engine/fetch/safe-fetch.ts:28` vuelve a comprobar robots para cada destino; `:35` consume la reserva antes de resolver DNS. Las consultas de robots y cada salto consumen presupuesto. La reserva persistente de `server/repositories/extraction-access.ts:23` y `:31`/`:32` comparte el contador entre intentos y fotos, verificando saldo y lease de forma atómica.

Resultados adicionales reproducidos:

- 24 conexiones, incluidos robots y enlaces 404; conserva la primera página útil.
- 24 fallos DNS consumen las 24 reservas; la siguiente operación se rechaza antes del resolver.
- Seis solicitudes ante una cadena que excede cinco redirecciones; cada una cuenta.
- Después de 23 reservas, el reintento mantiene 23; la foto consume la 24 y la 25 se rechaza.
- Con saldo de una, dos reservas concurrentes producen una sola aprobación y contador 24. Este ensayo concurrente usa el adaptador SQLite de pruebas, no dos dispositivos de producción.
- Veinte reservas HTML de 2 MiB agotan los **40 MiB reservados**, aun con respuestas vacías; no se devuelve saldo. Las fotos usan el mismo saldo con reservas de hasta 8 MiB. El corte puede ocurrir antes de 24 por este límite conservador.

El límite cuenta solicitudes al origen extraído, no las llamadas de control a la API ni los paquetes individuales de una resolución DNS. Esa es la semántica observada del presupuesto definido.

### Imágenes y OCR

`src/services/ocr.ts:9` inspecciona el archivo, `:12` exige `createImageBitmap`, `:13`/`:14` contrastan dimensiones reales y límites, y recién `:16` crea el Worker OCR. `shared/media/image.ts` rechaza PNG sin datos de píxeles útiles.

En Chromium real, con el build actual y recursos OCR locales:

- El archivo con cabecera y píxeles dañados produjo «No se pudo abrir la foto».
- El archivo mayor de 8 MiB se rechazó.
- Cancelación: `AbortError` en **107 ms**.
- Un intento posterior reconoció cuatro variantes de pizza y agua; confianza global **94**; el temporizador del navegador avanzó 58 veces.
- **Cero Workers restantes** y cero errores de página.

El OCR continúa requiriendo revisión editorial. Reconocer texto no aprueba platos, moneda, importes ni derechos de una fotografía.

### Fronteras de red: pruebas reales y garantías pendientes

| Control | Evidencia ejecutada | Alcance exacto |
| --- | --- | --- |
| IPv4, metadata y notaciones alternativas | Suite de URLs y servidor HTTP adversario real sin impactos al manejador | Política rechaza privados/reservados; el test adversario con puerto especial también puede cortarse por la regla de puertos |
| IPv6 privada, mapeada, traducción y documentación | Pruebas de clasificación; `get('https://[::1]/')` rechazado | Política de direcciones; no se conectó a IPv6 pública |
| DNS cambiante | DNS UDP real: primero 8.8.8.8 y después 127.0.0.1; segundo resultado bloqueado | No hubo conexión a 8.8.8.8; no es una cadena integral pública |
| DNS mixto A/AAAA | Nuevo servidor DNS UDP real: A 8.8.8.8 y AAAA ::1; rechazo `DNS_NO_PUBLICO`, cero bytes | Resolver nativo configurado en fixture e inyectado a SafeFetch; no sustituye una prueba integral del resolver del SO sobre un dominio público propio |
| Lookup fijado/Host | Transporte HTTP nativo sobre socket IPv4 real | Se invocó la frontera privada del transporte sobre loopback, como en la suite vigente; `get()` no habilitó redes privadas |
| TLS/SNI/certificado/hostname | Nuevo servidor HTTPS real en ::1: certificado efímero confiado solo por el cliente de prueba, SNI/Host correctos; sin esa confianza o con otro hostname la descarga falla | No se desactivó `rejectUnauthorized`; no se cambió el almacén de confianza del equipo |
| IP efectiva | Comparación con socket real IPv6/TLS; se forzó lookup de fixture discrepante y se obtuvo `IP_CAMBIADA`, cero bytes | El desvío se hizo exclusivamente en el arnés. También se conserva la prueba simulada existente |
| Redirección a metadata | Respuesta 302 de servidor HTTP nativo, seguida por validación normal del destino | Sin conexión a metadata; composición controlada, no origen público adversario |
| Redirección y robots | Simulación de transporte de origen inicial y asociado; robots del segundo prohíbe `/privado` | Se obtuvo solo robots del destino; su contenido no se solicitó |
| Streaming/descompresión | HTTP nativo y gzip real que excede límite después de descomprimir | Corte de bytes decodificados; conserva límites de streaming y Content-Length |

El test IPv6/TLS accede deliberadamente a `SafeFetch.request()` desde el arnés para verificar esa frontera sin introducir una excepción de loopback en producción. Se confía el certificado del fixture únicamente mediante una envoltura de `https.request` en el test; también se comprueba el rechazo sin esa envoltura de confianza. La política pública de `get()` permanece intacta.

**NO VERIFICABLE CON LA EVIDENCIA DISPONIBLE:** cadena integral adversaria de DNS público propio → IP pública IPv4/IPv6 → HTTPS con CA pública → redirecciones/DNS rebinding bajo la topología real de destino. No se dispone aquí de ese origen controlado y no se crearon recursos públicos. Tampoco se certifican todas las rutas TLS/red de Windows. Las pruebas controladas reducen el pendiente anterior, pero no se presentan como esa garantía integral.

## B. Compatibilidad con la futura publicación web

**Resultado: NO APTO PARA HABILITAR la importación web publicada en el estado actual.** Se conserva la separación de capas del plan; falta su integración online comprobada.

| Componente | Dónde corre realmente | Consecuencia |
| --- | --- | --- |
| `worker/main.ts` | Proceso Node de la computadora, iniciado por `npm run motor`/lanzador | Reclama importaciones, fotos, publicaciones y copias; debe estar activo mientras ejecuta esas tareas |
| `engine/core/bounded-parser.ts` y `parser-worker.ts` | Hilo Node dentro de ese proceso, con `node:worker_threads` | No es un Cloudflare Worker ni un Web Worker del navegador |
| `server/api/index.ts` | API Hono que compila y funciona en workerd para el alcance local | Autoriza y persiste; su bundle no incluye el ejecutor de análisis |
| `src/services/ocr.ts` y `ocr.worker.js` | Navegador del administrador | Reconocimiento de una foto aportada localmente sin motor Node; descargar una foto web sí requiere el motor |

No hace falta mantener Node las 24 horas para conservar trabajos en cola, pero **sí un ejecutor Node activo para procesar webs**. El motor se comunica como cliente saliente: no necesita servir el sitio público ni abrir conexiones entrantes a la PC. Desde otro navegador se puede solicitar una tarea solo cuando exista la API online; el navegador no reemplaza al ejecutor. Con la PC apagada y sin otro ejecutor, no se procesa la importación.

Esto coincide con la dependencia aceptada en `docs/referencia/documentos-carpeta-original/costa-a-la-carta-arquitectura-revision-2026-10-21.md:62` y `:88` a `:96`: portal/datos publicados en nube, trabajos esperando al ejecutor. La actualización posterior de OCR mueve ese reconocimiento al navegador. No hay motivo demostrado para reconstruir el catálogo, la revisión o las cartas.

### Hallazgo B1 — ALTO de compatibilidad/entrega, no un bypass de seguridad

**La versión funcional para Cloudflare aún no está disponible; el ejecutor no puede atenderla.**

Evidencia reproducible con el código vigente, esbuild instalado y **Miniflare 5.20261006.1-alpha / workerd 1.20261006.1**, fecha de compatibilidad `2026-10-01`:

1. La API compila a un bundle de **956.561 bytes**. El grafo de módulos no contiene `worker/main.ts` ni `bounded-parser.ts`.
2. En D1/KV efímeros, health/config responden 200 y una importación sin sesión 401. Con sesión local válida se encola un trabajo: 202, `queued`, intento 0, solicitudes 0. La API sola no ejecuta el analizador.
3. La misma API con hostname `https://costa-audit.example` devuelve **403 `SOLO_LOCAL`**. `server/auth/identity.ts:6` restringe el hostname; `server/api/index.ts:23` aplica esa condición también a rutas públicas.
4. Con variables representativas `APP_ENV=production`, `AUTH_MODE=google`, responde **503 `IDENTIDAD_PENDIENTE`** (`server/auth/identity.ts:5`). No se implementó identidad online ni se anuló ese bloqueo.
5. `worker/main.ts:9` rechaza cualquier API distinta de `http://127.0.0.1:8787`. El motor no puede vincularse hoy al endpoint Cloudflare previsto. No se ejecutó `main.ts` contra el dispositivo real para verificar una condición que está explícita en esa función.
6. Un Worker de prueba en workerd, incluso con `nodejs_compat`, puede importar el módulo `node:worker_threads`, pero `new Worker(...,{eval:true})` devuelve **«The Worker method is not implemented»**. El éxito de un import o un bundle no proporciona hilos Node ejecutables.

La [documentación oficial de compatibilidad Node de Cloudflare](https://developers.cloudflare.com/workers/runtime-apis/nodejs/#non-functional-stub-modules), consultada en esta auditoría, clasifica `node:worker_threads` entre los módulos stub no funcionales. La medición local coincide con esa limitación. No se presume equivalencia entre ambos tipos de Worker.

**Corrección necesaria y acotada:** completar la integración online que ya describe el plan: configuración/identidad y permisos de la API publicada, vinculación explícita y segura del ejecutor Node de este proyecto por HTTPS, y prueba del circuito en un entorno workerd representativo con ese ejecutor. Debe mantenerse la validación de revisión, reservas, cancelación, checkpoints y publicación. No alcanza con quitar `SOLO_LOCAL`, cambiar `APP_ENV` o agregar `nodejs_compat`.

Si el criterio de aceptación exige además *procesar importaciones con la PC apagada*, el estado actual no lo satisface y el plan citado tampoco lo prometía: no hay un ejecutor independiente de la PC configurado y verificado. Esta auditoría no instala ni selecciona infraestructura para suplirlo.

### Qué sí compila y funciona

`npm.cmd run build` pasó. Es un build Vite de la interfaz y OCR, no un empaquetado del motor Node para Cloudflare. La API se compiló y ejecutó separadamente en workerd mediante el arnés de auditoría.

`npm.cmd run build:demo` pasó: **39 páginas** generadas. Chromium mostró **20 fichas**, cero llamadas a la API y cero errores de página. Las imágenes externas se bloquearon en el arnés. Esto demuestra la demo estática y el OCR local del navegador, no el administrador online ni una importación remota.

No existe una configuración de producción del proyecto entre los archivos de configuración revisados; `wrangler.local.jsonc` y su wrapper son exclusivamente locales. No hubo despliegue ni comprobación de una cuenta Cloudflare, identidad real, cuotas o enrutamiento/Assets de producción. Esa parte permanece **NO VERIFICABLE CON LA EVIDENCIA DISPONIBLE** además de los bloqueos funcionales ya reproducidos.

## C. Limitaciones conocidas y regresión

- `resourceLimits` limita partes del heap V8 y la pila, no el RSS completo, memoria nativa, todos los ArrayBuffer ni el proceso principal. No es aislamiento de sistema operativo. Se mantiene el límite de entrada, salida y tiempo; no se ejecuta JavaScript procedente del sitio. La [documentación de Node](https://nodejs.org/docs/latest-v24.x/api/worker_threads.html#new-workerfilename-options) distingue esos límites.
- El presupuesto de 40 MiB es de **máximos reservados**, compartido con fotos; puede detener fuentes legítimas antes de 24 solicitudes. No representa bytes efectivamente descargados.
- El soporte probado de OCR corresponde a Chromium en esta máquina y fixtures propios. No certifica toda combinación de navegador/códec, ni exactitud sobre cualquier carta real. La cancelación medida no promete latencia universal.
- Los escenarios DNS/TLS públicos y las condiciones reales de publicación siguen pendientes en los términos de A y B. Cambiar el transporte o el entorno del analizador requiere repetir esas fronteras, no heredar automáticamente este dictamen.
- Las pruebas de revisión, cartas, borradores, recuperación y publicación corrieron contra repositorios/API con bases aisladas. No se realizó una recorrida gráfica completa de edición/publicación contra el catálogo activo.

**Regresión efectivamente ejecutada:** `npm.cmd test`: **85 aprobadas, cero fallidas, cero omitidas**. Incluye OCR/procedencia y revisión obligatoria, correcciones protegidas, variantes y moneda, borradores y versiones de carta, revisión idempotente, separación pública/privada, publicación humana, rechazo de entregas tardías, recuperación de lease, tres intentos, copias/restauración y compatibilidad con copias anteriores. El arnés independiente agrega **9 pruebas aprobadas**, cero fallidas/omitidas. Total de pruebas Node exitosas: **94**. Workerd, builds y reconocimiento real de navegador se registran por separado, no se suman como si fueran tests de esa suite.

La primera corrida de la suite dentro de la restricción de red falló por EACCES de loopback y timeout DNS. Se conserva [ese log](../../artifacts/segunda-auditoria-2026-10-22/npm-test.log). Se repitió con acceso de loopback permitido y las 85 pasaron, sin omitir pruebas. El arnés workerd se adaptó a la API Miniflare instalada y aplicó las migraciones a D1 efímero, omitiendo solo el PRAGMA local de activación de claves foráneas que D1 impone por su propia implementación. Esas adaptaciones pertenecen al arnés de auditoría; no al código de aplicación.

### Reproducción y archivos de evidencia

Desde la raíz del proyecto, con las dependencias ya instaladas y conexiones de loopback permitidas:

```powershell
npm.cmd test
node --test artifacts/segunda-auditoria-2026-10-22/red-controlada.test.mjs
npm.cmd run build
npm.cmd run build:demo
node artifacts/segunda-auditoria-2026-10-22/cloudflare.mjs
node artifacts/segunda-auditoria-2026-10-22/navegador.mjs
```

El arnés de navegador se basa en el recorrido existente de correcciones, con la salida dirigida a esta nueva evidencia; no se presenta como una segunda implementación del OCR. `cloudflare.mjs` usa el conversor de opciones V4 que exporta la versión V5 instalada de Miniflare. Sus recursos D1/KV son efímeros y no apuntan a `.local/state`.

| Evidencia | Archivo |
| --- | --- |
| Suite vigente y métricas de estrés | [npm-test-loopback.log](../../artifacts/segunda-auditoria-2026-10-22/npm-test-loopback.log) |
| Ensayos adicionales y TLS/DNS reales | [red-controlada.test.mjs](../../artifacts/segunda-auditoria-2026-10-22/red-controlada.test.mjs), [red-controlada.log](../../artifacts/segunda-auditoria-2026-10-22/red-controlada.log) |
| Runtime Cloudflare representativo | [cloudflare.mjs](../../artifacts/segunda-auditoria-2026-10-22/cloudflare.mjs), [cloudflare.json](../../artifacts/segunda-auditoria-2026-10-22/cloudflare.json), [cloudflare.log](../../artifacts/segunda-auditoria-2026-10-22/cloudflare.log) |
| OCR y demo en Chromium | [navegador.mjs](../../artifacts/segunda-auditoria-2026-10-22/navegador.mjs), [navegador.json](../../artifacts/segunda-auditoria-2026-10-22/navegador.json), [navegador.log](../../artifacts/segunda-auditoria-2026-10-22/navegador.log) |
| Compilaciones | [build.log](../../artifacts/segunda-auditoria-2026-10-22/build.log), [build-demo.log](../../artifacts/segunda-auditoria-2026-10-22/build-demo.log) |

**Cierre:** seis correcciones verificadas localmente; B1 abierto antes de declarar la importación compatible con la aplicación web publicada. No se modificó el estado de habilitación ni se emitió autorización de despliegue.
