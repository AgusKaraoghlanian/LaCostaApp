# Hito 0 · Línea base

Fecha: 21/10/2026. Alcance: verificación inicial (sección 3 del prompt maestro). No se modificó código de la aplicación.

## 1. Estado real del repositorio

- Rama `main`, HEAD `b1140c3` («Update Site source»), árbol limpio, sin cambios sin commitear. Solo existen dos commits (`4c8e2db` y `b1140c3`, ambos generados por ChatGPT Sites). **No hay remoto configurado**: no existe dónde hacer push.
- Git no tiene nombre ni correo configurados en esta PC. Los commits de los hitos se firman con el correo del dueño, sin modificar la configuración global.
- `core.autocrlf=true`: se agregó `.gitattributes` para que la línea base se compare byte a byte.
- Node v24.20.0 (el README pide 22.12 o posterior). `node_modules` presente y coherente con el lockfile, por eso no se ejecutó `npm ci`.

## 2. Contraste con la sección 2 del prompt maestro

Todo lo descrito se confirmó en el código, con estas precisiones:

| Afirmación | Resultado |
| --- | --- |
| `App.jsx` 65 KB en 71 líneas, con pantallas, contexto, router y funciones de datos con dos ramas | Confirmado (65.036 bytes, 71 líneas) |
| `estilos.css` 47 KB en 7 líneas | Confirmado (47.128 bytes) |
| `datos.js`, `supabase.js`, `main.jsx`, `entrada-servidor.jsx`, scripts y SQL | Confirmado |
| Prerender de 39 páginas con origen fijo `chatgpt.site` | Confirmado: 11 rutas fijas, 8 categorías y 20 fichas, más `404.html`, `sitemap.xml` y `robots.txt` |
| `.openai/hosting.json` con «acceso privado» | **Difiere**: el archivo solo tiene `project_id` y el directorio `dist`. La privacidad, si existe, se configura en ChatGPT Sites, no en el repositorio |
| Problemas (a) a (i) | Todos confirmados: textos inventados en `Detalle`, fotos de Unsplash en `guardarNegocio`, valoraciones y horarios de muestra, avatares de Pravatar, `/administracion` en el pie y acceso libre en modo demo, slug con `Date.now().toString(36)`, consulta que exige sesión |

Detalle adicional: el pie muestra el año con `new Date().getFullYear()`, que cambia cada año; la línea base lo normaliza.

## 3. Comandos y resultados

| Comando | Resultado |
| --- | --- |
| `npm test` (antes del hito) | 5 de 5 pruebas pasan |
| `npm run build` | Correcto: 1 JS (281 KB, 84 KB gzip), 1 CSS (47 KB), 39 páginas + 404 |
| `node scripts/linea-base.mjs --guardar` | 42 archivos en `tests/linea-base/` |
| Segundo `npm run build` + comparación | El build es reproducible y coincide con la línea base |
| `npm test` (después) | 7 de 7 pruebas pasan (5 originales + 2 de línea base) |

## 4. Línea base guardada

- `tests/linea-base/`: HTML normalizado de las 40 rutas (incluida 404), `sitemap.xml` y `robots.txt`. La normalización solo quita los hashes de los assets, el año del pie y el origen público.
- `tests/linea-base.test.mjs`: compara el build con la línea base. Se usará para demostrar que la modularización del hito 1 no cambia lo visible en modo demostración (con `DIRECTORIO_BUILD_DEMO` apuntando al build de demo).

## 5. Riesgos encontrados

1. **Sin remoto ni respaldo del repositorio.** Todo el código vive en esta PC. Recomiendo, cuando lo decidas, un repositorio privado (requiere tu aprobación para hacer push).
2. **Precisiones incorporadas al diseño** (aprobadas el 21/10): reanudación real de importaciones, respaldo completo de D1 y KV, seguridad de Browser Rendering y medición real del CPU. Ya figuran en las secciones correspondientes del prompt maestro.
3. **Browser Rendering:** la documentación oficial ofrece listas permitidas por expresión regular y devuelve la cadena de redirecciones, pero no documenta protección contra destinos internos. Queda desactivado en línea hasta su verificación (sección 15).
4. **CPU de 10 ms:** `wrangler dev` no mide ni aplica el límite. Se medirá en Node con cargas del piloto (desde el hito 1) y en línea con Workers Logs (hito 3).
5. **Cuenta de Cloudflare todavía no definida.** No hace falta hasta el hito 3; el desarrollo de los hitos 1 y 2 es local.
6. **Publicación existente en ChatGPT Sites:** no se toca sin tu aprobación.

## 6. Decisiones que necesito de vos

Ninguna para seguir con el hito 1, que es local y sin costo.
