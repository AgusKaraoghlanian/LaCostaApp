# Revisión independiente de las correcciones de extracción — pendiente

La primera auditoría independiente terminó con NO APTO PARA HABILITAR. Se implementaron las correcciones y las pruebas de regresión documentadas en [la entrega de correcciones](D:/Incoming/Videos/Proyectos/Gastronomia/costa-a-la-carta-nuevo-proyecto/docs/auditorias/correcciones-extraccion-1.md). La importación general continúa bloqueada: faltan la revisión independiente de esas correcciones y la autorización expresa del usuario. Las pruebas existentes y esta entrega no sustituyen ese cierre. El estado no depende de herramientas, cuentas, suscripciones, cuotas ni otros proyectos.

La explicación anterior de la interfaz vinculaba incorrectamente el bloqueo con la disponibilidad de una herramienta externa. Además existía un script auxiliar que intentaba iniciarla: no era llamado por la aplicación, la API, el motor ni el lanzador. Se retiró esa integración. El script ahora solo muestra esta guía y no ejecuta un auditor ni aprueba la extracción.

## Cómo completar la revisión

1. Un revisor distinto de la implementación, en una sesión de revisión separada o una persona de seguridad, revisa exclusivamente esta carpeta. Puede utilizar las herramientas de lectura y pruebas locales que tenga disponibles; no se exige ningún producto ni cuenta. Usar [el encargo actualizado](../referencia/auditoria-extraccion-1.md). No modificar el código ni acceder a credenciales, bases activas u otros proyectos.
2. Inspeccionar el código vigente y ejecutar las verificaciones de abajo. Registrar fecha, archivos/líneas, huellas SHA-256 de los archivos revisados (esta carpeta no tiene Git), comandos, resultados y casos reproducibles. Distinguir pruebas con transportes simulados, pruebas con servidor local real y comprobaciones de navegador. Una comprobación que no pueda ejecutarse queda pendiente; no se presume aprobada.
3. Entregar un informe con hallazgos críticos/altos/medios/bajos y un dictamen explícito sobre habilitar fuentes HTML e imágenes seleccionadas para administradores. Corregir los hallazgos críticos/altos y repetir las verificaciones afectadas con el revisor. Resolver también cualquier otra condición que el dictamen identifique como necesaria para abrir la ingesta. Registrar el cierre y el alcance aprobado antes de modificar la restricción de dominios en servidor.

La preparación, la existencia de un archivo de informe o el éxito de las pruebas no desbloquean nada automáticamente. Esta corrección no completa la auditoría ni habilita más fuentes. No se requiere reabrir los demás hitos ni auditar otro proyecto.

## Verificaciones concretas necesarias

| Superficie | Qué debe verificar el revisor |
| --- | --- |
| URLs y SSRF | IPv4/IPv6 privadas, loopback, metadata y notaciones alternativas; todos los resultados DNS; fijación de IP y dirección efectiva; redirecciones y subdominios/dominios asociados. Documentar especialmente la cobertura real de DNS rebinding y redirects a red privada, sin confundir un transporte simulado con una conexión adversaria real. |
| Descarga y consumo | Límites durante streaming y descompresión, tiempo, cancelación, reintentos limitados y respuesta a peticiones del origen de reducir consultas (incluido Retry-After, pendiente en el estado previo). Pruebas controladas; no atacar webs ajenas. |
| HTML y datos externos | No ejecución de scripts, HTML externo sin inserción activa, JSON-LD/enlaces/evidencia como datos; resultados y errores escapados. |
| Fotos y OCR | Solicitud solo de imágenes descubiertas y permitidas; acceso privado, tamaño/MIME/firma/dimensiones, archivos dañados, cancelación y entregas tardías; temporales con vencimiento/borrado; OCR en Workers con recursos locales. No publicar fotografías por haberlas reconocido. |
| Trabajos y revisión | Autenticación, rol administrador, CSRF, lease/checkpoints y rechazo de resultados ajenos/tardíos; procedencia, revisión humana, protección de correcciones y publicación separada. |
| Límites de alcance | Fuentes de evaluación restringidas en servidor; PDF y ejecución de JavaScript externo apagados; OCR de navegador distinto de ejecutar scripts de sitios. Sin instalar WSL/Linux, crear servicios remotos ni desplegar. |

## Comandos y evidencia

Desde la raíz del proyecto, con las dependencias ya instaladas:

~~~powershell
node --test tests/network.test.ts tests/safe-fetch.test.ts tests/native-boundary.test.ts tests/extraction.test.ts tests/jobs.test.ts tests/api.test.ts tests/ocr.test.ts
npm.cmd test
npm.cmd run build
~~~

La prueba de servidor adversario requiere permiso de conexión de loopback. Para OCR real: inspeccionar y ejecutar el recorrido de reconocimiento, cancelación, revisión y recarga usando imágenes legítimas. El script existente de verificación gráfica escribe trabajos de prueba en la base a la que apunta: no usarlo contra el catálogo activo en una revisión de solo lectura; preparar un entorno local aislado. Si no existe ese entorno, registrar esa verificación como pendiente.

No se debe aprobar la apertura solo porque las pruebas unitarias pasen. Falta un informe independiente sobre el código vigente, evidencia adversaria de las fronteras de red/archivos y cierre verificado de los hallazgos. La precisión de una carta del piloto y la revisión editorial siguen siendo verificaciones propias del producto, no permisos para omitir esta revisión.

El acceso online a terceros continúa fuera de alcance: requerirá sus controles de identidad, privacidad y operación antes de una autorización de despliegue.
