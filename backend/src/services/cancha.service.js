// Servicio de Canchas: lógica de negocio sobre las canchas
const canchaRepository = require('../repositories/cancha.repository');

// Retorna todas las canchas
const obtenerCanchas = async () => {
  return await canchaRepository.findAll();
};

// Retorna una cancha por su ID, lanza error si no existe
const obtenerCanchaPorId = async (id) => {
  const cancha = await canchaRepository.findById(id);
  if (!cancha) {
    const error = new Error('No se encontró la cancha');
    error.statusCode = 404;
    throw error;
  }
  return cancha;
};

// Crea una nueva cancha
const crearCancha = async (data) => {
  return await canchaRepository.create(data);
};

// Actualiza una cancha existente
const actualizarCancha = async (id, data) => {
  const cancha = await canchaRepository.update(id, data);
  if (!cancha) {
    const error = new Error('No se encontró la cancha a actualizar');
    error.statusCode = 404;
    throw error;
  }
  return cancha;
};

// Elimina una cancha
const eliminarCancha = async (id) => {
  const cancha = await canchaRepository.deleteCancha(id);
  if (!cancha) {
    const error = new Error('No se encontró la cancha a eliminar');
    error.statusCode = 404;
    throw error;
  }
};

module.exports = { obtenerCanchas, obtenerCanchaPorId, crearCancha, actualizarCancha, eliminarCancha };
