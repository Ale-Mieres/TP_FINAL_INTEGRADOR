// Middleware de validación de input: centraliza las validaciones de campos requeridos
// para mantener los controllers limpios y enfocados solo en request/response.

// Función genérica que genera un middleware de validación a partir de reglas
// Cada regla define: campo (nombre), origen (body/query/params) y mensaje de error personalizado
const validar = (reglas) => {
  return (req, res, next) => {
    const errores = [];

    for (const regla of reglas) {
      const { campo, origen = 'body', mensaje } = regla;
      const valor = req[origen]?.[campo];

      // Si el valor es undefined, null o string vacío, lo consideramos faltante
      if (valor === undefined || valor === null || valor === '') {
        errores.push(mensaje || `El campo "${campo}" es obligatorio`);
      }
    }

    // Si hay errores, respondemos con 400 y la lista de errores
    if (errores.length > 0) {
      return res.status(400).json({ error: errores.join('. ') });
    }

    // Si todo está bien, pasamos al siguiente middleware/controller
    next();
  };
};

// ==================== VALIDACIONES DE AUTH ====================

// POST /api/auth/register — nombre, email y password obligatorios
const validarRegistro = validar([
  { campo: 'nombre', mensaje: 'El nombre es obligatorio' },
  { campo: 'email', mensaje: 'El email es obligatorio' },
  { campo: 'password', mensaje: 'La contraseña es obligatoria' },
]);

// POST /api/auth/login — email y password obligatorios
const validarLogin = validar([
  { campo: 'email', mensaje: 'El email es obligatorio' },
  { campo: 'password', mensaje: 'La contraseña es obligatoria' },
]);

// POST /api/auth/forgot-password — email obligatorio
const validarForgotPassword = validar([
  { campo: 'email', mensaje: 'El email es obligatorio' },
]);

// POST /api/auth/reset-password — token y nueva contraseña obligatorios
const validarResetPassword = validar([
  { campo: 'token', mensaje: 'El token es obligatorio' },
  { campo: 'newPassword', mensaje: 'La nueva contraseña es obligatoria' },
]);

// ==================== VALIDACIONES DE TURNOS ====================

// POST /api/turnos — canchaId y fecha obligatorios
const validarCrearTurno = validar([
  { campo: 'canchaId', mensaje: 'El campo "canchaId" es obligatorio' },
  { campo: 'fecha', mensaje: 'El campo "fecha" es obligatorio' },
]);

// PUT /api/turnos/:id — fecha obligatoria para actualizar
const validarActualizarTurno = validar([
  { campo: 'fecha', mensaje: 'La nueva fecha es obligatoria' },
]);

// ==================== VALIDACIONES DE CANCHAS ====================

// POST /api/canchas — nombre, tipo y precio obligatorios
const validarCrearCancha = validar([
  { campo: 'nombre', mensaje: 'El nombre es obligatorio' },
  { campo: 'tipo', mensaje: 'El tipo es obligatorio' },
  { campo: 'precio', mensaje: 'El precio es obligatorio' },
]);

// ==================== VALIDACIONES DE ADMIN ====================

// GET /api/admin/disponibilidad?tipo=... — tipo obligatorio en query
const validarDisponibilidad = validar([
  { campo: 'tipo', origen: 'query', mensaje: 'El parámetro "tipo" es obligatorio' },
]);

module.exports = {
  validar,
  validarRegistro,
  validarLogin,
  validarForgotPassword,
  validarResetPassword,
  validarCrearTurno,
  validarActualizarTurno,
  validarCrearCancha,
  validarDisponibilidad,
};
