import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import styles from './Dashboard.module.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const TIPOS_ICONO = { 'Fútbol': '⚽', 'Pádel': '🏸', 'Tenis': '🎾' };

// Datos de pago estilo MercadoPago (simulados para el proyecto)
const PAGO_INFO = {
  alias: 'GESTOR.TURNOS.MP',
  cbu: '0000003100014052345238',
  titular: 'Gestor de Turnos S.A.',
  banco: 'Banco Mercado Pago',
};

// Bebidas disponibles para sumar a la reserva
const BEBIDAS_DISPONIBLES = [
  { id: 'coca', nombre: 'Coca Cola', precio: 1500, icono: '🥤' },
  { id: 'levite', nombre: 'Levite', precio: 1200, icono: '🧃' },
  { id: 'cerveza-botella', nombre: 'Cerveza (Botella)', precio: 3000, icono: '🍺' },
  { id: 'cerveza-lata', nombre: 'Cerveza (Lata)', precio: 1800, icono: '🥫' }
];

// Construye la URL del QR usando el servicio gratuito de qrserver.com
const buildQrUrl = (turno, cancha) => {
  const monto = turno.montoTotal || cancha?.precio || 0;
  const data = `Pago Gestor de Turnos\nCancha: ${cancha?.nombre}\nFecha: ${new Date(turno.fecha).toLocaleString('es-AR')}\nMonto: $${monto}\nAlias: ${PAGO_INFO.alias}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}&bgcolor=13131f&color=818cf8&margin=10`;
};

