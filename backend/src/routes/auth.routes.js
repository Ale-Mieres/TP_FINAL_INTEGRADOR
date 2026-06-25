// Rutas de autenticación: registro, verificación de email y login
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // módulo nativo de Node para generar tokens aleatorios
const Usuario = require('../models/Usuario');
const { signToken } = require('../utils/jwt');
const { sendVerificationEmail } = require('../services/email.service');

// POST /api/auth/register
// Registra un nuevo usuario, hashea la contraseña y manda el email de verificación
router.post('/register', async (req, res, next) => {
  try {
    const { nombre, email, password } = req.body;

    // Verificamos que vengan todos los campos
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Revisamos si ya existe un usuario con ese email
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese email' });
    }

    // Hasheamos la contraseña antes de guardarla (nunca guardamos la contraseña en texto plano)
    const salt = await bcrypt.genSalt(10);
    const passwordHasheada = await bcrypt.hash(password, salt);

    // Generamos un token aleatorio para verificar el email
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Creamos el usuario en la base de datos
    const usuarioNuevo = await Usuario.create({
      nombre,
      email,
      password: passwordHasheada,
      verificationToken,
      isVerified: false,
    });

    console.log('Usuario registrado:', usuarioNuevo.email);

    // Enviamos el email de verificación
    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      message: 'Te registraste correctamente. Revisá tu correo para verificar la cuenta.',
      userId: usuarioNuevo._id,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/verify/:token
// Activa la cuenta del usuario cuando hace clic en el link del email
router.get('/verify/:token', async (req, res, next) => {
  try {
    const { token } = req.params;

    // Buscamos al usuario que tenga ese token de verificación
    const usuario = await Usuario.findOne({ verificationToken: token });

    if (!usuario) {
      return res.status(400).json({ error: 'El token no es válido o ya fue usado' });
    }

    // Activamos la cuenta y borramos el token (ya no lo necesitamos)
    usuario.isVerified = true;
    usuario.verificationToken = undefined;
    await usuario.save();

    console.log('Cuenta verificada:', usuario.email);

    res.status(200).json({ message: 'Cuenta verificada correctamente. Ya podés iniciar sesión.' });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
// Verifica las credenciales y devuelve un JWT si todo está bien
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    // Buscamos al usuario por email
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    // Verificamos que la cuenta esté activada
    if (!usuario.isVerified) {
      return res.status(403).json({ error: 'Primero tenés que verificar tu cuenta desde el email' });
    }

    // Comparamos la contraseña ingresada con la que está hasheada en la BD
    const passwordCorrecta = await bcrypt.compare(password, usuario.password);
    if (!passwordCorrecta) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    // Generamos el token JWT con el id, email y nombre del usuario
    const token = signToken({ id: usuario._id, email: usuario.email, nombre: usuario.nombre });

    console.log('Usuario logueado:', usuario.email);

    res.status(200).json({
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
