// JSON con las claves ordenadas. Postgres guarda los Json reordenando las claves, así que
// para saber si dos objetos tienen los mismos datos no alcanza con JSON.stringify.
const jsonOrdenado = (valor) => JSON.stringify(valor, (clave, v) =>
  v && typeof v === 'object' && !Array.isArray(v)
    ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b)))
    : v);

export const mismosDatos = (a, b) => jsonOrdenado(a) === jsonOrdenado(b);
