// Servicio de Administración: lógica de negocio para el panel de administrador
const Turno = require('../models/Turno');
const Cancha = require('../models/Cancha');

// Calcula y devuelve las estadísticas generales del sistema
const obtenerEstadisticas = async () => {
  const turnos = await Turno.find({ estado: 'confirmado' })
    .populate('cancha')
    .populate('usuario', 'nombre email')
    .sort({ fecha: -1 });

  const recaudacionTotal = turnos.reduce((total, turno) => {
    return total + (turno.montoTotal || turno.cancha?.precio || 0);
  }, 0);

  const reservasPorTipo = {};
  turnos.forEach((turno) => {
    const tipo = turno.cancha?.tipo || 'Desconocido';
    reservasPorTipo[tipo] = (reservasPorTipo[tipo] || 0) + 1;
  });

  const totalCanchas = await Cancha.countDocuments();

  return { recaudacionTotal, totalReservas: turnos.length, reservasPorTipo, turnos, totalCanchas };
};

// Devuelve la disponibilidad de canchas de un tipo dado para los próximos 7 días
const obtenerDisponibilidad = async (tipo) => {
  const canchas = await Cancha.find({ tipo });

  if (canchas.length === 0) {
    const error = new Error(`No se encontraron canchas de tipo "${tipo}"`);
    error.statusCode = 404;
    throw error;
  }

  const canchaIds = canchas.map((c) => c._id);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const finRango = new Date(hoy);
  finRango.setDate(finRango.getDate() + 7);

  const turnosOcupados = await Turno.find({
    cancha: { $in: canchaIds },
    estado: 'confirmado',
    fecha: { $gte: hoy, $lt: finRango },
  })
    .populate('cancha')
    .populate('usuario', 'nombre email')
    .sort({ fecha: 1 });

  const horasPosibles = Array.from({ length: 16 }, (_, i) => i + 8);

  const disponibilidad = [];
  for (let d = 0; d < 7; d++) {
    const dia = new Date(hoy);
    dia.setDate(dia.getDate() + d);
    const diaStr = dia.toISOString().split('T')[0];

    const horarios = horasPosibles.map((h) => {
      const turnoEncontrado = turnosOcupados.find((t) => {
        const fechaTurno = new Date(t.fecha);
        return (
          fechaTurno.toISOString().split('T')[0] === diaStr &&
          fechaTurno.getHours() === h
        );
      });

      return {
        hora: `${h.toString().padStart(2, '0')}:00`,
        ocupado: !!turnoEncontrado,
        turno: turnoEncontrado
          ? {
              usuario: turnoEncontrado.usuario?.nombre || 'Desconocido',
              cancha: turnoEncontrado.cancha?.nombre || 'Desconocida',
            }
          : null,
      };
    });

    disponibilidad.push({
      fecha: diaStr,
      diaSemana: dia.toLocaleDateString('es-AR', { weekday: 'long' }),
      horarios,
    });
  }

  return {
    tipo,
    canchas: canchas.map((c) => ({ id: c._id, nombre: c.nombre, precio: c.precio })),
    disponibilidad,
  };
};

module.exports = { obtenerEstadisticas, obtenerDisponibilidad };
