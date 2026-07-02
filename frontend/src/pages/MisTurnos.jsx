import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import styles from './MisTurnos.module.css';
import dashboardStyles from './Dashboard.module.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const TIPOS_ICONO = { 'Fútbol': '⚽', 'Pádel': '🏸', 'Tenis': '🎾' };

const PAGO_INFO = {
  alias: 'GESTOR.TURNOS.MP',
  cbu: '0000003100000000000000',
  titular: 'Gestor de Turnos SRL',
};

const buildQrUrl = (cancha, turno) => {
  const monto = turno.montoTotal || cancha.precio || 0;
  const dataStr = `cancha:${cancha.nombre}|id:${turno._id}|monto:${monto}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(dataStr)}`;
};

const MisTurnos = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  
  // Estado para la lista de mis turnos
  const [turnos, setTurnos] = useState([]);
  
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [cancelando, setCancelando] = useState(null); // guarda el ID del turno que se está cancelando
  const [mensajeExito, setMensajeExito] = useState('');

  // Estado para el modal de edición
  const [turnoEditando, setTurnoEditando] = useState(null); // turno que se está editando
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [nuevaHora, setNuevaHora] = useState('');
  const [guardando, setGuardando] = useState(false);

  // Estados para el modal de pago
  const [modalPago, setModalPago] = useState(null);
  const [metodoPago, setMetodoPago] = useState('qr');
  const [confirmandoPago, setConfirmandoPago] = useState(false);
  const [pagoConfirmado, setPagoConfirmado] = useState(false);

  const abrirModalPago = (turno) => {
    setModalPago(turno);
    setMetodoPago('qr');
    setPagoConfirmado(false);
  };

  const cerrarModalPago = () => {
    setModalPago(null);
    setConfirmandoPago(false);
    setPagoConfirmado(false);
  };

  const handleConfirmarPago = async () => {
    if (!modalPago) return;
    setConfirmandoPago(true);
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/turnos/${modalPago._id}/pagar`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setPagoConfirmado(true);
      // Actualizamos el turno en la lista
      setTurnos((prev) =>
        prev.map((t) => (t._id === modalPago._id ? response.data : t))
      );
      setMensajeExito('Pago registrado correctamente');
      setTimeout(() => {
        cerrarModalPago();
      }, 3000);
    } catch (err) {
      console.log('Error al confirmar pago:', err);
      setError(err.response?.data?.error || 'No se pudo registrar el pago');
      setConfirmandoPago(false);
    }
  };

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

  // Abre el modal de edición prellenando la fecha y hora actuales del turno
  const handleAbrirEdicion = (turno) => {
    const fechaObj = new Date(turno.fecha);
    const fechaStr = fechaObj.toISOString().split('T')[0]; // YYYY-MM-DD
    const horaStr = `${fechaObj.getHours().toString().padStart(2, '0')}:00`;
    setTurnoEditando(turno);
    setNuevaFecha(fechaStr);
    setNuevaHora(horaStr);
    setMensajeExito('');
    setError('');
  };

  // Cierra el modal de edición
  const handleCerrarEdicion = () => {
    setTurnoEditando(null);
    setNuevaFecha('');
    setNuevaHora('');
  };

  // Guarda los cambios del turno editado (PUT /api/turnos/:id)
  const handleGuardarEdicion = async (e) => {
    e.preventDefault();
    if (!nuevaFecha || !nuevaHora) {
      setError('Seleccioná una fecha y una hora.');
      return;
    }

    const fechaHora = new Date(`${nuevaFecha}T${nuevaHora}:00`);
    if (fechaHora < new Date()) {
      setError('La nueva fecha tiene que ser futura.');
      return;
    }

    setGuardando(true);
    setError('');
    try {
      const response = await axios.put(`${API_BASE_URL}/turnos/${turnoEditando._id}`, {
        fecha: fechaHora.toISOString(),
      });

      // Actualizamos el turno en el estado local sin volver a pedir todo
      setTurnos((prev) =>
        prev.map((t) => (t._id === turnoEditando._id ? response.data : t))
      );
      setMensajeExito('¡Turno actualizado correctamente!');
      handleCerrarEdicion();
    } catch (err) {
      console.log('Error al editar:', err);
      setError(err.response?.data?.error || 'No se pudo actualizar el turno.');
    } finally {
      setGuardando(false);
    }
  };

  // Función para cancelar o eliminar un turno
  const handleEliminar = async (turnoId, esPasado = false) => {
    const mensaje = esPasado 
      ? '¿Estás seguro de que querés eliminar este turno de tu historial?'
      : '¿Estás seguro de que querés cancelar esta reserva?';

    // Le preguntamos al usuario si está seguro usando el confirm del navegador
    if (!window.confirm(mensaje)) return;

    setCancelando(turnoId);
    setMensajeExito('');
    setError('');
    
    try {
      // Mandamos la petición DELETE al backend
      await axios.delete(`${API_BASE_URL}/turnos/${turnoId}`);
      
      setMensajeExito(esPasado ? 'El turno se eliminó del historial.' : 'El turno se canceló correctamente.');
      
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
      hour12: false
    });
  };

  // Verifica si un turno ya pasó (para no mostrar el botón de cancelar si ya pasó)
  const esFuturo = (fecha) => {
    return new Date(fecha) > new Date();
  };

  const hoy = new Date().toISOString().split('T')[0];

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
          <p className={styles.pageSubtitle}>Acá podés ver, editar y cancelar tus reservas</p>
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
                    <span>${(turno.montoTotal || turno.cancha?.precio || 0).toLocaleString('es-AR')}</span>
                  </div>
                  
                  {/* Si el turno ya pasó, le avisamos al usuario */}
                  {!esFuturo(turno.fecha) && (
                    <div className={styles.vencidoBadge}>⏰ El turno ya pasó</div>
                  )}
                </div>

                {/* Solo mostramos acciones si el turno es en el futuro y está confirmado */}
                {esFuturo(turno.fecha) && turno.estado === 'confirmado' && (
                  <div className={styles.turnoActions}>
                    <button
                      id={`btn-editar-${turno._id}`}
                      className={styles.btnEditar}
                      onClick={() => handleAbrirEdicion(turno)}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      id={`btn-cancelar-${turno._id}`}
                      className={styles.btnCancelar}
                      onClick={() => handleEliminar(turno._id, false)}
                      disabled={cancelando === turno._id}
                    >
                      {cancelando === turno._id ? 'Cancelando...' : '🗑️ Cancelar'}
                    </button>
                    {turno.pagado === false && (
                      <button
                        className={styles.btnPagar}
                        onClick={() => abrirModalPago(turno)}
                      >
                        💳 Pagar
                      </button>
                    )}
                  </div>
                )}

                {/* Acciones para turnos pasados */}
                {!esFuturo(turno.fecha) && (
                  <div className={styles.turnoActions}>
                    <button
                      id={`btn-eliminar-historial-${turno._id}`}
                      className={styles.btnCancelar}
                      onClick={() => handleEliminar(turno._id, true)}
                      disabled={cancelando === turno._id}
                      style={{ width: '100%' }}
                    >
                      {cancelando === turno._id ? 'Eliminando...' : '🗑️ Eliminar del historial'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal de edición de turno */}
      {turnoEditando && (
        <div className={styles.modalOverlay} onClick={handleCerrarEdicion}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>✏️ Editar Turno</h2>
            <p className={styles.modalSubtitle}>
              {TIPOS_ICONO[turnoEditando.cancha?.tipo]} {turnoEditando.cancha?.nombre}
            </p>

            <form onSubmit={handleGuardarEdicion} className={styles.editForm}>
              <div className={styles.editField}>
                <label htmlFor="edit-fecha" className={styles.editLabel}>Nueva Fecha</label>
                <input
                  id="edit-fecha"
                  type="date"
                  value={nuevaFecha}
                  min={hoy}
                  onChange={(e) => setNuevaFecha(e.target.value)}
                  className={styles.editInput}
                />
              </div>

              <div className={styles.editField}>
                <label htmlFor="edit-hora" className={styles.editLabel}>Nueva Hora</label>
                <select
                  id="edit-hora"
                  value={nuevaHora}
                  onChange={(e) => setNuevaHora(e.target.value)}
                  className={styles.editSelect}
                >
                  <option value="">-- Seleccionar hora --</option>
                  {Array.from({ length: 16 }, (_, i) => i + 8).map((h) => {
                    const horaStr = `${h.toString().padStart(2, '0')}:00`;
                    const horaYaPaso = nuevaFecha === hoy && h <= new Date().getHours();
                    return (
                      <option key={horaStr} value={horaStr} disabled={horaYaPaso}>
                        {horaStr}{horaYaPaso ? ' (No disponible)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              {error && <div className={styles.alertError}>{error}</div>}

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.btnSecundario}
                  onClick={handleCerrarEdicion}
                >
                  Cancelar
                </button>
                <button
                  id="btn-guardar-edicion"
                  type="submit"
                  className={styles.btnPrimary}
                  disabled={guardando}
                >
                  {guardando ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE PAGO */}
      {modalPago && (
        <div className={dashboardStyles.pagoOverlay} onClick={cerrarModalPago}>
          <div className={dashboardStyles.pagoModal} onClick={(e) => e.stopPropagation()}>
            {pagoConfirmado ? (
              <div className={dashboardStyles.pagoSuccess}>
                <div className={dashboardStyles.pagoSuccessIcon}>✅</div>
                <h2 className={dashboardStyles.pagoSuccessTitle}>¡Pago Confirmado!</h2>
                <p className={dashboardStyles.pagoSuccessDesc}>
                  Tu pago de <strong>${(modalPago.montoTotal || modalPago.cancha?.precio || 0).toLocaleString('es-AR')}</strong> ha sido registrado.
                </p>
              </div>
            ) : (
              <>
                <div className={dashboardStyles.pagoHeader}>
                  <div className={dashboardStyles.pagoHeaderLeft}>
                    <div className={dashboardStyles.pagoMpLogo}>
                      <span className={dashboardStyles.pagoMpDot} style={{ background: '#009ee3' }}></span>
                      <span className={dashboardStyles.pagoMpText}>Mercado Pago</span>
                    </div>
                    <h2 className={dashboardStyles.pagoTitle}>Completar el pago</h2>
                    <p className={dashboardStyles.pagoSubtitle}>
                      {TIPOS_ICONO[modalPago.cancha?.tipo]} {modalPago.cancha?.nombre} • {new Date(modalPago.fecha).toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className={dashboardStyles.pagoMonto}>
                    <span className={dashboardStyles.pagoMontoLabel}>Total a pagar</span>
                    <span className={dashboardStyles.pagoMontoValor}>${(modalPago.montoTotal || modalPago.cancha?.precio || 0).toLocaleString('es-AR')}</span>
                  </div>
                </div>

                <div className={dashboardStyles.pagoTabs}>
                  <button
                    className={`${dashboardStyles.pagoTab} ${metodoPago === 'qr' ? dashboardStyles.pagoTabActive : ''}`}
                    onClick={() => setMetodoPago('qr')}
                  >
                    📱 QR
                  </button>
                  <button
                    className={`${dashboardStyles.pagoTab} ${metodoPago === 'transferencia' ? dashboardStyles.pagoTabActive : ''}`}
                    onClick={() => setMetodoPago('transferencia')}
                  >
                    🏦 Transferencia
                  </button>
                </div>

                {metodoPago === 'qr' && (
                  <div className={dashboardStyles.pagoQrSection}>
                    <p className={dashboardStyles.pagoQrDesc}>
                      Escaneá este código QR con la app de <strong>Mercado Pago</strong> o tu billetera virtual favorita:
                    </p>
                    <div className={dashboardStyles.pagoQrWrapper}>
                      <img
                        src={buildQrUrl(modalPago.cancha, modalPago)}
                        alt="Código QR de Pago"
                        className={dashboardStyles.pagoQrImg}
                        width="200" height="200"
                        loading="lazy"
                      />
                    </div>
                    <p className={dashboardStyles.pagoQrAlias}>
                      Alias: <strong>{PAGO_INFO.alias}</strong>
                    </p>
                  </div>
                )}

                {metodoPago === 'transferencia' && (
                  <div className={dashboardStyles.pagoTransfSection}>
                    <p className={dashboardStyles.pagoTransfDesc}>
                      Transferí el monto exacto a la siguiente cuenta bancaria. Tu reserva se confirmará automáticamente.
                    </p>
                    <div className={dashboardStyles.pagoTransfCard}>
                      <div className={dashboardStyles.pagoTransfRow}>
                        <span className={dashboardStyles.pagoTransfLabel}>CBU/CVU</span>
                        <span className={dashboardStyles.pagoTransfValue}>{PAGO_INFO.cbu}</span>
                      </div>
                      <div className={dashboardStyles.pagoTransfRow}>
                        <span className={dashboardStyles.pagoTransfLabel}>Alias</span>
                        <span className={`${dashboardStyles.pagoTransfValue} ${dashboardStyles.pagoTransfAlias}`}>{PAGO_INFO.alias}</span>
                      </div>
                      <div className={dashboardStyles.pagoTransfRow}>
                        <span className={dashboardStyles.pagoTransfLabel}>Titular</span>
                        <span className={dashboardStyles.pagoTransfValue}>{PAGO_INFO.titular}</span>
                      </div>
                      <div className={dashboardStyles.pagoTransfRow}>
                        <span className={dashboardStyles.pagoTransfLabel}>Monto a transferir</span>
                        <span className={`${dashboardStyles.pagoTransfValue} ${dashboardStyles.pagoTransfMonto}`}>${(modalPago.montoTotal || modalPago.cancha?.precio || 0).toLocaleString('es-AR')}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className={dashboardStyles.pagoActions}>
                  <button
                    className={dashboardStyles.pagoBtnSecundario}
                    onClick={cerrarModalPago}
                    disabled={confirmandoPago}
                  >
                    Pagar después
                  </button>
                  <button
                    className={dashboardStyles.pagoBtn}
                    onClick={handleConfirmarPago}
                    disabled={confirmandoPago}
                  >
                    {confirmandoPago ? 'Procesando...' : '✅ Ya pagué'}
                  </button>
                </div>
                <p className={dashboardStyles.pagoDisclaimer}>
                  Al hacer clic en "Ya pagué" confirmás que realizaste la transferencia o el pago por QR.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MisTurnos;
