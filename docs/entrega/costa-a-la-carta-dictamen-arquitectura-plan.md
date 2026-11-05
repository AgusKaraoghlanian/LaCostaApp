# Costa a la carta: dictamen técnico, arquitectura, plan y diseño del administrador

Fecha de referencia: 21 de octubre de 2026
Base revisada: repositorio local `costa-a-la-carta`, commit `b1140c3`, sin cambios locales.

---

## 0. Qué revisé y con qué alcance

Esta vez no trabajé solo con el informe de Codex: tuve acceso de lectura al repositorio.

- **Leí el código real.** Revisé `src/App.jsx`, `src/datos.js`, `src/supabase.js`, `src/main.jsx`, `src/entrada-servidor.jsx`, `scripts/prerender.mjs`, `scripts/generar-semilla.mjs`, `supabase/esquema.sql`, `package.json`, `.openai/hosting.json`, `.env.example` y `tests/directorio.test.mjs`.
- **Ejecuté las pruebas** con `npm test`: pasan las 5 (Node 24.20).
- **No ejecuté el build** ni modifiqué nada del repositorio.
- **No pude ver el sitio publicado.** `https://costa-a-la-carta.o4ftony10.chatgpt.site/` responde 401 porque tiene acceso privado. Que el sitio corresponda a `b1140c3` lo sigo tomando como dato informado por Codex. Sí comprobé que el repositorio local está en ese commit.
- **Verifiqué los límites gratuitos** en la documentación oficial de Cloudflare y Supabase de octubre de 2026 (fuentes al final).
- **Hay dos cosas que no pude confirmar:** si Cloudflare R2 pide medio de pago para usar su nivel gratuito y si el plan Free de Cloudflare Zero Trust lo pide. Por eso la arquitectura elegida no depende de ninguno de los dos.

---

## 1. Dictamen técnico

### Veredicto

**El proyecto puede evolucionar hasta cumplir los requisitos. No hay motivo técnico para reescribirlo.** Conviene conservar el diseño visual, las rutas públicas, la lógica de búsqueda y los recorridos de propietarios. Hay cinco intervenciones obligatorias:

1. Separar `App.jsx` en módulos, conservando exactamente su comportamiento.
2. Reemplazar la capa de datos (localStorage o Supabase directo desde el navegador) por una API propia.
3. Agregar un servidor, que hoy no existe.
4. Rediseñar el modelo de datos.
5. Retirar el contenido inventado que hoy se mezcla con cualquier ficha.

Conectar una base de datos, sin más, no resuelve ninguno de los requisitos centrales.

### 1.1 Lo que existe (confirmado en el código)

| Pieza | Estado real |
|---|---|
| Interfaz pública | Portada, explorador con filtros combinables y compartibles por URL, categorías, ficha con galería, guardados, páginas informativas. Diseño propio y adaptado a celulares. |
| Router | Propio, con `history.pushState`. URLs estables: `/lugar/:slug`, `/categoria/:id`, `/explorar?…`. |
| Prerender | En el build, `entrada-servidor.jsx` y `prerender.mjs` generan HTML a partir de `datos.js`, y en el navegador `createRoot` lo reemplaza. Solo sirve para datos fijos en el código. |
| Búsqueda | `filtrarNegocios` en `datos.js`: ignora tildes y mayúsculas y combina filtros. Probada. |
| Formularios | Alta de negocio, reclamo de titularidad, consulta, reseña e ingreso. Etiquetas accesibles, mensajes de validación en español y foco atrapado en los diálogos. |
| Administración | Cuatro pestañas: Lugares (aprobar, rechazar, destacar), Categorías, Reseñas, Titularidades. Sin conexión funciona con localStorage. |
| Panel de propietario | Mis lugares, bandeja de consultas y solicitudes, también con localStorage. |
| Supabase | Cliente opcional sin configurar, y un esquema SQL con RLS que nunca se aplicó. |
| Pruebas | 5 pruebas de datos y filtros. Ninguna prueba la interfaz, la persistencia ni una importación. |
| Publicación | ChatGPT Sites, estático y con acceso privado. |

El diagnóstico de Codex es correcto en lo esencial: **no hay motor de importación, ni modelo de cartas, ni procedencia, ni detección de duplicados, ni servidor.**

### 1.2 Lo aprovechable

- `src/estilos.css`: es la identidad visual. Hay que conservarla. Solo conviene formatearla para poder mantenerla, porque hoy son 47 KB en 7 líneas.
- Todos los componentes visuales de `App.jsx`: tarjeta, cabecera, buscador, explorador, ficha, modales, pie, migas, estados vacíos, métricas y pestañas.
- La convención de URLs y el patrón de HTML previo reemplazado por `createRoot` (`main.jsx`).
- `filtrarNegocios`, que se puede extender para buscar también por productos de la carta.
- La idea de `traducirError` en `supabase.js`, que pasa errores técnicos a frases en español. Se generaliza para el motor.
- El diseño de permisos del esquema SQL: el propietario no puede destacarse, cambiar su reputación ni transferir la titularidad, y la aprobación de un reclamo es una transacción. Ese diseño pasa a la API como especificación de permisos.
- Los 20 negocios ficticios, como conjunto de demostración aislado y como datos de prueba.

### 1.3 Lo que hay que corregir o ampliar (hallazgos propios, además de los de Codex)

