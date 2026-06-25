// Importamos lo que necesitamos para verificar el token JWT
const { verifyToken } = require('../utils/jwt');
const Usuario = require('../models/Usuario');

// Este middleware protege las rutas privadas
// Verifica que el usuario mande un token válido en el header Authorization
const authMiddleware = async (req, res, next) => {
  try {
    // Leemos el header Authorization
    const authHeader = req.headers['authorization'];

    // Si no hay header o no empieza con "Bearer" rechazamos la petición
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    // Separamos el token del "Bearer"
    const token = authHeader.split(' ')[1];

    // Verificamos que el token sea válido
    const decoded = verifyToken(token);
    console.log('Token decodificado:', decoded);

    // Buscamos al usuario en la base de datos usando el id del token
    const usuario = await Usuario.findById(decoded.id).select('-password');

    if (!usuario) {
      return res.status(401).json({ error: 'El usuario no existe' });
    }

    // Guardamos el usuario en req.user para usarlo en los controllers
    req.user = usuario;

    // Pasamos al siguiente middleware o controller
    next();
  } catch (error) {
    console.log('Error en el middleware de autenticación:', error.message);
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

module.exports = authMiddleware;
