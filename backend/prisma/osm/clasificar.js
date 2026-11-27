// Convierte lo que devuelve OpenStreetMap (Overpass) en fichas de la guía: a qué localidad y
// categoría va cada lugar, y qué se descarta (sin nombre, cerrado, fuera del Partido...).
// Funciones puras: las usa importar-osm.js.

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

// Lo que se le pide a Overpass: la caja va de San Clemente a Costa Esmeralda.
export const CAJA = '-37.08,-56.95,-36.28,-56.6';
export const CONSULTA = `[out:json][timeout:120];(
nwr["amenity"~"^(restaurant|cafe|bar|pub|fast_food|ice_cream|nightclub|biergarten)$"](${CAJA});
nwr["shop"~"^(bakery|pastry|ice_cream|confectionery)$"](${CAJA});
);out center tags;`;

const km = (lat1, lon1, lat2, lon2) => {
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

const sinTildes = (t) => t.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

// Nombres que en OSM describen el rubro y no son el nombre del local.
const GENERICOS = /^(pizzas?|pizzeria|comida rapida|restaurante?s?|resto|cafe|cafeteria|bar|heladeria|helados|panaderia|parrilla|rotiseria|kiosco|confiteria|cerveceria|buffet|comedor|sin nombre)$/;

export const categoriaDe = (tags) => {
  const tipo = tags.amenity || tags.shop;
  const cocina = sinTildes(tags.cuisine || '');
  const nombre = sinTildes(tags.name || '');
  if (['bakery', 'pastry', 'confectionery'].includes(tipo)) return 'panaderias';
  if (tipo === 'ice_cream' || /helad/.test(nombre) || /ice_cream/.test(cocina)) return 'heladerias';
  if (['bar', 'pub', 'biergarten', 'nightclub'].includes(tipo)) return 'bares';
  if (tipo === 'cafe') return /helad/.test(nombre) ? 'heladerias' : 'cafeterias';
  // restaurant y fast_food: por la cocina o el nombre.
  if (/pizz/.test(cocina) || /pizz/.test(nombre)) return 'pizzerias';
  if (/seafood|fish/.test(cocina) || /marisc|pescad|cantina del puerto/.test(nombre)) return 'mariscos';
  if (/steak|grill|barbecue|asado/.test(cocina) || /parrill|asador|asado/.test(nombre)) return 'parrillas';
  if (/cervec|brew/.test(nombre)) return 'bares';
  return 'restaurantes';
};

// Por qué no se carga (null = se carga).
export const motivoDescarte = (el) => {
  const tags = el.tags || {};
  if (!tags.name) return 'sin nombre';
  if (GENERICOS.test(sinTildes(tags.name).trim())) return 'nombre genérico';
  if (Object.keys(tags).some((k) => /^(disused|was|abandoned|demolished):/.test(k))) return 'cerrado según OSM';
  if (tags.opening_hours === 'closed') return 'cerrado según OSM';
  return null;
};

const primero = (...valores) => valores.find((v) => v && String(v).trim()) || '';

const conHttps = (v) => (!v ? '' : /^https?:\/\//i.test(v) ? v : `https://${v.replace(/^\/+/, '')}`);

const red = (valor, host) => {
  if (!valor) return '';
  if (/^https?:\/\//i.test(valor) || valor.includes(`${host}.com`)) return conHttps(valor);
  return `https://${host}.com/${valor.replace(/^@/, '')}`;
};

const PRESTACIONES = (tags) => {
  const lista = [];
  if (tags.outdoor_seating === 'yes') lista.push('Mesas al aire libre');
  if (['yes', 'only'].includes(tags.takeaway)) lista.push('Para llevar');
  if (tags.wheelchair === 'yes') lista.push('Accesible');
  if (/vegetarian|vegan/.test(tags.cuisine || '') || ['yes', 'only'].includes(tags['diet:vegetarian'])) lista.push('Opciones vegetarianas');
  if (tags.reservation === 'yes' || tags.reservation === 'recommended') lista.push('Reservas');
  return lista;
};

// Lo que va a la ficha del borrador (sin localidadId ni categoriaId: los pone el script).
export const fichaDe = (el, { localidad, categoria, fecha }) => {
  const t = el.tags;
  const osmId = `${el.type}/${el.id}`;
  const calle = primero(t['addr:street']);
  const direccion = calle ? `${calle}${t['addr:housenumber'] ? ` ${t['addr:housenumber']}` : ''}` : '';
  const notas = [
    `OpenStreetMap ${osmId} (https://www.openstreetmap.org/${osmId}), importado el ${fecha}.`,
    'Datos © colaboradores de OpenStreetMap (ODbL). Sin verificar: falta confirmar que sigue abierto, teléfono, horarios y foto.',
    t.opening_hours ? `Horario en OSM: ${t.opening_hours}.` : '',
    `Ubicación: ${el.lat ?? el.center?.lat}, ${el.lon ?? el.center?.lon}.`,
  ].filter(Boolean).join(' ');
  return {
    nombre: t.name.trim().slice(0, 150),
    estadoComercial: 'SIN_CONFIRMAR',
    direccion: direccion.slice(0, 250),
    telefono: primero(t.phone, t['contact:phone'], t.mobile, t['contact:mobile']).split(';')[0].trim().slice(0, 80),
    web: conHttps(primero(t.website, t['contact:website'])),
    instagram: red(primero(t['contact:instagram'], t.instagram), 'instagram'),
    facebook: red(primero(t['contact:facebook'], t.facebook), 'facebook'),
    prestaciones: PRESTACIONES(t),
    referenciaVerificacion: notas,
    // Para el listado del script, no van a la ficha.
    _osmId: osmId,
    _localidad: localidad,
    _categoria: categoria,
  };
};

export const coordenadas = (el) => [el.lat ?? el.center?.lat, el.lon ?? el.center?.lon];
