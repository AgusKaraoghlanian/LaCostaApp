import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';

vi.mock('../src/repositories/usuario.repository.js', () => ({ obtenerUsuarioPorEmail: vi.fn() }));

import * as usuarioRepository from '../src/repositories/usuario.repository.js';
import * as authService from '../src/services/auth.service.js';
import { CredencialesInvalidas } from '../src/errors/auth/CredencialesInvalidas.js';
import { verificarToken } from '../src/utils/jwt.js';

process.env.JWT_SECRET = 'secreto-de-prueba-de-al-menos-32-caracteres';

beforeEach(async () => {
  vi.clearAllMocks();
  usuarioRepository.obtenerUsuarioPorEmail.mockResolvedValue({
    id: 1, email: 'admin@ejemplo.com', nombre: 'Admin', rol: 'ADMINISTRADOR', password: await bcrypt.hash('correcta1', 4),
  });
});

describe('login', () => {
  it('devuelve un token con el id y el rol, y el usuario sin la contraseña', async () => {
    const { token, usuario } = await authService.login({ email: 'admin@ejemplo.com', password: 'correcta1' });

    expect(verificarToken(token)).toMatchObject({ id: 1, rol: 'ADMINISTRADOR' });
    expect(usuario).not.toHaveProperty('password');
  });

  it('el mismo error si la contraseña está mal o el email no existe', async () => {
    await expect(authService.login({ email: 'admin@ejemplo.com', password: 'otra' })).rejects.toBeInstanceOf(CredencialesInvalidas);
    usuarioRepository.obtenerUsuarioPorEmail.mockResolvedValue(null);
    await expect(authService.login({ email: 'nadie@ejemplo.com', password: 'otra' })).rejects.toBeInstanceOf(CredencialesInvalidas);
  });
});
