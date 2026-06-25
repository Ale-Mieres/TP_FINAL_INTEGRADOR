import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import styles from './MisTurnos.module.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const TIPOS_ICONO = { 'Fútbol': '⚽', 'Pádel': '🏸', 'Tenis': '🎾' };

const MisTurnos = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  
  // Estado para la lista de mis turnos
  const [turnos, setTurnos] = useState([]);
  
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [cancelando, setCancelando] = useState(null); // guarda el ID del turno que se está cancelando
  const [mensajeExito, setMensajeExito] = useState('');

  // Función para traer solo los turnos de este usuario desde el backend
  const cargarMisTurnos = async () => {
    setCargando(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE_URL}/turnos/mis-turnos`);
      setTurnos(response.data);
    } catch (err) {
      console.log('Error al traer mis turnos:', err);
      setError(err.response?.data?.error || 'Hubo un problema al cargar tus turnos.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarMisTurnos();
  }, []);

  // Función para cancelar un turno
  const handleCancelar = async (turnoId) => {
    // Le preguntamos al usuario si está seguro usando el confirm del navegador
    if (!window.confirm('¿Estás seguro de que querés cancelar esta reserva?')) return;

    setCancelando(turnoId);
    setMensajeExito('');
    setError('');
    
    try {
      // Mandamos la petición DELETE al backend
      await axios.delete(`${API_BASE_URL}/turnos/${turnoId}`);
      
      setMensajeExito('El turno se canceló correctamente.');
      
      // En vez de volver a pedir todos los turnos al backend, 
      // lo sacamos del array local para que desaparezca al instante
      setTurnos((prevTurnos) => prevTurnos.filter((t) => t._id !== turnoId));
    } catch (err) {
      console.log('Error al cancelar:', err);
      setError(err.response?.data?.error || 'No se pudo cancelar el turno.');
    } finally {
      setCancelando(null);
    }
  };

  // Función de ayuda para que la fecha se lea mejor
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Verifica si un turno ya pasó (para no mostrar el botón de cancelar si ya pasó)
  const esFuturo = (fecha) => {
    return new Date(fecha) > new Date();
  };

  return (
    <div className={styles.layout}>
      <header className={styles.navbar}>
        <div className={styles.navBrand}>🏟️ <span>GestorTurnos</span></div>
        <div className={styles.navUser}>
          <span className={styles.navUserName}>Hola, {usuario?.nombre}</span>
          <button id="btn-ir-dashboard" className={styles.navLink} onClick={() => navigate('/dashboard')}>
            Volver al Dashboard
          </button>
          <button id="btn-logout-misturnos" onClick={logout} className={styles.navLogout}>Cerrar sesión</button>
        </div>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Mis Turnos</h1>
          <p className={styles.pageSubtitle}>Acá podés ver y cancelar tus reservas</p>
        </div>

        {/* Mostramos mensajes al usuario si pasa algo */}
        {mensajeExito && <div className={styles.alertSuccess}>{mensajeExito}</div>}
        {error && <div className={styles.alertError}>{error}</div>}

        {cargando ? (
          <p>Cargando tus turnos...</p>
        ) : turnos.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📅</div>
            <h3>Todavía no tenés turnos</h3>
            <p>Andá al dashboard para hacer tu primera reserva.</p>
            <button
              id="btn-ir-dashboard-empty"
              className={styles.btnPrimary}
              onClick={() => navigate('/dashboard')}
            >
              Ir a reservar
            </button>
          </div>
        ) : (
          <div className={styles.turnosGrid}>
            {turnos.map((turno) => (
              // Si el turno ya pasó, le agregamos una clase CSS para que se vea más opaco
              <div
                key={turno._id}
                className={`${styles.turnoCard} ${!esFuturo(turno.fecha) ? styles.turnoVencido : ''}`}
              >
                <div className={styles.turnoCardHeader}>
                  <span className={styles.turnoIcono}>
                    {TIPOS_ICONO[turno.cancha?.tipo] || '🏟️'}
                  </span>
                  <div className={styles.turnoHeaderInfo}>
                    <h3 className={styles.turnoNombreCancha}>{turno.cancha?.nombre}</h3>
                    <span className={styles.turnoTipo}>{turno.cancha?.tipo}</span>
                  </div>
                  <span className={`${styles.estadoBadge} ${styles[`estado_${turno.estado}`]}`}>
                    {turno.estado}
                  </span>
                </div>

                <div className={styles.turnoBody}>
                  <div className={styles.turnoDetalle}>
                    <span className={styles.turnoDetalleIcon}>📅</span>
                    <span>{formatearFecha(turno.fecha)}</span>
                  </div>
                  <div className={styles.turnoDetalle}>
                    <span className={styles.turnoDetalleIcon}>💰</span>
                    <span>${turno.cancha?.precio || 0}/hr</span>
                  </div>
                  
                  {/* Si el turno ya pasó, le avisamos al usuario */}
                  {!esFuturo(turno.fecha) && (
                    <div className={styles.vencidoBadge}>⏰ El turno ya pasó</div>
                  )}
                </div>

                {/* Solo mostramos el botón de cancelar si el turno es en el futuro y está confirmado */}
                {esFuturo(turno.fecha) && turno.estado === 'confirmado' && (
                  <div className={styles.turnoActions}>
                    <button
                      id={`btn-cancelar-${turno._id}`}
                      className={styles.btnCancelar}
                      onClick={() => handleCancelar(turno._id)}
                      disabled={cancelando === turno._id}
                    >
                      {cancelando === turno._id ? 'Cancelando...' : '🗑️ Cancelar reserva'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MisTurnos;
