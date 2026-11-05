import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validarEntorno, origenesPermitidos } from '../src/config/entorno.js';

const SECRETO_LARGO = 'x'.repeat(48);
const original = { ...process.env };

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  process.env.DATABASE_URL = 'postgresql://prueba';
  process.env.JWT_SECRET = SECRETO_LARGO;
  delete process.env.NODE_ENV;
  delete process.env.CORS_ORIGENES;
});

afterEach(() => {
  process.env = { ...original };
  vi.restoreAllMocks();
});

describe('validarEntorno', () => {
  it('sin DATABASE_URL o JWT_SECRET no arranca', () => {
    delete process.env.DATABASE_URL;
    delete process.env.JWT_SECRET;
    expect(() => validarEntorno()).toThrow(/DATABASE_URL falta[\s\S]*JWT_SECRET falta/);
  });

  it('en desarrollo, un secreto corto solo avisa', () => {
    process.env.JWT_SECRET = 'corto';
    expect(() => validarEntorno()).not.toThrow();
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('JWT_SECRET tiene menos de 32'));
  });

  it('en producción, un secreto corto no deja arrancar', () => {
    process.env.NODE_ENV = 'production';
    process.env.CORS_ORIGENES = 'https://costa-a-la-carta.onrender.com';
    process.env.JWT_SECRET = 'corto';
    expect(() => validarEntorno()).toThrow(/JWT_SECRET tiene menos de 32/);
  });

  it('en producción, CORS_ORIGENES es obligatorio', () => {
    process.env.NODE_ENV = 'production';
    expect(() => validarEntorno()).toThrow(/CORS_ORIGENES falta/);
  });

  it('en producción con todo bien, arranca', () => {
    process.env.NODE_ENV = 'production';
    process.env.CORS_ORIGENES = 'https://costa-a-la-carta.onrender.com';
    expect(() => validarEntorno()).not.toThrow();
  });
});

describe('origenesPermitidos', () => {
  it('lee la lista separada por comas (sin espacios ni / al final)', () => {
    process.env.CORS_ORIGENES = ' https://costa-a-la-carta.onrender.com/ , https://costaalacarta.com';
    expect(origenesPermitidos()).toEqual(['https://costa-a-la-carta.onrender.com', 'https://costaalacarta.com']);
  });

  it('en desarrollo, sin configurar, acepta el frontend de Vite; en producción, nada', () => {
    expect(origenesPermitidos()).toEqual(['http://localhost:5173']);
    process.env.NODE_ENV = 'production';
    expect(origenesPermitidos()).toEqual([]);
  });
});
