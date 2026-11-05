import {readFile} from 'node:fs/promises';
// Preparación neutral: solo muestra el alcance. No inicia servicios ni aprueba la ingesta.
const guide=new URL('../docs/auditorias/extraccion-1-pendiente.md',import.meta.url);
process.stdout.write(await readFile(guide,'utf8'));
