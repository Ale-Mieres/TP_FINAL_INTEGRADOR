const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const turnoRoutes = require('./routes/turno.routes');
const canchaRoutes = require('./routes/cancha.routes');
const adminRoutes = require('./routes/admin.routes');

const errorMiddleware = require('./middleware/error.middleware');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ mensaje: 'El servidor está funcionando correctamente' });
});

app.use('/api/auth', authRoutes);
app.use('/api/turnos', turnoRoutes);
app.use('/api/canchas', canchaRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorMiddleware);

module.exports = app;
