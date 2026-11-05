import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { render, negocios, categorias } from '../.prerender/entrada-servidor.js';
const origen='https://costa-a-la-carta.o4ftony10.chatgpt.site';
const plantilla=await readFile('dist/index.html','utf8');
const rutas=['/','/explorar','/categorias','/guardados','/sumar-lugar','/reclamar','/ingresar','/mi-negocio','/administracion','/sobre-la-costa','/como-funciona',...categorias.map(c=>'/categoria/'+c.id),...negocios.map(n=>'/lugar/'+n.slug)];
const escapar=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
for(const ruta of rutas){
 const negocio=negocios.find(n=>ruta==='/lugar/'+n.slug), categoria=categorias.find(c=>ruta==='/categoria/'+c.id);
 const titulo=negocio?`${negocio.nombre} en ${negocio.localidad} · Costa a la carta`:categoria?`${categoria.nombre} en La Costa · Costa a la carta`:'Costa a la carta · Sabores de La Costa';
 const descripcion=negocio?`${negocio.descripcion} Propuesta de muestra en ${negocio.localidad}, Partido de La Costa.`:categoria?`Descubrí ${categoria.nombre.toLowerCase()} en el Partido de La Costa. Explorá por localidad, precio y servicios.`:'Descubrí restaurantes, cafés, bares y sabores locales del Partido de La Costa.';
 const privados=['/guardados','/sumar-lugar','/reclamar','/ingresar','/mi-negocio','/administracion'].includes(ruta);
 const metadatos=`<link rel="canonical" href="${origen}${ruta}"/><meta property="og:locale" content="es_AR"/><meta property="og:type" content="website"/><meta property="og:title" content="${escapar(titulo)}"/><meta property="og:description" content="${escapar(descripcion)}"/><meta property="og:url" content="${origen}${ruta}"/>${privados?'<meta name="robots" content="noindex,follow"/>':''}`;
 const html=plantilla.replace('<div id="root"></div>',`<div id="root" data-ruta="${ruta}">${render(ruta)}</div>`).replace(/<title>.*?<\/title>/,`<title>${escapar(titulo)}</title>`).replace(/<meta name="description" content="[^"]*"\s*\/>/,`<meta name="description" content="${escapar(descripcion)}"/>`).replace('</head>',metadatos+'</head>');
 const directorio=ruta==='/'?'dist':`dist${ruta}`;await mkdir(directorio,{recursive:true});await writeFile(directorio+'/index.html',html);
}
await writeFile('dist/404.html',plantilla.replace('<div id="root"></div>',`<div id="root">${render('/no-encontrado')}</div>`));
const publicas=rutas.filter(r=>!['/guardados','/sumar-lugar','/reclamar','/ingresar','/mi-negocio','/administracion'].includes(r));
await writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${publicas.map(r=>`<url><loc>${origen}${r}</loc></url>`).join('')}</urlset>`);
await writeFile('dist/robots.txt',`User-agent: *\nAllow: /\nSitemap: ${origen}/sitemap.xml\n`);
console.log(`Se generaron ${rutas.length} páginas en español y el mapa del sitio.`);
