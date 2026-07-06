// Servicio de Administración: lógica de negocio para el panel de administrador
// Usa los repositories en lugar de acceder directamente a los modelos,
// centralizando las consultas y evitando duplicación de populate/filtros
const turnoRepository = require('../repositories/turno.repository');
const canchaRepository = require('../repositories/cancha.repository');

// Calcula y devuelve las estadísticas generales del sistema
const obtenerEstadisticas = async () => {
  // Traemos todos los turnos usando el repository (ya incluye populate de cancha y usuario)
  const turnos = await turnoRepository.find({}, { sort: { fecha: -1 } });

  // Para la recaudación y las estadísticas, solo contamos los confirmados
  const turnosConfirmados = turnos.filter(turno => turno.estado === 'confirmado');

  const recaudacionTotal = turnosConfirmados.reduce((total, turno) => {
    return total + (turno.montoTotal || turno.cancha?.precio || 0);
  }, 0);

  const reservasPorTipo = {};
  turnosConfirmados.forEach((turno) => {
    const tipo = turno.cancha?.tipo || 'Desconocido';
    reservasPorTipo[tipo] = (reservasPorTipo[tipo] || 0) + 1;
  });

  const totalCanchas = await canchaRepository.count();

  return { 
    recaudacionTotal, 
    totalReservas: turnosConfirmados.length, 
    reservasPorTipo, 
    turnos, // Enviamos todos los turnos para la tabla
    totalCanchas 
  };
};

// Devuelve la disponibilidad de canchas de un tipo dado para los próximos 7 días
const obtenerDisponibilidad = async (tipo) => {
  const canchas = await canchaRepository.findByFilter({ tipo });

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

  // Usamos el método del repository en lugar de consultar directamente el modelo
  const turnosOcupados = await turnoRepository.findByFechaRangoYCanchas(canchaIds, hoy, finRango);

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
