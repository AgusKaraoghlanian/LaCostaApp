# Base independiente para el nuevo proyecto

Esta carpeta contiene una copia del estado actual de Costa a la carta realizada el 22 de octubre de 2026. El proyecto original continúa en la carpeta hermana `costa-a-la-carta`.

Se copiaron el código, las pruebas, los archivos de dependencias y la documentación, incluidos los cambios locales presentes al copiar. Los documentos de la carpeta original se conservaron como referencias en `docs/referencia/documentos-carpeta-original/`.

No se copiaron el historial de Git, la identidad de publicación de Sites, las credenciales, las variables de entorno privadas, las dependencias instaladas ni los archivos generados de publicación. Esta carpeta no está vinculada al sitio publicado ni a un proyecto de Supabase.

El código conserva el funcionamiento y las limitaciones de la base copiada. Crear esta carpeta no incorpora un motor de importación ni aplica automáticamente los planes o prompts conservados como referencia.

## Cómo continuar

Abrir esta carpeta como proyecto de trabajo y proporcionar el nuevo prompt. Indicar qué partes del diseño y del funcionamiento deben conservarse, y qué objetivo debe tener la nueva versión. El nuevo prompt todavía no fue definido ni ejecutado.

## Vista previa local, cuando se necesite

```powershell
npm.cmd ci
npm.cmd run dev -- --port 5174
```

El puerto 5174 permite usar un origen de navegador distinto del puerto 5173 empleado por el proyecto original. Así los datos locales de demostración de ambos proyectos quedan separados si se mantienen esos puertos.

La instalación y el inicio de la vista previa no se ejecutaron al crear esta copia. El README y los documentos anteriores describen la base original; para este nuevo proyecto, esta guía aclara su estado inicial.