1. **`App.jsx` tiene 65 KB en 71 líneas.** Cada pantalla ocupa una línea y el estado, el acceso a datos y las rutas están en el mismo archivo. Agregar sobre eso un administrador completo y un motor no es sostenible. Hay que dividirlo en módulos sin cambiar la apariencia, lo que no equivale a reescribirlo.
2. **La ficha inventa texto.** `Detalle` (`src/App.jsx:28`) agrega a cualquier negocio frases como «Una propuesta para disfrutar de los sabores de La Costa…» y «Dejá que la sobremesa se estire…». Con datos reales eso es contenido inventado.
3. **Las fichas nuevas reciben fotos genéricas.** `guardarNegocio` (`src/App.jsx:56`) les asigna fotos de Unsplash, y la galería completa con imágenes genéricas cuando faltan. Eso contradice el requisito de no presentar una foto genérica como si fuera del restaurante.
4. **El esquema impide publicar fichas reales incompletas** (`supabase/esquema.sql:24`):
   - `descripcion` es obligatoria, de 20 a 1.200 caracteres.
   - `direccion` es obligatoria. Un delivery sin local quedaría obligado a dar una dirección privada.
   - `horarios` es texto libre, así que no se puede saber si un local está «abierto ahora».
   - Cada negocio tiene una sola categoría.
   - `localidad` referencia a la localidad por su nombre en texto, y la jerarquía provincia/partido es solo un valor por defecto.
5. **Un dato privado queda público.** `grant select … listings to anon` expone `contacto_email` de cada ficha aprobada a cualquier visitante.
6. **Una corrección del propietario saca la ficha del portal.** El disparador `validar_edicion_ficha` pasa la ficha a `pendiente` y la política de lectura solo muestra las aprobadas. Corregir un error de tipeo dejaría el negocio fuera del portal hasta una nueva aprobación. Hace falta separar la versión publicada de los cambios propuestos.
7. **La protección del administrador es solo visual.** En modo demo `esAdmin = !conectado || …`, y `/administracion` está enlazado en el pie público.
8. **Los slugs nuevos no son legibles.** Llevan un sufijo temporal (`-lx3k9a`). Conviene usar `nombre-localidad`, agregar un número solo si hay colisión y guardar los slugs anteriores para redirigir.
9. **El origen del prerender está fijo** en `chatgpt.site` dentro de `prerender.mjs`, y las páginas solo se regeneran con un nuevo build.
10. **Las localidades están en el código** y con nombres abreviados («San Bernardo»). Falta Costa Azul, que figura en tu lista.
11. **Hay elementos ficticios en la interfaz:** valoraciones, «valoraciones de muestra», «horarios de ejemplo», avatares de Pravatar en la portada y la leyenda de muestra en el pie. En el portal real deben desaparecer o quedar solo en modo demostración.
12. **Una consulta exige iniciar sesión** (`leads.user_id not null`) y no llega a ningún comercio real. Para fichas reales conviene reemplazarla por botones directos: WhatsApp, llamar, Instagram.

### 1.4 Lo que falta desarrollar

- Un servidor: API, proxy seguro de descarga, sesiones y HTML dinámico de las fichas.
- Persistencia real, almacenamiento de fotos y documentos, y autenticación.
- El modelo ampliado: territorio, contactos, horarios estructurados, temporadas, cartas versionadas, fuentes, observaciones, procedencia por campo, propuestas de cambio, duplicados, medios con derechos, historial e instantáneas publicadas.
- El motor completo: descubrimiento, extractores, adaptadores, PDF, OCR, IA opcional, normalización, fusión y comparación.
- El administrador nuevo: importación, revisión, editor de cartas, fotos, fuentes y bandeja de cambios.
- La ficha con carta, horarios estructurados, mapa y JSON-LD.
- Las pruebas: motor con sitios de ejemplo, seguridad, recorridos completos en navegador y fuentes reales.

### 1.5 Riesgos importantes

| Riesgo | Por qué importa | Mitigación |
|---|---|---|
| **Muchos comercios de San Bernardo solo tienen Instagram o WhatsApp** | El importador por URL puede funcionar bien y aun así cubrir pocos comercios. | Los caminos «Subir carta (PDF o fotos)» y «Pegar texto» tienen la misma prioridad que el importador web. Se mide la cobertura real en el piloto. |
| Límite de 10 ms de CPU por solicitud en Cloudflare Workers Free | Interpretar HTML grande, un PDF u OCR en el servidor excedería el límite. | El análisis pesado corre en el navegador del administrador (sección 2). El servidor solo valida, descarga y guarda. |
| Derechos sobre las fotos | Republicar fotos ajenas sin una base válida puede violar derechos de autor (Ley 11.723). | Cada foto tiene cuatro estados (encontrada → accesible → autorizada → aprobada) y solo se publica la que tiene una base registrada. |
| Datos viejos por la estacionalidad | Una carta vieja o un local cerrado en invierno pueden engañar al visitante. | Fecha de relevamiento visible, avisos de antigüedad, temporadas y estado operativo separado de «la web no responde». |
| Cambios en los niveles gratuitos | Cloudflare puede modificar sus límites. | Topes propios por debajo de los límites, un panel de «Uso del plan gratuito» y una capa de acceso que permite cambiar de proveedor. |
| Seguridad del proxy | El servidor descarga URLs que ingresa el usuario. | Validación estricta, redirecciones controladas, límites, robots.txt, solo para administradores, y una auditoría antes de publicar. |
| Usabilidad para alguien que no programa | Es el criterio de aceptación principal. | Asistente paso a paso, catálogo de mensajes en lenguaje simple, prueba automática que detecta palabras técnicas en la interfaz y una prueba con vos (caso R). |
| Expansión del alcance | Un motor «universal» invita a seguir agregando cosas sin fin. | Hitos con casos verificables y cierre explícito. Los adaptadores nuevos solo se agregan si hay evidencia de que hacen falta. |

---

## 2. Arquitectura concreta

### 2.1 Decisión

