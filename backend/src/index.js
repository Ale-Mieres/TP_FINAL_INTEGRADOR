// Cargamos las variables de entorno del archivo .env
require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

// Usamos el puerto del .env o el 3001 si no está definido
const PORT = process.env.PORT || 3001;

// Función principal que conecta la BD y levanta el servidor
const iniciarServidor = async () => {
  // Primero conectamos a MongoDB
  await connectDB();

  // Sembramos las canchas y el usuario admin si no existen
  try {
    const Cancha = require('./models/Cancha');
    const Usuario = require('./models/Usuario');
    const bcrypt = require('bcryptjs');

    // Sembramos las canchas si no existen
    const canchasCount = await Cancha.countDocuments();
    if (canchasCount === 0) {
      await Cancha.insertMany([
        { _id: '64a2f8b9d3b14a2c9f1a2b3c', nombre: 'Cancha Central', tipo: 'Fútbol', precio: 2500 },
        { _id: '64a2f8b9d3b14a2c9f1a2b3d', nombre: 'Cancha Norte', tipo: 'Pádel', precio: 1800 },
        { _id: '64a2f8b9d3b14a2c9f1a2b3e', nombre: 'Cancha Sur', tipo: 'Tenis', precio: 2000 },
        { _id: '64a2f8b9d3b14a2c9f1a2b3f', nombre: 'Cancha Este', tipo: 'Fútbol', precio: 3000 },
      ]);
      console.log('Canchas sembradas correctamente en la base de datos.');
    }

    // Sembramos el usuario admin si no existe
    const adminExistente = await Usuario.findOne({ email: 'admin@gestorturnos.com' });
    if (!adminExistente) {
      const salt = await bcrypt.genSalt(10);
      const passwordHasheada = await bcrypt.hash('Admin123!', salt);
      await Usuario.create({
        nombre: 'Administrador',
        email: 'admin@gestorturnos.com',
        password: passwordHasheada,
        rol: 'admin',
        isVerified: true, // el admin no necesita verificar su email
      });
      console.log('Usuario administrador creado: admin@gestorturnos.com / Admin123!');
    }
  } catch (err) {
    console.log('Error sembrando la base de datos:', err.message);
  }

  // Después levantamos el servidor
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
};

// Llamamos a la función para arrancar todo
iniciarServidor();
