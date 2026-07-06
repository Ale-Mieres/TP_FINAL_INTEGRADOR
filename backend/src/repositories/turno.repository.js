// Importamos los modelos para hacer las operaciones en la base de datos
const Turno = require('../models/Turno');
require('../models/Cancha'); // Necesario para que mongoose registre el modelo antes de poblar

// Función reutilizable para aplicar populate estándar a una query de turno
// Centraliza el patrón de populate que se repite en todas las consultas
const populateTurno = (query) => {
  return query
    .populate('cancha')
    .populate('usuario', 'nombre email');
};

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
const find = async (filtro = {}, opciones = {}) => {
  const { sort = { fecha: 1 } } = opciones;
  const query = Turno.find(filtro).sort(sort);
  return await populateTurno(query);
};

// Busca un turno por su ID
const findById = async (id) => {
  const query = Turno.findById(id);
  return await populateTurno(query);
};

// Busca un solo turno que coincida con el filtro (sirve para verificar solapamiento)
const findOne = async (filtro) => {
  const query = Turno.findOne(filtro);
  return await populateTurno(query);
};

// Actualiza los datos de un turno por su ID
const update = async (id, data) => {
  const query = Turno.findByIdAndUpdate(id, data, { new: true });
  return await populateTurno(query);
};

// Elimina un turno por su ID
const deleteTurno = async (id) => {
  const resultado = await Turno.findByIdAndDelete(id);
  return resultado;
};

// Marca un turno como pagado
const marcarPagado = async (id) => {
  const query = Turno.findByIdAndUpdate(
    id,
    { pagado: true, pagoFecha: new Date() },
    { new: true }
  );
  return await populateTurno(query);
};

// Busca turnos dentro de un rango de fechas para canchas específicas
// Se usa en el admin para calcular disponibilidad sin duplicar consultas
const findByFechaRangoYCanchas = async (canchaIds, fechaDesde, fechaHasta) => {
  const query = Turno.find({
    cancha: { $in: canchaIds },
    estado: 'confirmado',
    fecha: { $gte: fechaDesde, $lt: fechaHasta },
  }).sort({ fecha: 1 });

  return await populateTurno(query);
};

module.exports = { create, find, findById, findOne, update, deleteTurno, marcarPagado, findByFechaRangoYCanchas };
