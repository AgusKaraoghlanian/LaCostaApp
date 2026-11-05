export const categorias = [
  {id:'restaurantes',nombre:'Restaurantes',icono:'utensils',texto:'Mesas para quedarse un rato más',color:'#f3e5da'},
  {id:'cafeterias',nombre:'Cafeterías',icono:'coffee',texto:'Café de especialidad y buenas charlas',color:'#ebe5d8'},
  {id:'parrillas',nombre:'Parrillas',icono:'flame',texto:'El ritual del fuego, cerca del mar',color:'#f2dfd6'},
  {id:'pizzerias',nombre:'Pizzerías',icono:'pizza',texto:'Una porción y un encuentro',color:'#f5e8cc'},
  {id:'bares',nombre:'Bares y cervecerías',icono:'beer',texto:'Brindis con espíritu costero',color:'#e5eadc'},
  {id:'heladerias',nombre:'Heladerías',icono:'icecream',texto:'El gusto de estar de vacaciones',color:'#f0e1df'},
  {id:'panaderias',nombre:'Panaderías',icono:'croissant',texto:'El aroma de los pequeños rituales',color:'#ece4cf'},
  {id:'mariscos',nombre:'Pescados y mariscos',icono:'fish',texto:'Sabores que vienen del Atlántico',color:'#e0e9e8'}
];
export const localidades = ['San Clemente del Tuyú','Las Toninas','Santa Teresita','Mar del Tuyú','Costa del Este','Aguas Verdes','La Lucila del Mar','San Bernardo','Mar de Ajó','Nueva Atlantis'];
export const prestaciones = ['Mesas al aire libre','Opciones vegetarianas','Acepta mascotas','Accesible','Para llevar','Reservas'];
const foto = (id,w=1100)=>`https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;
export const imagenes = {
  hero:foto('photo-1517248135467-4c7edcad34c4',1800),
  pescado:foto('photo-1510130387422-82bed34b37e9'),
  cafe:foto('photo-1501339847302-ac426a4a7cbb'),
  parrilla:foto('photo-1544025162-d76694265947'),
  pizza:foto('photo-1579751626657-72bc17010498'),
  bar:foto('photo-1514933651103-005eec06c04b'),
  helado:foto('photo-1563805042-7684c019e1cb'),
  pan:foto('photo-1509440159596-0249088772ff'),
  costa:foto('photo-1473116763249-2faaef81ccda'),
  plato:foto('photo-1414235077428-338989a2e8c0'),
  burger:foto('photo-1568901346375-23c9450c58cd')
};
const filas = [
 ['la-orilla','La Orilla','restaurantes','Costa del Este','Cocina de estación, sobremesas largas y el mar como inspiración.',4.8,128,3,'plato',true,'Av. Costanera 460',['Mesas al aire libre','Opciones vegetarianas','Reservas','Accesible']],
 ['casa-marea','Casa Marea','cafeterias','San Bernardo','Café de especialidad y pastelería artesanal, a pasitos de la playa.',4.9,96,2,'cafe',true,'Chiozza 2310',['Opciones vegetarianas','Acepta mascotas','Para llevar','Mesas al aire libre']],
 ['fuego-sur','Fuego Sur','parrillas','Mar de Ajó','Cortes a las brasas, vegetales al rescoldo y sabor bien argentino.',4.7,214,3,'parrilla',true,'Av. del Libertador 320',['Reservas','Accesible','Mesas al aire libre']],
 ['puerto-sal','Puerto & Sal','mariscos','San Clemente del Tuyú','Pesca del día y recetas marineras para compartir en familia.',4.8,87,3,'pescado',false,'Av. Costanera 1820',['Reservas','Accesible','Para llevar']],
 ['la-redonda','La Redonda','pizzerias','Santa Teresita','Masa madre, horno de piedra y clásicos que nunca fallan.',4.6,143,2,'pizza',true,'Calle 2 735',['Para llevar','Opciones vegetarianas','Mesas al aire libre']],
 ['bosque-cervecero','Bosque Cervecero','bares','Costa del Este','Cervezas artesanales y platos para picar bajo los pinos.',4.7,112,2,'bar',false,'Av. 2 580',['Acepta mascotas','Mesas al aire libre','Opciones vegetarianas']],
 ['duna-helados','Duna Helados','heladerias','San Bernardo','Helados hechos en pequeños lotes, con fruta de verdad.',4.9,76,1,'helado',false,'Chiozza 1985',['Para llevar','Opciones vegetarianas','Accesible']],
 ['harina-de-mar','Harina de Mar','panaderias','La Lucila del Mar','Panes de fermentación lenta y medialunas recién salidas del horno.',4.8,65,1,'pan',false,'Mendoza 425',['Para llevar','Opciones vegetarianas']],
 ['el-refugio','El Refugio del Tuyú','restaurantes','Mar del Tuyú','Pastas caseras y recetas de abuela con una mirada costera.',4.5,89,2,'plato',false,'Calle 58 240',['Reservas','Opciones vegetarianas','Accesible']],
 ['cafe-del-muelle','Café del Muelle','cafeterias','Santa Teresita','Desayunos sin apuro, tostados y café mirando al horizonte.',4.6,102,2,'cafe',false,'Av. Costanera 1260',['Mesas al aire libre','Para llevar','Acepta mascotas']],
 ['las-brasas','Las Brasas de Clemente','parrillas','San Clemente del Tuyú','Parrillada generosa y cocina criolla para toda la familia.',4.6,167,2,'parrilla',false,'Av. San Martín 640',['Reservas','Para llevar','Accesible']],
 ['nonna-costa','Nonna Costa','pizzerias','Mar de Ajó','Pizzas de barrio, empanadas y el secreto de la salsa de Nonna.',4.7,119,2,'pizza',false,'Av. San Martín 580',['Para llevar','Opciones vegetarianas']],
 ['atlantico-bar','Atlántico Bar','bares','Las Toninas','Tragos de autor y música suave para cerrar un día de playa.',4.5,73,2,'bar',false,'Calle 1 1210',['Mesas al aire libre','Reservas','Opciones vegetarianas']],
 ['bruma','Bruma Cocina','restaurantes','Aguas Verdes','Productos de estación, platos simples y un jardín escondido.',4.8,54,3,'plato',false,'Av. Fragata Sarmiento 285',['Acepta mascotas','Opciones vegetarianas','Reservas','Mesas al aire libre']],
 ['salitre','Salitre Pescadería & Cocina','mariscos','Mar de Ajó','Rabas, pesca fresca y sabores del mar preparados en el momento.',4.6,91,2,'pescado',false,'Av. Costanera 910',['Para llevar','Accesible']],
 ['pinamar-cafe','Entre Pinos Café','cafeterias','Costa del Este','Café de origen y tortas caseras en el corazón del bosque.',4.9,81,2,'cafe',false,'Las Camelias 130',['Acepta mascotas','Mesas al aire libre','Opciones vegetarianas']],
 ['dulce-marea','Dulce Marea','heladerias','Santa Teresita','Sabores clásicos y combinaciones de estación, hechos cada día.',4.7,108,1,'helado',false,'Calle 3 860',['Para llevar','Accesible','Opciones vegetarianas']],
 ['pan-del-bosque','Pan del Bosque','panaderias','Nueva Atlantis','Pan de campo, bizcochos y cosas ricas para el mate.',4.8,47,1,'pan',false,'Av. Roldán 410',['Para llevar','Opciones vegetarianas']],
 ['el-patio','El Patio de las Toninas','restaurantes','Las Toninas','Hamburguesas caseras, ensaladas y un patio para reencontrarse.',4.5,94,2,'burger',false,'Calle 7 560',['Mesas al aire libre','Acepta mascotas','Opciones vegetarianas','Para llevar']],
 ['sur-sustento','Sur Sustento','restaurantes','La Lucila del Mar','Cocina vegetal, bowls de estación y opciones para todos.',4.7,63,2,'plato',false,'Salta 680',['Opciones vegetarianas','Para llevar','Acepta mascotas']]
];
export const negocios = filas.map((f,i)=>({id:String(i+1),slug:f[0],nombre:f[1],categoria:f[2],localidad:f[3],descripcion:f[4],valoracion:f[5],opiniones:f[6],precio:f[7],imagen:imagenes[f[8]],destacado:f[9],direccion:f[10],prestaciones:f[11],estado:'aprobado',horarios:'Martes a domingo · 12:00 a 15:30 y 19:30 a 23:30',galeria:[imagenes[f[8]],imagenes.hero,imagenes.plato],demostracion:true}));
export const opinionesIniciales = [
 {id:'r1',negocio_id:'1',nombre:'Lucía M.',puntuacion:5,texto:'Un lugar hermoso para una cena tranquila. Muy buena atención y platos con mucho sabor. ¡Volveríamos!',fecha:'2026-09-18',estado:'aprobado'},
 {id:'r2',negocio_id:'1',nombre:'Martín R.',puntuacion:4,texto:'Nos encantó el ambiente y la propuesta de estación. Ideal para una sobremesa sin apuro.',fecha:'2026-09-12',estado:'aprobado'},
 {id:'r3',negocio_id:'2',nombre:'Paula G.',puntuacion:5,texto:'El café y la pastelería fueron lo mejor de nuestra tarde. Muy lindo el patio.',fecha:'2026-09-20',estado:'aprobado'}
];
export function filtrarNegocios(items, filtros={}, categoriasDisponibles=categorias) {
 const normalizar=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 return items.filter(n=>(n.estado==='aprobado')&&(!filtros.q||normalizar(`${n.nombre} ${n.descripcion} ${n.localidad} ${categoriasDisponibles.find(c=>c.id===n.categoria)?.nombre}`).includes(normalizar(filtros.q)))&&(!filtros.categoria||n.categoria===filtros.categoria)&&(!filtros.localidad||n.localidad===filtros.localidad)&&(!filtros.precio||n.precio===Number(filtros.precio))&&(!filtros.valoracion||n.valoracion>=Number(filtros.valoracion))&&(!filtros.prestaciones?.length||filtros.prestaciones.every(p=>n.prestaciones.includes(p))));
}
