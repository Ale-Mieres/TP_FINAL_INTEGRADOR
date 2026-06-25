// Middleware para manejar los errores de forma centralizada
// Express lo reconoce como error handler porque tiene 4 parámetros (err, req, res, next)
const errorMiddleware = (err, req, res, next) => {
  console.log('Error capturado:', err.message);

  // Si el error no tiene un statusCode usamos 500 (error del servidor)
  const statusCode = err.statusCode || 500;

  // Respondemos con el mensaje de error en formato JSON
  res.status(statusCode).json({
    error: err.message || 'Ocurrió un error en el servidor',
  });
};

module.exports = errorMiddleware;
