# Costa a la carta

Directorio gastronómico del Partido de La Costa. Interfaz, textos, formularios, mensajes y documentación en español de Argentina.

## Estado de esta entrega

Funciona en **modo demostración**, sin conexión con Supabase. No se creó ni modificó ningún proyecto de Supabase. El proyecto existente «la-costa-en-datos» no se utiliza.

Los 20 negocios, las direcciones y las reseñas son ficticios; las fotografías son ilustrativas de Unsplash. Las solicitudes, consultas, favoritos y cambios de administración se guardan en el almacenamiento local del navegador. Cada navegador tiene su propia demostración. No se envían correos ni mensajes a negocios reales.

## Iniciar el proyecto

Requiere Node.js 22.12 o posterior y npm.

```powershell
npm.cmd ci
npm.cmd run dev
```

Para crear la versión de producción y verla localmente:

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run preview
```

El proceso de construcción genera 39 páginas con contenido HTML, títulos y descripciones para las categorías y los negocios, además de un mapa del sitio. Las páginas de cuentas y administración llevan `noindex`. Las rutas públicas son `/explorar`, `/categorias`, `/categoria/:categoria` y `/lugar/:slug`.

## Qué incluye

- Portada con búsqueda por comida y localidad, categorías, destacados y enlaces entre localidades y fichas.
- Directorio con filtros combinables por categoría, localidad, valoración, precio y servicios; orden por recomendación, precio o valoración. Los filtros se pueden compartir mediante la dirección de la página.
- Fichas con galería ampliable, descripción, servicios, horarios, dirección, reseñas y formulario de consulta.
- Favoritos que permanecen guardados al recargar la página.
- Alta de negocio, edición de fichas propias y solicitud de titularidad.
- Panel del propietario con lugares, solicitudes y bandeja de consultas.
- Administración de demostración: aprobación o rechazo de fichas y titularidades, destacados, categorías y moderación de reseñas.
- Cliente de Supabase preparado para registro, inicio y cierre de sesión con correo y contraseña.
- Diseño adaptable a dispositivos móviles, controles con etiquetas y diálogo accesible mediante teclado.

## Recorrido sugerido

1. Buscá «café» y filtrá por San Bernardo. Abrí Casa Marea y guardala.
2. En la ficha de La Orilla, dejá una reseña y una consulta de prueba.
3. Abrí Administración para aprobar la reseña. La consulta se ve en Mi panel → Bandeja de consultas.
4. Sumá un negocio. En Mi panel figurará pendiente. Aprobalo en Administración y buscá su nombre en el directorio.
5. Reclamá una ficha existente y aprobá su titularidad en Administración. Aparecerá en el panel para editarla.
6. Agregá una categoría en Administración. Estará disponible al sumar un negocio y en los filtros del directorio.

## Conectar Supabase más adelante

Esta parte queda pendiente por decisión del usuario. Los archivos SQL son una preparación para revisar y ejecutar en un **proyecto nuevo y dedicado**, nunca sobre el proyecto existente.

1. Crear o seleccionar el nuevo proyecto autorizado.
2. Revisar y ejecutar `supabase/esquema.sql`, luego `supabase/datos-ejemplo.sql` si se desean los ejemplos.
3. Crear `.env.local` a partir de `.env.example` y completar la URL del nuevo proyecto y su clave **publicable**. Nunca usar `service_role` ni una clave secreta en el navegador.
4. Habilitar el registro por correo en Supabase Auth y configurar la URL del sitio y las direcciones de redirección permitidas. Los mensajes de confirmación de correo se deben personalizar en español dentro de Supabase.
5. Asignar `app_metadata.role = "admin"` a la cuenta administradora desde un entorno de confianza. Los usuarios no pueden asignarse ese rol mediante el registro.
6. Reconstruir el sitio. Comprobar las políticas con cuentas de dos propietarios distintos antes de habilitar el uso real.

El modelo contiene `listings`, `categories`, `locations`, `reviews`, `leads`, `listing_claims`, `listing_images` y `owners`. Todas las tablas tienen seguridad por filas. Los propietarios no pueden aprobar fichas, aumentar sus valoraciones ni destacarse. Las solicitudes de titularidad requieren intervención administrativa. La función de aprobación conserva la seguridad por filas y actualiza solicitud y propietario dentro de la misma transacción.

La carga de imágenes propias con Supabase Storage y el envío de notificaciones por correo quedan para la etapa de conexión. La bandeja de consultas funciona como registro; no se integra con un proveedor de correo. La semilla contiene puntuaciones de demostración; antes de abrir reseñas reales habrá que reemplazarlas y configurar su agregación a partir de reseñas aprobadas.

## Estructura

| Archivo | Contenido |
| --- | --- |
| `src/App.jsx` | Pantallas, formularios y recorridos |
| `src/estilos.css` | Diseño y adaptación móvil |
| `src/datos.js` | Veinte negocios de muestra, categorías y localidades |
| `src/supabase.js` | Conexión opcional y traducción de errores |
| `supabase/esquema.sql` | Modelo, índices, políticas y funciones preparadas |
| `supabase/datos-ejemplo.sql` | Semilla del catálogo de ejemplo |
| `scripts/prerender.mjs` | Páginas estáticas y mapa del sitio |
| `tests/directorio.test.mjs` | Verificación de datos y filtros |

## Publicación

El sitio utiliza Sites con acceso privado. Su identidad está en `.openai/hosting.json`. El directorio de publicación es `dist/`. Para usar otro dominio, actualizar el origen en `scripts/prerender.mjs` antes de construir.

Las tipografías se sirven desde Google Fonts, las imágenes desde Unsplash y los avatares decorativos desde Pravatar. Se necesita conexión a Internet para esos recursos; las tipografías tienen alternativas locales.
