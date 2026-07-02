// Middleware para verificar que el usuario sea administrador
// Se usa DESPUÉS del authMiddleware (que ya pone req.user)
const adminMiddleware = (req, res, next) => {
  // Verificamos que exista el usuario y que su rol sea 'admin'
  if (!req.user || req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
  }

  // Si es admin, seguimos al siguiente middleware o controller
  next();
};

module.exports = adminMiddleware;
