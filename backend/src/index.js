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

  // Después levantamos el servidor
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
};

// Llamamos a la función para arrancar todo
iniciarServidor();
