import bcrypt from 'bcryptjs';
import * as usuarioRepository from '../repositories/usuario.repository.js';
import { usuarioDto } from '../dtos/usuarioDto.js';
import { generarToken } from '../utils/jwt.js';
import { CredencialesInvalidas } from '../errors/auth/CredencialesInvalidas.js';

// Por ahora solo entran administradores (los crea el seed). El mismo error si el email no
// existe o la contraseña está mal: así no se puede averiguar qué emails tienen cuenta.
const login = async ({ email, password }) => {
  const usuario = await usuarioRepository.obtenerUsuarioPorEmail(email);
  if (!usuario) { throw new CredencialesInvalidas(); }

  const passwordValida = await bcrypt.compare(password, usuario.password);
  if (!passwordValida) { throw new CredencialesInvalidas(); }

  const token = generarToken({ id: usuario.id, rol: usuario.rol });
  return { token, usuario: usuarioDto(usuario) };
};

export { login };
