import {
  FRASES_SIN_PESO,
  OTROS_NOMBRES_DE_LOCALIDADES,
  PALABRAS_DE_CATEGORIAS,
  PALABRAS_SIN_PESO,
} from '../config/costa.js';
import { claveDeTexto } from './texto.js';

// Lo que escribió la persona, separado en lo que se entiende:
// - localidadIds: las localidades que nombró ("san clemente", "mar de ajo"...);
// - categoriaIds y palabrasDeCategoria: las categorías a las que lleva alguna palabra ("pizza",
//   "birra") y esas palabras (un lugar de otra categoría que dice "pizza" también sirve);
// - palabras: el resto (por ejemplo el nombre del local). Tienen que estar todas, en cualquier orden.
// categorias y localidades son las de la base ({ id, clave, nombre } y { id, nombre }).
// Devuelve null si no queda nada para buscar.
export const interpretarBusqueda = (texto, { categorias, localidades }) => {
  // Con espacios en las puntas para encontrar frases enteras (" mar de ajo ").
  let resto = ` ${claveDeTexto(texto).replace(/[^a-z0-9]+/g, ' ')} `;

  for (const frase of FRASES_SIN_PESO) {
    resto = resto.replaceAll(` ${frase} `, ' ');
  }

  // Las más largas primero: "san bernardo del tuyu" antes que "san bernardo".
  const formasDeLocalidades = localidades
    .flatMap((localidad) =>
      [claveDeTexto(localidad.nombre), ...(OTROS_NOMBRES_DE_LOCALIDADES[localidad.nombre] ?? [])].map((forma) => ({
        id: localidad.id,
        forma,
      })),
    )
    .sort((a, b) => b.forma.length - a.forma.length);
  const localidadIds = new Set();
  for (const { id, forma } of formasDeLocalidades) {
    if (resto.includes(` ${forma} `)) {
      localidadIds.add(id);
      resto = resto.replaceAll(` ${forma} `, ' ');
    }
  }

  const categoriaIds = new Set();
  const palabrasDeCategoria = [];
  const palabras = [];
  for (const palabra of resto.split(' ')) {
    if (!palabra || PALABRAS_SIN_PESO.includes(palabra)) continue;
    // Por su lista de palabras o por cualquier palabra de su nombre ("bares y cervecerias").
    const deEstaPalabra = categorias.filter(
      (categoria) =>
        PALABRAS_DE_CATEGORIAS[categoria.clave]?.includes(palabra) ||
        claveDeTexto(categoria.nombre).split(' ').includes(palabra),
    );
    if (deEstaPalabra.length) {
      deEstaPalabra.forEach((categoria) => categoriaIds.add(categoria.id));
      palabrasDeCategoria.push(palabra);
    } else {
      palabras.push(palabra);
    }
  }

  if (!palabras.length && !categoriaIds.size && !localidadIds.size) return null;
  return {
    palabras,
    categoriaIds: [...categoriaIds],
    palabrasDeCategoria,
    localidadIds: [...localidadIds],
  };
};
