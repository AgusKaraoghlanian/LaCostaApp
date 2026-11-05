# Copias y restauración local

## Uso desde la pantalla

1. Abrí Administración → Configuración → Copias de seguridad.
2. Iniciá o reconectá el motor. Pulsá «Preparar copia ahora» y esperá «Copia guardada». Una solicitud en espera todavía no es una copia terminada.
3. Desde el lanzador, «Abrir copias» muestra los archivos de `.local/backups`. El paquete terminado se llama `<identificador>.json`; los archivos `.part.json` y `.tmp` son avances, no copias terminadas.
4. «Verificar restauración» permite elegir un paquete y recuperarlo en una base nueva de `.local/restauraciones`. El informe queda junto a esa base. La base que usa la aplicación no se reemplaza.

La preferencia diaria quedó activada. Solo funciona cuando la API y el motor locales están ejecutándose; no hay servicio remoto trabajando con la computadora apagada. Falta observar un ciclo completo de 24 horas.

## Qué incluye y qué falta

Incluye catálogo, cartas/versiones/importes, fuentes, observaciones, selecciones, revisiones, auditoría, artefactos HTML y lecturas OCR (texto original/corregido, imagen/hash/línea y procedencia). Esquema 5; se siguen aceptando copias del esquema 4. Las fotos temporales de reconocimiento y sus solicitudes no se incluyen; no son medios publicados. Excluye sesiones, dispositivos, códigos de vinculación y tokens. La restauración verifica integridad por hash, relaciones y HTML. Para volver a operar un catálogo recuperado hará falta una vinculación nueva.

Límite de esta versión: 5.000 filas y 20 MB de datos. No copia objetos multimedia KV: si ya existieran variantes de medios, el sistema rechaza generar una copia incompleta. Falta retención automática, purga, recuperación completa de medios, exportación de mayor escala y reemplazo guiado de la base activa. No renombrar archivos SQLite de Wrangler manualmente para intentar restaurar.

Una copia local en el mismo disco no es un respaldo ante pérdida de esa PC. No se conectó almacenamiento externo ni se enviaron datos a otra cuenta. Los paquetes de contenido comercial no están cifrados; mantenerlos en una ubicación privada.

## Prueba realizada

Paquete: `.local/backups/b5c2c351-5b22-4fc3-a0a9-475fe4c7bf1e.json`.

Restauración real del 22/10/2026: 96 filas, una ficha, cero fichas con publicación activa, una revisión en curso recuperada, cero sesiones y cero dispositivos. Se conserva un artefacto HTML histórico de la publicación retirada, sin reactivarlo. Verificación de relaciones y hashes correcta. La base activa se conservó.

Además existe una prueba automatizada aislada con carta, variantes/precios y publicación que compara exactamente el HTML e importe recuperados.
