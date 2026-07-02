import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from './Auth.module.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';


function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');
    setCargando(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
      setMensaje(response.data.message || 'Te enviamos un correo con las instrucciones');
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Ocurrió un error al intentar enviar el correo');
    } finally {
      setCargando(false);
    }

  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <div className={styles.logoWrapper}>
            <svg viewBox="0 0 64 64" width="56" height="56" xmlns="http://www.w3.org/2000/svg">
              <g stroke="#cbd5e1" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 44c0-8.8 8.9-16 20-16s20 7.2 20 16v8H12v-8z" fill="rgba(255,255,255,0.05)"/>
                <path d="M22 44c0-5.5 4.5-10 10-10s10 4.5 10 10v8H22v-8z" fill="#eef2ff" stroke="#334155"/>
                <path d="M28 52v-6c0-2.2 1.8-4 4-4s4 1.8 4 4v6" fill="#0b0f19" stroke="#334155"/>
                <path d="M32 16v12M20 22v10M44 22v10" stroke="#cbd5e1"/>
                <path d="M32 16l6 3-6 3v-6z" fill="#6366f1" stroke="#6366f1"/>
                <path d="M20 22l5 2.5-5 2.5v-5zM44 22l5 2.5-5 2.5v-5z" fill="#94a3b8" stroke="#94a3b8"/>
                <path d="M8 52h48M16 38h0M48 38h0" stroke="#cbd5e1"/>
              </g>
            </svg>
          </div>
          <h1 className={styles.authTitle}>Recuperar Contraseña</h1>
          <p className={styles.authSubtitle}>
            Ingresá tu email y te enviaremos un link para restablecerla.
          </p>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}
        {mensaje && <div className={styles.successAlert}>{mensaje}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
              placeholder="juan@ejemplo.com"
            />
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={cargando}
          >
            {cargando ? <span className={styles.spinner}></span> : 'Enviar link de recuperación'}
          </button>
        </form>

        <p className={styles.authSwitch}>
          <Link to="/login" className={styles.authLink}>Volver al Login</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
