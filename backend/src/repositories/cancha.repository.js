// Repositorio de Canchas: única capa que toca la base de datos
const Cancha = require('../models/Cancha');

// Retorna todas las canchas
const findAll = async () => {
  return await Cancha.find().sort({ nombre: 1 });
};

// Retorna una cancha por su ID
const findById = async (id) => {
  return await Cancha.findById(id);
};

// Crea una nueva cancha
const create = async (data) => {
  const cancha = new Cancha(data);
  await cancha.save();
  return cancha;
};

// Actualiza una cancha por su ID
const update = async (id, data) => {
  return await Cancha.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

// Elimina una cancha por su ID
const deleteCancha = async (id) => {
  return await Cancha.findByIdAndDelete(id);
};

module.exports = { findAll, findById, create, update, deleteCancha };
