// Controlador de Autenticación: maneja request/response, delega lógica al servicio
// Las validaciones de campos requeridos se hacen en el middleware de validación (validation.middleware.js)
const authService = require('../services/auth.service');

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { nombre, email, password } = req.body;

    const resultado = await authService.registrar({ nombre, email, password });

    res.status(201).json({
      message: 'Te registraste correctamente. Revisá tu correo para verificar la cuenta.',
      userId: resultado.userId,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/verify/:token
const verifyEmail = async (req, res, next) => {
  try {
    await authService.verificarEmail(req.params.token);
    res.status(200).json({ message: 'Cuenta verificada correctamente. Ya podés iniciar sesión.' });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const resultado = await authService.login({ email, password });
    res.status(200).json(resultado);
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    await authService.forgotPassword(email);
    res.status(200).json({
      message: 'Se ha enviado un correo con las instrucciones para restablecer tu contraseña',
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    await authService.resetPassword({ token, newPassword });
    res.status(200).json({ message: 'Tu contraseña ha sido actualizada correctamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, verifyEmail, login, forgotPassword, resetPassword };
