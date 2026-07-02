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
    // Indica si el usuario ya realizó el pago de este turno
    pagado: {
      type: Boolean,
      default: false,
    },
    // Fecha y hora en que se confirmó el pago
    pagoFecha: {
      type: Date,
      default: null,
    },
    bebidas: [{
      nombre: String,
      cantidad: Number,
      subtotal: Number
    }],
    montoTotal: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Turno', turnoSchema);
