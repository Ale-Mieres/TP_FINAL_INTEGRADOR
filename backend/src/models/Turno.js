const mongoose = require('mongoose');

// Schema para los turnos (reservas)
const turnoSchema = new mongoose.Schema(
  {
    // Referencia a la cancha reservada
    cancha: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cancha',
      required: true,
    },
    // Referencia al usuario que hizo la reserva
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
    },
    fecha: {
      type: Date,
      required: true,
    },
    // El estado por defecto es 'confirmado' cuando se crea el turno
    estado: {
      type: String,
      enum: ['confirmado', 'cancelado', 'pendiente'],
      default: 'confirmado',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Turno', turnoSchema);
