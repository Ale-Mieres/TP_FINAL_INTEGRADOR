// Controlador de Administración: maneja request/response, delega lógica al servicio
const adminService = require('../services/admin.service');

// GET /api/admin/estadisticas
const obtenerEstadisticas = async (req, res, next) => {
  try {
    const datos = await adminService.obtenerEstadisticas();
    res.status(200).json(datos);
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/disponibilidad?tipo=Fútbol
const obtenerDisponibilidad = async (req, res, next) => {
  try {
    const { tipo } = req.query;
    if (!tipo) {
      return res.status(400).json({ error: 'El parámetro "tipo" es obligatorio' });
    }
    const datos = await adminService.obtenerDisponibilidad(tipo);
    res.status(200).json(datos);
  } catch (error) {
    next(error);
  }
};

module.exports = { obtenerEstadisticas, obtenerDisponibilidad };