**Se mantiene React/Vite. Toda la plataforma va en Cloudflare con el plan Free.** Un solo Worker sirve el sitio, la API, el proxy seguro y las fotos. Los datos van en D1, y las fotos y documentos en KV. El motor de importación es isomórfico, o sea que el mismo código puede ejecutarse en el navegador o en un servidor. **En la demo, el análisis pesado se ejecuta en el navegador del administrador.** Renderizar páginas que dependen de JavaScript (Browser Rendering) y la ayuda de IA (Workers AI) son opcionales y usan cupos gratuitos con tope duro.

```
 Visitante (celular/PC)                      Administrador (navegador, PC o celular)
        │                                              │   Motor de importación:
        │                                              │   DOMParser · pdf.js · Tesseract.js
        ▼                                              ▼   (corre acá, gratis y sin instalar nada)
 ┌──────────────────────── Cloudflare Worker · plan Free ────────────────────────┐
 │ Archivos estáticos (React/Vite)  │ /api/publico   /api/admin   /api/solicitudes │
 │ HTML de fichas con datos y SEO   │ Proxy seguro de descarga (solo administración)│
 │ /medios (fotos aprobadas)        │ Sesiones con Google · Turnstile anti-abuso    │
 └──────┬──────────────────┬───────┴──────────────┬──────────────────┬───────────┘
        ▼                  ▼                      ▼                  ▼
   D1 (SQLite)       KV (fotos, PDF)     Browser Rendering       Workers AI
   datos y           optimizados         opcional, 10 min/día    opcional,
   historial         en el navegador     sitios con JavaScript   10.000 neuronas/día
```

**Por qué esta opción:**

- **Costo.** No hace falta medio de pago para Workers, D1, KV, Workers AI ni Browser Rendering en el plan Free. Al llegar a un límite, el servicio responde con error en lugar de cobrar.
- **Continuidad.** El sitio React/Vite se sirve igual que hoy, como archivos estáticos. El Worker suma lo que falta sin reemplazar la interfaz.
- **Sencillez operativa.** Un solo proveedor, un solo despliegue y un solo panel de control.
- **Disponibilidad.** Nada depende de tu PC. Con la PC apagada funcionan el portal, el administrador y el motor, desde cualquier celular o computadora.
- **Crecimiento.** El plan Workers Paid, de unos USD 5 por mes, sube el CPU a 30 segundos por solicitud. Ahí el mismo motor puede pasar al servidor para hacer reanálisis programados, sin reconstruir nada.

### 2.2 Alternativas comparadas

| Opción | A favor | En contra | Decisión |
|---|---|---|---|
| **A. Todo local** (Node, SQLite y Playwright en tu PC) | Capacidad ilimitada y gratis. | Con la PC apagada no hay administrador ni datos entre dispositivos. Publicar exigiría un circuito de build y subida. Tendrías que mantener un proceso corriendo. | Rechazada como base. Queda como posible ejecutor opcional del motor en el futuro. |
| **B. Proyecto Supabase nuevo** | El esquema ya está pensado para Postgres y RLS. | La documentación oficial dice que el límite de **2 proyectos gratuitos se aplica entre todas las organizaciones** donde sos Owner o Admin. Tus plazas están ocupadas. Liberar una implicaría pausar otro proyecto, o sea, tocarlo. | Rechazada por ahora. Viable más adelante con Supabase Pro, si lo decidís. |
| **C. Cloudflare Free** (elegida) | Gratis, sin cobros automáticos, un solo proveedor, estáticos ilimitados, D1, KV, IA y navegador con cupos. | 10 ms de CPU por solicitud, SQLite en lugar de Postgres (sin RLS, los permisos van en la API), Cache API solo con dominio propio. R2 posiblemente exija medio de pago. | **Elegida**, con el análisis pesado en el navegador, las fotos en KV y los permisos en la API. |
| D. Neon o Turso con Vercel o Netlify | Postgres gratis (Neon). | Dos o tres proveedores, más credenciales y paneles. Vercel Hobby prohíbe uso comercial. | Rechazada por complejidad sin ventaja clara. |
| E. Firebase | Autenticación gratis. | Base de documentos poco apta para cartas relacionales, y Storage requiere el plan pago Blaze para buckets nuevos. | Rechazada. |

### 2.3 Componentes

**Frontend.** React 19 y Vite 7, como hoy.
- `App.jsx` se divide en `src/paginas/`, `src/componentes/`, `src/admin/`, `src/servicios/` y `src/motor-ui/`, conservando las clases CSS y los textos.
- El administrador es un bloque que se carga aparte, solo al entrar a `/administracion`. Así el visitante nunca descarga pdf.js, Tesseract ni el editor.
- El modo demostración (20 negocios ficticios en el navegador) queda disponible solo con un comando de desarrollo, nunca en producción.

**Backend.** Un único Cloudflare Worker escrito con Hono, en TypeScript.
- Rutas `/api/publico/*` para leer fichas publicadas, el índice de búsqueda y el sitemap.
- Rutas `/api/admin/*` para editar, importar, publicar, manejar medios y revisar.
- Rutas `/api/solicitudes/*` para «Sumá tu lugar», «Reclamar» y «Sugerir corrección», protegidas con Turnstile.
- `/medios/*` para servir las fotos.
- El HTML de `/lugar/:slug`, `/explorar`, `/categoria/:id` y `/`, con título, descripción, JSON-LD y datos incrustados.
- Regla de diseño: **cada solicitud debe usar menos de unos 5 ms de CPU.** Nada de interpretar HTML, PDF o imágenes en el servidor.

