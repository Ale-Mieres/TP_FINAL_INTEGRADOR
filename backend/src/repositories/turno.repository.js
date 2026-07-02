// Importamos los modelos para hacer las operaciones en la base de datos
const Turno = require('../models/Turno');
require('../models/Cancha'); // Necesario para que mongoose registre el modelo antes de poblar

// Crea un nuevo turno en la base de datos
const create = async (data) => {
  const nuevoTurno = new Turno(data);
  await nuevoTurno.save();

  // Populamos los datos de cancha y usuario para devolver la info completa
  await nuevoTurno.populate('cancha');
  await nuevoTurno.populate('usuario', 'nombre email');

  return nuevoTurno;
};

// Busca todos los turnos según un filtro (o todos si no se pasa filtro)
const find = async (filtro = {}) => {
  const turnos = await Turno.find(filtro)
    .populate('cancha')
    .populate('usuario', 'nombre email')
    .sort({ fecha: 1 }); // ordenados por fecha de más antiguo a más nuevo
  return turnos;
};

// Busca un turno por su ID
const findById = async (id) => {
  const turno = await Turno.findById(id)
    .populate('cancha')
    .populate('usuario', 'nombre email');
  return turno;
};

// Busca un solo turno que coincida con el filtro (sirve para verificar solapamiento)
const findOne = async (filtro) => {
  const turno = await Turno.findOne(filtro)
    .populate('cancha')
    .populate('usuario', 'nombre email');
  return turno;
};

// Actualiza los datos de un turno por su ID
const update = async (id, data) => {
  const turnoActualizado = await Turno.findByIdAndUpdate(id, data, { new: true })
    .populate('cancha')
    .populate('usuario', 'nombre email');
  return turnoActualizado;
};

// Elimina un turno por su ID
const deleteTurno = async (id) => {
  const resultado = await Turno.findByIdAndDelete(id);
  return resultado;
};

// Marca un turno como pagado
const marcarPagado = async (id) => {
  return await Turno.findByIdAndUpdate(
    id,
    { pagado: true, pagoFecha: new Date() },
    { new: true }
  )
    .populate('cancha')
    .populate('usuario', 'nombre email');
};

module.exports = { create, find, findById, findOne, update, deleteTurno, marcarPagado };

