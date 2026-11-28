// Convierte los lugares de Overture Maps (overture/lugares-*.json, ver overture/bajar.py) en
// lugares para importar (ver cargar.js). La mayoría vienen de las páginas de Facebook de los
// locales (Meta), con teléfono y link a Facebook. Licencia CDLA-Permissive-2.0 (Meta, Microsoft)
// y Apache 2.0 (Foursquare): se pueden guardar y mostrar.
import { claveDeTexto } from '../../src/utils/texto.js';
import { CENTROS } from './geografia.js';

// Categoría de Overture → clave de la guía. Las que no están (chocolaterías, kioscos, bodegas,
// rotiserías de fiambre...) no se cargan.
const CATEGORIAS = {
  panaderias: ['bakery', 'cupcake_shop', 'donut_shop', 'bagel_shop', 'patisserie', 'pastry_shop'],
  heladerias: ['ice_cream_shop', 'gelato_shop', 'shaved_ice_shop', 'frozen_yoghurt_shop'],
  cafeterias: ['coffee_shop', 'cafe', 'tea_room', 'breakfast_and_brunch_restaurant', 'pancake_house', 'dessert_shop', 'smoothie_juice_bar', 'internet_cafe'],
  bares: [
    'bar', 'pub', 'beer_bar', 'gastropub', 'brewery', 'beer_garden', 'tapas_bar', 'wine_bar', 'cocktail_bar', 'lounge',
    'hotel_bar', 'sports_bar', 'dance_club', 'karaoke_venue', 'night_club',
  ],
  pizzerias: ['pizza_restaurant'],
  mariscos: ['seafood_restaurant', 'fish_and_chips_restaurant'],
  parrillas: ['barbecue_restaurant', 'steakhouse', 'bar_and_grill_restaurant'],
};
const CLAVE_DE = Object.fromEntries(Object.entries(CATEGORIAS).flatMap(([clave, lista]) => lista.map((c) => [c, clave])));

const esRestaurante = (categoria) => /restaurant|food_truck|sandwich|diner|buffet|eatery|food_court|bistro/.test(categoria || '');

// El nombre manda cuando es claro ("Pizzería X" en "restaurant", "Heladería Y" en "cafe").
const porNombre = (nombre) => {
  if (/pizz/.test(nombre)) return 'pizzerias';
  if (/helad/.test(nombre)) return 'heladerias';
  if (/parrill|asador/.test(nombre)) return 'parrillas';
  if (/marisc|pescad/.test(nombre)) return 'mariscos';
  if (/panader|confiter/.test(nombre)) return 'panaderias';
  if (/cervec/.test(nombre)) return 'bares';
  return null;
};

const categoriaDe = ({ categoria, nombre }) => {
  const clave = CLAVE_DE[categoria] || (esRestaurante(categoria) ? 'restaurantes' : null);
  if (!clave) return null;
  const segunNombre = porNombre(claveDeTexto(nombre));
  // Un restaurante, café o bar con nombre claro va a esa categoría; una panadería o heladería
  // ya está bien ubicada.
  return segunNombre && ['restaurantes', 'cafeterias', 'bares'].includes(clave) ? segunNombre : clave;
};

const LOCALIDADES = new Set(CENTROS.map(([nombre]) => claveDeTexto(nombre)));
const GENERICOS = /^(pizzas?|pizzeria|comidas? rapidas?|restaurante?s?|resto|cafe|cafeteria|bar|heladeria|helados|panaderia|parrilla|rotiseria|kiosco|confiteria|cerveceria|buffet|comedor)$/;

export const CONFIANZA_MINIMA = 0.5;

const motivoDescarte = (l, confianzaMinima) => {
  if (!l.nombre?.trim()) return 'sin nombre';
  const nombre = claveDeTexto(l.nombre);
  if (GENERICOS.test(nombre)) return 'nombre genérico';
  // Páginas del balneario o del pueblo ("Costa Esmeralda", "San Bernardo Turismo").
  if (LOCALIDADES.has(nombre) || [...LOCALIDADES].some((loc) => nombre.startsWith(`${loc} `) && /turismo|ciudad|playa/.test(nombre))) return 'página de la localidad';
  if (l.estado && l.estado !== 'open') return 'cerrado según Overture';
  if (!categoriaDe(l)) return 'no es gastronomía (chocolatería, kiosco, bodega...)';
  if (l.confianza < confianzaMinima) return `poca confianza (< ${confianzaMinima})`;
  return null;
};

const hostDe = (url) => {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
};

export const lugarDe = (l, { version, fecha, confianzaMinima = CONFIANZA_MINIMA }) => {
  const enlaces = [...(l.webs || []), ...(l.redes || [])];
  const de = (...hosts) => enlaces.find((u) => hosts.includes(hostDe(u))) || '';
  const web = (l.webs || []).find((u) => !['facebook.com', 'm.facebook.com', 'instagram.com', 'wa.me'].includes(hostDe(u))) || '';
  const motivo = motivoDescarte(l, confianzaMinima);
  return {
    idFuente: `Overture ${l.id} `,
    nombre: (l.nombre || '').trim(),
    lat: l.lat,
    lon: l.lon,
    motivo,
    categoria: motivo ? null : categoriaDe(l),
    ficha: {
      direccion: l.direccion || '',
      telefono: (l.telefonos || [])[0] || '',
      web,
      instagram: de('instagram.com'),
      facebook: de('facebook.com', 'm.facebook.com'),
      prestaciones: [],
      referenciaVerificacion: [
        `Overture ${l.id} (Overture Maps ${version}, fuente: ${(l.fuentes || []).join(', ') || 'Overture'}, confianza ${l.confianza}), importado el ${fecha}.`,
        'Datos abiertos de Overture Maps Foundation (CDLA-Permissive-2.0). Sin verificar: falta confirmar que sigue abierto, horarios y foto.',
        l.categoria ? `Rubro en Overture: ${l.categoria}.` : '',
      ].filter(Boolean).join(' '),
    },
  };
};
