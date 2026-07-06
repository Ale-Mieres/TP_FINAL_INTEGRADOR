// Rutas exclusivas para el administrador — protegidas con authMiddleware + adminMiddleware
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');
const adminController = require('../controllers/admin.controller');
const { validarDisponibilidad } = require('../middleware/validation.middleware');

// Aplicamos ambos middlewares a todas las rutas de este archivo
router.use(authMiddleware);
router.use(adminMiddleware);

// GET /api/admin/estadisticas — recaudación total, turnos, reservas por tipo
router.get('/estadisticas', adminController.obtenerEstadisticas);

// GET /api/admin/disponibilidad?tipo=Fútbol — disponibilidad de canchas por tipo (7 días)
router.get('/disponibilidad', validarDisponibilidad, adminController.obtenerDisponibilidad);

module.exports = router;
