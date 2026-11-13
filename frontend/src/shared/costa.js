// Datos fijos del sitio (los mismos de la demo).

// Las prestaciones que ofrecen los filtros. Un negocio puede tener otras: se muestran en su ficha.
export const PRESTACIONES = [
  'Mesas al aire libre',
  'Opciones vegetarianas',
  'Acepta mascotas',
  'Accesible',
  'Para llevar',
  'Reservas',
]

// La foto de la portada y de "Nuestra Costa" (ilustrativa, de Unsplash).
export const FOTO_PORTADA =
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1800&q=85'

// Domingo es 0, como en el backend.
export const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export const ESTADOS_COMERCIALES = {
  SIN_CONFIRMAR: 'Actividad actual sin confirmar',
  ACTIVO: 'Activo, con evidencia revisada',
  TEMPORALMENTE_CERRADO: 'Cerrado temporalmente',
  CERRADO: 'Cierre confirmado',
}

export const CANALES = {
  SIN_ESPECIFICAR: 'No especificado',
  SALON: 'Salón',
  DELIVERY: 'Delivery',
  RETIRO: 'Retiro',
}

export const MONEDAS = ['ARS', 'USD', 'EUR', 'UYU', 'BRL']

// Una foto de Wikimedia Commons en un ancho cómodo para las tarjetas.
const commons = (archivo) => `https://commons.wikimedia.org/wiki/Special:FilePath/${archivo}?width=1100`