**Motor.** Paquete `motor/` en TypeScript, independiente del entorno. Trabaja sobre un `Document` estándar y un «obtenedor» de recursos.
- En la demo corre en el navegador del administrador: interpreta el HTML con `DOMParser`, que no ejecuta scripts ni descarga recursos, lee PDF con pdf.js y aplica OCR con Tesseract.js, estos dos en Web Workers.
- Pide cada página al proxy seguro del Worker, nunca directamente.
- Envía al servidor solo resultados estructurados.
- El estado de cada análisis queda guardado en D1, así que se puede retomar si se cierra la pestaña.
- En las pruebas corre en Node con linkedom. En el futuro puede correr en un servidor pago o en tu PC sin cambiar el núcleo.

**Persistencia.** D1 (SQLite) con migraciones versionadas (Drizzle ORM y drizzle-kit, que además facilitan una migración futura a Postgres). En desarrollo se usa una base D1 local (Miniflare), completamente aislada. En producción hay una sola base D1 dedicada a Costa a la carta.

**Publicación por instantáneas.**
- Editar nunca cambia lo que ve el público.
- **Publicar** genera una instantánea JSON validada de la ficha, con su carta publicada y sus fotos aprobadas, y el portal lee solo esas instantáneas.
- Los borradores, las importaciones y las propuestas de propietarios jamás llegan al público sin aprobación.
- Volver atrás es volver a publicar una instantánea anterior.

**Medios.**
- El navegador del administrador optimiza cada foto antes de subirla: la redimensiona a 1600 y 640 píxeles en WebP y le quita los metadatos EXIF, incluida la ubicación GPS.
- El Worker valida el archivo y lo guarda en KV (1 GB gratis, hasta 25 MiB por archivo).
- Hay una interfaz `AlmacenMedios` con dos implementaciones: KV en la demo y R2 cuando aceptes agregar medio de pago para crecer.

**Autenticación.**
- Ingreso con Google (OIDC), sin contraseñas que guardar ni cifrar. Los hashes de contraseña excederían el CPU disponible.
- Sesión en una cookie `__Host-` HttpOnly, guardada en D1.
- Las cuentas de administración se definen por lista de correos en un secreto del Worker.
- El rol de propietario se otorga al aprobar un reclamo.
- En desarrollo local hay un acceso de prueba que no puede activarse en producción.

**Trabajos pesados.**
- Los ejecuta el navegador del administrador mientras ve el progreso.
- Los sitios que solo muestran contenido con JavaScript usan Browser Rendering desde el Worker, con un cupo de 10 minutos por día.
- La IA es opcional y usa Workers AI con 10.000 neuronas por día. Se usa solo para cartas fotografiadas o texto desordenado, y siempre con revisión humana.
- Sin colas ni procesos permanentes en la demo.

**Publicación del sitio.**
- El portal va en un subdominio gratuito `*.workers.dev`.
- El dominio propio es opcional y queda para después. Habilita la caché de borde y mejores direcciones.
- El sitio de ChatGPT Sites no se toca: decidís vos si sigue como vitrina o se retira.

**Mapas.**
- MapLibre con teselas de OpenFreeMap: gratis, sin clave ni registro, con atribución. Se carga solo al abrir el mapa.
- «Cómo llegar» usa un enlace de Google Maps por URL, sin API paga.
- Las coordenadas salen solo de datos estructurados de la fuente o de un pin que ubicás vos.
- Nominatim se usa solo cuando apretás «Buscar en el mapa», con un máximo de una consulta por segundo, y el resultado siempre se confirma.

### 2.4 Límites gratuitos verificados (octubre de 2026) y cómo se respetan

| Servicio | Límite del plan Free (documentación oficial) | Uso en la demo | Al superarlo |
|---|---|---|---|
| Workers | 100.000 solicitudes por día, **10 ms de CPU por solicitud**, 50 subsolicitudes, 128 MB | API, HTML de fichas, fotos | Error 1027, sin cobro |
| Archivos estáticos | Hasta 20.000 archivos de 25 MiB cada uno | JS, CSS, pdf.js, datos de Tesseract | — |
| D1 | 5 M filas leídas y 100.000 escritas por día, 500 MB por base, 5 GB por cuenta, Time Travel de 7 días | Todos los datos | Las consultas fallan hasta las 00:00 UTC, sin cobro |
| KV | 100.000 lecturas y 1.000 escrituras por día, 1 GB, 25 MiB por valor | Fotos y PDF | Error |
| Browser Rendering («Browser Run») | 10 min por día, 1 solicitud REST cada 10 s, 3 navegadores | Solo sitios que necesitan JavaScript | 429 hasta el día siguiente |
| Workers AI | 10.000 neuronas por día | Opcional, cartas difíciles | Falla con error, sin cobro en Free |
| R2 | 10 GB, 1 M operaciones A y 10 M B por mes, salida gratis | **No se usa en la demo** | Facturable |
| Supabase | 2 proyectos gratis en total (los pausados no cuentan) | **No se usa** | — |

Hay un control propio: la app lleva sus contadores diarios y frena antes de llegar a los límites. Por ejemplo, 8 minutos de navegador o 8.000 neuronas estimadas. El administrador muestra «Uso del plan gratuito de hoy».

Turnstile, Google OAuth y OpenFreeMap son gratuitos según sus condiciones públicas. Igual conviene que el programador confirme sus términos al configurarlos.

Los límites son por cuenta de Cloudflare. Si usás una cuenta donde ya tenés otros proyectos, comparten el cupo.

### 2.5 ¿Qué pasa con la PC apagada?

**No pasa nada.** El portal, el administrador y el motor viven en Cloudflare y en el navegador desde el que trabajes. Una importación desde el celular funciona, aunque el OCR de una carta fotografiada es más lento que en una PC.

