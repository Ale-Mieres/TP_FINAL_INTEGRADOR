// Configuración principal de Express
const express = require('express');
const cors = require('cors');

// Importamos las rutas
const authRoutes = require('./routes/auth.routes');
const turnoRoutes = require('./routes/turno.routes');

// Importamos el middleware de errores
const errorMiddleware = require('./middleware/error.middleware');

const app = express();

// Habilitamos CORS para que el frontend pueda comunicarse con el backend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Habilitamos que Express entienda JSON en el body de las peticiones
app.use(express.json());

// Ruta de prueba para verificar que el servidor está funcionando
app.get('/api/health', (req, res) => {
  res.status(200).json({ mensaje: 'El servidor está funcionando correctamente' });
});

// Montamos las rutas en sus paths correspondientes
app.use('/api/auth', authRoutes);
app.use('/api/turnos', turnoRoutes);

// El middleware de errores va AL FINAL de todo
// Express sabe que es un error handler porque tiene 4 parámetros
app.use(errorMiddleware);

module.exports = app;
