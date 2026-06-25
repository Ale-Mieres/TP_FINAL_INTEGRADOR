const mongoose = require('mongoose');

// Schema para las canchas deportivas
const canchaSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
    },
    // El tipo solo puede ser uno de estos tres valores
    tipo: {
      type: String,
      enum: ['Fútbol', 'Pádel', 'Tenis'],
      required: true,
    },
    precio: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cancha', canchaSchema);
