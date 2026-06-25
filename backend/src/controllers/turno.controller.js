// Importamos el servicio que tiene la lógica de los turnos
const turnoService = require('../services/turno.service');

// Controlador para crear un turno
const crearTurno = async (req, res, next) => {
  try {
    const { canchaId, fecha } = req.body;
    const usuarioId = req.user._id; // el usuario viene del middleware de auth

    // Validamos que vengan los datos necesarios
    if (!canchaId || !fecha) {
      return res.status(400).json({ error: 'Faltan datos: canchaId y fecha son obligatorios' });
    }

    const turno = await turnoService.crearTurno({ canchaId, usuarioId, fecha });
    res.status(201).json(turno);
  } catch (error) {
    next(error); // mandamos el error al middleware de errores
  }
};

// Controlador para obtener todos los turnos
const obtenerTurnos = async (req, res, next) => {
  try {
    const turnos = await turnoService.obtenerTurnos();
    res.status(200).json(turnos);
  } catch (error) {
    next(error);
  }
};

// Controlador para obtener solo los turnos del usuario logueado
const obtenerMisTurnos = async (req, res, next) => {
  try {
    const usuarioId = req.user._id;
    const turnos = await turnoService.obtenerTurnosPorUsuario(usuarioId);
    res.status(200).json(turnos);
  } catch (error) {
    next(error);
  }
};

// Controlador para obtener un turno específico por su id
const obtenerTurnoPorId = async (req, res, next) => {
  try {
    const turno = await turnoService.obtenerTurnoPorId(req.params.id);
    res.status(200).json(turno);
  } catch (error) {
    next(error);
  }
};

// Controlador para eliminar (cancelar) un turno
const eliminarTurno = async (req, res, next) => {
  try {
    const usuarioId = req.user._id;
    await turnoService.eliminarTurno(req.params.id, usuarioId);
    res.status(200).json({ message: 'Turno cancelado correctamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  crearTurno,
  obtenerTurnos,
  obtenerMisTurnos,
  obtenerTurnoPorId,
  eliminarTurno,
};
