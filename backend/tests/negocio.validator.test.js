import { describe, it, expect } from 'vitest';
import { crearNegocioSchema, listarNegociosSchema } from '../src/validators/negocio.validator.js';

const base = { nombre: 'La Orilla', localidadId: 1, categoriaId: 2, referenciaVerificacion: 'Llamé al local' };

const validar = (cambios) => crearNegocioSchema.validate({ ...base, ...cambios }, { errors: { wrap: { label: false } } });

describe('crearNegocioSchema', () => {
  it('completa lo opcional con sus valores por defecto', () => {
    const { error, value } = validar({});
    expect(error).toBeUndefined();
    expect(value).toMatchObject({ estadoComercial: 'SIN_CONFIRMAR', descripcion: '', prestaciones: [], precio: null, foto: null, productos: [] });
  });

  it('pide la referencia de verificación', () => {
    const { error } = crearNegocioSchema.validate({ nombre: 'La Orilla', localidadId: 1, categoriaId: 2 });
    expect(error.message).toMatch(/verificaste/);
  });

  it('acepta un horario que cierra pasada la medianoche solo si se marca', () => {
    expect(validar({ horarios: [{ dia: 5, abre: '20:00', cierra: '02:00' }] }).error.message).toMatch(/día siguiente/);
    expect(validar({ horarios: [{ dia: 5, abre: '20:00', cierra: '02:00', alDiaSiguiente: true }] }).error).toBeUndefined();
  });

  it('un día especial abierto necesita su horario', () => {
    expect(validar({ horariosEspeciales: [{ fecha: '2026-12-25' }] }).error.message).toMatch(/día especial/);
    expect(validar({ horariosEspeciales: [{ fecha: '2026-12-25', cerrado: true }] }).error).toBeUndefined();
  });

  it('guarda las fechas como AAAA-MM-DD y rechaza las que no existen', () => {
    const horario = { dia: 1, abre: '12:00', cierra: '15:00' };
    expect(validar({ horarios: [{ ...horario, vigenteDesde: '2026-12-01' }] }).value.horarios[0].vigenteDesde).toBe('2026-12-01');
    expect(validar({ horarios: [{ ...horario, vigenteDesde: '2026-02-30' }] }).error.message).toMatch(/no existe/);
  });

  it('no aprueba un precio sin moneda', () => {
    const producto = { nombre: 'Cortado', precioCentavos: 250000 };
    expect(validar({ productos: [{ ...producto, estado: 'APROBADO' }] }).error.message).toMatch(/moneda/);
    expect(validar({ productos: [{ ...producto, estado: 'PROPUESTO' }] }).error).toBeUndefined();
    expect(validar({ productos: [{ ...producto, moneda: 'ARS', estado: 'APROBADO' }] }).error).toBeUndefined();
  });

  it('los links de redes tienen que ser de esa red', () => {
    expect(validar({ instagram: 'https://www.instagram.com/laorilla' }).error).toBeUndefined();
    expect(validar({ instagram: 'https://facebook.com/laorilla' }).error).toBeDefined();
    expect(validar({ whatsapp: 'https://wa.me/5492255123456' }).error).toBeUndefined();
    expect(validar({ whatsapp: 'https://wa.me/hola' }).error.message).toMatch(/wa\.me\/549/);
    expect(validar({ web: 'javascript:alert(1)' }).error).toBeDefined();
    expect(validar({ web: 'https://usuario:clave@laorilla.com' }).error).toBeDefined();
  });
});

describe('listarNegociosSchema', () => {
  it('acepta una sola prestación o varias', () => {
    expect(listarNegociosSchema.validate({ prestacion: 'Reservas' }).value.prestacion).toEqual(['Reservas']);
    expect(listarNegociosSchema.validate({ prestacion: ['Reservas', 'Accesible'] }).value.prestacion).toHaveLength(2);
  });

  it('convierte los números del query', () => {
    expect(listarNegociosSchema.validate({ pagina: '2', localidadId: '3' }).value).toMatchObject({ pagina: 2, localidadId: 3 });
  });
});
