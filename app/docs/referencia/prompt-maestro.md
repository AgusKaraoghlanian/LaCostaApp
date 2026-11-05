PROMPT MAESTRO DE IMPLEMENTACIÓN · COSTA A LA CARTA · PORTAL REAL Y MOTOR UNIVERSAL DE IMPORTACIÓN
Fecha de referencia: 21 de octubre de 2026. Destinatario: agente programador (Claude Code o Codex). Idioma de trabajo, interfaz, mensajes y documentación: español de Argentina.

Revisión aprobada por el dueño (21/10/2026): se incorporaron cuatro precisiones dentro del plan existente, sin fases nuevas: importaciones interrumpidas con reanudación real (secciones 10, 12, 24, 33 y hitos 2 y 4), respaldo completo de D1 y KV con restauración probada (secciones 10, 29, 33 y hito 5), seguridad de Browser Rendering más allá de la URL inicial (secciones 10, 15, 30, 33 y hitos 2 y 3) y medición real del CPU del plan gratuito (secciones 7, 10, 33 y hitos 1 a 3).

==================================================
0. TU ROL Y CÓMO TRABAJAR
==================================================

Sos el programador principal de Costa a la carta. Inspeccionás, desarrollás, probás y entregás evidencia. El dueño del proyecto no es programador: define objetivos y aprueba decisiones importantes. Un director técnico supervisa en los hitos. Tenés autonomía para resolver los detalles técnicos ordinarios dentro de este encargo, respetando todas las restricciones.

Reglas de trabajo:
- Un único objetivo integral. Los hitos internos (sección 34) ordenan el trabajo; no son proyectos separados.
- Trabajá en una sola sesión de agente siempre que alcance. No lances subagentes, ramas, worktrees ni auditorías por costumbre. No uses el modelo más caro ni el esfuerzo máximo por rutina: reservalos para el diseño de seguridad del proxy y para la comparación de versiones.
- Al cerrar cada hito, hacé un commit en la rama actual con un mensaje claro. No hagas push a ningún remoto sin aprobación.
- Si aparece un bloqueo real, investigá primero (documentación oficial, código, pruebas) antes de recurrir a más modelos o agentes.
- No reabras decisiones ya tomadas en este documento salvo por una razón técnica importante. Si eso pasa, explicala en dos o tres frases y pedí aprobación.
- Informes breves y verificables (sección 38). No inventes trabajo extra una vez cumplidos los criterios de aceptación.
- Distinguí siempre entre: implementado localmente / probado con fixtures / probado con webs controladas / probado con fuentes reales / publicado en línea.

==================================================
1. CONTEXTO DEL PROYECTO
==================================================

Costa a la carta es un portal gastronómico del Partido de La Costa (provincia de Buenos Aires, Argentina). Su identidad visual es «COSTA A LA CARTA · SABORES DE NUESTRA COSTA». Cada establecimiento (restaurante, pizzería, parrilla, cafetería, bar, heladería, panadería, rotisería, hamburguesería, casa de empanadas, local de delivery, etc.) tiene una ficha individual con URL propia y estable.

La demo real empieza con 10 a 20 establecimientos reales de San Bernardo del Tuyú. Después debe crecer a 30, 50, 100 o más, y luego a todo el Partido (San Clemente del Tuyú, Las Toninas, Santa Teresita, Mar del Tuyú, Costa del Este, Aguas Verdes, La Lucila del Mar, Costa Azul, San Bernardo del Tuyú, Mar de Ajó, Nueva Atlantis y las localidades que se agreguen desde administración), e incluso a otros partidos, sin reconstruir fichas, administrador, base de datos ni motor. La jerarquía es Provincia → Partido → Localidad → Establecimiento.

Hoy existe una aplicación React/Vite en modo demostración, con 20 negocios ficticios, persistencia en el localStorage del navegador y un administrador simulado. No hay motor de importación, ni servidor, ni persistencia real, ni modelo de cartas.

La característica central que hay que construir: el dueño entra al administrador, pega la URL de un comercio, obtiene automáticamente la información que se puede extraer legítimamente, corrige los resultados y publica una ficha gastronómica completa. Después puede actualizarla sin perder sus correcciones. Muchos comercios de San Bernardo solo tienen Instagram o WhatsApp: por eso, cargar la carta desde un PDF, desde fotos o pegando texto tiene la misma prioridad que importar desde una web.

==================================================
2. UBICACIÓN Y ESTRUCTURA EXISTENTE
==================================================

Repositorio: D:\Incoming\Videos\Proyectos\Gastronomia\costa-a-la-carta (Windows; usá npm.cmd en PowerShell). Node instalado: v24.20. El README pide Node 22.12 o posterior.

