// Repositorio de Usuarios: única capa que toca la base de datos para autenticación
const Usuario = require('../models/Usuario');

// Busca un usuario por email
const findByEmail = async (email) => {
  return await Usuario.findOne({ email });
};

// Busca un usuario por su ID (sin incluir la contraseña)
const findById = async (id) => {
  return await Usuario.findById(id).select('-password');
};

// Busca un usuario por su token de verificación de email
const findByVerificationToken = async (token) => {
  return await Usuario.findOne({ verificationToken: token });
};

// Busca un usuario por su token de reset de contraseña (que no haya expirado)
const findByResetToken = async (token) => {
  return await Usuario.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });
};

// Crea un nuevo usuario
const create = async (data) => {
  return await Usuario.create(data);
};

// Guarda los cambios de un usuario (se usa con documentos Mongoose ya cargados)
const save = async (usuario) => {
  return await usuario.save();
};

module.exports = { findByEmail, findById, findByVerificationToken, findByResetToken, create, save };
