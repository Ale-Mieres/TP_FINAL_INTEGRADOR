import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import styles from './Auth.module.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener el token de la URL
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Enlace inválido o sin token.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    if (password !== confirmPassword) {
      return setError('Las contraseñas no coinciden');
    }

    if (password.length < 6) {
      return setError('La contraseña debe tener al menos 6 caracteres');
    }

    setCargando(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        token,
        newPassword: password,
      });

      setMensaje(response.data.message || 'Contraseña actualizada correctamente. Serás redirigido al login en breve...');

      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error al restablecer la contraseña');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <div className={styles.logo}>🔐</div>
          <h1 className={styles.authTitle}>Nueva Contraseña</h1>
          <p className={styles.authSubtitle}>
            Ingresá tu nueva contraseña.
          </p>
        </div>
        
        {(!token && !error) && (
          <div className={styles.errorAlert}>
            No se encontró el token de recuperación en la URL.
          </div>
        )}

        {error && <div className={styles.errorAlert}>{error}</div>}
        {mensaje && <div className={styles.successAlert}>{mensaje}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Nueva Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className={styles.input}
              placeholder="Nueva Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>Confirmar Contraseña</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className={styles.input}
              placeholder="Confirmar Contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={cargando || !token || !!mensaje}
            className={styles.submitBtn}
          >
            {cargando ? <span className={styles.spinner}></span> : 'Guardar nueva contraseña'}
          </button>
        </form>
          
        <p className={styles.authSwitch}>
          <Link to="/login" className={styles.authLink}>Volver al Login</Link>
        </p>
      </div>
    </div>
  );
}

export default ResetPassword;
