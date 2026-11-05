# Decisión vigente: OCR en navegador; PDF postergado; sin WSL

La actualización expresa del usuario del 22/10/2026 reemplaza la propuesta siguiente. **No se autoriza instalar WSL 2, Linux, virtualización ni reiniciar Windows. No son requisitos de esta demo.** OCR se implementó con Tesseract.js y recursos propios en Workers del navegador. PDF y ejecución de JavaScript externo siguen deshabilitados. [Implementación, evidencia y límites actuales](informes/estado-ocr-2026-10-22.md).

El siguiente texto queda únicamente como antecedente histórico, no como instrucción de instalación vigente. Su existencia no autoriza ejecutarlo.

---

# Propuesta de aislamiento local pendiente de autorización

Fecha: 22/10/2026. Es un plan para revisar; no se instaló ni se habilitó este entorno.

## Decisión concreta

Preparar WSL 2 con una distribución Linux dedicada a este motor, denominada `CostaALaCartaMotor`, y lectores locales de PDF/imágenes/OCR. Evaluar Bubblewrap y límites por proceso dentro de esa distribución. Integrarlos detrás de `DocumentReader`, manteniendo deshabilitados PDF/OCR/JavaScript hasta probar el límite y completar la auditoría 1.

WSL por sí solo no es la caja de seguridad de cada tarea. Los procesos que interpretan archivos necesitan además usuario restringido, espacio temporal propio, discos ajenos inaccesibles, límites y red denegada por defecto. Esta propuesta no garantiza esos controles antes de probarlos.

## Qué requiere autorización

Habilitar/instalar el componente de Windows WSL 2, descargar una distribución y dependencias desde fuentes oficiales, y crear su almacenamiento dedicado dentro de `.local/aislamiento`. Puede necesitar elevación de administrador y reiniciar la PC. **El reinicio se coordina con el dueño; no es automático.** No se contratarán servicios ni se activará facturación. Las descargas consumen conexión y espacio local; se informará su tamaño real antes de ejecutarlas.

La documentación de Microsoft indica que la instalación puede habilitar características de Windows y requiere reinicio: [instalación de WSL](https://learn.microsoft.com/es-es/windows/wsl/install). Se verificará compatibilidad y espacio disponible antes de modificar el sistema.

## Límites de la preparación

- Usar únicamente la distribución dedicada, sin cambiar la predeterminada, detener otras distribuciones ni modificar la configuración global `.wslconfig`.
- Deshabilitar montaje automático de discos Windows e interoperabilidad Windows en el `wsl.conf` de esa distribución. Microsoft diferencia explícitamente la configuración por distribución y la global: [configuración avanzada](https://learn.microsoft.com/es-es/windows/wsl/wsl-config).
- No copiar credenciales, el archivo protegido del dispositivo, sesiones, carpetas personales ni el catálogo completo al intérprete. Transferir solo el archivo autorizado y datos mínimos mediante un canal acotado.
- Para documentos y OCR: sin red; entradas de solo lectura, salida JSON validada, temporales por tarea y eliminación controlada de esos temporales. PDF máximo 10 MB/20 páginas; imagen máximo 10 MB/20 megapíxeles. Límites de memoria/tiempo/procesos comprobados antes de habilitar lectura.
- Para JavaScript: mantenerlo apagado hasta demostrar control de cada conexión y subrecurso, perfil efímero y sandbox de Chromium. La API y el token del motor quedan fuera del proceso. Usar un mediador de red basado en SafeFetch; un bloqueo de URL por texto no alcanza.
- Ningún acceso a servicios online del proyecto ni cambios al sitio publicado.

## Pruebas de aceptación

Un proceso adversario debe fallar al leer un archivo centinela fuera de la tarea, acceder a discos Windows, obtener credenciales o conectarse directamente a loopback, LAN, metadata e Internet. También debe probarse agotamiento de memoria, tiempo, procesos, rutas maliciosas y enlaces simbólicos. Luego: PDF textual real autorizado, escaneo/OCR real autorizado y navegación JS con redirecciones, iframes, workers y subrecursos hostiles controlados. Guardar los resultados; no habilitar por la sola instalación de WSL.

Las observaciones resultantes usarán el contrato y la revisión editorial actuales. Si una página o una fila no es legible, queda pendiente con su evidencia; no se inventan platos ni precios.

## Recuperación

Si la comprobación falla, conservar deshabilitada la capacidad, detener exclusivamente la distribución dedicada y mantener el catálogo y las copias actuales. La eliminación de esa distribución o la desinstalación de componentes de Windows requiere una decisión posterior y copia de sus datos; no se ejecutará como limpieza automática. Los archivos actuales de Costa a la carta no dependen de esta instalación para abrir fichas o guardar borradores.
