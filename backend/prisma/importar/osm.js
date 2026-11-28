// Convierte lo que devuelve OpenStreetMap (Overpass) en lugares para importar: categoría, qué
// se descarta (sin nombre, cerrado...) y los datos de la ficha. Lo usa importar-osm.js.

// Lo que se le pide a Overpass: la caja va de San Clemente a Costa Esmeralda.
export const CAJA = '-37.08,-56.95,-36.28,-56.6';
export const CONSULTA = `[out:json][timeout:120];(
nwr["amenity"~"^(restaurant|cafe|bar|pub|fast_food|ice_cream|nightclub|biergarten)$"](${CAJA});
nwr["shop"~"^(bakery|pastry|ice_cream|confectionery)$"](${CAJA});
);out center tags;`;

const sinTildes = (t) => t.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

// Nombres que en OSM describen el rubro y no son el nombre del local.
const GENERICOS = /^(pizzas?|pizzeria|comida rapida|restaurante?s?|resto|cafe|cafeteria|bar|heladeria|helados|panaderia|parrilla|rotiseria|kiosco|confiteria|cerveceria|buffet|comedor|sin nombre)$/;

const categoriaDe = (tags) => {
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
const motivoDescarte = (el) => {
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

// Un elemento de Overpass como lugar para importar (ver cargar.js): id, nombre, coordenadas,
// categoría (o por qué se descarta) y los datos de la ficha.
export const lugarDe = (el, fecha) => {
  const t = el.tags || {};
  const osmId = `${el.type}/${el.id}`;
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  const calle = primero(t['addr:street']);
  const direccion = calle ? `${calle}${t['addr:housenumber'] ? ` ${t['addr:housenumber']}` : ''}` : '';
  const motivo = motivoDescarte(el);
  return {
    // Con el espacio final: así node/12 no coincide con node/123.
    idFuente: `OpenStreetMap ${osmId} `,
    nombre: (t.name || '').trim(),
    lat,
    lon,
    motivo,
    categoria: motivo ? null : categoriaDe(t),
    ficha: {
      direccion,
      telefono: primero(t.phone, t['contact:phone'], t.mobile, t['contact:mobile']).split(';')[0].trim(),
      web: conHttps(primero(t.website, t['contact:website'])),
      instagram: red(primero(t['contact:instagram'], t.instagram), 'instagram'),
      facebook: red(primero(t['contact:facebook'], t.facebook), 'facebook'),
      prestaciones: PRESTACIONES(t),
      referenciaVerificacion: [
        `OpenStreetMap ${osmId} (https://www.openstreetmap.org/${osmId}), importado el ${fecha}.`,
        'Datos © colaboradores de OpenStreetMap (ODbL). Sin verificar: falta confirmar que sigue abierto, teléfono, horarios y foto.',
        t.opening_hours ? `Horario en OSM: ${t.opening_hours}.` : '',
      ].filter(Boolean).join(' '),
    },
  };
};
