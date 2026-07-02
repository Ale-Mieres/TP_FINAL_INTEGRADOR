// Controlador de Canchas: maneja request/response, delega la lógica al servicio
const canchaService = require('../services/cancha.service');

// GET /api/canchas — lista todas las canchas
const obtenerCanchas = async (req, res, next) => {
  try {
    const canchas = await canchaService.obtenerCanchas();
    res.status(200).json(canchas);
  } catch (error) {
    next(error);
  }
};

// GET /api/canchas/:id — detalle de una cancha
const obtenerCanchaPorId = async (req, res, next) => {
  try {
    const cancha = await canchaService.obtenerCanchaPorId(req.params.id);
    res.status(200).json(cancha);
  } catch (error) {
    next(error);
  }
};

// POST /api/canchas — crea una nueva cancha (solo admin)
const crearCancha = async (req, res, next) => {
  try {
    const { nombre, tipo, precio } = req.body;
    if (!nombre || !tipo || !precio) {
      return res.status(400).json({ error: 'nombre, tipo y precio son obligatorios' });
    }
    const cancha = await canchaService.crearCancha({ nombre, tipo, precio });
    res.status(201).json(cancha);
  } catch (error) {
    next(error);
  }
};

// PUT /api/canchas/:id — actualiza una cancha (solo admin)
const actualizarCancha = async (req, res, next) => {
  try {
    const { nombre, tipo, precio } = req.body;
    const cancha = await canchaService.actualizarCancha(req.params.id, { nombre, tipo, precio });
    res.status(200).json(cancha);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/canchas/:id — elimina una cancha (solo admin)
const eliminarCancha = async (req, res, next) => {
  try {
    await canchaService.eliminarCancha(req.params.id);
    res.status(200).json({ message: 'Cancha eliminada correctamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = { obtenerCanchas, obtenerCanchaPorId, crearCancha, actualizarCancha, eliminarCancha };
