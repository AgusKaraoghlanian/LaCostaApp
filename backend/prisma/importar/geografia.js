// En qué localidad cae un lugar según sus coordenadas. Lo usan los importadores
// (importar-osm.js, importar-overture.js).

// Centro de cada localidad (de los "place" de OpenStreetMap). Cada lugar va a la más cercana.
export const CENTROS = [
  ['San Clemente del Tuyú', -36.3561, -56.7194],
  ['Las Toninas', -36.4882, -56.7051],
  ['Costa Chica', -36.5083, -56.6980],
  ['Santa Teresita', -36.5431, -56.7044],
  ['Mar del Tuyú', -36.5813, -56.6875],
  ['Costa del Este', -36.6115, -56.6882],
  ['Aguas Verdes', -36.6371, -56.6849],
  ['La Lucila del Mar', -36.6600, -56.6839],
  ['Costa Azul', -36.6705, -56.6827],
  ['San Bernardo', -36.6866, -56.6841],
  ['Mar de Ajó', -36.7213, -56.6776],
  ['Nueva Atlantis', -36.7634, -56.6765],
  ['Punta Médanos', -36.8995, -56.6885],
  ['Costa Esmeralda', -37.0300, -56.8000],
];

// Más lejos que esto del centro más cercano no es de la Costa (General Lavalle, campo...).
const DISTANCIA_MAXIMA_KM = 6;

export const km = (lat1, lon1, lat2, lon2) => {
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(a));
};

export const localidadDe = (lat, lon) => {
  let mejor = null;
  for (const [nombre, la, lo] of CENTROS) {
    const d = km(lat, lon, la, lo);
    if (!mejor || d < mejor.d) mejor = { nombre, d };
  }
  return mejor.d <= DISTANCIA_MAXIMA_KM ? mejor.nombre : null;
};