Lo único que la demo **no** hace es analizar fuentes de forma automática y programada cuando nadie está usando el administrador. Para revisar todas las fuentes desde el administrador hay un botón «Revisar fuentes». El reanálisis automático nocturno pertenece a la etapa paga, o a un ejecutor opcional en tu PC si algún día conviene.

### 2.6 Evolución a infraestructura paga, sin reconstruir

1. **Workers Paid (unos USD 5 por mes).** CPU de 30 s, de modo que el mismo motor corre en el servidor con linkedom. Habilita reanálisis programados con Cron y Queues, más tiempo de navegador y bases D1 de hasta 10 GB.
2. **R2** para medios cuando aceptes registrar un medio de pago. Gracias a la interfaz de almacenamiento, el cambio es de configuración y de copia de archivos.
3. **Dominio propio** (un `.com.ar` tiene un costo anual bajo). Suma caché de borde, una dirección prolija y correo saliente para propietarios, por ejemplo con un proveedor con nivel gratuito.
4. **Postgres** (Supabase Pro o Neon) solo si hiciera falta. Drizzle y la capa de repositorios acotan esa migración. Para todo el Partido de La Costa, D1 alcanza.
5. **La expansión territorial es un dato, no código:** nuevas localidades y partidos se agregan desde Configuración.

### 2.7 Modelo de datos (resumen; el detalle completo está en el prompt maestro)

- **Territorio.** `provinces` → `districts` (partidos) → `locations` (localidades con slug y centro geográfico).
- **Ficha.** `listings` es la única identidad del establecimiento: slug estable, estado de publicación, estado operativo, coordenadas con su origen, marca para sucursales. Se acompaña de:
  - `listing_categories` (varias por ficha) y `listing_services`;
  - `listing_contacts` (teléfono, WhatsApp confirmado, Instagram, etc., con indicación de público o privado);
  - `listing_hours` (horarios estructurados, admite cierre después de medianoche) y `listing_seasons` (temporadas);
  - `slug_history`, para redirigir slugs anteriores.
- **Cartas.** `menus` → `menu_versions` (fecha de relevamiento, fuente, documento) → `menu_sections` → `menu_items` → `menu_item_variants` → `menu_prices` (importe en centavos o ningún importe, estado del precio: publicado, sin precio, a consultar o ilegible, canal, condición). Cada sección, producto y variante tiene una `clave_estable` que se mantiene entre versiones, para poder comparar.
- **Motor.**
  - `sources` (cada fuente con sus reglas simples), `import_jobs`, `snapshots` (cada descarga, con su hash) y `observations` (cada dato hallado, con método, evidencia y confianza).
  - `field_provenance` registra, por campo, de dónde salió y si está protegido.
  - `change_proposals` es la bandeja de cambios, con valor base, actual y propuesto.
- **Identidad y duplicados.** `listing_identifiers` (dominio, teléfono, Instagram, dirección normalizada) y `duplicate_decisions`.
- **Medios.** `media` (estado: encontrada, accesible, autorizada o aprobada) y `media_rights` (base de uso, autor, licencia, evidencia del permiso).
- **Personas.** `users`, `sessions`, `user_roles`, `listing_owners`, `listing_claims` y `submissions` (sugerencias y altas propuestas). `reviews` y `leads` se conservan, desactivadas con interruptores.
- **Publicación y control.** `published_snapshots`, `audit_log`, `usage_counters` y `config` (interruptores y límites).

No hay dos catálogos paralelos: las importaciones no crean fichas aparte, sino observaciones y propuestas que se aplican a la misma ficha.

### 2.8 Motor universal (resumen)

**Universalidad por arquitectura.** Hay estrategias generales que siempre se ejecutan, adaptadores por familia de plataformas que se activan solos al detectarla, y reglas simples por fuente que se configuran desde la interfaz. Nunca hace falta código por comercio.

Orden de las capas, de la más barata y determinista a la más costosa:

1. Validar la URL y detectar redes sociales. Instagram y Facebook no se descargan: se guardan como enlace y se ofrecen caminos alternativos.
2. Descargar la página principal por el proxy, respetando robots.txt, y detectar la plataforma (WordPress, WooCommerce, Shopify, Tiendanube, Wix, Linktree, Google Sites, etc.).
3. Descubrir las páginas útiles: enlaces internos clasificados por palabras (carta, menú, pizzas, contacto, nosotros, galería, delivery), sitemaps, la API REST de WordPress, documentos PDF y enlaces a redes. Con un presupuesto máximo de páginas.
4. Extraer, con estos extractores:
   - JSON-LD y Schema.org (Restaurant, Menu, MenuItem, Product, Offer, horarios, dirección, coordenadas);
   - microdatos;
   - metadatos y OpenGraph;
   - contactos en los enlaces (`tel:`, `wa.me`, `mailto:`, redes);
   - horarios en texto;
   - carta en el DOM (bloques repetidos con precios, columnas de tamaños);
   - JSON incrustado (`__NEXT_DATA__` y similares);
   - adaptadores de la API pública de tienda de WooCommerce y del `products.json` de Shopify.
5. Si la página casi no tiene contenido sin JavaScript, renderizarla con Browser Rendering, siempre que quede cupo, y repetir el paso 4.
6. Para documentos:
   - un PDF con texto se lee con pdf.js y el analizador de cartas en texto;
   - un PDF escaneado o una foto pasa por OCR con Tesseract y el mismo analizador;
   - la IA es opcional, para estructurar o leer casos difíciles. Todo lo que produce queda marcado «para revisar».
7. Normalizar a un formato común en el que cada dato es un hallazgo con valor, método, URL, evidencia y confianza. También se registra lo que no se encontró y los diagnósticos con su mensaje para el usuario.
8. Fusionar los hallazgos con prioridades (los datos estructurados ganan) y conservar las alternativas cuando hay conflicto.
9. Buscar duplicados y mostrar la vista previa.
10. Aplicar los cambios en una transacción, con procedencia e historial.

