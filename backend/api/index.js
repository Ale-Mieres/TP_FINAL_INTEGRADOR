require('dotenv').config();
const app = require('../src/app');
const connectDB = require('../src/config/db');

// Conectamos a la base de datos para entorno serverless de Vercel
connectDB();

module.exports = app;
