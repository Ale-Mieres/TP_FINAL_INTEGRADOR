// Servicio de Autenticación: lógica de negocio para registro, verificación y login
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const authRepository = require('../repositories/auth.repository');
const { signToken } = require('../utils/jwt');
const { sendVerificationEmail, sendPasswordResetEmail } = require('./email.service');

// Registra un nuevo usuario, hashea la contraseña y envía el email de verificación
const registrar = async ({ nombre, email, password }) => {
  // Verificamos si ya existe un usuario con ese email
  const usuarioExistente = await authRepository.findByEmail(email);
  if (usuarioExistente) {
    const error = new Error('Ya existe una cuenta con ese email');
    error.statusCode = 409;
    throw error;
  }

  // Hasheamos la contraseña (nunca se guarda en texto plano)
  const salt = await bcrypt.genSalt(10);
  const passwordHasheada = await bcrypt.hash(password, salt);

  // Generamos un token aleatorio para verificar el email
  const verificationToken = crypto.randomBytes(32).toString('hex');

  // Guardamos el usuario en la BD
  const usuarioNuevo = await authRepository.create({
    nombre,
    email,
    password: passwordHasheada,
    verificationToken,
    isVerified: false,
  });

  // Enviamos el email de verificación
  await sendVerificationEmail(email, verificationToken);

  console.log('Usuario registrado:', usuarioNuevo.email);
  return { userId: usuarioNuevo._id };
};

// Activa la cuenta del usuario usando el token del email
const verificarEmail = async (token) => {
  const usuario = await authRepository.findByVerificationToken(token);
  if (!usuario) {
    const error = new Error('El token no es válido o ya fue usado');
    error.statusCode = 400;
    throw error;
  }

  // Activamos la cuenta y borramos el token
  usuario.isVerified = true;
  usuario.verificationToken = undefined;
  await authRepository.save(usuario);

  console.log('Cuenta verificada:', usuario.email);
};

// Verifica credenciales y devuelve un JWT
const login = async ({ email, password }) => {
  const usuario = await authRepository.findByEmail(email);
  if (!usuario) {
    const error = new Error('Email o contraseña incorrectos');
    error.statusCode = 401;
    throw error;
  }

  // La cuenta debe estar verificada
  if (!usuario.isVerified) {
    const error = new Error('Primero tenés que verificar tu cuenta desde el email');
    error.statusCode = 403;
    throw error;
  }

  // Comparamos la contraseña ingresada con la hasheada en la BD
  const passwordCorrecta = await bcrypt.compare(password, usuario.password);
  if (!passwordCorrecta) {
    const error = new Error('Email o contraseña incorrectos');
    error.statusCode = 401;
    throw error;
  }

  // Generamos el JWT con los datos necesarios
  const token = signToken({
    id: usuario._id,
    email: usuario.email,
    nombre: usuario.nombre,
    rol: usuario.rol,
  });

  console.log('Login exitoso:', usuario.email);
  return {
    token,
    usuario: {
      id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    },
  };
};

// Inicia el flujo de recuperación de contraseña
const forgotPassword = async (email) => {
  const usuario = await authRepository.findByEmail(email);
  if (!usuario) {
    const error = new Error('No existe una cuenta con ese email');
    error.statusCode = 404;
    throw error;
  }

  // Generamos el token y su fecha de expiración (1 hora)
  const resetToken = crypto.randomBytes(32).toString('hex');
  usuario.resetPasswordToken = resetToken;
  usuario.resetPasswordExpires = Date.now() + 3600000;
  await authRepository.save(usuario);

  await sendPasswordResetEmail(email, resetToken);
};

// Restablece la contraseña usando el token de reset
const resetPassword = async ({ token, newPassword }) => {
  const usuario = await authRepository.findByResetToken(token);
  if (!usuario) {
    const error = new Error('El token es inválido o ha expirado');
    error.statusCode = 400;
    throw error;
  }

  const salt = await bcrypt.genSalt(10);
  usuario.password = await bcrypt.hash(newPassword, salt);
  usuario.resetPasswordToken = undefined;
  usuario.resetPasswordExpires = undefined;
  await authRepository.save(usuario);
};

module.exports = { registrar, verificarEmail, login, forgotPassword, resetPassword };