---

## 3. Plan de desarrollo

Los hitos se ordenan para tener lo antes posible el circuito real **URL → extracción → revisión → guardado → publicación** (hito 2), probado con sitios reales. Cartas por documentos, fotos y actualizaciones vienen inmediatamente después, sin postergarse.

| Hito | Objetivo funcional | Incluye | Casos | Tamaño |
|---|---|---|---|---|
| **0. Línea base** | Saber exactamente qué hay | Verificar el commit (`b1140c3` o posterior, leyendo las diferencias), correr pruebas y build, guardar el HTML de todas las rutas actuales como referencia y escribir un informe breve. | — | Chico |
| **1. Base real local y carga manual** | Crear y publicar una ficha real con persistencia | Dividir `App.jsx` sin cambios visuales. Worker con Hono y D1 local con migraciones del modelo completo. API pública y de administración. Publicación por instantáneas. Retiro del contenido inventado. Administrador nuevo: Inicio, Negocios y editor de Datos. Datos demo aislados. Localidades y categorías reales. | A, J (local) | Grande |
| **2. Motor web v1 y revisión** | **Pegar una URL real y obtener datos útiles** | Proxy seguro. Motor HTML completo: descubrimiento, extractores, adaptadores WordPress, WooCommerce y Shopify, carta en el DOM, analizador de precios argentinos. Browser Rendering como alternativa. Asistente de importación con progreso, revisión, duplicados, borrador y publicación. Editor básico de carta. Catálogo de mensajes. Enlaces de redes. Más de 15 sitios de ejemplo y al menos 8 sitios reales. | B, C, D, F, L, M | Grande |
| **3. Demo en línea segura** | Usarla desde el celular, en la nube gratis | Ingreso con Google y permisos. Turnstile en Sumá tu lugar, Reclamar y Sugerir corrección, que llegan a la bandeja «Revisar». Verificaciones de costo y aislamiento. **Auditoría 1.** Despliegue en Workers Free con tu aprobación. | J, K, N, O, P, Q | Mediano |
| **4. Cartas por documentos y fotos con derechos** | Cargar cartas de PDF, fotos o texto pegado (el camino de Instagram) | PDF con texto, OCR, pegar texto, IA opcional con tope, versiones de carta. Gestor de fotos con estados de derechos, optimización y foto principal. Mapa y «Cómo llegar». | E, K | Grande |
| **5. Fuentes múltiples y actualizaciones protegidas** | Enriquecer una ficha y detectar cambios sin perder correcciones | Segunda fuente sin duplicar. Reanálisis con comparación de tres valores. Bandeja de cambios. Campos y precios protegidos. Historial y «Deshacer». Copia de seguridad descargable. **Auditoría 2.** | G, H, I | Mediano |
| **6. Prueba con el dueño y cierre del piloto** | Que vos lo manejes sin ayuda | Guía de prueba y prueba de usabilidad con vos. Ajustes. Carga de 10 a 20 comercios reales aprobados por vos. Pulido de la ficha pública. Propietarios con cuenta, detrás de un interruptor (**Auditoría 3** solo si se activa). | R, cierre | Mediano |

Los tamaños son relativos, no una estimación en horas. No hay fases extra: cada hito termina en recorridos que se pueden usar.

### Auditorías independientes justificadas

Cada auditoría se hace en un **chat nuevo de Claude Code (o Codex), en la misma carpeta del proyecto**. El auditor **no modifica código**: revisa el código y ejecuta pruebas reales, no se basa en el informe del programador. Después de las correcciones, se repite solo lo afectado.

**Auditoría 1: seguridad y honestidad del circuito (fin del hito 3, antes del primer despliegue)**
- Proxy:
  - redirecciones hacia `127.0.0.1`, `[::1]`, `169.254.169.254`, IP decimales o hexadecimales, IPv6 con IPv4 incrustado y nombres que resuelven a redes privadas;
  - puertos no estándar y esquemas no permitidos;
  - límites de tamaño, tiempo y tipo;
  - robots.txt.
- Matriz de permisos de todos los endpoints `/api/admin/*` y de solicitudes. CSRF y atributos de las cookies.
- XSS con sitios de ejemplo maliciosos: `<script>`, enlaces `javascript:`, SVG con eventos, HTML en nombres y precios.
- Que no haya secretos en `dist/`. Que la configuración no tenga recursos pagos ni referencias a otros proyectos.
- Que la importación sea real: ejecutarla contra 3 sitios reales y 3 de ejemplo, y comparar con el contenido de la fuente.
- **Se aprueba** con cero hallazgos críticos o altos abiertos, y con los medios corregidos o justificados por escrito.

**Auditoría 2: integridad de datos (fin del hito 5)**
- Procedencia por campo.
- Que las correcciones protegidas sobrevivan a un reanálisis.
- Comparación de tres valores.
- Que una segunda fuente no duplique la ficha.
- Que el público nunca vea un borrador.
- «Deshacer».
- Migraciones desde cero.
- Copia de seguridad y restauración probadas en una base local.
- **Se aprueba** cuando los casos G, H e I se reproducen desde la interfaz y ninguna prueba de integridad falla.

**Auditoría 3: cuentas de propietarios (solo si se activan)**
- Dos propietarios de prueba: ninguno puede leer ni modificar la ficha o las consultas del otro, ni destacarse, ni aprobarse.
- Los datos privados (correos de reclamos, teléfonos privados) no aparecen en respuestas públicas.
- Abuso de formularios.
- **Se aprueba** con el caso O demostrado con pruebas automáticas.

Texto base para abrir cada auditoría:

