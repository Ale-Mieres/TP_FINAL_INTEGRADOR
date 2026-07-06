// Rutas de autenticación: registro, verificación de email, login y recuperación de contraseña
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const {
  validarRegistro,
  validarLogin,
  validarForgotPassword,
  validarResetPassword,
} = require('../middleware/validation.middleware');

// POST /api/auth/register — registra un nuevo usuario
router.post('/register', validarRegistro, authController.register);

// GET /api/auth/verify/:token — activa la cuenta desde el link del email
router.get('/verify/:token', authController.verifyEmail);

// POST /api/auth/login — verifica credenciales y devuelve JWT
router.post('/login', validarLogin, authController.login);

// POST /api/auth/forgot-password — envía el email de recuperación
router.post('/forgot-password', validarForgotPassword, authController.forgotPassword);

// POST /api/auth/reset-password — restablece la contraseña con el token
router.post('/reset-password', validarResetPassword, authController.resetPassword);

module.exports = router;
