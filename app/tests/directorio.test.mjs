import test from 'node:test';
import assert from 'node:assert/strict';
import { negocios,categorias,localidades,filtrarNegocios } from '../src/datos.js';
test('Los 20 ejemplos pertenecen a categorías y localidades del directorio',()=>{assert.equal(negocios.length,20);assert.equal(new Set(negocios.map(n=>n.slug)).size,20);for(const n of negocios){assert.ok(categorias.some(c=>c.id===n.categoria));assert.ok(localidades.includes(n.localidad));assert.ok(n.demostracion)}});
test('La búsqueda ignora tildes y mayúsculas',()=>{assert.ok(filtrarNegocios(negocios,{q:'CAFE'}).some(n=>n.nombre==='Casa Marea'));assert.ok(filtrarNegocios(negocios,{q:'maR dE AJo'}).every(n=>n.localidad==='Mar de Ajó'))});
test('Los filtros de categoría, localidad, precio y servicios se combinan',()=>{const r=filtrarNegocios(negocios,{categoria:'cafeterias',localidad:'San Bernardo',precio:'2',valoracion:'4.8',prestaciones:['Acepta mascotas','Para llevar']});assert.equal(r.length,1);assert.equal(r[0].nombre,'Casa Marea')});
test('Ninguna ficha pendiente o rechazada aparece en la búsqueda pública',()=>{const ejemplos=[...negocios,{...negocios[0],id:'pendiente',estado:'pendiente'},{...negocios[0],id:'rechazado',estado:'rechazado'}];assert.equal(filtrarNegocios(ejemplos).length,20)});
test('Un filtro sin coincidencias devuelve una lista vacía',()=>{assert.deepEqual(filtrarNegocios(negocios,{categoria:'parrillas',localidad:'Nueva Atlantis'}),[])});
