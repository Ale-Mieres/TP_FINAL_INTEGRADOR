// Importamos el repositorio que se encarga de las operaciones en la BD
const turnoRepository = require('../repositories/turno.repository');

// Función para crear un nuevo turno
// Antes de crear, verificamos que no haya otro turno en la misma cancha y hora
const crearTurno = async ({ canchaId, usuarioId, fecha }) => {
  const fechaDate = new Date(fecha);

  // Buscamos si ya existe un turno con la misma cancha y fecha
  const turnoExistente = await turnoRepository.findOne({
    cancha: canchaId,
    fecha: fechaDate,
    estado: 'confirmado',
  });

  // Si ya hay un turno, lanzamos un error para que no se guarde
  if (turnoExistente) {
    const error = new Error('Esa cancha ya está reservada para esa fecha y hora');
    error.statusCode = 409;
    throw error;
  }

  // Si no hay solapamiento, creamos el turno
  const turnoNuevo = await turnoRepository.create({
    cancha: canchaId,
    usuario: usuarioId,
    fecha: fechaDate,
    estado: 'confirmado',
  });

  console.log('Turno creado con éxito:', turnoNuevo._id);
  return turnoNuevo;
};

// Trae todos los turnos confirmados
const obtenerTurnos = async () => {
  const turnos = await turnoRepository.find({ estado: 'confirmado' });
  return turnos;
};

// Trae solo los turnos del usuario que está logueado
const obtenerTurnosPorUsuario = async (usuarioId) => {
  const turnos = await turnoRepository.find({ usuario: usuarioId });
  return turnos;
};

// Trae un turno por su id
const obtenerTurnoPorId = async (id) => {
  const turno = await turnoRepository.findById(id);

  if (!turno) {
    const error = new Error('No se encontró el turno');
    error.statusCode = 404;
    throw error;
  }

  return turno;
};

// Elimina un turno, pero solo si le pertenece al usuario que lo pide
const eliminarTurno = async (id, usuarioId) => {
  const turno = await turnoRepository.findById(id);

  if (!turno) {
    const error = new Error('No se encontró el turno');
    error.statusCode = 404;
    throw error;
  }

  // Verificamos que el turno sea del usuario que quiere borrarlo
  if (turno.usuario._id.toString() !== usuarioId.toString()) {
    const error = new Error('No podés cancelar un turno que no es tuyo');
    error.statusCode = 403;
    throw error;
  }

  await turnoRepository.deleteTurno(id);
  console.log('Turno eliminado:', id);
};

module.exports = {
  crearTurno,
  obtenerTurnos,
  obtenerTurnosPorUsuario,
  obtenerTurnoPorId,
  eliminarTurno,
};
