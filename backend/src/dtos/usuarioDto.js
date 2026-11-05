// Lo que vuelve al iniciar sesión (nunca la contraseña).
const usuarioDto = (usuario) => ({
  id: usuario.id,
  email: usuario.email,
  nombre: usuario.nombre,
  rol: usuario.rol,
});

export { usuarioDto };
