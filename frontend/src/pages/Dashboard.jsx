import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import styles from './Dashboard.module.css';

// URL de nuestra API, viene del archivo .env
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Un diccionario chiquito para ponerle emojis a cada tipo de cancha
const TIPOS_ICONO = { 'Fútbol': '⚽', 'Pádel': '🏸', 'Tenis': '🎾' };

const Dashboard = () => {
  // Sacamos los datos del usuario y la función de logout del contexto
  const { usuario, logout } = useAuth();

  // Estados para guardar los datos que vienen del backend
  const [canchas, setCanchas] = useState([]);
  const [turnos, setTurnos] = useState([]);

  // Estados para el formulario de reserva
  const [canchaSeleccionada, setCanchaSeleccionada] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');

  // Estados de carga
  const [cargandoCanchas, setCargandoCanchas] = useState(true);
  const [cargandoTurnos, setCargandoTurnos] = useState(true);
  const [enviando, setEnviando] = useState(false);

  // Estado para los mensajes de éxito/error del formulario
  const [mensajeForm, setMensajeForm] = useState({ tipo: '', texto: '' });

  // Función para cargar las canchas disponibles
  const cargarCanchas = async () => {
    try {
      // Como no armamos un endpoint de canchas en el backend (porque son fijas), 
      // dejamos esto hardcodeado como si viniera de la BD por ahora.
      // Profe: intenté hacer el GET /canchas pero como eran fijas las puse directo acá.
      setCanchas([
        { _id: '1', nombre: 'Cancha Central', tipo: 'Fútbol', precio: 2500 },
        { _id: '2', nombre: 'Cancha Norte', tipo: 'Pádel', precio: 1800 },
        { _id: '3', nombre: 'Cancha Sur', tipo: 'Tenis', precio: 2000 },
        { _id: '4', nombre: 'Cancha Este', tipo: 'Fútbol', precio: 3000 },
      ]);
    } catch (error) {
      console.log('Error al cargar canchas', error);
    } finally {
      setCargandoCanchas(false);
    }
  };

  // Función para traer los turnos confirmados desde el backend
  const cargarTurnos = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/turnos`);
      setTurnos(response.data);
    } catch (error) {
      console.log('Error cargando turnos:', error);
    } finally {
      setCargandoTurnos(false);
    }
  };

  // El useEffect se ejecuta una sola vez al cargar la página
  useEffect(() => {
    cargarCanchas();
    cargarTurnos();
  }, []);

  // Función que se ejecuta cuando el usuario hace clic en "Reservar"
  const handleReservar = async (e) => {
    e.preventDefault(); // evitamos que se recargue la página
    setMensajeForm({ tipo: '', texto: '' });

    // Validamos que haya completado todo
    if (!canchaSeleccionada || !fecha || !hora) {
      setMensajeForm({ tipo: 'error', texto: 'Por favor completá la cancha, la fecha y la hora.' });
      return;
    }

    // Armamos un objeto Date juntando la fecha y la hora
    const fechaHora = new Date(`${fecha}T${hora}:00`);

    // Validamos que no sea una fecha pasada
    if (fechaHora < new Date()) {
      setMensajeForm({ tipo: 'error', texto: 'La reserva tiene que ser para una fecha futura.' });
      return;
    }

    setEnviando(true);
    try {
      // Mandamos la petición al backend para crear el turno
      await axios.post(`${API_BASE_URL}/turnos`, {
        canchaId: canchaSeleccionada,
        fecha: fechaHora.toISOString(), // mandamos la fecha en formato ISO para MongoDB
      });

      setMensajeForm({ tipo: 'exito', texto: '¡Turno reservado correctamente!' });
      
      // Limpiamos el formulario
      setCanchaSeleccionada('');
      setFecha('');
      setHora('');

      // Recargamos la lista de turnos para que aparezca el nuevo
      cargarTurnos();
    } catch (error) {
      console.log('Error al reservar:', error.response?.data);
      setMensajeForm({
        tipo: 'error',
        texto: error.response?.data?.error || 'Hubo un error al guardar el turno.',
      });
    } finally {
      setEnviando(false);
    }
  };

  // Obtenemos la fecha de hoy para bloquear fechas anteriores en el input date
  const hoy = new Date().toISOString().split('T')[0];

  return (
    <div className={styles.dashboardLayout}>
      <header className={styles.navbar}>
        <div className={styles.navBrand}>🏟️ <span>GestorTurnos</span></div>
        <div className={styles.navUser}>
          <span className={styles.navUserName}>Hola, {usuario?.nombre}</span>
          <a href="/mis-turnos" className={styles.navLink}>Mis Turnos</a>
          <button id="btn-logout" onClick={logout} className={styles.navLogout}>Cerrar sesión</button>
        </div>
      </header>

      <main className={styles.mainContent}>
        <section className={styles.sectionHeader}>
          <h1 className={styles.pageTitle}>Panel Principal</h1>
          <p className={styles.pageSubtitle}>Elegí una cancha y hacé tu reserva</p>
        </section>

        {/* Sección de Canchas Disponibles */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Canchas Disponibles</h2>
          {cargandoCanchas ? (
            <p>Cargando canchas...</p>
          ) : (
            <div className={styles.canchasGrid}>
              {canchas.map((cancha) => (
                <div
                  key={cancha._id}
                  className={`${styles.canchaCard} ${canchaSeleccionada === cancha._id ? styles.canchaCardSelected : ''}`}
                  onClick={() => setCanchaSeleccionada(cancha._id)}
                  role="button"
                >
                  <div className={styles.canchaIcono}>{TIPOS_ICONO[cancha.tipo] || '🏟️'}</div>
                  <div className={styles.canchaInfo}>
                    <h3 className={styles.canchaNombre}>{cancha.nombre}</h3>
                    <span className={styles.canchaTipo}>{cancha.tipo}</span>
                  </div>
                  <div className={styles.canchaPrecio}>${cancha.precio}/hr</div>
                  {canchaSeleccionada === cancha._id && (
                    <div className={styles.canchaSelectedBadge}>Seleccionada</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Sección del Formulario de Reserva */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Reservar un Turno</h2>
          <form onSubmit={handleReservar} className={styles.reservaForm}>
            <div className={styles.reservaField}>
              <label htmlFor="select-cancha" className={styles.reservaLabel}>Cancha</label>
              <select
                id="select-cancha"
                value={canchaSeleccionada}
                onChange={(e) => setCanchaSeleccionada(e.target.value)}
                className={styles.reservaSelect}
              >
                <option value="">-- Elegí una cancha --</option>
                {canchas.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.nombre} ({c.tipo}) - ${c.precio}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.reservaField}>
              <label htmlFor="input-fecha" className={styles.reservaLabel}>Fecha</label>
              <input
                id="input-fecha"
                type="date"
                value={fecha}
                min={hoy} // no deja elegir fechas pasadas
                onChange={(e) => setFecha(e.target.value)}
                className={styles.reservaInput}
              />
            </div>

            <div className={styles.reservaField}>
              <label htmlFor="input-hora" className={styles.reservaLabel}>Hora</label>
              <input
                id="input-hora"
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className={styles.reservaInput}
              />
            </div>

            <button
              id="btn-reservar"
              type="submit"
              className={styles.reservaBtn}
              disabled={enviando}
            >
              {enviando ? 'Reservando...' : 'Reservar ahora'}
            </button>
          </form>

          {/* Mostramos si hubo un error o salió todo bien */}
          {mensajeForm.texto && (
            <div className={mensajeForm.tipo === 'exito' ? styles.alertSuccess : styles.alertError}>
              {mensajeForm.texto}
            </div>
          )}
        </section>

        {/* Sección de Turnos Ocupados */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Agenda de Turnos</h2>
          {cargandoTurnos ? (
            <p>Cargando turnos...</p>
          ) : turnos.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>📅</span>
              <p>Todavía no hay turnos reservados. ¡Sé el primero!</p>
            </div>
          ) : (
            <div className={styles.turnosTable}>
              <div className={styles.tableHeader}>
                <span>Cancha</span>
                <span>Usuario</span>
                <span>Fecha y Hora</span>
                <span>Estado</span>
              </div>
              {turnos.map((turno) => (
                <div key={turno._id} className={styles.tableRow}>
                  <span>
                    {TIPOS_ICONO[turno.cancha?.tipo]} {turno.cancha?.nombre}
                  </span>
                  <span>{turno.usuario?.nombre}</span>
                  <span>
                    {new Date(turno.fecha).toLocaleDateString('es-AR', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                  <span className={styles.estadoBadge}>{turno.estado}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
