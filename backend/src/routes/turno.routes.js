// Rutas para los turnos - todas están protegidas por el middleware de autenticación
const express = require('express');
const router = express.Router();
const turnoController = require('../controllers/turno.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Aplicamos el middleware a todas las rutas de este archivo
router.use(authMiddleware);

// Ruta para crear un turno
router.post('/', turnoController.crearTurno);

// Ruta para obtener todos los turnos
router.get('/', turnoController.obtenerTurnos);

// Ruta para obtener solo los turnos del usuario logueado
// IMPORTANTE: esta ruta tiene que ir antes que /:id porque si no Express
// interpreta "mis-turnos" como un id y no funciona
router.get('/mis-turnos', turnoController.obtenerMisTurnos);

// Ruta para obtener un turno por id
router.get('/:id', turnoController.obtenerTurnoPorId);

// Ruta para cancelar un turno
router.delete('/:id', turnoController.eliminarTurno);

module.exports = router;
