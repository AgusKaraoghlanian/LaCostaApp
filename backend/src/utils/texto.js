// "Café del Muelle" → "cafe-del-muelle": sin tildes, en minúsculas y con guiones. Se usa para
// las URLs (/lugar/cafe-del-muelle, /categoria/parrillas).
export const armarSlug = (texto) =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100);

// "  Café   del Muelle " → "cafe del muelle": con esto se busca sin importar tildes,
// mayúsculas ni espacios de más.
export const claveDeTexto = (texto) =>
  texto
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
