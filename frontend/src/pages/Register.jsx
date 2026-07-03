import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from './Auth.module.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const Register = () => {
  // Estado de cada campo del formulario
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');

  // Para mostrar errores por campo
  const [errores, setErrores] = useState({});

  // Para mostrar un mensaje general de éxito o error
  const [mensajeExito, setMensajeExito] = useState('');
  const [errorGeneral, setErrorGeneral] = useState('');

  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmarPassword, setMostrarConfirmarPassword] = useState(false);

  // Para deshabilitar el botón mientras se procesa
  const [cargando, setCargando] = useState(false);

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio';
    }

    if (!email.trim()) {
      nuevosErrores.email = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      nuevosErrores.email = 'El email no es válido';
    }

    if (!password) {
      nuevosErrores.password = 'La contraseña es obligatoria';
    } else if (password.length < 6) {
      nuevosErrores.password = 'La contraseña tiene que tener al menos 6 caracteres';
    }

    if (password !== confirmarPassword) {
      nuevosErrores.confirmarPassword = 'Las contraseñas no coinciden';
    }

    return nuevosErrores;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorGeneral('');
    setMensajeExito('');

    const erroresEncontrados = validarFormulario();
    if (Object.keys(erroresEncontrados).length > 0) {
      setErrores(erroresEncontrados);
      return;
    }

    setCargando(true);
    try {
      // Mandamos los datos al backend para registrar al usuario
      await axios.post(`${API_BASE_URL}/auth/register`, { nombre, email, password });

      setMensajeExito('¡Te registraste correctamente! Revisá tu correo para verificar la cuenta.');

      // Limpiamos el formulario
      setNombre('');
      setEmail('');
      setPassword('');
      setConfirmarPassword('');
      setErrores({});
    } catch (error) {
      setErrorGeneral(error.response?.data?.error || 'Error al registrarse, intentá de nuevo');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <div className={styles.logoWrapper}>
            <img src="/logo_messi.png" alt="Logo Gestor" style={{ width: 'auto', height: '100px', objectFit: 'contain', filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.3))' }} />
          </div>
          <h1 className={styles.authTitle}>Crear Cuenta</h1>
          <p className={styles.authSubtitle}>Únete al Gestor de Turnos de Canchas</p>
        </div>

        {mensajeExito && <div className={styles.successAlert}>{mensajeExito}</div>}
        {errorGeneral && <div className={styles.errorAlert}>{errorGeneral}</div>}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.formGroup}>
            <label htmlFor="nombre" className={styles.label}>Nombre completo</label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                if (errores.nombre) setErrores({ ...errores, nombre: '' });
              }}
              className={`${styles.input} ${errores.nombre ? styles.inputError : ''}`}
              placeholder="Juan García"
              autoComplete="name"
            />
            {errores.nombre && <span className={styles.fieldError}>{errores.nombre}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email-register" className={styles.label}>Email</label>
            <input
              id="email-register"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errores.email) setErrores({ ...errores, email: '' });
              }}
              className={`${styles.input} ${errores.email ? styles.inputError : ''}`}
              placeholder="juan@ejemplo.com"
              autoComplete="email"
            />
            {errores.email && <span className={styles.fieldError}>{errores.email}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password-register" className={styles.label}>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password-register"
                type={mostrarPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errores.password) setErrores({ ...errores, password: '' });
                }}
                className={`${styles.input} ${errores.password ? styles.inputError : ''}`}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={mostrarPassword ? "Ocultar contraseña" : "Ver contraseña"}
              >
                {mostrarPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                    <line x1="2" y1="2" x2="22" y2="22"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {errores.password && <span className={styles.fieldError}>{errores.password}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmar-password" className={styles.label}>Confirmar contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                id="confirmar-password"
                type={mostrarConfirmarPassword ? "text" : "password"}
                value={confirmarPassword}
                onChange={(e) => {
                  setConfirmarPassword(e.target.value);
                  if (errores.confirmarPassword) setErrores({ ...errores, confirmarPassword: '' });
                }}
                className={`${styles.input} ${errores.confirmarPassword ? styles.inputError : ''}`}
                placeholder="Repetí tu contraseña"
                autoComplete="new-password"
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setMostrarConfirmarPassword(!mostrarConfirmarPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={mostrarConfirmarPassword ? "Ocultar contraseña" : "Ver contraseña"}
              >
                {mostrarConfirmarPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                    <line x1="2" y1="2" x2="22" y2="22"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {errores.confirmarPassword && (
              <span className={styles.fieldError}>{errores.confirmarPassword}</span>
            )}
          </div>

          <button
            id="btn-register-submit"
            type="submit"
            className={styles.submitBtn}
            disabled={cargando}
          >
            {cargando ? <span className={styles.spinner}></span> : 'Crear cuenta'}
          </button>
        </form>

        <p className={styles.authSwitch}>
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className={styles.authLink}>Iniciá sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
