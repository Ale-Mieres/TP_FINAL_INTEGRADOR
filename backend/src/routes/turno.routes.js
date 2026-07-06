// Rutas para los turnos - todas están protegidas por el middleware de autenticación
const express = require('express');
const router = express.Router();
const turnoController = require('../controllers/turno.controller');
const authMiddleware = require('../middleware/auth.middleware');
const {
  validarCrearTurno,
  validarActualizarTurno,
} = require('../middleware/validation.middleware');

// Aplicamos el middleware a todas las rutas de este archivo
router.use(authMiddleware);

// POST /api/turnos — crea un turno (valida canchaId y fecha)
router.post('/', validarCrearTurno, turnoController.crearTurno);

// GET /api/turnos — obtiene todos los turnos confirmados (agenda pública del club)
router.get('/', turnoController.obtenerTurnos);

// GET /api/turnos/mis-turnos — solo los turnos del usuario logueado
// IMPORTANTE: esta ruta va ANTES de /:id para que Express no interprete "mis-turnos" como un id
router.get('/mis-turnos', turnoController.obtenerMisTurnos);

// GET /api/turnos/:id — detalle de un turno
router.get('/:id', turnoController.obtenerTurnoPorId);

// PUT /api/turnos/:id — edita la fecha/hora de un turno (solo el dueño, valida nueva fecha)
router.put('/:id', validarActualizarTurno, turnoController.actualizarTurno);

// PATCH /api/turnos/:id/pagar — confirma el pago de un turno (solo el dueño)
router.patch('/:id/pagar', turnoController.pagarTurno);

// DELETE /api/turnos/:id — cancela/elimina un turno (solo el dueño)
router.delete('/:id', turnoController.eliminarTurno);

module.exports = router;
