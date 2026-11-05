import {writeFile} from 'node:fs/promises';
import {negocios,categorias,localidades,opinionesIniciales} from '../src/datos.js';
const sql=v=>v===null||v===undefined?'null':typeof v==='boolean'?String(v):typeof v==='number'?String(v):Array.isArray(v)?`array[${v.map(sql).join(',')}]::text[]`:`'${String(v).replaceAll("'","''")}'`;
let salida='-- Datos ficticios para un proyecto dedicado a Costa a la carta.\n-- Ejecutar después de esquema.sql. No ejecutar en «la-costa-en-datos».\nbegin;\n';
salida+=`insert into public.categories (id,nombre,icono,texto,color) values\n${categorias.map(c=>`(${[c.id,c.nombre,c.icono,c.texto,c.color].map(sql).join(',')})`).join(',\n')}\non conflict (id) do nothing;\n`;
salida+=`insert into public.locations (id,nombre) values\n${localidades.map((n,i)=>`(${sql('localidad-'+(i+1))},${sql(n)})`).join(',\n')}\non conflict (id) do nothing;\n`;
// La semilla se carga como administración de base. Se desactiva solo este
// disparador durante la misma transacción para preservar los ejemplos aprobados.
salida+='alter table public.listings disable trigger proteger_edicion_ficha;\n';
const columnas=['id','slug','nombre','categoria','localidad','descripcion','valoracion','opiniones','precio','imagen','destacado','direccion','prestaciones','estado','horarios','galeria','demostracion'];
salida+=`insert into public.listings (${columnas.join(',')}) values\n${negocios.map(n=>'('+columnas.map(c=>sql(n[c])).join(',')+')').join(',\n')}\non conflict (id) do nothing;\n`;
salida+='alter table public.listings enable trigger proteger_edicion_ficha;\n';
salida+=`insert into public.reviews (id,negocio_id,nombre,puntuacion,texto,fecha,estado) values\n${opinionesIniciales.map((r,i)=>'('+[sql('00000000-0000-4000-8000-'+String(i+1).padStart(12,'0')),...['negocio_id','nombre','puntuacion','texto','fecha','estado'].map(k=>sql(r[k]))].join(',')+')').join(',\n')}\non conflict (id) do nothing;\ncommit;\n`;
await writeFile('supabase/datos-ejemplo.sql',salida);
console.log('Semilla de 20 negocios preparada. No se ejecutó ninguna consulta remota.');
