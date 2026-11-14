import { describe, it, expect } from 'vitest';
import { interpretarBusqueda } from '../src/utils/busqueda.js';

const categorias = [
  { id: 1, clave: 'restaurantes', nombre: 'Restaurantes' },
  { id: 2, clave: 'cafeterias', nombre: 'Cafeterías' },
  { id: 4, clave: 'pizzerias', nombre: 'Pizzerías' },
  { id: 5, clave: 'bares', nombre: 'Bares y cervecerías' },
  { id: 6, clave: 'heladerias', nombre: 'Heladerías' },
  { id: 9, clave: 'empanadas', nombre: 'Empanadas' },
];
const localidades = [
  { id: 1, nombre: 'San Clemente del Tuyú' },
  { id: 10, nombre: 'San Bernardo' },
  { id: 11, nombre: 'Mar de Ajó' },
  { id: 4, nombre: 'Costa del Este' },
];
const interpretar = (texto) => interpretarBusqueda(texto, { categorias, localidades });

describe('interpretarBusqueda', () => {
  it('lleva una comida a su categoría, en singular y en plural', () => {
    expect(interpretar('pizza')).toEqual({ palabras: [], categoriaIds: [4], palabrasDeCategoria: ['pizza'], localidadIds: [] });
    expect(interpretar('Helados').categoriaIds).toEqual([6]);
    expect(interpretar('birra').categoriaIds).toEqual([5]);
  });

  it('entiende la categoría por su nombre aunque no tenga lista de palabras', () => {
    expect(interpretar('empanadas').categoriaIds).toEqual([9]);
  });

  it('reconoce la localidad por su nombre o por como se la dice, sin tildes', () => {
    expect(interpretar('pizza en Mar de Ajo')).toMatchObject({ categoriaIds: [4], localidadIds: [11], palabras: [] });
    expect(interpretar('cafe san clemente').localidadIds).toEqual([1]);
  });

  it('prefiere el nombre más largo de localidad', () => {
    const resultado = interpretar('san bernardo del tuyu');
    expect(resultado.localidadIds).toEqual([10]);
    expect(resultado.palabras).toEqual([]);
  });

  it('deja el resto como palabras sueltas, sin las que no aportan', () => {
    expect(interpretar('La Orilla')).toEqual({ palabras: ['orilla'], categoriaIds: [], palabrasDeCategoria: [], localidadIds: [] });
    expect(interpretar('donde comer pizza en la costa')).toMatchObject({ palabras: [], categoriaIds: [4], localidadIds: [] });
  });

  it('no confunde "la costa" con Costa del Este', () => {
    expect(interpretar('helado la costa').localidadIds).toEqual([]);
  });

  it('devuelve null si no queda nada para buscar', () => {
    expect(interpretar('  de la  ')).toBeNull();
  });
});
