```text
PROMPT MAESTRO DE IMPLEMENTACIÓN — COSTA A LA CARTA
Referencia: 21/10/2026. Idioma: español argentino.

1. MISIÓN, ALCANCE Y AUTORIDAD

Sos el agente programador principal. Evolucioná la aplicación existente hasta conseguir un portal gastronómico real y un motor extensible de importación. El dueño no es programador. Su recorrido principal debe ser: pegar URL → analizar → revisar/corregir → guardar → publicar → actualizar sin perder correcciones. Implementá ese recorrido y sus cartas, medios, fuentes, versiones, permisos y operación gráfica. No entregues una simulación como importación real.

La arquitectura de este encargo es un monolito modular React/Vite + API Hono + repositorios SQLite/D1 + un ejecutor Node de tareas. Los límites concretos están definidos abajo. No reescribas con Next.js ni sustituyas la identidad visual. Supabase se evaluará después: no es una tarea inmediata ni un requisito para empezar.

Este prompt habilita el trabajo local de implementación cuando el dueño te lo entregue para programar. No autoriza contratar servicios, activar facturación, crear recursos externos, migrar bases remotas ni desplegar. Prepará resultados concretos y verificables antes de pedir las aprobaciones que correspondan. Avanzá autónomamente en tareas locales reversibles; no pidas confirmación por cada archivo.

NO tocar La Costa en Datos, Territorio, Emergencias La Costa ni ningún otro proyecto. NO usar otros proyectos de Supabase, secretos, tablas, usuarios, Storage o motores privados ajenos. NO copiar motores de Inoreader. NO crear cuentas/organizaciones para evadir cuotas. NO activar facturación, planes pagos ni APIs con costo. NO desplegar, modificar audiencia, conectar servicios ni hacer push sin autorización expresa. NO eliminar funcionalidades útiles, sobrescribir trabajo nuevo, inventar datos ni exigir un conector por restaurante. NO prometer compatibilidad universal sin pruebas. NO ampliar a pagos, delivery propio, reservas, suscripciones, chatbots o microservicios innecesarios.

Usá un agente cuando alcance; no crees ramas, worktrees, auditorías ni fases por costumbre. Las auditorías independientes se reservan para los dos hitos de riesgo definidos en este encargo. No presupongas aprobaciones que solo aparezcan mencionadas en documentos anteriores; contrastá contradicciones importantes con el dueño. No hagas commits con cambios ajenos ni restablezcas el árbol.

2. REPOSITORIO Y VERIFICACIÓN INICIAL

Ubicación conocida en Windows: D:\Incoming\Videos\Proyectos\Gastronomia\costa-a-la-carta. Si ejecutás en otro entorno, localizá ese proyecto antes de crear nada. Sitio existente: https://costa-a-la-carta.o4ftony10.chatgpt.site/ . No crees otro proyecto de interfaz desde cero.

El diagnóstico entregado originalmente corresponde a b1140c3. Una revisión posterior observó HEAD 2bc13df, modificaciones locales en package.json y package-lock.json, pruebas de línea base y documentos anteriores. Comprobá el estado actual: puede haber cambiado otra vez. Inspeccioná AGENTS.md aplicables, Git, dependencias, rutas, guardado, pruebas, build y manifest. Preservá trabajo nuevo; reutilizá capacidades realmente implementadas.

Estructura conocida:
- src/App.jsx: contexto, router, pantallas, formularios y acceso a datos muy concentrados.
- src/estilos.css: identidad y adaptación móvil.
- src/datos.js: catálogo ficticio, categorías, localidades y filtros.
- src/supabase.js: integración opcional y mensajes, no conexión aprobada.
- src/main.jsx: montaje React.
- src/entrada-servidor.jsx y scripts/prerender.mjs: HTML y sitemap desde datos estáticos.
- supabase/esquema.sql y datos-ejemplo.sql: referencia preparada; no ejecutar.
- tests/directorio.test.mjs, tests/linea-base*, scripts/linea-base.mjs.
- .openai/hosting.json: identidad de Sites y publicación estática dist.
- docs/referencia y docs/informes: antecedentes, no prueba automática de funcionalidad.

La revisión de referencia ejecutó solo las cinco pruebas de directorio, que pasaron. No certificó un motor, seguridad remota, build actual ni experiencia visual. Sites informó versión 2 activa y acceso custom; no deduzcas acceso público ni equivalencia con Git. Nunca imprimas secretos ni leas variables ajenas para completar configuración.

Informá brevemente qué se conserva, qué ya se implementó y qué falta. Usá la línea base existente y verificaciones pertinentes; no dediques un hito entero a rehacer informes o capturas ya útiles. Priorizá la primera extracción real antes de una refactorización global.

3. PRODUCTO Y REUTILIZACIÓN

Identidad: COSTA A LA CARTA — SABORES DE NUESTRA COSTA. Piloto: 10–20 establecimientos REALES de San Bernardo del Tuyú; expansión por Provincia → Partido → Localidad → Establecimiento, administrable sin código. Incluí locales sin carta o sin precios. No confundas sucursales.

Conservá portada, diseño, cabecera, tarjetas, categorías, búsqueda, filtros compartibles, favoritos, formularios, paneles y rutas /explorar, /categorias, /categoria/:categoria, /lugar/:slug. Agregá cartas navegables y fechas verificadas; ocultá secciones sin información. Eliminá del modo real los fallbacks que atribuyen fotos genéricas, reseñas, descripciones, horarios, valoraciones o rangos económicos ficticios. Los favoritos locales pueden seguir siendo preferencias del dispositivo.

No obligues a un delivery a publicar un domicilio privado. La ficha necesita nombre, localidad confirmada, categoría, referencia de verificación y aprobación editorial; teléfono, carta, dirección pública, fotos y precio pueden faltar. WhatsApp solo con evidencia de que ese número/canal corresponde al comercio. No deduzcas vegetarianismo, accesibilidad o delivery por el nombre.

Los slugs se asignan una vez. Identificador interno estable separado del slug. Cambios deliberados de slug generan alias/redirect. Cambiar alojamiento puede cambiar el hostname: conservá rutas y prepará redirecciones, pero no prometas conservar la URL de Sites sin verificar y aprobar la migración.

4. ESTRUCTURA Y CONTRATOS

Separá gradualmente la interfaz, sin una reescritura masiva:
src/components, src/pages, src/features/{negocios,importaciones,cartas,revision,medios,propietarios}, src/data.
shared/contracts: esquemas Zod y tipos versionados.
server/{api,auth,application,repositories,publication}.
engine/{core,fetch,discovery,extractors,adapters,normalize,match,diff,documents,security}.
worker: ejecutor Node, checkpoints, emparejamiento y lanzador.
db: esquema y migraciones SQLite/D1.
tests: unidades útiles, integración, seguridad, recorridos y fuentes reales registradas.

Son límites conceptuales; adaptá carpetas al estado real sin duplicar componentes. TypeScript en módulos nuevos; convertí JSX existente solo cuando aporte valor. Conservá versiones compatibles ya instaladas, verificá dependencias nuevas y lockfile; no actualices todo por rutina.

La interfaz solo utiliza servicios de aplicación; no escribe el catálogo directamente en localStorage ni en Supabase. Definí repositorios concretos, no un framework de persistencia genérico: CatalogRepository, SourceRepository, JobRepository, RevisionRepository, MediaStore e IdentityProvider. Los extractores producen propuestas y nunca escriben publicaciones. Seleccioná explícitamente el backend; evitá que variables VITE_SUPABASE heredadas activen el cliente anterior. Una configuración incompatible debe fallar de forma cerrada, sin contactar esa base ni mostrar sus secretos.

API mínima versionada:
- GET /api/v1/public/listings y /public/listings/:slug: solo revisiones publicadas y campos públicos.
- CRUD protegido de borradores de negocios, cartas, medios y fuentes.
- POST /imports: crea trabajo idempotente, responde 202 con jobId.
- GET /imports/:id: etapa, checkpoints, observaciones y errores autorizados.
- POST /imports/:id/cancel y /retry.
- POST /reviews/:id/decisions: decisiones por campo con revisión esperada.
- POST /listings/:id/publish: solicita publicación de una revisión aprobada; no implica éxito inmediato.
- POST /listings/:id/revert: nueva revisión a partir de una anterior.
- API separada de worker para claim/heartbeat/checkpoint/result, con permisos estrechos.

Usá Idempotency-Key para creación/reintentos relevantes, expectedRevision/If-Match para cambios y 409 para edición concurrente. Validación y autorización siempre en servidor. Errores estructurados con código interno, mensaje argentino y acción sugerida. No mostrar trazas en la interfaz normal.

5. EJECUCIÓN, PERSISTENCIA Y ALOJAMIENTO

Desarrollo totalmente local: API en el runtime de Workers mediante Wrangler y D1/KV locales persistentes, dentro de este proyecto. Ejecutor Node local mediante la misma API. No conectar datos remotos para desarrollar. Separá base de pruebas, demo ficticia y piloto real.

Referencia online, pendiente de autorización: React/Vite como assets, Hono en Cloudflare Workers Free, una D1 dedicada y un namespace KV dedicado. La API recibe escrituras pequeñas; Node hace extracción, OCR, transformaciones y generación de HTML. No mantener trabajos largos en una petición HTTP, waitUntil o una pestaña.

Sites actual se preserva. Sus guías documentan runtime Worker y almacenamiento; no lo describas como incapaz de backend por naturaleza. Este encargo usa Workers propio como referencia presupuestaria verificable. Antes del cambio de alojamiento, explicá URL, acceso, cuotas, migración y vuelta atrás. No modifiques su manifest/identidad/audiencia para publicar sin permiso.

Entregá un lanzador gráfico para Windows «Costa a la carta — Motor», con runtime resuelto, inicio/cierre, estado conectado/desconectado, reconexión y diagnóstico simple. El dueño no debe escribir comandos ni instalar dependencias manualmente en cada uso. Un instalador/asistente inicial puede requerir una aprobación puntual. Inicio automático con Windows es opcional y consentido.

Emparejamiento único por código corto de un solo uso, expiración y revocación. Token de dispositivo limitado, guardado en almacenamiento protegido del SO; nunca una clave general de Cloudflare o de base. Tráfico saliente HTTPS hacia una URL de API permitida. Sin puertos entrantes, túneles, lectura de carpetas ajenas ni credenciales dentro del sandbox de extracción.

Con PC apagada: portal y medios publicados continúan online; admin guarda borradores en la nube; extracción/OCR/preparación de publicación quedan pendientes. Mostrá «Esperando que se conecte tu motor». No afirmar «Publicado» hasta completar el commit. Al iniciar el motor, reanudar. No instalar un servidor pago para ocultar esta limitación.

Google OIDC será la identidad online del piloto usando biblioteca mantenida, no un OAuth inventado. Configuración externa solo tras autorización. Localmente, identidad de prueba limitada a loopback y compilación de desarrollo; un despliegue real debe fallar si esa vía está activada. El modo local no demuestra la seguridad online.

6. MODELO DE DATOS

Implementá claves foráneas, índices, restricciones y migraciones locales versionadas. Conservá listings como única identidad comercial; no mantengas otro catálogo autónomo de importados. Usá UUID/texto estable, timestamps UTC y zona horaria comercial America/Argentina/Buenos_Aires. No copies SQL PostgreSQL a SQLite sin adaptar tipos, funciones, políticas e índices.

Entidades mínimas:
- provinces → districts → locations, con alias y nombres editables.
- listings: id, slug, estado comercial verificado, localidad, revisión publicada y borrador; dirección pública opcional, zona de atención, contactos, coordenadas verificadas, descripción y rango económico opcional.
- categories, listing_categories; servicios/canales y relaciones normalizadas.
- listing_aliases, slug_redirects; relación opcional de marca/sucursales sin fusionarlas.
- opening_periods y opening_exceptions: día, hora local, fin al día siguiente, vigencia, temporada y excepciones.
- users, auth_identities, sessions, listing_memberships, listing_claims, suggestions; conservar/compatibilizar los conceptos owners, leads y reviews.
- sources y listing_sources: asociación muchos a muchos; URL oficial/social/documento/manual, política de acceso, revisión de condiciones, dominios permitidos y estado.
- source_resources: URL original/final, tipo, status HTTP, hash, ETag, Last-Modified y evidencia permitida.
- import_jobs, import_runs y job_checkpoints: entradas, intentos, versión del motor, lease, resultado, errores, tiempos y consumo.
- observations: entityType/entityId o clave de candidato, fieldPath, rawValue, normalizedValue, sourceId/resourceId/runId, observedAt, fecha efectiva si consta, método y versión, selector/JSON Pointer/página/boundingBox, evidencia breve y nivel/motivo de incertidumbre.
- field_selections: observación elegida, entidad/campo, revisión, autor, fecha, motivo, locked y motivo de protección.
- change_sets y change_items: base editorial, observación previa/nueva, decisión, conflicto y autor.
- duplicate_candidates: candidatos, señales, explicación y decisión.
- media_assets, media_variants, media_rights y vínculos a ficha/producto/carta.
- listing_revisions, publication_jobs, publication_artifacts, audit_events y backup_manifests.

Las observaciones son inmutables, incluso si provienen de carga manual. Un dato editado conserva autor y referencia. Los campos canónicos materializados y sus selecciones deben actualizarse juntos; no dejar dos verdades divergentes. No guardar toda la procedencia en un JSON mutable que se reemplace con cada importación.

Catálogo gastronómico:
- menus: identidad, establecimiento, nombre, canal/temporada.
- menu_versions: número, estado, fuente, vigencia, revisadoEn, versión previa y contenido congelado al publicar.
- menu_sections: identidad lógica y orden; pertenencia/snapshot por versión.
- products: identidad lógica del plato, nombre y descripción.
- product_variants: identidad, tamaño, cantidad/unidad, atributos explícitos; variante base cuando no hay variantes.
- price_offers: variante, importe en unidad monetaria menor entera, moneda ISO, canal salón/delivery/retiro, condiciones, promoción, fechas, observación y estado.
- menu_version_entries y sus variantes/ofertas: pertenencia, orden y copia exacta de lo seleccionado en esa versión. Una versión histórica no lee precios actuales mutables.

Un mismo producto puede aparecer en distintas cartas sin crear identidades incoherentes. No generar combinaciones tamaño/canal que no estén en la fuente. Precio desconocido = null; cero requiere evidencia. Conservar texto monetario original, no adivinar moneda solo por «$», interpretar separadores argentinos sin flotantes y pedir revisión de ambigüedades. El rango $/$$/$$$ del local no es un precio de producto. No imponer fecha de vigencia inventada: separar observación, revisión y vigencia.

7. MOTOR Y CONTRATO COMÚN

Contrato ExtractionResult versionado: schemaVersion, runId, source/resource identifiers, extractor/version, estado complete/partial/blocked/failed, businessCandidates, observations, menuCandidates, mediaCandidates, discoveredResources, warnings, errors, coverage y metrics. Coverage explica qué páginas/secciones se procesaron y cuáles no. Los contadores visibles se calculan a partir del resultado persistido.

Cada observación tiene evidencia y normalización; «confianza alta/media/baja» debe explicar su motivo. No presentar puntajes arbitrarios como probabilidades calibradas. Un teléfono o precio dudoso puede quedar propuesto, nunca confirmado sin revisión.

Pipeline:
1) Normalizar URL, política de acceso y presupuesto; registrar intención.
2) Descargar de forma segura y detectar HTML, JSON, XML, PDF o imagen.
3) Leer JSON-LD/Schema.org, incluidos @graph y múltiples entidades Restaurant, LocalBusiness, Menu, MenuSection, MenuItem y Offer. No mezclar distintas sucursales ni confiar ciegamente en datos estructurados viejos.
4) Extraer HTML semántico: títulos, contactos, horarios, tablas/listas de carta, links tel, wa.me y redes. Conservar relación espacial/estructural de nombres y precios.
5) Descubrir menú/carta/contacto/nosotros/ubicación/galería; puntuar enlaces por texto, URL y tipo. Sitemap/RSS/Atom son ayuda, no garantía de datos gastronómicos.
6) Usar API pública permitida de CMS, por ejemplo WordPress, cuando haya evidencia de que existe. No barrer endpoints privados.
7) Aplicar adaptadores reutilizables por familia/formato.
8) Si el contenido depende de JavaScript y la política lo permite, navegador aislado; volver a pasar DOM/resultados por los extractores comunes.
9) PDF con texto: PDF.js, texto y posiciones; imagen/escaneo: OCR local Tesseract, agrupamiento por filas/columnas y cajas. Sin texto inventado.
10) Normalización, candidatos de identidad, cambios y revisión.

Adapter: id, version, capabilities, detect(context), discover(context), extract(context), fixtures. Recibe SafeFetch, DocumentReader y presupuesto del núcleo; no hace red arbitraria, no tiene secretos y no escribe el catálogo. Si falla, conservar resultados válidos de otras estrategias y explicar el límite. Registrar adaptadores sin tocar la UI ni reescribir el núcleo.

Configuración normal de una fuente: tipo sugerido, URL de carta/contacto, dominios relacionados confirmados, método habilitado, límites y frecuencia. Opcionalmente un modo visual avanzado permite señalar región de carta con vista previa. No exigir selectores CSS, JavaScript o JSON al dueño. No aceptar código ejecutable como «regla configurable».

Valores iniciales del producto: 8 páginas HTML, profundidad 2, 5 redirecciones, 2 MB descomprimidos por página, PDF 10 MB/20 páginas, imagen hasta 10 MB/20 megapíxeles, total 40 MB por trabajo, 30 s por descarga y 60 s por navegación. Una solicitud cada 2 s por dominio y una tarea pesada simultánea. Trabajo máximo 10 min con continuación por checkpoints. Ajustar solo con medición y sin ampliar límites silenciosamente.

Mismo origen por defecto. Un menú externo o CDN necesita validación de red y asociación explícita con la fuente; habilitar su dominio de forma comprensible, sin hacer obligatorio programar un adaptador. Evitar parámetros de rastreo, calendarios infinitos, URLs repetidas y descargas de archivos no pertinentes. Respetar condiciones/robots aplicables; robots permitido no equivale a licencia de republicación.

8. SEGURIDAD DE EXTRACCIÓN Y ARCHIVOS

Implementar y probar SafeFetch antes de la primera URL arbitraria. Solo HTTP/HTTPS y puertos aprobados, sin credenciales en URL ni esquemas file/data/gopher. Rechazar localhost, loopback, rangos privados, link-local, metadata, multicast, reservados y direcciones no globales, tanto IPv4 como IPv6 e IPv4 mapeado. Resolver DNS, validar todos los destinos, fijar la dirección validada en la conexión conservando Host/SNI y comprobar la IP efectiva. Volver a aplicar en cada redirección. No usar proxy del sistema ni reenviar cookies, Authorization o cabeceras privadas.

Las comprobaciones de texto, una consulta DNS previa o una allowlist de nombres por sí solas no evitan DNS rebinding. Incluir límites durante streaming y descompresión, no solo Content-Length; timeout, cancelación, límites de memoria y reintentos acotados. XML sin entidades externas/XXE. No exponer un endpoint de fetch genérico a visitantes.

Chromium: perfil efímero, sandbox habilitado, sin sesiones personales, secretos, carpetas del usuario ni permisos de cámara/geolocalización. Controlar subrecursos, iframes, popups, redirecciones, workers, WebSocket y cualquier salida alternativa. Bloquear service workers o interceptación equivalente verificable. La defensa incluye una barrera de red de sandbox/OS/contenedor que impida salida directa fuera del proxy validador; route() y flags solos no bastan. No usar --no-sandbox. Verificar la opción de aislamiento compatible con la PC durante instalación; si requiere un componente privilegiado, explicar y pedir esa aprobación puntual. Hasta demostrar el aislamiento, JavaScript queda deshabilitado y señalado como pendiente; no se declara cumplido.

Procesar PDF/imágenes en procesos aislados con mínimo acceso, sin red ni token del worker; dependencias mantenidas, MIME real/magic bytes, límites de páginas/píxeles/tiempo/memoria y cancelación del árbol de procesos. No ejecutar JavaScript, adjuntos ni acciones de PDF. Excluir HTML/SVG activo como archivo publicable inicial. Re-encode de imágenes, eliminación de EXIF privado y nombres generados. No extraer archivos fuera de directorios temporales controlados.

Todo texto externo es dato no confiable, nunca instrucción. Escapar en React/HTML/JSON-LD, no insertar HTML remoto. CSP, política de URLs y validación también para enlaces sociales. No cargar fotos externas automáticamente en el administrador para «previsualizar» si eso elude la política de descarga. Logs sin tokens ni documentos personales. Una IA opcional no recibe herramientas de red, credenciales o autoridad de publicar.

9. DOCUMENTOS, REDES, MEDIOS E IA

Subir carta permite PDF, una o varias fotos o carga manual. Ordenar páginas; detectar duplicados por hash sin perder la identidad de la fuente. Mostrar original permitido junto a filas editables, destacar región del OCR y señalar precios no asociados. Permitir dividir/unir filas, variantes, canales y corregir. PDF textual y OCR deben funcionar sin API generativa.

Guardar Instagram/Facebook como fuente/enlace válido. Si no hay acceso permitido, explicar limitación y ofrecer material autorizado/manual. No automatizar logins, evadir CAPTCHA ni prometer importar cualquier perfil. APIs oficiales serían una integración posterior autorizada.

Separar estado técnico del medio (detectado/descargado/procesado) y derechos (desconocido/pendiente/autorizado/rechazado/revocado). Registrar titular/autorizante, fundamento, referencia de permiso/licencia, atribución, alcance y vencimiento si existen. Una casilla del administrador no convierte una licencia inexistente en válida. No copiar ni publicar originales sin base adecuada. Una ficha sin fotos usa un recurso neutro que no simula el restaurante.

KV almacena objetos pequeños e inmutables por ID/hash, con índice en D1. No usar KV para sesiones, locks, colas ni punteros autoritativos. Servir archivos mediante rutas con política de acceso; originales privados no son públicos por conocer su clave. Para revocaciones, retirar referencias, bloquear nuevas respuestas y gestionar caches con una ventana documentada. Tener fallback neutro ante propagación eventual; no garantizar consistencia instantánea global de KV.

Generar tamaños móviles, miniatura y principal, lazy loading, alt editorial y variantes suficientes sin desperdicio. No servir PDFs activos inline en el origen de sesión sin una política segura; preferir visor rasterizado/aislado y descarga controlada del original autorizado. Respetar derechos también al guardar evidencia y hacer backups; no archivar sitios enteros por rutina.

IA generativa: interfaz opcional y deshabilitada. Solo si mejora una ambigüedad, con proveedor/cuota/privacidad autorizados, presupuesto duro y salida validada contra evidencia. Sin cuota: OCR determinista, edición manual o espera; ningún cargo ni proveedor alternativo automático. El piloto base debe cerrar con IA apagada.

10. DUPLICADOS, CAMBIOS Y PUBLICACIÓN

Normalizar nombres/alias, teléfonos conservando original, direcciones y dominios. Comparar nombre+localidad, teléfono, dirección, distancia cuando hay coordenadas confiables e identificadores de fuente. Mostrar razones. Un dominio o teléfono corporativo puede corresponder a varias sucursales; no imponer unicidad global. Nunca fusionar solo por similitud de nombre.

Antes de crear ficha, proponer coincidencias: «Agregar a esta ficha», «Crear otra sucursal», «Crear negocio nuevo» o «Revisar después». Reintentar la misma importación no crea productos/fuentes/fichas repetidos. Una fusión administrativa excepcional necesita confirmación, historial y posibilidad de recuperar relaciones; no es parte automática de la importación.

Actualización de tres vías por campo: última observación de ESA fuente, dato editorial vigente y observación nueva. Si la fuente no cambió, no reemplazar la corrección editorial. Si cambian ambas, conflicto. Una corrección protegida conserva el valor y genera propuesta visible. Los rechazos se registran para no volver a insistir con la misma observación sin novedades.

Ausencia de producto, falta de precio, foto parcial, página caída o error OCR no equivalen a eliminación, precio cero o cierre. Eliminar/descontinuar requiere evidencia y aprobación específica. Conservar antigüedad visible: «Precios revisados el…», «Fuente sin fecha» o «Carta posiblemente desactualizada». Horarios nocturnos/estacionales y excepciones se modelan, no se aplanan a una frase imposible de actualizar.

Borrador, datos importados y publicación son estados separados del mismo negocio. Editar una ficha publicada no retira la última versión buena. Aprobar en revisión crea revisión editorial; solicitar publicación encola preparación.

El ejecutor toma esa revisión inmutable, renderiza HTML seguro con los componentes/plantillas del proyecto y genera snapshot público/SEO. No monta HTML obtenido de terceros. El servidor valida revisión, hash de contenido, versión de plantilla, campos públicos y resultado. Guardar los artefactos HTML pequeños y snapshot de ficha en D1, no depender de una clave KV recién actualizada para servir el contenido principal. Preparación y subida se hacen fuera de la transacción; la activación usa un batch transaccional y comparación de revisión esperada. La versión vieja permanece visible si falla cualquier paso.

Solo el actor autorizado puede aprobar/activar. Token de worker entrega artefactos de trabajos previamente autorizados; no cambia roles, decisiones ni catálogo arbitrario. Transacciones con comprobaciones SQL y restricciones que aborten ante precondiciones fallidas: no asumir que un UPDATE de cero filas cancela otras escrituras. Publicación de un lote grande se prepara en etapas y se activa por puntero; no crear una transacción ilimitada.

GET público, búsqueda, HTML, JSON-LD y sitemap leen únicamente la revisión activada. No emitir reseñas ni aggregateRating inventados. Evitar que React reemplace el HTML real con datos de demo al montar. Metadatos y contenido corresponden a la misma versión; privados noindex y jamás incluidos en el snapshot. Cache y rollback deben respetar revisiones. Revertir crea nueva revisión auditada y no borra historia.

11. TRABAJOS DURABLES Y RECUPERACIÓN

Estado: queued → running → awaiting_review/completed, con partial, retry_scheduled, failed y cancelled cuando corresponda; mostrar etiquetas comprensibles. Estados de publicación separados.

Claim atómico de un trabajo con lease, leaseToken/generación y vencimiento; heartbeat. Solo el token/generación vigente entrega resultados. Checkpoint tras cada recurso y lote documental: hashes, etapas, páginas procesadas, observaciones confirmadas y pendientes. Reanudación idempotente tras cerrar app, cortar Internet, suspender PC o reiniciar ejecutor. No repetir una publicación ya confirmada. Cancelar invalida el lease y descarta entregas tardías.

Reintentos máximos iniciales: tres para fallas transitorias, backoff y Retry-After. No reintentar indefinidamente 401/403, CAPTCHA, política bloqueada o formato no compatible. Un trabajo parcial conserva evidencia útil y explica qué faltó. No mantener toda la verdad en RAM.

Polling moderado con backoff, activo solo cuando corresponde; medir costo de polling e índices. No añadir Redis, Kafka, Kubernetes ni una cola externa mientras esta solución alcance.

12. ADMINISTRADOR Y ROLES

Navegación principal: Inicio, Negocios, Importar, Revisar cambios, Configuración. Dentro de negocio: Ficha, Carta, Fotos, Fuentes, Historial. Titularidades y sugerencias en pendientes. Conservar estilos actuales y usar revelado progresivo.

Inicio muestra Agregar negocio, Importar desde web, Subir carta, pendientes, motor conectado y Ver portal. Importar muestra progreso por etapas reales, datos encontrados/ausentes/dudosos, páginas analizadas, posibles duplicados y errores con solución. Corregir en formulario normal; fuente y explicación se abren a demanda. Nunca JSON, SQL o mensajes crípticos como interfaz habitual.

Carta: secciones ordenables, productos/variantes/canal/precio/moneda, original al lado y vista móvil por tarjetas. Guardar borrador persistente, vista previa, deshacer y publicación explícita. Cambios: anterior, nuevo y corrección protegida; aceptar/rechazar por campo y lote seguro. No preseleccionar conflictos o eliminaciones. Confirmar únicamente acciones destructivas o sensibles, no cada clic.

Roles reales:
- Visitante: información publicada y favoritos propios locales.
- Registrado: propuestas/reclamos propios; no propiedad automática.
- Propietario verificado: borradores, cartas y medios de fichas asignadas; no publicar, aprobar titularidad, tocar otros negocios, roles, destacados o valoraciones.
- Administrador: revisión general, publicación, permisos, categorías/localidades y configuración.

Activar primero administración. Conservar Sumá tu lugar y Reclamá mi negocio; habilitar luego por invitación en el piloto tras probar permisos. Solicitudes con estado pendiente, revisión administrativa y evidencia proporcionada; no pedir documentos sensibles innecesarios. Datos de reclamos, contacto privado y consultas separados del DTO público. No anunciar «enviado al restaurante» si una consulta solo queda en la bandeja. Notificaciones in-app primero; correo real y reseñas públicas requieren política y activación posterior.

OIDC: validar firma, issuer, audience, expiración, nonce/state y PKCE cuando corresponda; redirects exactos, sesión opaca revocable, cookie Secure/HttpOnly/SameSite, protección CSRF/origin y rate limits. Roles en servidor por userId estable. No dar administrador al primer usuario ni confiar en un correo escrito en el cliente. Vincular administrador mediante alta controlada y verificada.

SQLite/D1 no dispone de las políticas RLS de PostgreSQL: toda autorización se aplica en la API con pruebas por recurso y rol. CORS no es autorización. No suponer que ocultar botones protege datos. Si en el futuro se adopta Supabase, diseñar y probar allí RLS aparte.

13. MIGRACIÓN, BACKUP Y ESCALA

No fusionar automáticamente localStorage demo con datos reales. Exportador gráfico de datos existentes, revisión de registros que realmente valga conservar y migración idempotente de los aprobados. Mantener el respaldo original; ignorar roles/valoraciones/permisos procedentes del navegador. Fixtures ficticios en entorno separado, no seleccionables desde la API pública real ni activables por un parámetro de visitante.

Respaldar datos relacionales, revisiones, evidencia retenida legítimamente, medios/derivados, derechos, manifiesto de hashes, versión del esquema y plantilla. No incluir secretos en el paquete de usuario. No prometer recuperación de KV con un backup solo de D1. Incluir exportación gráfica paginada/reanudable y respaldo automático por el ejecutor cuando esté conectado. Mostrar fecha de última copia y advertir atraso; PC apagada impide esa copia local.

Restaurar a entorno vacío aislado, comprobar relaciones, hashes, ficha pública, cartas y permisos. Reautenticar/revocar sesiones al restaurar. Objetivo inicial: copia diaria cuando el motor está conectado y antes de cambios sensibles, mostrando la pérdida potencial desde la última copia. Recuperación temporal de D1 complementa, no sustituye, el backup completo. Definir retención y purga segura de temporales; no borrar evidencia necesaria o archivos referenciados.

Expandir a otras localidades/partidos agregando datos. Para crecer, mover el mismo ejecutor Node a un servidor y MediaStore a R2 bajo aprobación; conservar contratos. PostgreSQL/Supabase queda como decisión posterior con migración explícita, recuentos, permisos y restauración probados. No prometer portabilidad gratuita sin trabajo de migración.

14. PRESUPUESTO

Sin APIs generativas ni servicios facturables necesarios para demostrar el circuito local. Workers/D1/KV Free son la referencia online, no una garantía de cuota disponible de la cuenta.

Valores documentados al 21/10/2026: Workers 100.000 solicitudes/día y 10 ms CPU por solicitud; D1 5 millones de filas leídas/día, 100.000 escritas/día y 500 MB por base Free; KV 1 GB, 100.000 lecturas y 1.000 escrituras/día. Revalidar antes de habilitar recursos. Tener en cuenta otros usos de cuenta sin inspeccionar ni alterar proyectos ajenos.

Límites propios iniciales: 300 MB de objetos y 200 escrituras KV/día para el piloto; alertas al 70% y freno de nuevas ingestas al 85%. Contadores no sustituyen métricas del proveedor. Medir API, autenticación, validación, búsquedas, polling y publicación en la nube autorizada; el emulador y medir Node no certifican el límite de CPU de Workers. Si se supera, reducir trabajo por petición y paginar; no aprobar el hito ni activar pago para ocultarlo.

En Free, agotamiento puede impedir operaciones; explicar de forma sencilla y conservar trabajos. No garantizar uptime ilimitado. R2 tiene franquicia y excedentes facturables: no habilitar por rutina. Instalación de Google OIDC y recursos externos requiere configuración inicial autorizada; luego la operación del dueño debe ser gráfica.

15. HITOS Y EVIDENCIA

Hito 1 — Primer circuito real local. Inspección breve y reutilización, SafeFetch verificado, importación de una URL REAL permitida, observaciones con evidencia, revisión, creación/selección de ficha, persistencia y publicación local. Alta manual incluida. Reabrir aplicación y conservar datos. No esperar a terminar una refactorización global o cuentas de propietarios. Si la primera fuente no es compatible, registrar la razón y probar otra fuente legítima, sin sustituirla por fixture ni cambiar el alcance silenciosamente.

Hito 2 — Carta y actualización completas. HTML de carta, PDF textual, foto/OCR, variantes y precios, medios autorizados, fuentes múltiples, duplicados, tres vías, protección manual, reversión y reanudación. Varias estructuras y adaptadores reutilizables. JavaScript solo tras aislamiento comprobado. Lanzador gráfico usable. Primera auditoría focalizada.

Hito 3 — Demo online aislada. Preparar recursos/configuración/plan de migración y pedir autorización antes de crear/desplegar. Identidad y permisos reales, dos dispositivos, CPU/cuotas medidas, publicación consistente, portal con PC apagada y restauración completa. Segunda auditoría antes de apertura a terceros. Si falta permiso de despliegue, entregar listo para revisión y declarar pruebas online pendientes; no marcar ese hito completo.

Hito 4 — Piloto de 10–20 negocios y facilidad de uso. Fuentes reales de San Bernardo con procedencia, fotografías solo autorizadas, casos incompletos publicados honestamente, pruebas móviles, propietarios invitados cuando sean seguros y sesión de uso del dueño sin comandos. No agregar más fases si estos resultados están cumplidos.

Matriz obligatoria A–R:
A alta manual real; B URL real y extracción útil; C descubrimiento de páginas internas; D platos/precios de una fuente compatible; E PDF y fotografía/OCR; F revisión/corrección gráfica; G segunda fuente sin duplicar; H cambio de precio propuesto; I corrección protegida; J búsqueda pública; K ficha móvil y contactos correctos; L distintas estructuras; M error explicado; N persistencia real entre sesiones y dispositivos online; O denegación de cambios ajenos y datos privados; P ningún proyecto externo utilizado; Q ningún costo o facturación no autorizados; R dueño opera sin programación.

Pruebas necesarias:
- Unitarias de importes/variantes, horarios nocturnos, normalización, comparación de tres vías, bloqueos, identidad e idempotencia.
- Integración de jobs, leases vencidos, entregas tardías, cancelación, API/DB, publicación atómica, archivos pendientes y restauración.
- Seguridad con servidor adversario controlado: IPv4/IPv6 internos, rebinding, redirects, subrecursos, compresión excesiva, XML/archivos hostiles, XSS, CSRF, IDOR y roles.
- Recorridos UI de escritorio/móvil y teclado; formularios, foco, errores, reintento y estado del motor.
- Matriz de fuentes reales: URL, fecha, condiciones de acceso, estructura, método, evidencia esperada, resultado/campos correctos y límites. Probar al menos tres dominios independientes y cuatro formatos/estructuras entre HTML, JSON-LD, CMS, JS, PDF y foto, aclarando qué se probó realmente en cada uno.

No manipules sitios de terceros para generar un cambio: H se demuestra con fuente controlada mutable más una relectura real, o con dos capturas reales fechadas legítimas si existen. Para precios, comparar al menos 20 asociaciones producto-variante-canal-precio contra el original cuando haya material suficiente. Una ambigüedad marcada no es dato correcto; un precio equivocado aceptado como seguro es un defecto. Publicación revisada debe coincidir con la evidencia. Informar precisión y cobertura sin prometer un porcentaje universal a partir de pocas fuentes.

La usabilidad la prueba el dueño y otra persona no técnica si está disponible: alta, importar, corregir precio, agregar fuente, proteger dato y revisar cambio. Registrar tiempo, errores y ayuda recibida. No declarar probado R solo con Playwright. Nadie debe abrir terminal, escribir SQL, modificar archivos ni pedir un conector para completar esos recorridos.

Auditoría 1: revisión independiente de código y pruebas del límite de extracción/red/documentos antes de habilitar procesamiento no confiable general. Auditoría 2: identidad, permisos, publicación, privacidad, backup y presupuesto antes de acceso online a terceros. Auditor no modifica código; Claude Code usa chat nuevo separado en la misma carpeta. No aprobar con hallazgos críticos/altos pendientes en esas superficies. Corregir y repetir verificaciones afectadas, sin auditorías integrales reiteradas por rutina.

16. AUTONOMÍA Y CIERRE

Resolver detalles ordinarios sin pedir permiso. Ante bloqueo, investigar primero y seguir trabajo independiente. Pedir autorización solo cuando corresponda a creación/conexión de recursos externos, migración real, despliegue/cambio de audiencia/hostname, costo, instalación privilegiada, operación destructiva o cambio sustancial de arquitectura/alcance. Presentar exactamente qué se aprobará, sus límites y recuperación. No iniciar esas operaciones por inferencia.

Por hito entregar informe breve: versión y cambios, recorrido usable, comandos/pruebas y resultados reales, fuentes comprobadas, capturas pertinentes, métricas, riesgos pendientes y ubicación de artefactos. Separar IMPLEMENTADO LOCALMENTE / FIXTURES / FUENTES CONTROLADAS / FUENTES REALES / ONLINE / VALIDADO POR EL DUEÑO. No llamar éxito a una cola pendiente o un contador simulado.

Entregar al cierre: código integrado, esquema/migraciones, lanzador y guía visual breve, matriz A–R con evidencia, registro de fuentes/derechos, mediciones, procedimiento y prueba de restauración, limitaciones de compatibilidad y lista de funciones deliberadamente deshabilitadas. No guardar credenciales en documentos o repositorio.

El objetivo termina cuando el dueño puede incorporar y mantener negocios reales sin programar, el motor aporta información útil de fuentes distintas, las cartas/precios son revisables, las correcciones se preservan y el piloto cumple sus pruebas y límites. Si falta autorización externa o una verificación humana, declarar ese punto pendiente con precisión. No inventar tareas nuevas después de cumplir el encargo ni presentar la entrega parcial como producto completo.
```
