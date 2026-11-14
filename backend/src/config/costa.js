// Reglas fijas de la guía. Si algo de esto cambia, se cambia acá y vale para todo el backend.

// Negocios por página en el listado público y en el del admin.
export const NEGOCIOS_POR_PAGINA = 24;

// Productos que puede tener la carta de un negocio. Una carta más grande se divide.
export const PRODUCTOS_MAXIMOS = 300;

// Franjas de horario por negocio (semanales y especiales, cada una).
export const HORARIOS_MAXIMOS = 50;

// Prestaciones por negocio ("Mesas al aire libre", "Acepta mascotas"...).
export const PRESTACIONES_MAXIMAS = 30;

// Todas las horas de la guía son de Argentina.
export const ZONA_HORARIA = 'America/Argentina/Buenos_Aires';

// Búsqueda del sitio (utils/busqueda.js). Todo va sin tildes y en minúsculas, como se compara.

// Las palabras que llevan a cada categoría (por su clave), en singular, en plural y como se
// dicen acá. Buscar "pizza" o "birra" trae también todas las pizzerías o los bares. Una
// categoría nueva sin lista se encuentra igual por su nombre.
export const PALABRAS_DE_CATEGORIAS = {
  restaurantes: [
    'restaurante', 'restaurantes', 'restaurant', 'restaurants', 'resto', 'restos', 'bodegon', 'bodegones',
    'cantina', 'cantinas', 'minuta', 'minutas', 'milanesa', 'milanesas', 'pasta', 'pastas',
  ],
  cafeterias: [
    'cafe', 'cafes', 'cafecito', 'cafeteria', 'cafeterias', 'desayuno', 'desayunos', 'desayunar', 'merienda',
    'meriendas', 'merendar', 'brunch', 'tostado', 'tostados', 'licuado', 'licuados', 'capuchino', 'cortado',
  ],
  parrillas: [
    'parrilla', 'parrillas', 'parrillada', 'parrilladas', 'asado', 'asados', 'asador', 'carne', 'carnes',
    'achura', 'achuras', 'chori', 'choripan', 'choripanes', 'vacio', 'bife', 'bifes', 'provoleta',
  ],
  pizzerias: [
    'pizza', 'pizzas', 'pizzeria', 'pizzerias', 'muzza', 'muzzarella', 'mozzarella', 'fugazzeta', 'faina',
    'calzone', 'calzones',
  ],
  bares: [
    'bar', 'bares', 'cerveza', 'cervezas', 'cerveceria', 'cervecerias', 'birra', 'birras', 'chopp', 'pinta',
    'pintas', 'trago', 'tragos', 'coctel', 'cocteles', 'vino', 'vinos', 'vineria', 'picada', 'picadas', 'pub',
    'pubs', 'after',
  ],
  heladerias: [
    'helado', 'helados', 'heladeria', 'heladerias', 'cucurucho', 'cucuruchos', 'gelato', 'gelateria',
  ],
  panaderias: [
    'pan', 'panes', 'panaderia', 'panaderias', 'medialuna', 'medialunas', 'factura', 'facturas', 'criollo',
    'criollos', 'bizcocho', 'bizcochos', 'torta', 'tortas', 'confiteria', 'confiterias', 'pasteleria',
    'pastelerias', 'budin', 'budines',
  ],
  mariscos: [
    'pescado', 'pescados', 'pescaderia', 'pescaderias', 'marisco', 'mariscos', 'mariscada', 'rabas', 'paella',
    'paellas', 'cornalitos', 'langostino', 'langostinos', 'calamar', 'calamares', 'pulpo', 'mejillones',
  ],
};

// Otras formas de nombrar una localidad (además de su nombre completo, que siempre vale),
// por el nombre exacto de la localidad. "pizza en san clemente" busca en San Clemente del Tuyú.
export const OTROS_NOMBRES_DE_LOCALIDADES = {
  'San Clemente del Tuyú': ['san clemente', 'clemente'],
  'Las Toninas': ['toninas'],
  'Santa Teresita': ['teresita'],
  'La Lucila del Mar': ['lucila del mar', 'la lucila', 'lucila'],
  'San Bernardo': ['san bernardo del tuyu'],
  'Nueva Atlantis': ['atlantis'],
  'Punta Médanos': ['medanos'],
  'Costa Esmeralda': ['esmeralda'],
};

// Frases y palabras que no ayudan a encontrar nada ("donde comer pizza en la costa" busca
// solo "pizza"). "la costa" es todo el partido: no filtra ninguna localidad.
export const FRASES_SIN_PESO = ['partido de la costa', 'la costa'];
export const PALABRAS_SIN_PESO = [
  'de', 'del', 'la', 'las', 'el', 'los', 'lo', 'en', 'y', 'o', 'a', 'al', 'con', 'para', 'por', 'un', 'una',
  'unos', 'unas', 'que', 'donde', 'cerca', 'lugar', 'lugares', 'quiero', 'busco', 'comer', 'comida', 'comidas',
  'algo', 'rico', 'rica', 'ricos', 'ricas', 'buen', 'buena', 'buenos', 'buenas', 'almuerzo', 'almorzar', 'cena',
  'cenar', 'hay', 'me', 'mi',
];
