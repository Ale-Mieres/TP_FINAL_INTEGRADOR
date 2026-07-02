import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import styles from './AdminDashboard.module.css';

// URL de nuestra API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Emojis para cada tipo de cancha
const TIPOS_ICONO = { 'Fútbol': '⚽', 'Pádel': '🏸', 'Tenis': '🎾' };

// Los tipos disponibles para el filtro
const TIPOS_CANCHA = ['Fútbol', 'Pádel', 'Tenis'];

const AdminDashboard = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  // Estados para las estadísticas
  const [estadisticas, setEstadisticas] = useState(null);
  const [cargandoStats, setCargandoStats] = useState(true);

  // Estados para el filtro de disponibilidad
  const [tipoSeleccionado, setTipoSeleccionado] = useState('');
  const [disponibilidad, setDisponibilidad] = useState(null);
  const [canchasDelTipo, setCanchasDelTipo] = useState([]);
  const [cargandoDisp, setCargandoDisp] = useState(false);

  // Función para cargar las estadísticas del admin
  const cargarEstadisticas = async () => {
    setCargandoStats(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/estadisticas`);
      setEstadisticas(response.data);
    } catch (error) {
      console.log('Error al cargar estadísticas:', error);
    } finally {
      setCargandoStats(false);
    }
  };

  // Función para cargar la disponibilidad filtrada por tipo de cancha
  const cargarDisponibilidad = async (tipo) => {
    if (!tipo) {
      setDisponibilidad(null);
      setCanchasDelTipo([]);
      return;
    }

    setCargandoDisp(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/disponibilidad?tipo=${encodeURIComponent(tipo)}`);
      setDisponibilidad(response.data.disponibilidad);
      setCanchasDelTipo(response.data.canchas);
    } catch (error) {
      console.log('Error al cargar disponibilidad:', error);
    } finally {
      setCargandoDisp(false);
    }
  };

  // Cargamos las estadísticas al montar el componente
  useEffect(() => {
    cargarEstadisticas();
  }, []);

  // Cuando cambia el tipo seleccionado, cargamos la disponibilidad
  const handleTipoChange = (e) => {
    const tipo = e.target.value;
    setTipoSeleccionado(tipo);
    cargarDisponibilidad(tipo);
  };

  // Función para formatear la fecha de los turnos
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className={styles.adminLayout}>
      <header className={styles.navbar}>
        <div className={styles.navBrand}>
          🏟️ <span>GestorTurnos</span>
          <span className={styles.navBrandBadge}>Admin</span>
        </div>
        <div className={styles.navUser}>
          <span className={styles.navUserName}>Hola, {usuario?.nombre}</span>
          <button className={styles.navLink} onClick={() => navigate('/dashboard')}>
            Ir al Dashboard
          </button>
          <button id="btn-logout-admin" onClick={logout} className={styles.navLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Panel de Administración</h1>
          <p className={styles.pageSubtitle}>Gestioná las reservas y la recaudación del sistema</p>
        </div>

        {cargandoStats ? (
          <div className={styles.loadingState}>
            <div className={styles.spinnerLarge}></div>
            <p>Cargando estadísticas...</p>
          </div>
        ) : estadisticas ? (
          <>
            {/* ═══════════════ TARJETAS DE RESUMEN ═══════════════ */}
            <div className={styles.statsGrid}>
              <div className={`${styles.statCard} ${styles.statCardRecaudacion}`}>
                <span className={styles.statIcon}>💰</span>
                <div className={styles.statLabel}>Recaudación Total</div>
                <div className={`${styles.statValue} ${styles.statValueRecaudacion}`}>
                  ${estadisticas.recaudacionTotal.toLocaleString('es-AR')}
                </div>
              </div>

              <div className={`${styles.statCard} ${styles.statCardReservas}`}>
                <span className={styles.statIcon}>📋</span>
                <div className={styles.statLabel}>Total de Reservas</div>
                <div className={`${styles.statValue} ${styles.statValueReservas}`}>
                  {estadisticas.totalReservas}
                </div>
              </div>

              <div className={`${styles.statCard} ${styles.statCardCanchas}`}>
                <span className={styles.statIcon}>🏟️</span>
                <div className={styles.statLabel}>Total de Canchas</div>
                <div className={`${styles.statValue} ${styles.statValueCanchas}`}>
                  {estadisticas.totalCanchas}
                </div>
              </div>
            </div>

            {/* Badges de reservas por tipo */}
            {Object.keys(estadisticas.reservasPorTipo).length > 0 && (
              <div className={styles.tipoBadges}>
                {Object.entries(estadisticas.reservasPorTipo).map(([tipo, count]) => (
                  <div key={tipo} className={styles.tipoBadge}>
                    <span>{TIPOS_ICONO[tipo] || '🏟️'}</span>
                    <span className={styles.tipoBadgeLabel}>{tipo}:</span>
                    <span className={styles.tipoBadgeCount}>{count}</span>
                  </div>
                ))}
              </div>
            )}

            {/* ═══════════════ TABLA DE TODAS LAS RESERVAS ═══════════════ */}
            <section className={styles.section} style={{ marginTop: '40px' }}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionTitleIcon}>📊</span>
                Todas las Reservas del Sistema
              </h2>

              {estadisticas.turnos.length === 0 ? (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>📅</span>
                  <p>Todavía no hay reservas en el sistema.</p>
                </div>
              ) : (
                <div className={styles.turnosTable}>
                  <div className={styles.tableHeader}>
                    <span>Cliente</span>
                    <span>Cancha</span>
                    <span>Tipo</span>
                    <span>Fecha y Hora</span>
                    <span>Estado</span>
                  </div>
                  {estadisticas.turnos.map((turno) => (
                    <div key={turno._id} className={styles.tableRow}>
                      <span>{turno.usuario?.nombre || 'Desconocido'}</span>
                      <span>{turno.cancha?.nombre || 'Desconocida'}</span>
                      <span>
                        {TIPOS_ICONO[turno.cancha?.tipo]} {turno.cancha?.tipo}
                      </span>
                      <span>{formatearFecha(turno.fecha)}</span>
                      <span className={styles.estadoBadge}>{turno.estado}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ═══════════════ FILTRO DE DISPONIBILIDAD ═══════════════ */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionTitleIcon}>🔍</span>
                Disponibilidad por Tipo de Cancha
              </h2>

              <div className={styles.filterBar}>
                <span className={styles.filterLabel}>Filtrar por tipo:</span>
                <select
                  id="select-tipo-cancha"
                  className={styles.filterSelect}
                  value={tipoSeleccionado}
                  onChange={handleTipoChange}
                >
                  <option value="">-- Elegí un tipo --</option>
                  {TIPOS_CANCHA.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {TIPOS_ICONO[tipo]} {tipo}
                    </option>
                  ))}
                </select>
              </div>

              {/* Info de las canchas del tipo seleccionado */}
              {canchasDelTipo.length > 0 && (
                <div className={styles.canchasInfo}>
                  {canchasDelTipo.map((c) => (
                    <span key={c.id} className={styles.canchaChip}>
                      {c.nombre} — ${c.precio}/hr
                    </span>
                  ))}
                </div>
              )}

              {cargandoDisp ? (
                <div className={styles.loadingState}>
                  <div className={styles.spinnerLarge}></div>
                  <p>Cargando disponibilidad...</p>
                </div>
              ) : disponibilidad ? (
                <div className={styles.dispGrid}>
                  {disponibilidad.map((dia) => (
                    <div key={dia.fecha} className={styles.dispDayCard}>
                      <div className={styles.dispDayHeader}>
                        <p className={styles.dispDayName}>{dia.diaSemana}</p>
                        <p className={styles.dispDayDate}>{dia.fecha}</p>
                      </div>
                      <div className={styles.dispSlots}>
                        {dia.horarios.map((slot) => (
                          <span
                            key={`${dia.fecha}-${slot.hora}`}
                            className={`${styles.dispSlot} ${
                              slot.ocupado ? styles.dispSlotOcupado : styles.dispSlotLibre
                            }`}
                            title={
                              slot.ocupado
                                ? `Reservado por: ${slot.turno?.usuario} — ${slot.turno?.cancha}`
                                : 'Horario libre'
                            }
                          >
                            {slot.hora}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>👆</span>
                  <p>Seleccioná un tipo de cancha para ver la disponibilidad de los próximos 7 días.</p>
                </div>
              )}
            </section>
          </>
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>⚠️</span>
            <p>No se pudieron cargar las estadísticas. Verificá la conexión con el servidor.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
