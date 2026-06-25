const mongoose = require('mongoose');

// Schema del usuario con todos los campos que necesitamos
const usuarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true, // el nombre es obligatorio
    },
    email: {
      type: String,
      required: true,
      unique: true, // no puede haber dos usuarios con el mismo email
    },
    password: {
      type: String,
      required: true,
    },
    // Este campo indica si el usuario verificó su cuenta por email
    isVerified: {
      type: Boolean,
      default: false, // por defecto la cuenta NO está verificada
    },
    // Guardamos el token que mandamos al email para verificar la cuenta
    verificationToken: {
      type: String,
    },
  },
  { timestamps: true } // agrega createdAt y updatedAt automaticamente
);

// Exportamos el modelo para usarlo en otros archivos
module.exports = mongoose.model('Usuario', usuarioSchema);