// La foto de cada localidad para las tarjetas de la portada, por nombre exacto de la localidad.
// Va detrás de una capa con los colores de la tarjeta (arriba → abajo), así se ve la foto pero
// la tarjeta sigue teniendo su color. posicion: qué parte de la foto queda a la vista; oscura:
// el texto va verde en vez de blanco. Las que no están acá se muestran con la ilustración.
// Son fotos reales de Wikimedia Commons: el crédito y la licencia de cada una se muestran en
// "Sobre La Costa" (las licencias CC piden nombrar al autor).
export const FOTOS_LOCALIDADES = {
  'San Clemente del Tuyú': {
    foto: commons('Faro_San_Antonio,_Punta_Rasa_extremo_norte_del_cabo_San_Antonio.jpg'),
    posicion: '50% 48%',
    arriba: '#eadfc9',
    abajo: '#dfc49f',
    oscura: true,
    lugar: 'Faro San Antonio (Punta Rasa)',
    autor: 'Gabrielsus',
    licencia: 'Dominio público',
    fuente: 'https://commons.wikimedia.org/wiki/File:Faro_San_Antonio,_Punta_Rasa_extremo_norte_del_cabo_San_Antonio.jpg',
  },
  'Las Toninas': {
    foto: commons('Laberinto_de_Las_Toninas.jpg'),
    posicion: '51% 54%',
    arriba: '#c2d4ca',
    abajo: '#759483',
    lugar: 'Laberinto de Las Toninas',
    autor: 'Hergallego',
    licencia: 'CC BY-SA 3.0',
    fuente: 'https://commons.wikimedia.org/wiki/File:Laberinto_de_Las_Toninas.jpg',
  },
  'Santa Teresita': {
    foto: commons('R%C3%A9plica_de_Carabela_de_Sta_Mar%C3%ADa_en_Santa_Teresita.jpg'),
    posicion: '51% 48%',
    arriba: '#edbd9c',
    abajo: '#bf774f',
    lugar: 'Réplica de la carabela Santa María',
    autor: 'EMMAJECHY',
    licencia: 'CC0',
    fuente: 'https://commons.wikimedia.org/wiki/File:R%C3%A9plica_de_Carabela_de_Sta_Mar%C3%ADa_en_Santa_Teresita.jpg',
  },
  'Mar del Tuyú': {
    foto: commons('Mtuyu6.jpg'),
    posicion: '55% 48%',
    arriba: '#d4ddd8',
    abajo: '#769388',
    lugar: 'Muelle de pesca',
    autor: 'Gabrielsus',
    licencia: 'CC BY-SA 4.0',
    fuente: 'https://commons.wikimedia.org/wiki/File:Mtuyu6.jpg',
  },
  'Costa del Este': {
    foto: commons('Bosque_en_Costa_del_Este(Costa_Atl%C3%A1ntica)..JPG'),
    posicion: '50% 50%',
    arriba: '#d4ddc9',
    abajo: '#68876b',
    lugar: 'Bosque de pinos',
    autor: 'JavierMas1994',
    licencia: 'CC BY-SA 4.0',
    fuente: 'https://commons.wikimedia.org/wiki/File:Bosque_en_Costa_del_Este(Costa_Atl%C3%A1ntica)..JPG',
  },
  'Aguas Verdes': {
    foto: commons('Aguas_Verdes,_Cruz_sobre_un_m%C3%A9dano.jpg'),
    posicion: '50% 40%',
    arriba: '#dfd9bc',
    abajo: '#a99071',
    lugar: 'Médano con cruz',
    autor: 'Hergallego',
    licencia: 'CC BY-SA 3.0',
    fuente: 'https://commons.wikimedia.org/wiki/File:Aguas_Verdes,_Cruz_sobre_un_m%C3%A9dano.jpg',
  },
  'La Lucila del Mar': {
    foto: commons('Muelle_de_La_Lucila_del_Mar,_Argentina.jpg'),
    posicion: '52% 50%',
    arriba: '#c8dad7',
    abajo: '#638f90',
    lugar: 'Muelle de La Lucila del Mar',
    autor: 'Ale2006',
    licencia: 'CC BY 2.5',
    fuente: 'https://commons.wikimedia.org/wiki/File:Muelle_de_La_Lucila_del_Mar,_Argentina.jpg',
  },
  'Costa Azul': {
    foto: commons('Costa_azul,_La_caldera.JPG'),
    posicion: '50% 50%',
    arriba: '#d6dbd5',
    abajo: '#667f82',
    lugar: 'Restos de la caldera del vapor Mar del Sur',
    autor: 'Hergallego',
    licencia: 'CC BY-SA 3.0',
    fuente: 'https://commons.wikimedia.org/wiki/File:Costa_azul,_La_caldera.JPG',
  },
  'San Bernardo': {
    foto: commons('San_Bernardo_del_Tuy%C3%BA_Vereda_Alta.jpg'),
    posicion: '50% 48%',
    arriba: '#dfc6b7',
    abajo: '#a57067',
    lugar: 'La Vereda Alta',
    autor: 'Hergallego',
    licencia: 'Dominio público',
    fuente: 'https://commons.wikimedia.org/wiki/File:San_Bernardo_del_Tuy%C3%BA_Vereda_Alta.jpg',
  },
  'Mar de Ajó': {
    foto: commons('Mar_de_Aj%C3%B3,_Monumento_El_libertador_y_el_mar,_Ricardo_D_Emilio.jpg'),
    posicion: '48% 43%',
    arriba: '#d8cdb9',
    abajo: '#9f795e',
    lugar: 'Monumento El Libertador y el Mar',
    autor: 'Roberto Fiadone',
    licencia: 'CC BY-SA 4.0',
    fuente: 'https://commons.wikimedia.org/wiki/File:Mar_de_Aj%C3%B3,_Monumento_El_libertador_y_el_mar,_Ricardo_D_Emilio.jpg',
  },
  'Nueva Atlantis': {
    foto: commons('Amanecer_en_la_playa.jpg'),
    posicion: '50% 48%',
    arriba: '#d8dbd5',
    abajo: '#6e8892',
    lugar: 'Amanecer en la playa',
    autor: 'Vicky Sapienza',
    licencia: 'CC BY-SA 4.0',
    fuente: 'https://commons.wikimedia.org/wiki/File:Amanecer_en_la_playa.jpg',
  },
  'Punta Médanos': {
    foto: commons('Faro_Punta_M%C3%A9danos_01.jpg'),
    posicion: '50% 35%',
    arriba: '#d6e0e4',
    abajo: '#9a5c50',
    lugar: 'Faro Punta Médanos',
    autor: 'Ariel Fontana',
    licencia: 'CC BY 2.5',
    fuente: 'https://commons.wikimedia.org/wiki/File:Faro_Punta_M%C3%A9danos_01.jpg',
  },
}
