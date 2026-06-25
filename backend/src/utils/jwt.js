// Importamos jsonwebtoken para trabajar con tokens JWT
const jwt = require('jsonwebtoken');

// Función para crear un token JWT con los datos del usuario
// El token dura 4 horas y después expira
const signToken = (payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '4h' });
  return token;
};

// Función para verificar si un token es válido
// Si el token está mal o expiró, lanza un error
const verifyToken = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded;
};

module.exports = { signToken, verifyToken };