> Sos auditor independiente del proyecto Costa a la carta, en esta carpeta. No modifiques archivos del proyecto. Leé el prompt maestro y el último informe del programador solo para saber qué se afirma. Verificá esas afirmaciones contra el código y ejecutando las pruebas y los recorridos indicados para la Auditoría N: [criterios]. Entregá una lista de hallazgos con severidad (crítica, alta, media, baja), evidencia (archivo:línea, comando y salida) y cómo reproducirlos. No propongas funciones nuevas.

---

## 4. Diseño funcional del administrador

### Principios

- **Una acción principal por pantalla**, en el botón naranja actual (`boton-naranja`). Las secundarias van con borde.
- **Lenguaje del dueño:** «negocio», «carta», «foto», «fuente», «publicar». Nunca «JSON», «endpoint», «selector», «null» ni «error 500».
- **Nada se publica solo.** Todo queda en borrador hasta que apretás «Publicar», y siempre hay vista previa.
- **Cada dato importado muestra de dónde salió** («de la web oficial · página Contacto») y cuán seguro es, con tres niveles: ✔ Seguro / ⚠ Revisar / ✖ No encontrado.
- **Se puede deshacer:** un aviso con «Deshacer» después de guardar o publicar, y un historial con «Volver a esta versión».
- **Celular primero:** en pantallas chicas, una barra inferior con Inicio, Negocios, Importar y Revisar, más un menú «Más».
- **Mismo estilo que el portal:** las tarjetas, `metricas`, `pestanas`, `lista-gestion` y `estado` actuales se reutilizan.

### Mapa de secciones

Las diez secciones que propusiste se agrupan en seis pantallas:

| Pantalla | Contiene | Reemplaza o integra |
|---|---|---|
| **Inicio** | Botones grandes: Agregar negocio, Importar desde web, Subir carta, Revisar cambios (con número), Ver portal. Tareas pendientes. Últimos negocios editados. | — |
| **Negocios** | Buscador y filtros (localidad, estado, «le falta…»). Cada fila muestra estado y completitud. Al entrar, un editor con pestañas **Datos · Carta · Fotos · Fuentes · Historial**. | La pestaña actual «Lugares» (aprobar y destacar se mantienen) |
| **Importar** | «Pegar dirección web» o «Subir PDF / fotos / pegar texto de una carta». Análisis anteriores. | — |
| **Revisar** | Una sola bandeja: cambios detectados, propuestas de propietarios, sugerencias del público, negocios propuestos, titularidades y, si se activan, reseñas. | «Titularidades» y «Reseñas» |
| **Configuración** | Categorías, localidades, servicios, uso del plan gratuito, copia de seguridad, ayuda de IA (activar o desactivar). | «Categorías» |
| **Ayuda** | Guía breve con los recorridos habituales. | — |

### Recorridos principales

**R1. Importar un restaurante desde su web**
1. Inicio → **Importar desde web** → pegás la dirección → **Analizar sitio**.
2. Ves el progreso en frases: «Abriendo la página principal ✓», «Buscando datos del comercio ✓», «Encontramos la página Nuestra carta», «Leyendo la carta…». Podés cerrar y retomarlo después.
3. **Revisión**. Ejemplo ilustrativo de la pantalla:

```
 Pizzería Ejemplo · ejemplo.com.ar                 [Guardar borrador]  [Publicar]
 ✔ 14 datos encontrados   ⚠ 3 para revisar   ✖ 4 no encontrados
 DATOS DEL COMERCIO
  Nombre      Pizzería Ejemplo        ✔ Seguro · datos de la web          [Editar]
  Categoría   Pizzería                ⚠ Revisar · deducido del título     [Cambiar]
  Dirección   Chiozza 1234            ✔ Seguro · página Contacto          [Editar]
  Horarios    —                       ✖ No encontrado                     [Agregar]
 CONTACTO     WhatsApp ✔ · Instagram ✔ · Teléfono ✔
 CARTA        Pizzas · 12 productos · 20 precios · ⚠ 2 sin precio  [Ver y corregir]
 FOTOS        8 detectadas · ninguna con permiso registrado      [Elegir e indicar permiso]
```

4. **¿Ya existe?** Si el sistema encuentra coincidencias, pregunta. Por ejemplo: «Parece ser *Pizzería Ejemplo* ya cargada (mismo teléfono)». Las opciones son **Actualizar esa ficha**, **Es otra sucursal** o **Es otro negocio**.
5. **Guardar borrador** o **Publicar**. La vista previa muestra la ficha tal como la verá el público.

**R2. Crear un negocio sin web (solo Instagram o WhatsApp)**
Agregar negocio → formulario corto: nombre, localidad, categoría y un medio de contacto. Pegás el enlace de Instagram y queda como contacto. Guardás. La ficha se puede publicar aunque no tenga carta ni descripción: las secciones vacías no aparecen.

**R3. Cargar una carta desde PDF, fotos o texto**
Carta → **Subir carta**:
- **Subir PDF:** si tiene texto, se lee directamente; si está escaneado, se usa el reconocimiento de texto.
- **Subir fotos:** reconocimiento de texto, y opcionalmente «Ayuda de IA».
- **Pegar texto:** por ejemplo, copiado de una publicación de Instagram.

El resultado aparece en el editor de cartas con lo dudoso marcado («No pudimos leer este precio»), nunca completado al azar. Indicás de dónde salió (enlace a la publicación o «la envió el comercio») y la fecha de los precios.

**R4. Corregir un precio y protegerlo**
En el editor de cartas, cada sección es una tarjeta plegable y cada producto muestra sus variantes con precio (por ejemplo, «Individual $9.000», «Grande $14.000»). Corregís el valor y tocás el candado **Proteger**. Un reanálisis posterior nunca lo pisa: si la web dice otra cosa, aparece en Revisar como «Tenés una corrección protegida y la web dice $15.000».

