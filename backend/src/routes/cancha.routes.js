// Rutas para la entidad Cancha (CRUD completo)
// GET es público; POST/PUT/DELETE requieren admin
const express = require('express');
const router = express.Router();
const canchaController = require('../controllers/cancha.controller');
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');

// GET /api/canchas — lista todas las canchas (ruta pública para el frontend)
router.get('/', canchaController.obtenerCanchas);

// GET /api/canchas/:id — detalle de una cancha
router.get('/:id', canchaController.obtenerCanchaPorId);

// Las rutas de escritura requieren autenticación + rol admin
// POST /api/canchas — crea una nueva cancha
router.post('/', authMiddleware, adminMiddleware, canchaController.crearCancha);

// PUT /api/canchas/:id — actualiza una cancha
router.put('/:id', authMiddleware, adminMiddleware, canchaController.actualizarCancha);

// DELETE /api/canchas/:id — elimina una cancha
router.delete('/:id', authMiddleware, adminMiddleware, canchaController.eliminarCancha);

module.exports = router;