Estructura informada en b1140c3:
- src/App.jsx (65 KB en 71 líneas): todas las pantallas, el contexto global, el router propio (history.pushState) y las funciones de datos (guardarNegocio, guardarConsulta, guardarOpinion, guardarReclamo, modificarNegocio, modificarOpinion, modificarReclamo, agregarCategoria, quitarCategoria), cada una con una rama Supabase y otra de localStorage.
- src/estilos.css (47 KB en 7 líneas): identidad visual. Variables: --fondo #f8f7f2, --verde #293e32, --naranja #df713c, tipografías DM Sans y DM Serif Display.
- src/datos.js: 20 negocios ficticios, 8 categorías, 10 localidades en texto, prestaciones, imágenes de Unsplash, reseñas iniciales y filtrarNegocios() (ignora tildes y mayúsculas; está probada).
- src/supabase.js: cliente opcional (VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY, vacíos) y traducirError().
- src/main.jsx (createRoot reemplaza el HTML previo); src/entrada-servidor.jsx (renderToString para el prerender).
- scripts/prerender.mjs (genera 39 páginas y el sitemap; origen fijo https://costa-a-la-carta.o4ftony10.chatgpt.site); scripts/generar-semilla.mjs.
- supabase/esquema.sql (listings, categories, locations, reviews, leads, listing_claims, listing_images, owners, con RLS; nunca aplicado); supabase/datos-ejemplo.sql.
- tests/directorio.test.mjs (5 pruebas de datos y filtros; se ejecutan con node --test).
- .openai/hosting.json (ChatGPT Sites, estático, acceso privado, directorio dist/).
- Rutas públicas: /, /explorar, /categorias, /categoria/:id, /lugar/:slug, /guardados, /sumar-lugar, /reclamar, /ingresar, /mi-negocio, /administracion, /sobre-la-costa, /como-funciona.

Problemas ya detectados en el código, que tenés que resolver:
(a) Detalle agrega a cualquier ficha texto genérico inventado («Una propuesta para disfrutar de los sabores de La Costa…», «Dejá que la sobremesa se estire…»).
(b) guardarNegocio y la galería asignan fotos genéricas de Unsplash a negocios que no las tienen.
(c) Hay valoraciones, «valoraciones de muestra», «horarios de ejemplo», avatares de Pravatar y la leyenda de muestra del pie.
(d) El esquema obliga a tener descripción de 20 caracteres o más y dirección, usa horarios en texto libre, una sola categoría y la localidad referenciada por nombre.
(e) El email de contacto de cada ficha aprobada queda visible para visitantes anónimos.
(f) Cuando el propietario edita, el disparador pone la ficha en «pendiente» y la saca del portal.
(g) La protección del administrador es solo visual en modo demo, y /administracion figura en el pie público.
(h) Los slugs nuevos llevan un sufijo temporal.
(i) Para enviar una consulta hay que iniciar sesión, y la consulta no llega a ningún comercio.

==================================================
3. VERIFICACIÓN INICIAL OBLIGATORIA (ANTES DE MODIFICAR NADA)
==================================================

El diagnóstico recibido corresponde al commit b1140c3. El código puede haber cambiado desde entonces.
1. Ejecutá git status y git log --oneline -10. Si HEAD no es b1140c3, revisá git diff b1140c3..HEAD y leé los cambios. Si hay cambios sin commitear, no los pises: informalos y preguntá antes de tocar esos archivos.
2. Leé el README y todos los archivos de la sección 2. Confirmá o corregí cada afirmación de esa sección.
3. Ejecutá npm.cmd ci (solo si falta node_modules o cambió el lockfile), npm.cmd test y npm.cmd run build. Registrá los resultados.
4. Guardá como línea base el HTML generado en dist/ para todas las rutas (normalizado) en tests/linea-base/. Agregá una prueba que compare el build de demostración contra esa línea base, para demostrar que la modularización no cambia lo visible.
5. Entregá un informe del hito 0 de no más de una página: estado real, diferencias con este documento, riesgos encontrados.

==================================================
4. OBJETIVO CONCRETO
==================================================

Convertir la aplicación existente en un producto real, gratuito para la demo, con estos componentes:
- un portal público con fichas reales y cartas navegables;
- un administrador extremadamente sencillo;
- un motor universal de importación (web, PDF, fotos, texto);
- revisión humana obligatoria antes de publicar;
- procedencia por campo, detección de duplicados y actualizaciones que protegen las correcciones manuales;
- persistencia real en la nube, sin depender de la PC del dueño;
- recorridos de «Sumá tu lugar» y «Reclamá tu negocio» conservados y conectados.

Todo debe poder demostrarse con los casos A a R (sección 34).

==================================================
5. ALCANCE APROBADO
==================================================

DENTRO DEL ALCANCE:
- Modularizar el frontend sin cambiar el diseño.
- Worker de Cloudflare con API, proxy seguro y HTML dinámico.
- D1 y KV.
- Modelo de datos completo.
- Motor con las capas de las secciones 12 a 18.
- Administrador nuevo (sección 24).
- Ficha pública ampliada: carta, horarios, mapa, contacto.
- Fotos con derechos.
- Ingreso con Google para administración.
- Formularios públicos con Turnstile.
- Copia de seguridad descargable.
- Pruebas: unitarias, de integración, de recorridos completos, de seguridad y con fuentes reales.
- Despliegue en Cloudflare Workers Free, con aprobación.
- Cuentas de propietarios con autoservicio (hito 6), detrás de un interruptor desactivado por defecto.

FUERA DEL ALCANCE (no implementar):
- Suscripciones, Stripe y cobros.
- Delivery, pedidos o reservas propios.
- Dominio o sitio separado por restaurante.
- Chatbot.
- Rankings de precios.
- Microservicios, Kubernetes, buscadores externos.
- Reanálisis programado en el servidor (es de la etapa paga; dejá el núcleo preparado).
- Ejecutor local en la PC (dejalo posible, no lo construyas).
- Integración con APIs de Meta (dejala preparada como fuente de tipo instagram o facebook).
- Reseñas públicas reales (el código se conserva, desactivado).

==================================================
6. COMPONENTES QUE SE PRESERVAN
==================================================

- estilos.css y todo el lenguaje visual. Podés formatearlo (es una operación sin cambios de comportamiento) y agregar estilos nuevos con las mismas variables y patrones: boton-naranja, boton-borde, metricas, pestanas, lista-gestion, fila-gestion, estado, aviso-demo, formulario, dos-campos.
- Los componentes Tarjeta, Cabecera, Buscador, Inicio, Explorador, Categorias, Detalle, Guardados, Pie, Migas, Vacio, Estado, Metrica, VentanaModal, BotonFavorito y Logo, divididos en archivos, con las mismas clases y textos salvo los que contienen datos inventados.
- Las URLs públicas y sus parámetros, incluidos los filtros compartibles.
- filtrarNegocios (se extiende para buscar también por productos y alias).
- La accesibilidad actual: etiquetas, foco atrapado en el modal, validación en español mediante setCustomValidity y el enlace «Saltar al contenido».
- El patrón de HTML previo reemplazado por createRoot.
- Los favoritos en localStorage (son una comodidad del visitante).
- Sumar lugar, Reclamar, Panel del propietario y las pestañas de administración (Lugares, Categorías, Reseñas y Titularidades se integran en las pantallas nuevas; ver sección 24).
- La especificación de permisos de supabase/esquema.sql (el propietario no se destaca, no cambia la reputación ni la titularidad; la aprobación de un reclamo es una transacción). Movelo a docs/referencia/esquema-supabase-original.sql. Quitá @supabase/supabase-js solo cuando ningún código lo use.
- Los 20 negocios ficticios, como conjunto de demostración aislado (sección 29).

==================================================
7. ARQUITECTURA SELECCIONADA (DECISIÓN TOMADA)
==================================================

React/Vite existente + un único Cloudflare Worker en el plan Free + D1 + KV + un motor isomórfico que en la demo se ejecuta en el navegador del administrador. Opcionales con cupo gratuito y tope duro: Browser Rendering (sitios que necesitan JavaScript) y Workers AI (cartas difíciles).

Motivos:
- Costo cero sin medio de pago; al superar un límite del plan Free el servicio responde con error en lugar de cobrar.
- Continuidad del código actual.
- Un solo proveedor.
- Nada depende de la PC del dueño.
- Se puede crecer al plan Workers Paid (unos USD 5 por mes) sin reconstruir.

Se descartaron:
- Supabase nuevo: el límite de 2 proyectos gratuitos se aplica entre todas las organizaciones donde el dueño es Owner o Admin, y sus plazas están ocupadas.
- Todo local: no funciona con la PC apagada ni entre dispositivos.
- Combinaciones Neon/Turso con Vercel o Netlify: más proveedores, y Vercel Hobby no permite uso comercial.
- Firebase: Storage exige el plan pago Blaze.

RESTRICCIONES DURAS DEL PLAN FREE (verificadas en octubre de 2026; reconfirmalas en la documentación oficial antes de depender de ellas):
- Workers: 100.000 solicitudes por día; 10 ms de CPU por solicitud y por Cron; 50 subsolicitudes por solicitud; 128 MB de memoria; archivos estáticos sin costo (hasta 20.000 archivos de hasta 25 MiB).
- D1: 5 M filas leídas y 100.000 escritas por día; 500 MB por base; 5 GB por cuenta; fila o BLOB de hasta 2 MB; Time Travel de 7 días; al superarlo, error hasta las 00:00 UTC.
- KV: 100.000 lecturas y 1.000 escrituras por día; 1 GB; hasta 25 MiB por valor; consistencia eventual.
- Browser Rendering (también llamado «Browser Run»): 10 minutos por día; una solicitud REST cada 10 segundos; 3 navegadores en simultáneo; al superarlo, 429.
- Workers AI: 10.000 neuronas por día; al superarlo, error sin cobro.
- Cache API: solo funciona con dominio propio, no en workers.dev.
- R2: puede requerir medio de pago. NO se usa en la demo.

CONSECUENCIA DE DISEÑO OBLIGATORIA: ninguna solicitud al Worker hace trabajo pesado. Objetivo: menos de 5 ms de CPU típicos; medilo con wrangler dev y wrangler tail. Interpretar HTML, extraer texto de un PDF, hacer OCR, redimensionar imágenes, diferencias grandes y validaciones masivas se hacen en el navegador del administrador. El Worker valida la entrada, descarga, autoriza, guarda con lotes de D1 (db.batch, atómicos) y sirve. Los lotes que envía el cliente son chicos (por ejemplo, 100 observaciones o menos por solicitud) para que la validación no exceda el CPU disponible.

MEDICIÓN REAL DEL CPU (precisión incorporada; forma parte de los hitos existentes, no es una fase aparte):
- Por qué no alcanza con wrangler dev: en el entorno local el reloj del Worker no mide CPU y no se aplica el límite. Se mide en dos niveles.
- Nivel 1, local y automático (desde el hito 1): scripts/medir-cpu.mjs ejecuta en Node 24 (el mismo motor V8) las funciones del Worker de cada operación con cargas representativas del piloto (20 fichas) y de diez veces el piloto (200 fichas, una carta de 300 productos), mide con process.cpuUsage() la mediana y el percentil 95 de 200 repeticiones después del calentamiento, y falla si el percentil 95 supera 5 ms. Operaciones medidas: autenticación (verificar el id_token con JWKS en caché, crear la sesión, validar la cookie en cada solicitud), respuestas públicas (HTML de una ficha, /explorar con el índice incrustado, sitemap, /medios), lotes de datos (100 observaciones con zod, decisiones de revisión, filas del respaldo), publicación (instantánea de una ficha con su carta y el índice) y proxy (validación de URL, robots.txt, conteo de bytes de una descarga de 20 MB en streaming, respuesta de Browser Rendering de 3 MB).
- Nivel 2, en línea (hito 3, después del despliegue aprobado): Workers Logs con observability activada (gratis en el plan Free) o wrangler tail --format json, que informan el CPU real de cada invocación. scripts/informe-cpu.mjs resume CPU por ruta (mediana, p95 y máximo) y el informe del hito 3 incluye esa tabla.
- Si una operación supera 10 ms (o 5 ms en el p95 local), se optimiza o se modifica esa operación, sin abandonar la arquitectura. Modificaciones previstas:
  - Respuestas públicas: la publicación guarda la instantánea ya serializada y ya escapada para insertarla en un script application/json, junto con el bloque HTML semántico ya generado. Servir una ficha es concatenar cadenas: sin JSON.parse ni plantillas en cada visita.
  - Índice público: cada ficha publicada guarda su entrada del índice ya serializada (public_index_entries); el índice completo lo arma D1 con json_group_array(json(entrada)), de modo que el armado no consume CPU del Worker y publicar no recorre todas las fichas.
  - Publicación: si la instantánea de una carta grande excede el presupuesto, la arma el navegador del administrador con el mismo código compartido, y el Worker solo la valida por partes (cabecera y lotes de productos) y verifica su consistencia con consultas a D1.
  - Lotes: el tamaño de lote se ajusta según la medición (por defecto 100 observaciones, menor si hace falta); los esquemas zod de los lotes evitan transformaciones costosas.
  - Proxy: el conteo de bytes usa un TransformStream que solo suma longitudes; la descompresión la hace el runtime; el contenido nunca se interpreta en el Worker.
  - Autenticación: sin contraseñas; la firma RS256 se verifica con WebCrypto y las JWKS se guardan en KV con su vencimiento.

==================================================
8. TECNOLOGÍAS
==================================================

Usá versiones exactas y estables. No agregues dependencias sin necesidad. Todas deben ser gratuitas y de código abierto.
- Frontend: React 19 y Vite 7 (los actuales), lucide-react, CSS propio. Carga diferida del administrador (React.lazy) y de los módulos pesados.
- Integración de desarrollo: @cloudflare/vite-plugin y wrangler.
- Worker: Hono, zod (esquemas compartidos), drizzle-orm (D1) y drizzle-kit (migraciones SQL en migraciones/, aplicadas con wrangler d1 migrations).
- Autenticación: OIDC de Google con una biblioteca liviana (por ejemplo, arctic para el flujo y jose para verificar el id_token) más sesiones propias en D1. No uses contraseñas: su hash excede el CPU disponible.
- Motor: TypeScript sin dependencias de entorno en el núcleo. En el navegador: DOMParser, pdfjs-dist y tesseract.js con datos «spa», ambos en Web Workers y alojados en nuestros estáticos, sin CDN externo. Para normalizar teléfonos: libphonenumber-js. En pruebas de Node: linkedom.
- Mapas: maplibre-gl con teselas de OpenFreeMap (gratis, sin clave; atribución obligatoria), cargado solo al abrir el mapa. «Cómo llegar» por URL de Google Maps (https://www.google.com/maps/dir/?api=1&destination=lat,lng), sin API. Geocodificación con Nominatim solo cuando el administrador lo pide: como máximo una consulta por segundo, User-Agent identificable y resultado siempre confirmado.
- Anti-abuso: Cloudflare Turnstile en los formularios públicos.
- IA opcional: Workers AI desde el Worker (solo E/S; el CPU queda bajo). Elegí el modelo de visión y el de texto al implementar, verificando su costo en neuronas; por ejemplo, @cf/meta/llama-3.2-11b-vision-instruct requiere aceptar su licencia. Dejá una interfaz ProveedorIA para Gemini u otros, desactivada por defecto.
- Pruebas: node:test (el actual; Node 24 ejecuta TypeScript con eliminación de tipos, así que usá solo sintaxis eliminable), linkedom y Playwright para recorridos completos y capturas.

==================================================
9. MÓDULOS NUEVOS Y ESTRUCTURA
==================================================

Estructura objetivo (ajustá nombres si encontrás una razón concreta):
- src/: main.jsx; App.jsx (solo proveedor y router); rutas.js; contexto/; componentes/; paginas/; admin/ (carga diferida); servicios/api.js (cliente HTTP con manejo de errores); servicios/repositorio-demo.js (localStorage, solo en modo demostración); servicios/imagenes.js (optimización en el navegador); motor-ui/ (puente entre la interfaz y el motor, y los Web Workers de pdf.js y Tesseract); mensajes.js (catálogo de mensajes al usuario); datos-demo/ (los datos ficticios actuales).
- compartido/: esquemas zod y tipos compartidos por la interfaz, el Worker y el motor (ResultadoExtraccion, instantánea publicada, DTO de ficha, etc.).
- motor/: nucleo/ (pipeline, presupuesto, diagnósticos), obtencion/ (interfaz Obtenedor; implementación por proxy), descubrimiento/, extractores/, adaptadores/ (con registro), documentos/ (pdf, ocr), texto/ (precios, carta en texto, horarios, normalización), fusion/, comparacion/ (tres valores), duplicados/ (puntaje), ia/ (interfaz y Workers AI).
- worker/: index.ts; rutas/ (publico, admin, solicitudes, auth, medios, html); seguridad/ (validación de URL, proxy, sesiones, CSRF, cabeceras, límites); datos/ (esquema drizzle, repositorios); publicacion/ (instantáneas e índice); html/ (plantillas con escape); medios/ (interfaz AlmacenMedios con implementación en KV; la de R2 queda preparada sin enlazar).
- migraciones/, tests/ (unidad, integracion, e2e, fixtures/sitios, fixtures/documentos, linea-base), scripts/ (prerender, verificar-costos, verificar-aislamiento, respaldo), wrangler.jsonc, docs/ (decisiones.md, guia-administrador.md, informes/).

La interfaz nunca accede a la base directamente: todo pasa por la API. Las funciones del contexto actual (guardarNegocio, etc.) conservan su forma, pero ahora llaman a servicios/api.js. En modo demostración llaman a repositorio-demo.js.

==================================================
10. MODELO DE DATOS COMPLETO (D1 / SQLite)
==================================================

Convenciones (continuidad con esquema.sql): tablas en inglés con snake_case y columnas en español. Identificadores TEXT (UUID). Fechas en TEXT ISO 8601 UTC. Booleanos INTEGER 0/1. JSON en TEXT validado con zod. Importes en INTEGER de centavos. Claves foráneas activadas. Índices en los campos de búsqueda.

TERRITORIO
- provinces(id, nombre, slug)
- districts(id, province_id, nombre, slug)
- locations(id, district_id, nombre, nombre_corto, slug, lat, lng, activa, orden). Semilla real: Partido de La Costa con las localidades de la sección 1. San Bernardo del Tuyú usa el nombre corto «San Bernardo».

CATÁLOGO
- categories(id, nombre, texto, color, icono, orden, activa). Conservá las 8 actuales y agregá rotiserías, hamburgueserías y casas de empanadas. El delivery es una modalidad, no una categoría.
- services(id, nombre, grupo: modalidad|comodidad|dieta|pago, orden). Semilla: Para llevar, Delivery, Retiro en el local, Mesas al aire libre, Reservas, Accesible, Acepta mascotas, Opciones vegetarianas, Opciones sin TACC.

ESTABLECIMIENTO (una identidad estable; no existe otro catálogo paralelo)
- listings(id, slug UNIQUE, nombre, alias JSON, location_id, categoria_principal_id, descripcion NULL, rango_precio NULL 1-3, direccion NULL, direccion_publica 0/1, referencia_ubicacion NULL, lat NULL, lng NULL, origen_coordenadas: estructurado|pin_admin|geocodificado_confirmado NULL, estado_publicacion: borrador|publicada|oculta|archivada, estado_operativo: abierto|temporada|cerrado_temporal|cerrado_definitivo|desconocido, nota_estacional NULL, horarios_texto NULL, imagen_principal_id NULL, destacado, marca_id NULL, demostracion 0/1, verificado_en NULL, creado_por, creado_en, actualizado_en, publicado_en NULL, cambios_sin_publicar 0/1)
- listing_categories(listing_id, category_id)
- listing_services(listing_id, service_id, nota)
- listing_contacts(id, listing_id, tipo: telefono|whatsapp|email|web|instagram|facebook|tiktok|pedidos|otro, valor, valor_normalizado, etiqueta, publico, verificado, orden). Un WhatsApp solo queda «verificado» si proviene de un enlace wa.me o api.whatsapp.com de la fuente oficial, o si lo confirma el administrador. Nunca se deduce de un número de teléfono.
- listing_hours(id, listing_id, season_id NULL, dia 1-7 con lunes=1, abre HH:MM, cierra HH:MM; si cierra es menor que abre, el turno termina después de la medianoche; nota)
- listing_seasons(id, listing_id, nombre, desde, hasta, tipo: apertura|cierre|horario_especial, nota)
- brands(id, nombre): agrupa sucursales reales, cada una con su ficha.
- slug_history(slug, listing_id): los slugs anteriores redirigen con 301.
Slug: nombre-localidad normalizado; si hay colisión, se agrega un sufijo numérico. Nunca un sufijo temporal.

CARTAS (sección 11)
- menus(id, listing_id, nombre, tipo: principal|bebidas|temporada|promociones|delivery|otro, canal: todos|salon|delivery|retiro, orden, estado: activa|archivada, version_publicada_id NULL)
- menu_versions(id, menu_id, numero, estado: borrador|publicada|reemplazada|descartada, fecha_relevamiento, vigente_desde NULL, vigente_hasta NULL, source_id NULL, documento_media_id NULL, nota, creada_por, creada_en, publicada_en NULL)
- menu_sections(id, version_id, clave_estable, nombre, descripcion, orden)
- menu_items(id, version_id, section_id, clave_estable, nombre, descripcion, etiquetas JSON, media_id NULL, disponible, orden, origen: manual|importacion|propietario, observation_id NULL, protegido)
- menu_item_variants(id, item_id, clave_estable, nombre NULL (la variante única no lleva nombre), orden)
- menu_prices(id, variant_id, canal, moneda ISO 4217 (ARS por defecto), importe_centavos NULL, estado_precio: publicado|sin_precio|consultar|ilegible, condicion NULL, observation_id NULL, protegido)

FUENTES, MOTOR Y PROCEDENCIA
- sources(id, listing_id NULL, tipo: sitio_web|pagina|pdf|imagen|instagram|facebook|directorio|manual|propietario|texto_pegado, url NULL, dominio NULL, titulo, estado: activa|pausada|con_error|bloqueada_por_robots, reglas JSON (sección 18), ultima_revision_en, ultimo_job_id, notas)
- import_jobs(id, source_id, listing_id_destino NULL, tipo: web|pdf|imagenes|texto, url_inicial, estado: creado|analizando|interrumpido|listo_para_revisar|fallido|aplicado|descartado, etapa, progreso JSON (pasos legibles), diagnostico JSON, version_motor, punto_control JSON (etapa completada, candidatos descubiertos, presupuesto consumido), procesando_por NULL (identificador de la pestaña), arrendamiento_hasta NULL, documento_media_id NULL, documento_sha256 NULL, clave_aplicacion NULL, aplicado_resultado JSON NULL, creado_por, creado_en, terminado_en)
- import_job_tasks(id, job_id, clave UNIQUE por job (por ejemplo, «obtener:{url normalizada}», «pdf:{sha256}:pagina:7», «ocr:{sha256}:imagen:3»), tipo, estado: pendiente|en_curso|completada|fallida|omitida, intentos, snapshot_id NULL, observaciones INTEGER, error_codigo NULL, actualizado_en). Es la unidad de trabajo reanudable (sección 12).
- snapshots(id, job_id, source_id, url, url_final, http_estado, tipo_contenido, bytes, hash_sha256, metodo_obtencion: directo|navegador, robots: permitido|no_permitido|sin_robots, obtenido_en, titulo; UNIQUE(job_id, url)). Por defecto no guardes la copia completa del contenido: guardá hash, metadatos y fragmentos de evidencia.
- observations(id determinista: hash de job_id, clave de la tarea, entidad, campo, ruta_carta y valor_normalizado; se inserta con INSERT OR IGNORE, de modo que repetir un lote nunca duplica; job_id, snapshot_id, task_id, entidad: listing|contacto|horario|servicio|carta|seccion|producto|variante|precio|medio|documento, campo, valor JSON, valor_normalizado, ruta_carta JSON NULL, metodo: jsonld|microdata|meta|contacto_dom|horario_texto|carta_dom|json_embebido|wordpress|woocommerce|shopify|pdf_texto|ocr|ia|texto_pegado|manual, evidencia (hasta 300 caracteres), confianza: alta|media|baja, decision: pendiente|aceptada|editada|descartada, valor_editado JSON NULL, decidido_en NULL, aplicada_a JSON NULL, creado_en). Cada decisión de revisión (aceptar, editar, descartar) se guarda en el servidor en el momento, no al final del asistente.
- field_provenance(listing_id, campo, observation_id NULL, origen: manual|importacion|propietario|sugerencia, protegido, actualizado_por, actualizado_en, PK(listing_id,campo))
- change_proposals(id, listing_id, origen: reanalisis|propietario|sugerencia_publica|importacion, tipo: campo|contacto|horario|precio|producto_nuevo|producto_ausente|carta|foto|estado_operativo, objetivo JSON, valor_base JSON, valor_actual JSON, valor_propuesto JSON, observation_id NULL, motivo, conflicto_con_proteccion, estado: pendiente|aprobada|rechazada|caducada, decidido_por, decidido_en, creado_en)
- listing_identifiers(listing_id, tipo: dominio|telefono|whatsapp|instagram|facebook|direccion|nombre, valor_normalizado; índice (tipo, valor_normalizado); NO es único, porque las sucursales pueden compartir dominio o Instagram)
- duplicate_decisions(listing_a, listing_b, decision: distintos|sucursales|fusionados, decidido_por, decidido_en)

MEDIOS Y DERECHOS
- media(id, listing_id NULL, tipo: foto_local|foto_plato|foto_carta|logo|documento, clave_almacen NULL, variantes JSON, mime, ancho, alto, bytes, sha256, alt, leyenda, orden, origen_url NULL, source_id NULL, estado: encontrada|accesible|autorizada|aprobada|rechazada, creado_por, creado_en)
- media_rights(media_id, base: propia|propietario_verificado|autorizacion_comercio|licencia_abierta|solo_referencia, detalle, autor, licencia, atribucion, evidencia_media_id NULL, registrado_por, registrado_en)
Regla: un medio es público solo si su estado es «aprobada» y su base es propia, propietario_verificado, autorizacion_comercio o licencia_abierta (en este caso, con atribución visible). «Solo referencia» nunca se publica.

PERSONAS, ROLES Y SOLICITUDES
- users(id, email, nombre, proveedor, proveedor_id, creado_en, ultimo_ingreso)
- sessions(id_hash, user_id, expira_en, creado_en, user_agent)
- user_roles(user_id, rol: admin|editor). La lista inicial de administradores sale del secreto ADMINISTRADORES (correos).
- listing_owners(listing_id, user_id, estado: activo|revocado, otorgado_por, desde)
- listing_claims(id, listing_id, user_id NULL, nombre, email, telefono NULL, relacion, verificacion, metodo_verificacion NULL, estado: pendiente|aprobado|rechazado, notas_admin, decidido_por, creado_en)
- submissions(id, tipo: nuevo_negocio|correccion|baja, listing_id NULL, datos JSON, contacto_nombre, contacto_email, estado, ip_hash, creado_en)
- reviews y leads: se conservan con el modelo actual adaptado, desactivadas por interruptor.

PUBLICACIÓN Y CONTROL
- published_snapshots(id, listing_id, version, contenido JSON (validado por zod; incluye la carta publicada y los medios aprobados), publicado_por, publicado_en, vigente 0/1)
- public_index(id='principal', contenido JSON, actualizado_en): índice compacto para la búsqueda. Se regenera al publicar o despublicar.
- public_index_entries(listing_id, entrada JSON ya serializada, actualizado_en): una entrada por ficha publicada; D1 arma public_index con json_group_array sin recorrer las fichas en el Worker (sección 7).
- published_snapshots guarda además html_semantico y datos_incrustados (la instantánea ya escapada para el script application/json), generados una sola vez al publicar.
- backups(id, creado_por, creado_en, estado: en_curso|completo|interrumpido, manifiesto JSON (tablas, filas, claves de KV con sha256 y bytes), bytes_totales): registro de los respaldos (sección 29).
- audit_log(id, actor_id, accion, entidad, entidad_id, antes JSON, despues JSON, motivo, creado_en)
- usage_counters(fecha, recurso: navegador_segundos|ia_neuronas|analisis|escrituras_kv, cantidad)
- config(clave, valor): resenas_publicas=false, consultas_habilitadas=false, propietarios_habilitados=false, ia_habilitada=false, navegador_habilitado=false (se habilita en línea solo después de aprobar la verificación de seguridad de la sección 15 y con autorización del dueño), más los topes diarios.

==================================================
11. CARTAS Y PRODUCTOS
==================================================

- Jerarquía: establecimiento → cartas → versiones → secciones → productos → variantes → precios. Cada variante tiene su propio precio: «Muzzarella individual» y «Muzzarella grande» son dos variantes de un mismo producto, nunca un único precio ambiguo.
- El rango $/$$/$$$ de la ficha (rango_precio) nunca se confunde con los precios de la carta.
- Un precio desconocido es NULL con un estado (sin_precio, consultar o ilegible). Nunca 0. Un $0 literal se marca como dudoso.
- Se admiten varias monedas (ARS por defecto; US$, USD y u$s se mapean a USD), canales (salón, delivery, retiro), promociones con condiciones y vigencia, cartas de bebidas, cartas de temporada y productos sin precio publicado.
- Versiones: la primera edición sobre una carta publicada crea una versión borrador copiando la publicada, con las mismas claves estables. Publicar la ficha publica también los borradores de carta. Las versiones anteriores quedan en el historial.
- Analizador de precios argentinos: el punto seguido de exactamente 3 dígitos separa miles ($12.500); la coma seguida de 1 o 2 dígitos separa decimales ($12.500,50). Reconoce «c/u», «x unidad», «docena», «1/2 docena», columnas con encabezados de tamaño (Chica | Grande, Individual | Grande) y formatos como «Individual $X / Grande $Y». Ante una ambigüedad, confianza baja y marca para revisión.
- Analizador de carta en texto (compartido por PDF, OCR, texto pegado y extracción del DOM): reconstruye líneas, detecta títulos de sección (mayúsculas, líneas cortas sin precio, encabezados), productos con su descripción en la línea siguiente, variantes y precios. Nunca inventa texto ilegible: produce estado ilegible con la evidencia.
- En la ficha pública, la carta es HTML navegable: pestañas por carta, secciones, productos, variantes y precios. Se muestra «Precios relevados el {fecha} · Fuente: {tipo}». Si tiene más de 60 días, se avisa que los precios pueden haber cambiado; si tiene más de 180, con un aviso más fuerte. El documento original se puede ver solo si su publicación está autorizada.

==================================================
12. MOTOR UNIVERSAL: PRINCIPIOS Y PIPELINE
==================================================

Principios:
- Universalidad por arquitectura: las estrategias generales siempre se ejecutan, los adaptadores por familia se activan solos al detectar la plataforma y hay reglas simples por fuente. Nunca hace falta código por comercio. Un adaptador nuevo es una excepción justificada con evidencia: el diagnóstico «plataforma detectada sin adaptador», repetido.
- Primero lo determinista y gratuito; la IA solo cuando aporta valor.
- Nunca inventar. Cada dato tiene evidencia. Lo no encontrado se informa como no encontrado.
- El núcleo es puro y no depende del entorno: recibe un Document estándar y un Obtenedor. Usá solo APIs de DOM disponibles en DOMParser y en linkedom (querySelectorAll, getAttribute, textContent). No uses innerText ni APIs de diseño: escribí una función textoVisible() propia que trate br y los elementos de bloque.
- Presupuesto por análisis (configurable): hasta 15 descargas, 2 niveles de profundidad, 60 segundos en total, 1 solicitud por segundo por dominio.
- Versionado: version_motor se guarda en cada import_job.

Pipeline (cada etapa es una función con entrada y salida tipadas y pruebas propias):
1. validarEntrada: normaliza la URL y detecta redes sociales (sección 19). Muestra el rechazo con un mensaje simple.
2. reconocer: descarga la página principal por el proxy; registra la URL final y la cadena de redirecciones; detecta la plataforma con huellas: WordPress (wp-content, meta generator, enlace wp-json), WooCommerce, Shopify, Tiendanube, Wix, Squarespace, Webflow, Google Sites, Blogger, Linktree y similares, enlaces a PedidosYa o Rappi. Detecta también si la página necesita JavaScript: poco texto visible, aplicación vacía, noscript que pide JavaScript.
3. descubrir: ver sección 14.
4. obtener: cada candidato pasa por el proxy y se enruta según el tipo de contenido (HTML, PDF, imagen, JSON, XML).
5. extraer: extractores generales más los adaptadores activos (secciones 13 a 18). Cada uno emite hallazgos.
6. normalizar: convierte todo a ResultadoExtraccion (abajo).
7. fusionar: prioridad JSON-LD o microdatos > página de contacto visible > pie de página > metadatos > deducción. Los conflictos se conservan como alternativas para la interfaz.
8. duplicados: la consulta al servidor con los identificadores normalizados (sección 21).
9. presentar: la revisión en la interfaz (sección 24).
10. aplicar: el servidor aplica, en un lote atómico, la ficha, la carta, los contactos, la procedencia, el historial y la decisión de duplicado.

FORMATO COMÚN ResultadoExtraccion (esquema zod en compartido/):
version_motor; url_inicial; url_final; plataforma {id, confianza}; paginas [{url, tipo: inicio|carta|contacto|nosotros|galeria|pedidos|otra, metodo_obtencion, estado, motivo}]; comercio {nombre, descripcion, categorias, direccion, localidad, coordenadas, rango_precio, estado_operativo: cada uno como Hallazgo[]}; contactos Hallazgo<{tipo, valor}>[]; horarios Hallazgo<{dias, abre, cierra, texto_original}>[]; servicios Hallazgo<string>[]; cartas [{nombre, tipo, origen {url, metodo}, confianza, secciones [{nombre, productos [{nombre, descripcion, variantes [{nombre, precio {importe_centavos|null, moneda, estado, texto_original}}], evidencia, confianza}]}], advertencias}]; medios [{url, tipo_probable, ancho, alto, alt, pagina, estado:'encontrada'}]; documentos [{url, tipo, titulo, es_carta_probable}]; no_encontrado [campos]; diagnosticos [{codigo, nivel: info|aviso|error, mensaje_usuario, detalle_tecnico}].
Hallazgo<T> = {valor: T, valor_normalizado, metodo, url, snapshot_id, evidencia, confianza: alta|media|baja}.
El detalle_tecnico nunca se muestra en la interfaz normal; solo dentro de un desplegable «Detalles para soporte».

IMPORTACIONES INTERRUMPIDAS: PUNTOS DE CONTROL Y REANUDACIÓN REAL (precisión incorporada)
Como el procesamiento corre en el navegador, cerrar la pestaña, perder la conexión o apagar el celular puede cortarlo en cualquier punto. La recuperación es real: se retoma desde lo que ya quedó guardado en el servidor, sin repetir descargas completadas, sin duplicar registros y sin perder correcciones. Conservar la pantalla anterior no cuenta como reanudación.
- Unidad de trabajo: cada descarga, cada página de un PDF y cada imagen para OCR es una tarea (import_job_tasks) con clave estable. El servidor es la fuente de verdad del avance; el navegador solo ejecuta.
- Punto de control: al terminar una tarea, el navegador envía en una sola solicitud, que el Worker guarda en un lote atómico de D1, la instantánea (snapshot), sus observaciones (en lotes chicos con INSERT OR IGNORE e identificadores deterministas) y el cierre de la tarea. Si la pestaña se cierra antes de esa confirmación, la tarea queda «en_curso» y se repite completa; nunca queda a medias. import_jobs.punto_control registra la etapa completada y los candidatos descubiertos, para no volver a descubrir.
- Arrendamiento: la pestaña que procesa renueva procesando_por y arrendamiento_hasta cada 20 segundos. Si otra pestaña abre el mismo análisis mientras el arrendamiento está vigente, ve «Este análisis se está procesando en otra pestaña» y puede tomarlo cuando venza. Un análisis con el arrendamiento vencido y tareas pendientes se muestra como «interrumpido».
- Retomar: en /administracion/importar los análisis interrumpidos aparecen primero, con «Seguir donde quedó» y cuánto falta («Faltan 3 de 9 páginas»). Al retomar, el navegador pide el punto de control, marca como pendientes las tareas en_curso con arrendamiento vencido, procesa solo las pendientes y recalcula la fusión a partir de las observaciones guardadas (la fusión es determinista, no requiere volver a descargar).
- Documentos y fotos: al iniciar un análisis de PDF o de imágenes, el archivo optimizado se guarda primero en KV como documento privado (no publicable hasta tener derechos), y su sha256 queda en el job. Al retomar, se lee desde ahí; el OCR continúa desde la primera página sin completar. Si el tope de escrituras de KV del día impide guardarlo, se pide volver a elegir el mismo archivo y se verifica que el sha256 coincida antes de continuar.
- Correcciones: cada Aceptar, Editar o Descartar de la revisión se guarda al instante (observations.decision y valor_editado). Al reabrir la revisión, las decisiones ya tomadas aparecen tal como quedaron. Las ediciones en un campo aún no confirmadas se guardan como borrador local con try/catch y se ofrecen al volver, sin reemplazar lo confirmado en el servidor.
- Aplicar sin duplicar: «Guardar borrador» y «Publicar» envían clave_aplicacion (generada una vez por el navegador y guardada en el job antes del envío). El Worker aplica en un único lote atómico; si recibe otra vez la misma clave, devuelve el resultado guardado en aplicado_resultado sin volver a crear la ficha. Un job en estado «aplicado» no admite otra aplicación. Si la pestaña se cierra durante el envío, al volver se consulta el job: o quedó aplicado (se muestra el resultado) o no (se puede enviar de nuevo con la misma clave).
- Diagnóstico honesto: si una tarea falló tres veces, queda «fallida» con su mensaje del catálogo, y el análisis puede continuar sin ella.

==================================================
13. HTML Y DATOS ESTRUCTURADOS
==================================================

- JSON-LD: parseo tolerante (varios bloques, @graph, arreglos, comentarios y comas finales comunes). Tipos: Restaurant, FoodEstablishment y subtipos (CafeOrCoffeeShop, BarOrPub, Bakery, IceCreamShop, FastFoodRestaurant), LocalBusiness, Organization, Menu, MenuSection, MenuItem, Offer, Product, PostalAddress, GeoCoordinates, OpeningHoursSpecification y openingHours en texto, sameAs (redes), telephone, servesCuisine, priceRange y hasMenu (URL o estructura).
- Microdatos y RDFa básicos (itemscope, itemprop, typeof, property).
- Metadatos: title, meta description, og:site_name, og:title, og:description, og:image, twitter:*, link rel=icon y canonical.
- Contactos en el DOM: tel:, wa.me, api.whatsapp.com, mailto:, perfiles de Instagram, Facebook y TikTok; teléfonos argentinos en el texto normalizados a E.164 con libphonenumber-js (región AR); direcciones que contengan nombres de localidades conocidas.
- Horarios en texto: patrones como «Lunes a viernes de 20 a 00 hs», «Mar a Dom 12–16 y 20–01», «Todos los días desde las 19», «Cerrado los lunes», «Abierto en temporada». Se guarda siempre el texto original, y la confianza es baja si hay ambigüedad.
- Carta en el DOM: bloques repetidos con patrones de precio; agrupación por encabezados (h1 a h4, strong, elementos con clase o id que contengan menu, carta o precio); tablas con encabezados de tamaño; listas de definiciones. Si no hay estructura, el texto visible de la página de carta pasa por el analizador de carta en texto.
- JSON incrustado: script type application/json, __NEXT_DATA__, estados iniciales y datos de precarga. Un recorrido genérico busca objetos con nombre y precio.

==================================================
14. DESCUBRIMIENTO DE PÁGINAS INTERNAS
==================================================

- Fuentes de candidatos: enlaces de navegación y del cuerpo; robots.txt (líneas Sitemap); sitemap.xml y sus índices; WordPress (/wp-json/wp/v2/pages y posts, con per_page acotado); feeds RSS y Atom; enlaces a PDF e imágenes con palabras clave; enlaces a redes y plataformas de pedidos.
- Clasificación por puntaje según la URL, el texto del enlace y el título: carta, menú, menu, nuestra-carta, platos, pizzas, empanadas, bebidas, precios, delivery, pedidos, contacto, ubicación, horarios, nosotros, galería, fotos.
- Restricción: el mismo dominio registrable de la fuente. Los documentos alojados en otro host (por ejemplo, un PDF en un servicio de archivos) se tratan como un documento externo, con su propia validación y diagnóstico.
- Las plataformas de pedidos (PedidosYa, Rappi y similares) no se analizan: el enlace se guarda como contacto de tipo pedidos.

==================================================
15. PÁGINAS CON JAVASCRIPT
==================================================

- Si reconocer o extraer indican que el contenido depende de JavaScript, intentá primero el JSON incrustado. Si no alcanza, y el interruptor y el cupo diario lo permiten, el Worker llama a la API REST de Browser Rendering (endpoint de contenido HTML renderizado; verificá el nombre y los parámetros vigentes) para una URL ya validada, con bloqueo de imágenes, fuentes y multimedia, espera de red inactiva y un tope de 30 segundos. El HTML resultante vuelve al navegador y se analiza igual que cualquier otro.
- El token de la cuenta para Browser Rendering es un secreto del Worker con el permiso mínimo. Registrá los segundos usados en usage_counters y frená al llegar al tope propio (por defecto 8 minutos por día).

SEGURIDAD DEL RENDERIZADO (precisión incorporada). Validar la URL inicial no alcanza: el navegador remoto sigue redirecciones y hace solicitudes secundarias.
Mecanismos disponibles verificados en la documentación oficial (octubre de 2026; endpoint POST /accounts/{id}/browser-run/content o el enlace de Workers env.BROWSER.quickAction("content"), que no necesita token y es preferible si funciona en el plan Free):
- allowRequestPattern y rejectRequestPattern (expresiones regulares sobre la URL de cada solicitud; los rechazos se aplican primero) y allowResourceTypes y rejectResourceTypes;
- setJavaScriptEnabled, userAgent, gotoOptions.timeout (hasta 60 s) y waitUntil, cacheTTL;
- la respuesta incluye meta.finalUrl, meta.status y meta.redirectChain (las redirecciones HTTP seguidas; no incluye redirecciones del lado del cliente).
Política obligatoria:
1. Antes de renderizar, la URL pasa por el mismo validador del proxy (sección 30), incluida la resolución DNS sobre HTTPS.
2. Lista permitida estricta: allowRequestPattern admite solo http(s) sin puerto explícito hacia el host validado, otros hosts del mismo dominio registrable y, como máximo, 8 hosts de recursos que figuran en el HTML obtenido sin navegador (por ejemplo, el CDN de la plataforma), cada uno validado por separado con el validador y DNS sobre HTTPS. Ninguna IP literal, ningún nombre interno (localhost, .local, .internal, .lan, .home.arpa) ni los dominios propios de la aplicación pueden coincidir: hay una prueba que lo verifica sobre las expresiones generadas. rejectRequestPattern repite esos rechazos como segunda barrera.
3. Tipos de recurso: solo document, script, xhr y fetch. Se rechazan image, media, font, stylesheet, websocket, eventsource, ping, manifest, prefetch, signedexchange y el resto.
4. Sin authenticate, cookies, setExtraHTTPHeaders, addScriptTag ni addStyleTag. cacheTTL=0. userAgent identificable con /relevamiento.
5. Verificación posterior: si meta.finalUrl o cualquier URL de meta.redirectChain no supera el validador, o si redirectChain viene vacío (redirecciones ilegibles), el resultado se descarta con un diagnóstico y no llega al navegador.
6. El HTML devuelto es contenido inerte (JSON con el texto), con el mismo tope de tamaño que el proxy, y se interpreta solo con DOMParser.
Limitaciones que se documentan en docs/decisiones.md:
- Las expresiones regulares filtran por nombre, no por la IP resuelta. Un nombre público que resuelva a una IP privada en la red de Cloudflare no puede bloquearse desde nuestro lado; lo mitiga la resolución previa (con su diferencia entre verificación y uso) y la restricción a hosts ya validados.
- La documentación no aclara si las redirecciones intermedias se someten a allowRequestPattern antes de seguirse. Hasta comprobarlo, la garantía es posterior (descarte por redirectChain), no preventiva.
Restricción hasta verificar: navegador_habilitado queda en false en línea. Se habilita solo cuando, con aprobación del dueño para el token o el enlace, una prueba controlada contra servicios públicos de redirección (por ejemplo, una redirección hacia 127.0.0.1, 169.254.169.254 y [::1], y una página que pide recursos a hosts no permitidos) demuestra que esas solicitudes se bloquean o que el resultado se descarta. El resultado de esa prueba queda en el informe del hito. En local y en las pruebas automáticas se usa un doble del servicio que reproduce su contrato, y las pruebas verifican los parámetros enviados y el descarte posterior. Si la prueba en línea falla, el navegador especial sigue desactivado y se ofrecen las alternativas (JSON incrustado, capturas, PDF, carga manual).
- El JavaScript externo nunca se ejecuta con privilegios de la aplicación: ni en nuestra página, ni en el Worker, ni en el navegador del administrador. DOMParser no ejecuta scripts ni carga recursos.
- Si no queda cupo: mensaje simple y alternativas (subir capturas o un PDF, cargar a mano, reintentar mañana).

==================================================
16. PDF, OCR Y VISIÓN OPCIONAL
==================================================

- PDF con texto: pdfjs-dist en un Web Worker. Extracción con posiciones, reconstrucción de líneas y columnas, y luego el analizador de carta en texto.
- PDF sin capa de texto, o fotos de cartas: renderizar la página a un canvas (pdf.js) o usar la imagen, aplicar OCR con tesseract.js «spa» en un Web Worker y pasar el resultado al mismo analizador. Lo que el OCR reconoce con baja confianza, por palabra, se marca.
- Visión o IA (solo si ia_habilitada=true y el administrador lo pide en ese caso concreto, con un aviso claro de que la imagen se envía al servicio de IA de Cloudflare): estructurar el texto del OCR o leer una foto difícil. El modelo recibe instrucciones de transcribir literalmente, marcar como ilegible lo que no se lea y devolver JSON con el esquema de la carta. Validación posterior: todo nombre de producto debe aparecer, con coincidencia aproximada, en el texto del OCR o queda marcado «posible invención, verificar». Todo resultado de IA queda «para revisar». Nunca se envían datos privados (reclamos, correos, teléfonos privados).
- Límites: PDF de hasta 20 MB y 40 páginas; imagen de hasta 10 MB. Si el archivo supera el límite, mensaje simple.
- Procedencia: el documento queda como fuente (sources) y, si corresponde, como medio (media) con sus derechos. La versión de carta resultante guarda source_id, documento_media_id y fecha_relevamiento.

==================================================
17. CARGA POR TEXTO PEGADO Y CARGA MANUAL
==================================================

- «Pegar texto de la carta»: un área de texto pasa por el analizador de carta en texto y muestra la vista previa en el editor. Es el camino principal para comercios que publican su carta en el texto de una publicación de Instagram. Se registra la fuente (tipo texto_pegado, con la URL de referencia opcional y la base de uso).
- Carga manual en el editor de cartas (sección 24), siempre disponible.

==================================================
18. SISTEMA DE ADAPTADORES Y REGLAS CONFIGURABLES
==================================================

- Interfaz Adaptador {id, nombre, detectar(contexto) → puntaje, descubrir?(contexto) → candidatos, extraer?(documento, contexto) → hallazgos}. Un registro central activa los adaptadores cuyo puntaje supera el umbral. Los extractores generales siempre corren.
- Adaptadores iniciales:
  - WordPress: páginas por REST y detección de plugins de menú habituales por su marcado.
  - WooCommerce: la API pública de tienda /wp-json/wc/store/v1/products con sus variaciones, si responde públicamente.
  - Shopify: /products.json público.
  - Páginas de enlaces tipo Linktree: los enlaces se clasifican en WhatsApp, carta en PDF, pedidos y redes.
  - Product y Offer en JSON-LD: tiendas como Tiendanube.
  Cualquier otro adaptador requiere evidencia de los diagnósticos.
- Reglas por fuente, editables en la interfaz sin conocimientos técnicos y guardadas en sources.reglas: «La carta está en esta página» (URL), «Ignorar esta página», «Esta sección es de bebidas», «Usar navegador especial para este sitio», «No volver a analizar». Solo en un desplegable «Opciones avanzadas» puede haber un campo de selector CSS, que nunca es obligatorio.
- Informe en Configuración: «Sitios que no pudimos leer bien», agrupados por plataforma detectada, para decidir con evidencia si vale la pena un adaptador.

==================================================
19. REDES SOCIALES
==================================================

- Las URL de Instagram, Facebook y TikTok no se descargan ni se analizan: no hay acceso automatizado sin autorización, y no se evade login, CAPTCHA ni bloqueo. Se normalizan (el perfil o el usuario), se guardan como contacto y como fuente de tipo instagram o facebook, y se muestra el mensaje del catálogo.
- Se ofrecen caminos legítimos: subir capturas o fotos de la carta sobre las que haya derecho de uso (OCR), pegar el texto de una publicación, cargar a mano, registrar la URL de la publicación como referencia de procedencia y registrar la base de uso.
- La falta de importación automática nunca impide crear ni publicar la ficha.
- Queda preparado, no implementado: un conector oficial de Meta en el que el propietario autoriza su cuenta profesional, y oEmbed oficial para mostrar publicaciones. Ambos requieren una app de Meta con permisos y revisión, y una aprobación aparte.

==================================================
20. PROCEDENCIA POR CAMPO
==================================================

- Cada campo de la ficha y cada producto, variante o precio registran su origen (manual, importación con su observation_id, propietario o sugerencia), quién lo modificó y cuándo, y si está protegido.
- Proteger: candado visible en la interfaz para campos, productos y precios. Un campo protegido nunca se modifica automáticamente.
- En la ficha pública: «Información verificada el {fecha} a partir de {tipo de fuente}». Nunca se exponen datos internos ni privados.

==================================================
21. DUPLICADOS
==================================================

- Al importar, al crear manualmente y al aprobar una solicitud de alta, se calcula un puntaje de coincidencia con las fichas existentes:
  - señales fuertes: el mismo teléfono en E.164, el mismo WhatsApp, el mismo dominio registrable (salvo marcas con sucursales conocidas), el mismo usuario de Instagram, la misma dirección normalizada en la misma localidad;
  - señales medias: un nombre parecido (normalizado sin tildes ni palabras genéricas como pizzería, resto o bar; coincidencia por tokens de 0,85 o más) en la misma localidad, o coordenadas a menos de 60 m.
- La interfaz muestra los candidatos con sus motivos en lenguaje simple («mismo teléfono», «nombre parecido en San Bernardo») y tres decisiones: Es el mismo (se actualiza esa ficha) / Es otra sucursal (se crea una ficha vinculada a la misma marca) / Son distintos. Las decisiones se guardan para no volver a preguntar.
- Nunca se fusiona automáticamente por similitud de nombre.

==================================================
22. ACTUALIZACIONES Y SINCRONIZACIÓN
==================================================

- «Volver a analizar» una fuente repite el pipeline y compara, por cada dato con clave (campo, o clave estable de sección, producto y variante, emparejada por nombre normalizado cuando es necesario), tres valores: BASE (la última observación aceptada de esa misma fuente), ACTUAL (el valor vigente, con origen y protección) y NUEVO (la observación nueva).
  1. Si NUEVO es igual a ACTUAL, no hay cambio: se actualiza verificado_en.
  2. Si ACTUAL está protegido y NUEVO es distinto, se crea una propuesta con conflicto_con_proteccion=1 («Tenés una corrección protegida y la web dice otra cosa»). Nunca se aplica sola.
  3. Si ACTUAL coincide con BASE y NUEVO es distinto, se crea la propuesta «Cambio detectado: precio anterior $X → nuevo $Y».
  4. Si ACTUAL difiere de BASE (fue editado a mano sin proteger) y NUEVO también difiere de BASE, se crea una propuesta en conflicto que muestra los tres valores.
  5. Si NUEVO no aparece: no se borra nada. Solo si la misma página se leyó completa y correctamente, se propone, con prioridad baja, «posible producto discontinuado».
  6. Si la fuente falla (está caída, da error o tiempo de espera), queda solo un diagnóstico: «La web no respondió». Nunca se cambia estado_operativo por eso.
- Nada se aplica automáticamente en la demo. Queda preparada una política futura, desactivada, para cambios de bajo riesgo provenientes de fuentes oficiales sin protección.
- Cada propuesta aprobada registra audit_log (antes y después) y permite deshacerla.
- «Revisar fuentes»: botón que analiza en serie, desde el navegador, las fuentes elegidas (por ejemplo, las que tienen más de 30 días), con progreso y opción de detener.
- Estacionalidad: temporadas con apertura y cierre, cierre temporal distinto de cierre definitivo, horarios que pasan la medianoche, nota estacional visible. «Abierto ahora» se calcula en America/Argentina/Buenos_Aires y solo se muestra si los horarios están estructurados y se verificaron en los últimos 120 días; si no, «Horarios a confirmar».

==================================================
23. PUBLICACIÓN CONTROLADA
==================================================

- Editar nunca cambia lo público. «Publicar cambios» valida los requisitos mínimos (nombre, localidad, categoría y al menos un medio de contacto o una dirección pública), muestra un resumen de lo que cambia («3 precios, 1 foto, horarios»), genera published_snapshots (JSON validado), marca la nueva instantánea como vigente, regenera public_index y registra audit_log.
- El portal y la API pública leen solo instantáneas vigentes y el índice. Los borradores, las importaciones, las propuestas de propietarios y los datos privados jamás llegan al público.
- Ocultar o archivar piden confirmación. Volver a una versión anterior es republicar una instantánea previa, y la ficha queda marcada como «difiere de lo publicado».
- Las importaciones y las propuestas nunca publican solas.

==================================================
24. DISEÑO DEL ADMINISTRADOR (CRITERIO DE ACEPTACIÓN OBLIGATORIO)
==================================================

Principios:
- Una acción principal por pantalla, con boton-naranja.
- Lenguaje simple en español rioplatense.
- Vista previa siempre.
- Guardar borrador.
- Deshacer (un aviso de 10 segundos con «Deshacer» e historial con «Volver a esta versión»).
- Confirmación en operaciones sensibles.
- Ayudas breves junto a los campos.
- Experiencia móvil cuidada: en pantallas chicas, barra inferior con Inicio, Negocios, Importar y Revisar, más un menú «Más».
- Nada de JSON, SQL, códigos de error ni términos técnicos en la interfaz normal.
- Se usa el mismo lenguaje visual del portal.

Rutas (todas con noindex, carga diferida y acceso solo para administración):
- /administracion — INICIO: botones grandes Agregar negocio, Importar desde web, Subir carta, Revisar cambios (con contador), Ver portal; tareas pendientes; últimos editados.
- /administracion/negocios — MIS NEGOCIOS: buscador y filtros (localidad, estado, «le falta…»), cada fila con estado y medidor de completitud. Conserva aprobar, rechazar y destacar de la pestaña Lugares actual.
- /administracion/negocios/nuevo — AGREGAR NEGOCIO: formulario corto (nombre, localidad, categoría y un contacto). Lo demás es opcional. Antes de guardar se verifican duplicados.
- /administracion/negocios/:id — EDITOR con pestañas:
  - DATOS: campos, contactos, horarios estructurados con un selector simple de días y turnos, temporadas, servicios, ubicación con pin en el mapa y «Buscar en el mapa».
  - CARTA: secciones como tarjetas plegables, productos, variantes con precio, estado del precio, mover arriba y abajo accesible, candado Proteger, «Subir carta» y «Pegar texto».
  - FOTOS: ver sección 25.
  - FUENTES: fuentes con su tipo, última revisión, resultado en palabras, «Volver a analizar», reglas simples y «Agregar fuente».
  - HISTORIAL: cambios con quién, cuándo y de dónde, «Deshacer» y versiones publicadas.
  El encabezado muestra el estado (Borrador / Publicada / Publicada con cambios sin publicar / Oculta) y los botones Vista previa, Guardar borrador y Publicar cambios.
- /administracion/importar — IMPORTAR: «Pegar dirección web» o «Subir PDF, fotos o pegar texto de una carta». Lista de análisis anteriores; los interrumpidos aparecen primero con «Seguir donde quedó» y lo que falta, con reanudación real desde los puntos de control (sección 12).
- /administracion/importar/:id — ASISTENTE en pasos:
  1. Analizando: lista de pasos en frases («Abriendo la página principal ✓», «Encontramos la página Nuestra carta», «Leyendo la carta…»).
  2. Revisión: secciones Datos del comercio, Contacto y redes, Horarios, Carta, Fotos y Documentos. Cada valor muestra su fuente en palabras («de la web oficial · página Contacto»), un indicador de confianza (✔ Seguro / ⚠ Revisar / ✖ No encontrado) y las acciones Aceptar, Editar y Descartar. Arriba, un resumen: «14 datos encontrados · 3 para revisar · 4 no encontrados».
  3. ¿Ya existe?: duplicados (sección 21).
  4. Guardar borrador o Publicar, con vista previa idéntica a la ficha pública.
  Con una ficha existente como destino, la revisión muestra solo lo nuevo o distinto.
- /administracion/revisar — REVISAR CAMBIOS: una sola bandeja con filtros: cambios detectados, conflictos con correcciones protegidas, propuestas de propietarios, sugerencias públicas, negocios propuestos («Sumá tu lugar»), titularidades y reseñas si se activan. Cada tarjeta tiene Aceptar, Rechazar y Editar.
- /administracion/configuracion — categorías, localidades (y sus partidos), servicios, «Uso del plan gratuito de hoy» (análisis, minutos de navegador, neuronas de IA, almacenamiento de medios, filas de D1), «Descargar copia de seguridad», interruptores (ayuda de IA, navegador especial, reseñas, consultas, propietarios) y «Sitios que no pudimos leer bien».
- /administracion/ayuda — guía breve de los recorridos habituales.

Mensajes: catálogo único en src/mensajes.js, con un código interno y un texto para el usuario que incluye la acción sugerida. Mínimo:
- «No encontramos esa dirección. Revisá que esté bien escrita.»
- «La página tardó demasiado en responder. Probá de nuevo más tarde.»
- «Este sitio no permite que lo leamos automáticamente. Podés cargar los datos a mano o subir la carta.»
- «El sitio pidió no ser analizado por programas automáticos. Respetamos esa decisión: podés completar la ficha a mano.»
- «Esta página necesita un navegador especial y hoy se terminó el cupo gratuito. Probá mañana o subí capturas de la carta.»
- «Instagram y Facebook no permiten importar perfiles automáticamente. Guardamos el enlace en la ficha. Para la carta, subí capturas que tengas permiso de usar o pegá el texto.»
- «No pudimos leer automáticamente la carta de este restaurante. Podés subir una fotografía o completarla manualmente.»
- «No encontramos datos útiles en esta página. Si tiene una sección de carta o contacto, pegá esa dirección.»
Generalizá traducirError para que ningún error técnico llegue crudo a la interfaz.

==================================================
25. FOTOGRAFÍAS Y MEDIOS
==================================================

- Subida desde la PC o la cámara del celular. Optimización en el navegador: createImageBitmap respetando la orientación, redimensión a 1600 y 640 px, WebP de calidad 0,8 aproximadamente, sin EXIF ni GPS (la recodificación en canvas los elimina), SHA-256 calculado en el cliente.
- El Worker valida el tipo por los bytes iniciales (no por la extensión) y el tamaño máximo (1,5 MB por variante), guarda en KV con una clave de contenido (m/{sha256}-{ancho}.webp) y registra media. Los PDF van a KV hasta su tamaño máximo; los no autorizados para publicación se sirven solo por una ruta autenticada.
- Servicio público en /medios/{clave}, solo para medios aprobados, con Cache-Control público e inmutable de un año, Content-Type desde los metadatos guardados y X-Content-Type-Options: nosniff.
- Estados: encontrada (URL detectada en una fuente; la miniatura se ve en la revisión a través del proxy y no se descarga para guardarla) → accesible (descargada a pedido del administrador, visible solo en la administración) → autorizada (con una base de uso registrada) → aprobada (publicable). Antes de aprobar, la pregunta en lenguaje simple: «¿De dónde es esta foto y podemos usarla?» con las opciones «La saqué yo o mi equipo» / «La envió el comercio y autorizó su uso» / «Licencia libre (indicar autor y licencia)» / «Solo como referencia, no publicar». Detalle opcional y evidencia opcional (por ejemplo, la captura del permiso).
- Foto principal (estrella), orden, texto alternativo sugerido y editable, leyenda. Si no hay foto aprobada, la ficha muestra una ilustración neutra de la categoría, nunca una foto genérica que parezca del local.
- Las imágenes decorativas de la portada se pueden conservar si su licencia lo permite y no se asocian a ningún comercio. Quitá los avatares de Pravatar.

==================================================
26. PORTAL PÚBLICO E INTEGRACIÓN CON LAS FICHAS EXISTENTES
==================================================

- Se conservan las URLs. /lugar/:slug lee la instantánea vigente. Un slug anterior redirige.
- Orden de la ficha:
  1. Nombre y foto principal (o la ilustración).
  2. Localidad y categorías.
  3. Acciones de contacto: WhatsApp, Llamar, Cómo llegar, Instagram, Pedir online. En celulares, barra fija abajo; los enlaces tel: y wa.me deben funcionar.
  4. Carta y precios.
  5. Horarios («Abierto ahora» / «Horarios a confirmar») y servicios.
  6. Ubicación con un mapa diferido y «Cómo llegar».
  7. Galería solo con fotos aprobadas.
  8. Redes.
  9. Información adicional verificada, y «Información verificada el … a partir de …».
  10. «¿Este es tu negocio?» y «Sugerir una corrección».
  Las secciones sin contenido no aparecen. Se elimina todo texto genérico inventado.
- Si el comercio no tiene dirección pública (delivery), no se muestra mapa ni se pide dirección.
- En fichas reales, la consulta por formulario se reemplaza por botones de contacto directo. El formulario de consulta queda detrás del interruptor consultas_habilitadas, solo para fichas con propietario verificado.
- Reseñas y valoraciones: se ocultan mientras resenas_publicas=false. No se muestran estrellas ni conteos. El código se conserva.
- Tarjetas: distintivos «Carta con precios» y «Abierto ahora» cuando corresponda; no se muestran valoraciones.
- Búsqueda: el cliente descarga public_index (nombre, alias, localidad, categorías, servicios, rango, si tiene carta, nombres de productos sin duplicados y recortados, slug), que va incrustado en el HTML de /explorar y /. filtrarNegocios se extiende para buscar también por productos («muzzarella» encuentra las pizzerías que la tienen). Los filtros compartibles se mantienen. A partir de unas 1.000 fichas se migra a búsqueda con FTS5 en D1.
- Localidades desde la base, con su nombre oficial y su nombre corto. El parámetro ?localidad= acepta el slug y conserva compatibilidad con el nombre actual. Opcional: /localidad/:slug.
- HTML de rutas dinámicas: el Worker toma index.html del binding de estáticos, inserta title, description, canonical, OpenGraph y JSON-LD (Restaurant y Menu generados solo con datos publicados), un HTML semántico liviano (h1, dirección, enlaces de contacto, carta en listas) y los datos iniciales en un script de tipo application/json, escapando los caracteres <, > y & para evitar inyecciones. main.jsx lee esos datos y monta con createRoot, el mismo patrón actual. Todo con plantillas de cadenas y escape. No uses React SSR en el Worker, por el límite de CPU.
- Las páginas estáticas (/sobre-la-costa, /como-funciona, cáscaras de cuenta y administración) se siguen prerenderizando en el build, con el origen público tomado de una variable (ORIGEN_PUBLICO) y no fijo en el código.
- sitemap.xml dinámico (solo fichas publicadas, categorías y localidades); robots.txt; administración y cuentas con noindex. /administracion se quita del pie público.
- Agregar las páginas /relevamiento (cómo y por qué se relevan datos públicos, cómo pedir una corrección o una baja, mediante submissions de tipo baja; el User-Agent del motor enlaza aquí) y /privacidad (borrador en lenguaje simple para que el dueño lo revise; no es asesoramiento legal).
- La geolocalización del visitante es opcional, nunca se pide al abrir el sitio, y siempre se puede elegir la localidad a mano.
- Rendimiento y accesibilidad: el bundle público no incluye el administrador, pdf.js, Tesseract ni MapLibre. Las imágenes usan srcset con las dos variantes y carga diferida. La accesibilidad se mantiene.

==================================================
27. PROPIETARIOS: SUMÁ TU LUGAR Y RECLAMÁ TU NEGOCIO
==================================================

Roles: visitante, usuario registrado, propietario verificado y administrador. Queda preparado el rol editor (colaborador sin permiso de borrar).
En la demo (hito 3):
- «Sumá tu lugar» es un formulario público sin cuenta, con Turnstile y límite por IP. Crea submissions de tipo nuevo_negocio. El administrador puede convertirlo en una ficha borrador, con verificación de duplicados.
- «Reclamá tu negocio» es un formulario público con Turnstile. Crea listing_claims en estado pendiente. El administrador recibe una guía de verificación: contactar al comercio por su teléfono o Instagram públicos, nunca solo por los datos del solicitante. La titularidad nunca se otorga automáticamente.
- «Sugerir una corrección» crea submissions de tipo correccion, que se convierten en change_proposals.
- Las pantallas actuales Mi panel e Ingresar se conservan. Mientras propietarios_habilitados=false, muestran un mensaje claro de que las cuentas de propietarios se habilitarán más adelante.
En el hito 6, detrás de propietarios_habilitados:
- El propietario ingresa con Google. Al aprobar un reclamo, una transacción crea listing_owners y actualiza el reclamo.
- El propietario ve solo sus fichas y propone cambios (change_proposals con origen propietario) a sus datos, su carta y sus fotos (declarando la base propietario_verificado). Sus cambios no se publican hasta que el administrador los aprueba, y la ficha publicada nunca sale del portal mientras tanto.
- No puede destacarse, tocar la reputación ni la titularidad, ni ver datos de otras fichas.
- Las consultas (leads) quedan disponibles para sus fichas si se activan.

==================================================
28. AUTENTICACIÓN Y PERMISOS
==================================================

- OIDC con Google: state, PKCE y nonce. Se verifica la firma del id_token con JWKS (en caché), y también iss, aud, exp y email_verified.
- Sesión: token aleatorio de 32 bytes; en D1 se guarda solo su hash SHA-256. Cookie __Host-sesion con HttpOnly, Secure, SameSite=Lax y Path=/. Expira a los 14 días, con rotación al reingresar. Cerrar sesión la invalida en el servidor.
- Administrador: el correo verificado debe estar en el secreto ADMINISTRADORES, o tener el rol admin en user_roles.
- CSRF: toda operación que modifica datos exige la cabecera propia X-Costa-Solicitud y que Origin coincida con ORIGEN_PUBLICO.
- Autorización en el servidor, en cada ruta, con funciones explícitas (requiereAdmin, requierePropietarioDe(listing)). La interfaz solo oculta lo que el servidor ya prohíbe.
- Separación de datos públicos y privados: las respuestas públicas se construyen solo a partir de instantáneas que excluyen los contactos con publico=0, los correos de reclamos y sugerencias, los IP, las notas administrativas y los medios no aprobados. Una prueba lo verifica.
- Desarrollo local: acceso de prueba solo si ENTORNO=desarrollo y el host es localhost o 127.0.0.1. El script de despliegue falla si esa configuración está presente en producción.
- Este acceso reemplaza al cliente Supabase Auth actual. Ingresar.jsx se adapta a «Ingresar con Google».

==================================================
29. ALMACENAMIENTO, PERSISTENCIA, DATOS DEMO Y RESPALDO
==================================================

- Desarrollo: D1 y KV locales (Miniflare, mediante wrangler o @cloudflare/vite-plugin), aislados y gratuitos. Todo el desarrollo y las pruebas de los hitos 1 y 2 se hacen ahí.
- Producción: una base D1 y un espacio KV dedicados, con nombres que empiezan por costa-a-la-carta. Las migraciones se versionan y se aplican primero en local; en remoto, solo con aprobación.
- Datos demo: los 20 negocios ficticios se mueven a src/datos-demo/ y solo se usan en npm run dev:demo (modo demostración con localStorage, igual que hoy) y en las pruebas. La base real nunca contiene filas de demostración. El build de producción no incluye esos datos: una prueba busca, por ejemplo, «Casa Marea» en dist/ y falla si aparece. La leyenda «Edición de muestra» aparece solo en modo demo. San Bernardo real no se mezcla con nada ficticio.
- El localStorage actual tiene datos de demostración por navegador: no se migran. Los favoritos se conservan (con los ids nuevos; los viejos inválidos se descartan sin errores).
- Respaldo completo (precisión incorporada): un respaldo recuperable contiene los datos de D1 y los archivos de KV (fotos en todas sus variantes, PDF y documentos privados). Un JSON que solo enumera los medios no es un respaldo completo. Time Travel de D1 no cubre KV.
  - «Descargar copia de seguridad» en Configuración genera un único archivo .zip desde el navegador del administrador, por partes, para no exceder el CPU del Worker:
    - datos/{tabla}.jsonl: todas las tablas, leídas por páginas con orden estable (GET /api/admin/respaldo/tabla/:nombre?despues=…; hasta 500 filas por página);
    - medios/{clave}: cada objeto de KV, descargado por una ruta autenticada que lo devuelve sin transformarlo (GET /api/admin/respaldo/medio/:clave);
    - manifiesto.json: versión del esquema (última migración), fecha, cantidad de filas por tabla y, por cada objeto de KV, clave, bytes, sha256 y tipo. El navegador verifica el sha256 de cada objeto al descargarlo;
    - LEEME.txt con los pasos para restaurar en lenguaje simple.
    El zip se arma en streaming (fflate o un escritor ZIP mínimo sin compresión, porque WebP y PDF ya están comprimidos) y, si el navegador lo permite, se escribe directo al disco; si no, se arma en memoria. Si la descarga se interrumpe, se retoma desde la última tabla o el último medio confirmado (backups.manifiesto).
  - Tamaño proporcional al piloto: con 20 fichas, unas 10 fotos por ficha en 2 variantes y algunos PDF, el respaldo ronda los 50 a 150 MB y consume unas 500 lecturas de KV (el límite diario es 100.000). Configuración muestra el tamaño estimado antes de descargar.
  - Restauración probada: scripts/respaldo.mjs (npm run respaldo:restaurar -- archivo.zip --local | --remoto) verifica el manifiesto y los sha256, recrea la base desde cero con las migraciones, inserta las filas por lotes con wrangler d1 execute y sube los objetos con wrangler kv bulk put (o key put para los grandes). En remoto, solo con aprobación del dueño y sobre una base vacía o con su confirmación expresa. La escritura de cada objeto de KV cuenta para el tope diario de 1.000 escrituras: el script calcula cuántas hacen falta y, si exceden el cupo restante, restaura por días, retomando desde el último objeto confirmado.
  - npm run respaldo:descargar (script de línea de comandos con wrangler d1 export y la lectura de KV) produce el mismo .zip, para guardar fuera del repositorio en cada hito.
  - Prueba de integración obligatoria: sembrar D1 y KV locales con datos del tamaño del piloto (incluidas fotos y un PDF reales sintéticos), generar el respaldo por la API, borrar todo, restaurar con el script y comparar fila por fila y sha256 por sha256. También se prueba la restauración con un respaldo interrumpido y retomado.
  - D1 Time Travel (7 días en el plan Free) sigue como recurso adicional para la base, no como respaldo de medios.
  - El procedimiento de restauración queda documentado en docs/respaldo-y-restauracion.md.

==================================================
30. SEGURIDAD DEL MOTOR Y DE LA APLICACIÓN
==================================================

Proxy seguro (POST /api/admin/obtener, solo administración y asociado a un import_job):
- Solo esquemas http y https. Sin usuario ni contraseña en la URL. Solo los puertos 80 y 443. URL de hasta 2.048 caracteres. Los nombres internacionalizados se convierten a punycode.
- Se bloquean:
  - las IP literales y las resoluciones a rangos privados, reservados o especiales. IPv4: 0/8, 10/8, 100.64/10, 127/8, 169.254/16, 172.16/12, 192.0.0/24, 192.0.2/24, 192.168/16, 198.18/15, 198.51.100/24, 203.0.113/24, 224/4, 240/4 y 255.255.255.255. IPv6: ::, ::1, fc00::/7, fe80::/10, ff00::/8, 2001:db8::/32, 64:ff9b::/96 y ::ffff:0:0/96 (se verifica la IPv4 incrustada);
  - las formas de IP decimales, octales y hexadecimales;
  - los nombres localhost, *.localhost, *.local, *.internal, *.lan, *.home.arpa y los propios dominios de la aplicación.
- Resolución previa por DNS sobre HTTPS (A y AAAA) que rechaza respuestas privadas, como defensa adicional. Documentá su límite (diferencia entre la verificación y el uso).
- Redirecciones manuales: hasta 5, revalidando cada una.
- Tiempo máximo de 15 segundos por descarga.
- Tamaño máximo por tipo (HTML 3 MB, JSON y XML 2 MB, PDF 20 MB, imagen 10 MB), contando bytes en streaming y abortando al superarlo. Se cuentan los bytes descomprimidos.
- Lista permitida de tipos de contenido.
- robots.txt por dominio y por análisis, respetado para el User-Agent «CostaALaCartaBot/1.0 (+{ORIGEN_PUBLICO}/relevamiento)».
- Una solicitud por segundo por dominio. Tope de descargas por análisis y por día.
- La respuesta al cliente es contenido inerte (application/octet-stream, o JSON con el texto), nunca HTML servido desde nuestro origen.
- Modo prueba: solo con ENTORNO=prueba y una lista explícita PERMITIR_HOSTS_PRUEBA, se permite 127.0.0.1 con el puerto de las webs controladas. Una prueba demuestra que en producción eso se rechaza.
- Browser Rendering: las garantías equivalentes y sus limitaciones están en la sección 15; el mismo validador se aplica antes, en la lista permitida de solicitudes y después del renderizado.
- Si en el futuro existe un ejecutor del motor en Node (local o servidor), debe fijar la IP resuelta en la conexión (lookup propio en el agente HTTP) para evitar el DNS rebinding.

Navegador del administrador:
- El contenido externo se interpreta solo con DOMParser, en un documento inerte que nunca se inserta en la página.
- Los textos extraídos se muestran mediante React (con escape). Los enlaces extraídos se validan (solo http y https; nunca javascript: ni data:).
- Las miniaturas externas se cargan a través del proxy.

Cabeceras de toda la aplicación:
- Content-Security-Policy estricta: script-src 'self' (sin inline; los datos iniciales van como application/json); style-src 'self' 'unsafe-inline' y fonts.googleapis.com, porque el código actual usa estilos en línea; font-src fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' y los servicios de teselas; worker-src 'self' blob:; object-src 'none'; frame-ancestors 'none'; base-uri 'none'.
- Además: X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin y Permissions-Policy mínima.

Otras medidas:
- Validación de toda entrada con zod en el servidor.
- Archivos validados por sus bytes iniciales.
- Turnstile y límite por IP (contador en D1, con el IP guardado como hash) en los formularios públicos.
- audit_log en toda operación sensible.
- Los secretos solo se guardan como secretos del Worker (wrangler secret), nunca en el repositorio ni en el bundle. Una prueba revisa dist/.
- Nunca se evaden CAPTCHA, logins, muros de pago ni bloqueos de terceros.

==================================================
31. PRESUPUESTO GRATUITO Y CONTROL DE COSTOS
==================================================

- La demo se desarrolla y se prueba sin contratar nada. El plan es Workers Free. No se agrega medio de pago. No se usan R2, Queues, Durable Objects, Hyperdrive, Vectorize, Images de pago, Argo, Load Balancing ni ningún producto pago.
- wrangler.jsonc solo declara estáticos, D1, KV, AI (opcional), variables y secretos.
- npm run verificar:costos falla si la configuración contiene enlaces o productos fuera de la lista permitida, e imprime la lista de enlaces.
- Topes propios por debajo del plan Free, configurables en Configuración: navegador 8 min por día, IA 8.000 neuronas estimadas por día, 50 análisis por día, 800 escrituras de KV por día. Al alcanzar un tope se muestra un mensaje simple y una alternativa. El panel «Uso del plan gratuito de hoy» se alimenta de usage_counters.
- Antes de cada despliegue: confirmá con el dueño que la cuenta está en el plan Free y sin medio de pago (lo ve en el panel de facturación) e informalo.
- Si alguna capacidad exige un gasto inevitable, detenete, explicalo y proponé la alternativa gratuita o la limitación transparente antes de implementarla.

==================================================
32. AISLAMIENTO TOTAL DE OTROS PROYECTOS
==================================================

- NO uses, leas, modifiques ni conectes La Costa en Datos («la-costa-en-datos»), Territorio, Emergencias La Costa ni ningún otro proyecto de Supabase o de otro proveedor del dueño. No apliques el esquema de Costa a la carta en ninguna base existente.
- No uses conectores, herramientas MCP ni credenciales de Supabase u otros servicios que estén configurados en este entorno para otros proyectos. Costa a la carta no usa Supabase.
- No compartas tablas, autenticación, almacenamiento, credenciales ni migraciones con otros proyectos. No copies ni reutilices motores de Inoreader ni herramientas privadas de otros proyectos: el motor se escribe desde cero para este proyecto.
- En Cloudflare: usá solo recursos con el prefijo costa-a-la-carta. No listes para modificar, ni toques, Workers, bases o espacios de otros proyectos. Si la cuenta es compartida, informale al dueño que los cupos del plan Free son por cuenta.
- npm run verificar:aislamiento falla si algún archivo de configuración o variable contiene URLs de Supabase, identificadores de otros proyectos, o si los identificadores de D1 y KV de wrangler.jsonc no corresponden a recursos costa-a-la-carta. Para esa comprobación, la lectura de listados con wrangler está permitida.
- No envíes mensajes ni correos a comercios reales, ni a nadie.

==================================================
33. PRUEBAS
==================================================

Distinguí y reportá por separado: fixtures (archivos de ejemplo), webs controladas (servidas localmente), fuentes reales y funciones solo implementadas.
- Unitarias (node:test, con linkedom para el DOM): analizador de precios, carta en texto, horarios (incluidos los que pasan la medianoche), normalización de teléfonos, usuarios y URLs, cada extractor, cada adaptador, fusión, comparación de tres valores (las 6 reglas de la sección 22), puntaje de duplicados, validador de URL (todos los rangos y formas de IP), esquemas zod.
- Integración (Worker con wrangler o Miniflare, D1 y KV locales): API pública y de administración, matriz de autorización (anónimo, usuario, propietario A, propietario B, administrador en cada ruta), CSRF, cabeceras, publicación por instantáneas (lo no publicado nunca es visible), separación de datos privados, proxy contra webs controladas (redirección a 127.0.0.1, a 169.254.169.254 y a [::1]; tamaño excedido; tiempo de espera; tipo no permitido; robots.txt con Disallow), subida de medios (archivo con extensión falsa, demasiado grande), topes de uso, copia de seguridad completa (D1 y KV) y restauración comparando filas y sha256.
- Importaciones interrumpidas: unitarias (idempotencia de observaciones, de snapshots y de clave_aplicacion; arrendamiento vencido y vigente) y un recorrido Playwright que cierra la pestaña a mitad de un análisis web y de un OCR de varias páginas, la reabre, retoma y comprueba que las páginas ya obtenidas no se vuelven a descargar (contador del proxy), que no hay observaciones duplicadas, que las decisiones de revisión tomadas antes del cierre siguen ahí y que aplicar dos veces crea una sola ficha.
- Browser Rendering: con un doble local del servicio, se verifican los parámetros enviados (lista permitida, tipos de recurso, ausencia de cookies y cabeceras), que ninguna expresión generada admite IP literales, nombres internos ni dominios propios, y el descarte cuando finalUrl o redirectChain apuntan a destinos prohibidos o redirectChain viene vacío. La prueba en línea se describe en la sección 15.
- CPU: npm run medir:cpu (sección 7) forma parte de npm test desde el hito 1 y falla si una operación supera el presupuesto.
- Webs controladas (sitios sintéticos en tests/fixtures/sitios, sin copiar contenido protegido de terceros):
  1. JSON-LD Restaurant y Menu completo.
  2. Tipo WordPress con página Carta en HTML y wp-json.
  3. API de tienda WooCommerce con variaciones de tamaño.
  4. products.json de Shopify.
  5. Aplicación que necesita JavaScript, una con __NEXT_DATA__ y otra sin él.
  6. Página de enlaces tipo Linktree con WhatsApp, Instagram y PDF.
  7. PDF con texto en dos columnas con Chica | Grande.
  8. PDF escaneado.
  9. Foto de una carta.
  10. robots.txt con Disallow.
  11. Redirección a una IP privada.
  12. Sitio malicioso con script, enlaces javascript:, SVG con onload y HTML en nombres y precios.
  13. Sitio gigante y sitio lento.
  14. Errores 404 y 500.
  15. Precios ambiguos y «consultar».
  16. Horarios que pasan la medianoche y temporada.
- Recorridos completos (Playwright, escritorio de 1280 px y celular de 390 px): casos A a M sobre webs controladas; capturas de cada pantalla clave en docs/informes/hito-N/.
- Fuentes reales: al menos 8 sitios reales con estructuras distintas, idealmente de San Bernardo (si no hay suficientes con web, de otras localidades del Partido). Solo con acceso permitido y respetando robots.txt. Informe en tabla: URL, plataforma, qué se encontró, qué no, tiempo, problemas. Ninguna ficha real se publica sin aprobación del dueño.
- Pruebas de honestidad: una prueba falla si el motor devuelve un valor sin evidencia ni URL; otra falla si un precio desconocido se guarda como 0; otra falla si una ficha sin fotos aprobadas muestra una foto; otra falla si aparecen datos de demostración en producción.

==================================================
34. HITOS Y CRITERIOS DE ACEPTACIÓN
==================================================

Trabajá en este orden. Cada hito termina con su informe (sección 38) y su commit. Antes de los pasos que requieren aprobación (sección 37), pedila.

HITO 0 · Línea base. Sección 3. Aceptación: informe con el estado real y la línea base guardada.

HITO 1 · Base real local y carga manual.
- Modularizar App.jsx: el build de demo debe coincidir con la línea base.
- Worker, D1 y KV locales; migraciones del modelo completo (sección 10); semilla territorial y de categorías real.
- API pública y de administración; publicación por instantáneas.
- Administrador: Inicio, Negocios, Agregar negocio y editor con la pestaña Datos.
- Ficha pública sin contenido inventado; búsqueda con public_index; modo demo aislado.
- Medición local de CPU (sección 7) de autenticación de prueba, respuestas públicas, lotes y publicación, integrada en npm test.
Aceptación: CASO A (crear manualmente un establecimiento real de San Bernardo y publicarlo, en local) y CASO J en local (encontrarlo con el buscador público). Las pruebas pasan.

HITO 2 · Motor web v1 y revisión.
- Proxy seguro.
- Pipeline de las secciones 12 a 15, 18 y 19, con adaptadores iniciales y analizador de precios.
- Asistente de importación completo con duplicados, con puntos de control, decisiones guardadas al instante y reanudación real de análisis web (sección 12).
- Seguridad de Browser Rendering con doble local y navegador desactivado en línea hasta su verificación (sección 15); medición de CPU del proxy y de los lotes.
- Editor de carta básico (corregir nombres, variantes y precios).
- Catálogo de mensajes y webs controladas.
- Prueba con al menos 8 sitios reales.
Aceptación:
- CASO B: pegar una URL real compatible y obtener información útil y verificable.
- CASO C: descubrir páginas internas relevantes.
- CASO D: extraer platos y precios de una fuente compatible.
- CASO F: corregir desde la interfaz.
- CASO L: estructuras distintas.
- CASO M: un error explicado de forma simple.
Con capturas y la tabla de sitios reales.

HITO 3 · Demo en línea segura.
- Ingreso con Google y permisos.
- Formularios públicos con Turnstile hacia Revisar; verificaciones de costos y aislamiento.
- AUDITORÍA 1 y sus correcciones.
- Despliegue en Workers Free, con aprobación.
- Medición de CPU en línea con Workers Logs o wrangler tail, tabla por ruta en el informe; optimización de lo que supere 10 ms. Con aprobación del token o del enlace, prueba controlada de Browser Rendering (sección 15) antes de habilitarlo.
Aceptación:
- CASO J: buscador público en línea.
- CASO K: ficha en un celular real con los botones de contacto funcionando.
- CASO N: persistencia entre sesiones y dispositivos.
- CASO O: un usuario no autorizado no modifica fichas ni ve datos privados (pruebas automáticas y una verificación manual en línea).
- CASO P: no se usa ningún proyecto externo (verificar:aislamiento y revisión de la configuración).
- CASO Q: sin costos (verificar:costos y facturación en cero informada por el dueño).

HITO 4 · Cartas por documentos y fotos con derechos.
- PDF con texto, OCR, pegar texto, IA opcional con tope y versiones de carta. Reanudación de PDF y OCR desde la primera página sin completar, con el documento guardado en KV.
- Gestor de fotos con estados y derechos, optimización y servicio público.
- Mapa, pin y «Cómo llegar».
Aceptación:
- CASO E: importar una carta desde un PDF o una fotografía con el mecanismo adecuado, revisarla y publicarla.
- Una foto sin permiso registrado no se publica.

HITO 5 · Fuentes múltiples y actualizaciones protegidas.
- Agregar fuente a una ficha existente; reanálisis con comparación de tres valores; Revisar con propuestas y conflictos; candados; historial; deshacer; versiones publicadas; copia de seguridad completa (D1 y KV en un .zip) y restauración probada desde cero (sección 29).
- AUDITORÍA 2.
Aceptación:
- CASO G: agregar una segunda fuente sin duplicar.
- CASO H: detectar un cambio de precio y proponer la actualización.
- CASO I: una corrección protegida se conserva después del reanálisis.
Los tres demostrados desde la interfaz, en webs controladas (cambiando el fixture) y, si es posible, también con fuentes reales.

HITO 6 · Prueba con el dueño y cierre del piloto.
- Guía de prueba en /administracion/ayuda y en docs/guia-administrador.md.
- Prueba de usabilidad con el dueño (sección 35).
- Ajustes derivados.
- Carga de los comercios reales que el dueño apruebe (objetivo: 10 a 20).
- Cuentas de propietarios con autoservicio detrás del interruptor. AUDITORÍA 3 antes de activarlo en línea.
Aceptación: CASO R aprobado por el dueño; condiciones de cierre (sección 39).

==================================================
35. PRUEBAS DE FACILIDAD DE USO
==================================================

- Automática: una prueba recorre los textos de la interfaz del administrador y falla si aparecen términos técnicos fuera del desplegable de soporte: JSON, SQL, null, undefined, NaN, error 500, fetch, endpoint, token, selector, DOM, stack, SSRF, worker, o códigos HTTP sueltos.
- Automática: toda pantalla del administrador tiene título, una acción principal, estados vacíos con una acción sugerida y mensajes de error del catálogo. Se verifica a 390 px sin desplazamiento horizontal.
- Con el dueño (CASO R; vos preparás la guía, el dueño la ejecuta sin ayuda y sin comandos), tareas cronometradas:
  1. Importar un restaurante desde su web y publicarlo.
  2. Crear un negocio que solo tiene Instagram.
  3. Cargar una carta pegando texto o subiendo fotos.
  4. Corregir el precio de una variante y protegerlo.
  5. Subir una foto, indicar su permiso y elegirla como principal.
  6. Aceptar un cambio detectado en Revisar.
  7. Deshacer un cambio.
  8. Encontrar el restaurante desde el celular y tocar «WhatsApp».
  Éxito: el dueño completa todas las tareas sin escribir comandos ni pedir ayuda técnica. Lo que le resulte confuso se corrige y se vuelve a probar solo esa tarea.

==================================================
36. AUDITORÍAS INDEPENDIENTES
==================================================

Solo tres, en hitos de riesgo. Las hace un chat nuevo y separado de Claude Code (o Codex) en la misma carpeta del proyecto. El auditor no modifica código, revisa el código y ejecuta pruebas reales en lugar de basarse en tu informe, y entrega hallazgos con severidad, evidencia y forma de reproducirlos. Vos corregís y se repiten solo las verificaciones afectadas.
- AUDITORÍA 1 (fin del hito 3, antes del primer despliegue): proxy y SSRF, matriz de permisos, CSRF y cookies, XSS con fixtures maliciosos, secretos en dist/, configuración sin recursos pagos ni referencias externas, importación real verificada contra 3 sitios reales y 3 de ejemplo. Se aprueba con cero hallazgos críticos o altos abiertos.
- AUDITORÍA 2 (fin del hito 5): procedencia, protección, comparación de tres valores, duplicados, publicación por instantáneas, deshacer, migraciones desde cero, respaldo y restauración. Se aprueba si G, H e I se reproducen y no falla ninguna prueba de integridad.
- AUDITORÍA 3 (solo antes de activar propietarios en línea): dos propietarios de prueba aislados entre sí, privacidad, abuso de formularios. Se aprueba con el CASO O demostrado de forma automática.

==================================================
37. AUTONOMÍA Y ACCIONES QUE REQUIEREN APROBACIÓN
==================================================

Podés hacer sin preguntar: leer el repositorio; crear y modificar código, pruebas y documentación del proyecto; instalar dependencias de desarrollo gratuitas; usar D1 y KV locales; ejecutar pruebas, builds y wrangler dev; hacer commits locales al cerrar los hitos; analizar sitios reales con acceso permitido para las pruebas, respetando robots.txt y los límites, sin publicar nada; tomar decisiones técnicas ordinarias que no contradigan este documento.

Pedí aprobación explícita del dueño antes de:
- crear recursos en Cloudflare (base D1, espacio KV, Worker), aunque sean gratuitos; la primera vez explicá qué se crea y que no tiene costo;
- desplegar o publicar cualquier cosa en línea, y cada despliegue que cambie la seguridad, los datos o los permisos;
- aplicar migraciones o modificar datos en la base remota; borrar datos; restaurar respaldos en remoto;
- configurar secretos o credenciales, como el cliente de Google, el token de Browser Rendering o Turnstile; el dueño crea las cuentas y los clientes, y vos lo guiás paso a paso;
- activar la ayuda de IA, el navegador especial o las cuentas de propietarios en línea;
- publicar comercios reales en el portal en línea;
- cualquier cambio de arquitectura de alto impacto o cualquier capacidad que implique costo;
- tocar la publicación existente de ChatGPT Sites (.openai/hosting.json);
- hacer push a un repositorio remoto.

Nunca, ni siquiera con un pedido indirecto: activar facturación, agregar medios de pago, contratar planes, crear proyectos pagos, usar bases o proyectos existentes del dueño, modificar proyectos externos, crear cuentas masivamente para evadir cuotas, contactar comercios.

==================================================
38. EVIDENCIA QUE DEBÉS ENTREGAR EN CADA HITO
==================================================

Un informe breve en docs/informes/hito-N.md (una o dos páginas) y un resumen en el chat:
1. Qué se pidió y qué se hizo.
2. El estado de cada función, separando: implementado localmente / probado con fixtures / probado con webs controladas / probado con fuentes reales / publicado.
3. Los casos A a R cubiertos, con su tipo de evidencia (prueba automática con nombre, captura, recorrido manual).
4. Los comandos ejecutados y su resultado resumido (pruebas: X de Y; build; verificar:costos; verificar:aislamiento).
5. La tabla de sitios reales probados, cuando corresponda.
6. Las limitaciones conocidas y lo que no funciona, dicho sin rodeos.
7. Costos: enlaces declarados, uso del día y confirmación de que no hay recursos pagos.
8. Las decisiones o aprobaciones que necesitás del dueño, en lenguaje simple.
No presentes una simulación como importación real. No des por terminado un hito cuya funcionalidad no fue probada.

==================================================
39. CONDICIONES CONCRETAS DE CIERRE DE LA DEMO
==================================================

La demo se cierra cuando se cumple todo esto:
- Los casos A a R están demostrados con la evidencia indicada, y cada uno está clasificado según el tipo de prueba.
- Las auditorías 1 y 2 están aprobadas (y la 3, si se activaron los propietarios).
- El dueño completó la prueba de usabilidad sin ayuda técnica.
- Hay fichas reales de San Bernardo cargadas y aprobadas por el dueño (objetivo: de 10 a 20), con al menos algunas importadas desde web y algunas con carta. Si la realidad no lo permite (por ejemplo, porque pocos comercios tienen web), se informa con datos en lugar de forzarlo.
- El portal está en línea en Workers Free, el costo es cero, no hay medio de pago y no se usó ningún proyecto externo.
- La guía del administrador, el procedimiento de respaldo y restauración y un documento breve de decisiones están en docs/.
- La restauración completa (D1 y KV) se probó desde cero; la tabla de CPU en línea no muestra operaciones por encima de 10 ms; Browser Rendering está verificado o sigue desactivado con la limitación documentada.
Cumplido esto, detenete y entregá el informe final. No agregues funciones nuevas.

==================================================
40. ESCALABILIDAD FUTURA (DISEÑAR PARA ESTO, NO IMPLEMENTARLO AHORA)
==================================================

- Nuevas localidades y partidos se agregan desde Configuración, sin código. Los slugs, los filtros, el sitemap y las páginas por localidad salen de los datos.
- Plan Workers Paid (unos USD 5 por mes): el mismo núcleo del motor corre en el servidor con linkedom; reanálisis programados con Cron y Queues; más minutos de navegador.
- R2 para medios (mediante la interfaz AlmacenMedios), dominio propio con caché de borde, correo saliente para propietarios.
- FTS5 en D1 para la búsqueda a partir de unas 1.000 fichas.
- Postgres solo si hiciera falta, gracias a Drizzle y los repositorios.
- Adaptadores nuevos como módulos del registro, sin tocar el núcleo, solo con evidencia de necesidad.
- Conectores oficiales de Meta autorizados por el propietario.

==================================================
41. PROHIBICIONES EXPLÍCITAS
==================================================

- NO tocar La Costa en Datos. NO tocar otros proyectos de Supabase ni de ningún proveedor. NO usar secretos de proyectos ajenos.
- NO activar facturación ni contratar nada. NO desplegar públicamente sin permiso.
- NO sustituir el motor real por datos simulados ni presentar una simulación como importación real. NO inventar negocios, direcciones, precios, reseñas, servicios, horarios ni coordenadas.
- NO rehacer la aplicación sin justificación técnica. NO eliminar funcionalidades existentes sin evaluar su integración.
- NO sacrificar la facilidad de uso. NO exigir programar un conector por restaurante.
- NO prometer compatibilidad con cualquier web sin pruebas.
- NO introducir arquitectura excesiva para una demo.
- NO cerrar una fase como completa si su funcionalidad no fue probada.
- NO desarrollar indefinidamente sin entregar recorridos utilizables.
- NO republicar fotos de terceros sin una base de uso registrada. NO presentar fotos genéricas como si fueran del comercio.
- NO evadir robots.txt, autenticación, CAPTCHA ni bloqueos. NO analizar Instagram ni Facebook de forma automatizada.
- NO mezclar datos ficticios con los reales en producción.

Empezá por la sección 3 (verificación inicial) y entregá el informe del hito 0 antes de modificar código de la aplicación.