**R5. Sumar una segunda fuente a una ficha existente**
Ficha → **Fuentes** → **Agregar fuente** (web, PDF, fotos o Instagram) → se analiza → la revisión muestra solo lo **nuevo o distinto** frente a la ficha → aceptás lo que querés. No se crea otra ficha.

**R6. Revisar cambios detectados**
Fuentes → **Volver a analizar** (o «Revisar fuentes» para varias a la vez). En Revisar aparecen tarjetas como «Muzzarella grande: precio anterior $14.000 → nuevo $15.500 (web oficial, hoy)», con **Aceptar**, **Rechazar** o **Editar**. Si la página no responde, el sistema avisa «La web no respondió»; nunca marca el negocio como cerrado.

**R7. Fotos**
- Fotos → subir desde la PC o la cámara del celular. Se optimizan solas.
- Antes de publicar, cada foto pide **«¿De dónde es y podemos usarla?»**: «La saqué yo o mi equipo» / «La envió el comercio y autorizó su uso» / «Licencia libre (indicar autor)» / «Solo como referencia, no publicar».
- Estrella para la foto principal y orden por arrastre o con flechas.
- Las fotos detectadas en una web aparecen como «Encontrada». Solo se descargan si elegís usarlas, y no se publican sin un permiso registrado.

**R8. Atender solicitudes**
Revisar → una sugerencia, un negocio propuesto («Sumá tu lugar») o un reclamo de titularidad. Las opciones son Aprobar, Rechazar o Convertir en ficha. El reclamo incluye una guía para verificarlo: contactar al comercio por su teléfono público, nunca por los datos del solicitante.

**R9. Publicar, ocultar o deshacer**
Cada ficha muestra su estado: Borrador / Publicada / Publicada con cambios sin publicar / Oculta. **Publicar cambios** resume qué cambia («3 precios, 1 foto, horarios»). Ocultar y Archivar piden confirmación. En el historial está «Volver a la versión publicada el 12/11».

**R10. Mantenimiento sin técnica**
Configuración → **Uso del plan gratuito** (por ejemplo, «Hoy usaste 2 de 8 minutos de navegador») y **Descargar copia de seguridad**, un único archivo con todos los datos.

### Mensajes ante problemas (ejemplos del catálogo)

| Situación | Mensaje |
|---|---|
| Dirección inexistente | «No encontramos esa dirección. Revisá que esté bien escrita.» |
| Sitio lento | «La página tardó demasiado en responder. Probá de nuevo más tarde.» |
| Bloqueo o CAPTCHA | «Este sitio no permite que lo leamos automáticamente. Podés cargar los datos a mano o subir la carta.» |
| robots.txt lo prohíbe | «El sitio pidió no ser analizado por programas automáticos. Respetamos esa decisión: podés completar la ficha a mano.» |
| Hace falta navegador y no queda cupo | «Esta página necesita un navegador especial y hoy se terminó el cupo gratuito. Probá mañana o subí capturas de la carta.» |
| Instagram o Facebook | «Instagram y Facebook no permiten importar perfiles automáticamente. Guardamos el enlace en la ficha. Para la carta, subí capturas que tengas permiso de usar o pegá el texto.» |
| Carta ilegible | «No pudimos leer automáticamente la carta de este restaurante. Podés subir una fotografía más nítida o completarla manualmente.» |
| Nada útil | «No encontramos datos útiles en esta página. Si tiene una sección de carta o contacto, pegá esa dirección.» |

---

## 5. Decisiones que necesito de vos (el programador te las va a pedir en su momento)

1. **La cuenta de Cloudflare**: una nueva solo para Costa a la carta, recomendada para que los cupos no se compartan, o una existente. La creás vos; nunca se agrega medio de pago.
2. **La cuenta de Google** con la que vas a entrar al administrador, y la creación del cliente de ingreso en Google Cloud. Es gratis y no requiere facturación; el programador te guía.
3. **El nombre del subdominio** `*.workers.dev`, y si en algún momento querés un dominio propio.
4. **Qué comercios reales se publican.** El programador propone candidatos con sus fuentes y vos aprobás cada uno.
5. **Si activás la ayuda de IA** (Workers AI, con cupo gratuito) para cartas fotografiadas.
6. **Qué hacer con el sitio actual** de ChatGPT Sites.

---

## Fuentes consultadas (límites y condiciones, octubre de 2026)

- Cloudflare Workers, límites: https://developers.cloudflare.com/workers/platform/limits/
- Cloudflare D1, límites: https://developers.cloudflare.com/d1/platform/limits/ y precios: https://developers.cloudflare.com/d1/platform/pricing/
- Cloudflare KV, límites: https://developers.cloudflare.com/kv/platform/limits/
- Cloudflare Browser Rendering, límites: https://developers.cloudflare.com/browser-rendering/platform/limits/
- Cloudflare Workers AI, precios y cupo gratuito: https://developers.cloudflare.com/workers-ai/platform/pricing/
- Cloudflare R2, precios: https://developers.cloudflare.com/r2/pricing/ (no aclara si se pide medio de pago; según guías de terceros, sí lo pide)
- Cloudflare Cache API: https://developers.cloudflare.com/workers/runtime-apis/cache/ (funciona con dominios propios)
- Supabase, facturación y límite de proyectos gratuitos: https://supabase.com/docs/guides/platform/billing-on-supabase
- OpenFreeMap: https://openfreemap.org
- Gemini API, nivel gratuito y uso de datos (alternativa no elegida): https://ai.google.dev/gemini-api/docs/billing