const Dashboard = () => {
  const { usuario, logout, esAdmin } = useAuth();

  const [canchas, setCanchas] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [canchaSeleccionada, setCanchaSeleccionada] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [bebidasSeleccionadas, setBebidasSeleccionadas] = useState({});
  const [cargandoCanchas, setCargandoCanchas] = useState(true);
  const [cargandoTurnos, setCargandoTurnos] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [mensajeForm, setMensajeForm] = useState({ tipo: '', texto: '' });

  // Estado del modal de pago
  const [modalPago, setModalPago] = useState(null); // { turno, cancha }
  const [metodoPago, setMetodoPago] = useState('qr'); // 'qr' | 'transferencia'
  const [confirmandoPago, setConfirmandoPago] = useState(false);
  const [pagoConfirmado, setPagoConfirmado] = useState(false);

  // Calcula el total de las bebidas
  const getTotalBebidas = () => {
    return Object.entries(bebidasSeleccionadas).reduce((total, [id, cant]) => {
      const bebida = BEBIDAS_DISPONIBLES.find(b => b.id === id);
      return total + (bebida.precio * cant);
    }, 0);
  };

  // Maneja sumar o restar bebidas
  const cambiarCantidadBebida = (id, incremento) => {
    setBebidasSeleccionadas(prev => {
      const actual = prev[id] || 0;
      const nuevo = actual + incremento;
      if (nuevo <= 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: nuevo };
    });
  };

  const cargarCanchas = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/canchas`);
      setCanchas(response.data);
    } catch (error) {
      console.log('Error al cargar canchas', error);
    } finally {
      setCargandoCanchas(false);
    }
  };

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

  useEffect(() => {
    cargarCanchas();
    cargarTurnos();
  }, []);

  const handleReservar = async (e) => {
    e.preventDefault();
    setMensajeForm({ tipo: '', texto: '' });

    if (!canchaSeleccionada || !fecha || !hora) {
      setMensajeForm({ tipo: 'error', texto: 'Por favor completá la cancha, la fecha y la hora.' });
      return;
    }

    const fechaHora = new Date(`${fecha}T${hora}:00`);
    if (fechaHora < new Date()) {
      setMensajeForm({ tipo: 'error', texto: 'La reserva tiene que ser para una fecha futura.' });
      return;
    }

    setEnviando(true);
    try {
      const canchaData = canchas.find((c) => c._id === canchaSeleccionada);
      const bebidasArray = Object.entries(bebidasSeleccionadas).map(([id, cantidad]) => {
        const bebida = BEBIDAS_DISPONIBLES.find(b => b.id === id);
        return { nombre: bebida.nombre, cantidad, subtotal: bebida.precio * cantidad };
      });
      const montoTotal = (canchaData?.precio || 0) + getTotalBebidas();

      const response = await axios.post(`${API_BASE_URL}/turnos`, {
        canchaId: canchaSeleccionada,
        fecha: fechaHora.toISOString(),
        bebidas: bebidasArray,
        montoTotal
      });

      // Limpiamos formulario
      setCanchaSeleccionada('');
      setFecha('');
      setHora('');
      setBebidasSeleccionadas({});
      cargarTurnos();

      // Abrimos el modal de pago con los datos del turno recién creado
      setPagoConfirmado(false);
      setMetodoPago('qr');
      setModalPago({ turno: response.data, cancha: canchaData });
    } catch (error) {
      setMensajeForm({
        tipo: 'error',
        texto: error.response?.data?.error || 'Hubo un error al guardar el turno.',
      });
    } finally {
      setEnviando(false);
    }
  };

  // Cuando el usuario hace clic en "Ya pagué" en el modal
  const handleConfirmarPago = async () => {
    if (!modalPago) return;
    setConfirmandoPago(true);
    try {
      const response = await axios.patch(`${API_BASE_URL}/turnos/${modalPago.turno._id}/pagar`);
      // Actualizamos el turno en el estado local
      setTurnos((prev) =>
        prev.map((t) => (t._id === response.data._id ? response.data : t))
      );
      setPagoConfirmado(true);
    } catch (error) {
      console.log('Error al confirmar pago:', error);
    } finally {
      setConfirmandoPago(false);
    }
  };

  const cerrarModal = () => {
    setModalPago(null);
    setPagoConfirmado(false);
    setMetodoPago('qr');
  };

  const abrirModalDePagoAux = (turno) => {
    setPagoConfirmado(false);
    setMetodoPago('qr');
    setModalPago({ turno, cancha: turno.cancha });
  };

  const hoy = new Date().toISOString().split('T')[0];

  return (
    <div className={styles.dashboardLayout}>
      <header className={styles.navbar}>
        <div className={styles.navBrand}>🏟️ <span>GestorTurnos</span></div>
        <div className={styles.navUser}>
          <span className={styles.navUserName}>Hola, {usuario?.nombre}</span>
          {esAdmin && (
            <a href="/admin" className={styles.navLink} style={{ color: '#f59e0b' }}>🛡️ Panel Admin</a>
          )}
          <a href="/mis-turnos" className={styles.navLink}>Mis Turnos</a>
          <button id="btn-logout" onClick={logout} className={styles.navLogout}>Cerrar sesión</button>
        </div>
      </header>

      <main className={styles.mainContent}>
        <section className={styles.sectionHeader}>
          <h1 className={styles.pageTitle}>Panel Principal</h1>
          <p className={styles.pageSubtitle}>Elegí una cancha y hacé tu reserva</p>
        </section>

        {/* Canchas Disponibles */}
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

        {/* Formulario de Reserva */}
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
                min={hoy}
                onChange={(e) => setFecha(e.target.value)}
                className={styles.reservaInput}
              />
            </div>

            <div className={styles.reservaField}>
              <label htmlFor="input-hora" className={styles.reservaLabel}>Hora</label>
              <select
                id="input-hora"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className={styles.reservaSelect}
              >
                <option value="">-- Seleccionar hora --</option>
                {Array.from({ length: 16 }, (_, i) => i + 8).map((h) => {
                  const horaStr = `${h.toString().padStart(2, '0')}:00`;
                  const horaYaPaso = fecha === hoy && h <= new Date().getHours();
                  return (
                    <option key={horaStr} value={horaStr} disabled={horaYaPaso}>
                      {horaStr} {horaYaPaso ? '(No disponible)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: '16px' }}>
              <label className={styles.reservaLabel} style={{ marginBottom: '12px', display: 'block' }}>¿Querés sumar algo para tomar? (Opcional)</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
                {BEBIDAS_DISPONIBLES.map(bebida => (
                  <div key={bebida.id} style={{
                    background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{bebida.icono}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#f1f5f9' }}>{bebida.nombre}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '12px' }}>${bebida.precio}</div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '4px' }}>
                      <button type="button" onClick={() => cambiarCantidadBebida(bebida.id, -1)} style={{ background: 'none', border: 'none', color: '#f87171', fontSize: '1.1rem', cursor: 'pointer', padding: '0 8px' }}>-</button>
                      <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#fff' }}>{bebidasSeleccionadas[bebida.id] || 0}</span>
                      <button type="button" onClick={() => cambiarCantidadBebida(bebida.id, 1)} style={{ background: 'none', border: 'none', color: '#4ade80', fontSize: '1.1rem', cursor: 'pointer', padding: '0 8px' }}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button id="btn-reservar" type="submit" className={styles.reservaBtn} disabled={enviando || !canchaSeleccionada} style={{ gridColumn: '1 / -1', marginTop: '16px' }}>
              {enviando ? 'Reservando...' : `🏟️ Reservar ahora ($${(canchas.find(c => c._id === canchaSeleccionada)?.precio || 0) + getTotalBebidas()})`}
            </button>
          </form>

          {mensajeForm.texto && (
            <div className={mensajeForm.tipo === 'exito' ? styles.alertSuccess : styles.alertError}>
              {mensajeForm.texto}
            </div>
          )}
        </section>

        {/* Agenda de Turnos */}
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
                <span>Pago</span>
              </div>
              {turnos.map((turno) => (
                <div key={turno._id} className={styles.tableRow}>
                  <span>{TIPOS_ICONO[turno.cancha?.tipo]} {turno.cancha?.nombre}</span>
                  <span>{turno.usuario?.nombre}</span>
                  <span>
                    {new Date(turno.fecha).toLocaleDateString('es-AR', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit', hour12: false,
                    })}
                  </span>
                  <span className={styles.estadoBadge}>{turno.estado}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <span className={turno.pagado ? styles.pagoBadgePagado : styles.pagoBadgePendiente}>
                      {turno.pagado ? '✅ Pagado' : '⏳ Pendiente'}
                    </span>
                    {!turno.pagado && turno.usuario?._id === (usuario?.id || usuario?._id) && turno.estado === 'confirmado' && (
                      <button 
                        onClick={() => abrirModalDePagoAux(turno)}
                        style={{
                          background: 'rgba(0, 158, 227, 0.15)', color: '#009ee3', border: '1px solid rgba(0, 158, 227, 0.3)', borderRadius: '6px', padding: '4px 10px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold'
                        }}
                      >
                        💳 Pagar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* ═══════════ MODAL DE PAGO ═══════════ */}
      {modalPago && (
        <div className={styles.pagoOverlay} onClick={cerrarModal}>
          <div className={styles.pagoModal} onClick={(e) => e.stopPropagation()}>

            {pagoConfirmado ? (
              /* ── Pantalla de éxito ── */
              <div className={styles.pagoSuccess}>
                <div className={styles.pagoSuccessIcon}>🎉</div>
                <h2 className={styles.pagoSuccessTitle}>¡Pago registrado!</h2>
                <p className={styles.pagoSuccessDesc}>
                  Tu turno en <strong>{modalPago.cancha?.nombre}</strong> está confirmado y pagado.
                </p>
                <button id="btn-cerrar-pago-ok" className={styles.pagoBtn} onClick={cerrarModal}>
                  Entendido
                </button>
              </div>
            ) : (
              <>
                {/* Cabecera */}
                <div className={styles.pagoHeader}>
                  <div className={styles.pagoHeaderLeft}>
                    <div className={styles.pagoMpLogo}>
                      <span className={styles.pagoMpDot} style={{ background: '#009ee3' }} />
                      <span className={styles.pagoMpDot} style={{ background: '#00d4f5' }} />
                      <span className={styles.pagoMpText}>Mercado Pago</span>
                    </div>
                    <h2 className={styles.pagoTitle}>Completar el pago</h2>
                    <p className={styles.pagoSubtitle}>
                      {TIPOS_ICONO[modalPago.cancha?.tipo]} {modalPago.cancha?.nombre} &bull;{' '}
                      {new Date(modalPago.turno.fecha).toLocaleDateString('es-AR', {
                        weekday: 'long', day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit', hour12: false,
                      })}
                    </p>
                  </div>
                  <div className={styles.pagoMonto}>
                    <span className={styles.pagoMontoLabel}>Total a pagar</span>
                    <span className={styles.pagoMontoValor}>${(modalPago.turno?.montoTotal || modalPago.cancha?.precio || 0).toLocaleString('es-AR')}</span>
                  </div>
                </div>

                {/* Tabs de método */}
                <div className={styles.pagoTabs}>
                  <button
                    id="tab-qr"
                    className={`${styles.pagoTab} ${metodoPago === 'qr' ? styles.pagoTabActive : ''}`}
                    onClick={() => setMetodoPago('qr')}
                  >
                    📱 QR
                  </button>
                  <button
                    id="tab-transferencia"
                    className={`${styles.pagoTab} ${metodoPago === 'transferencia' ? styles.pagoTabActive : ''}`}
                    onClick={() => setMetodoPago('transferencia')}
                  >
                    🏦 Transferencia
                  </button>
                </div>

                {/* Contenido del método seleccionado */}
                {metodoPago === 'qr' ? (
                  <div className={styles.pagoQrSection}>
                    <p className={styles.pagoQrDesc}>
                      Escaneá este código QR con la app de <strong>Mercado Pago</strong>:
                    </p>
                    <div className={styles.pagoQrWrapper}>
                      <img
                        src={buildQrUrl(modalPago.turno, modalPago.cancha)}
                        alt="QR de pago"
                        className={styles.pagoQrImg}
                        width={200}
                        height={200}
                      />
                    </div>
                    <p className={styles.pagoQrAlias}>
                      Alias: <strong>{PAGO_INFO.alias}</strong>
                    </p>
                  </div>
                ) : (
                  <div className={styles.pagoTransfSection}>
                    <p className={styles.pagoTransfDesc}>Realizá la transferencia a estos datos:</p>
                    <div className={styles.pagoTransfCard}>
                      <div className={styles.pagoTransfRow}>
                        <span className={styles.pagoTransfLabel}>Titular</span>
                        <span className={styles.pagoTransfValue}>{PAGO_INFO.titular}</span>
                      </div>
                      <div className={styles.pagoTransfRow}>
                        <span className={styles.pagoTransfLabel}>Banco</span>
                        <span className={styles.pagoTransfValue}>{PAGO_INFO.banco}</span>
                      </div>
                      <div className={styles.pagoTransfRow}>
                        <span className={styles.pagoTransfLabel}>Alias</span>
                        <span className={`${styles.pagoTransfValue} ${styles.pagoTransfAlias}`}>
                          {PAGO_INFO.alias}
                        </span>
                      </div>
                      <div className={styles.pagoTransfRow}>
                        <span className={styles.pagoTransfLabel}>CBU</span>
                        <span className={styles.pagoTransfValue} style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                          {PAGO_INFO.cbu}
                        </span>
                      </div>
                      <div className={styles.pagoTransfRow}>
                        <span className={styles.pagoTransfLabel}>Monto</span>
                        <span className={`${styles.pagoTransfValue} ${styles.pagoTransfMonto}`}>
                          ${(modalPago.turno?.montoTotal || modalPago.cancha?.precio || 0).toLocaleString('es-AR')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Botones de acción */}
                <div className={styles.pagoActions}>
                  <button className={styles.pagoBtnSecundario} onClick={cerrarModal}>
                    Pagar después
                  </button>
                  <button
                    id="btn-confirmar-pago"
                    className={styles.pagoBtn}
                    onClick={handleConfirmarPago}
                    disabled={confirmandoPago}
                  >
                    {confirmandoPago ? 'Procesando...' : '✅ Ya pagué'}
                  </button>
                </div>

                <p className={styles.pagoDisclaimer}>
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

export default Dashboard;
