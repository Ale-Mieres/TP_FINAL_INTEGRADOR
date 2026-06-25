// Importamos mongoose para conectarnos a la base de datos
const mongoose = require('mongoose');
const dns = require('dns');

// Configuramos DNS de Google para evitar errores querySrv con Atlas
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Esta función conecta nuestra app a MongoDB
const connectDB = async () => {
  try {
    // Usamos la variable de entorno MONGO_URI que está en el .env
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log('Conexión a MongoDB exitosa:', conn.connection.host);
  } catch (error) {
    // Si hay un error mostramos el mensaje y cerramos el proceso
    console.log('Error al conectar a MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
