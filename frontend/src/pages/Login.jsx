import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';
import LoadingScreen from '../components/LoadingScreen';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Estado del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [mostrarPassword, setMostrarPassword] = useState(false);

  // Estado para los mensajes de error
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');

  // Estado de carga mientras se hace el request
  const [cargando, setCargando] = useState(false);

  // Estados para la pantalla de carga animada
  const [mostrarLoading, setMostrarLoading] = useState(false);
  const [rutaDestino, setRutaDestino] = useState('');

  // Validamos los campos antes de enviar el formulario
  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!email.trim()) {
      nuevosErrores.email = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      nuevosErrores.email = 'El email no tiene un formato válido';
    }

    if (!password) {
      nuevosErrores.password = 'La contraseña es obligatoria';
    }

    return nuevosErrores;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorGeneral('');

    // Primero validamos
    const erroresEncontrados = validarFormulario();
    if (Object.keys(erroresEncontrados).length > 0) {
      setErrores(erroresEncontrados);
      return;
    }

    setCargando(true);
    try {
      const data = await login(email, password);
      // Guardamos la ruta y mostramos la pantalla de carga animada
      setRutaDestino(data.usuario?.rol === 'admin' ? '/admin' : '/dashboard');
      setMostrarLoading(true);
    } catch (error) {
      // Mostramos el mensaje de error que devuelve el backend
      setErrorGeneral(error.response?.data?.error || 'Error al iniciar sesión, intentá de nuevo');
      setCargando(false);
    }
  };

  if (mostrarLoading) {
    return <LoadingScreen onComplete={() => navigate(rutaDestino)} />;
  }

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
          <h1 className={styles.authTitle}>Iniciar Sesión</h1>
          <p className={styles.authSubtitle}>Gestor de Turnos de Canchas</p>
        </div>

        {/* Mensaje de error general del servidor */}
        {errorGeneral && <div className={styles.errorAlert}>{errorGeneral}</div>}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.formGroup}>
            <label htmlFor="email-login" className={styles.label}>Email</label>
            <input
              id="email-login"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                // Limpiamos el error del campo cuando el usuario empieza a escribir
                if (errores.email) setErrores({ ...errores, email: '' });
              }}
              className={`${styles.input} ${errores.email ? styles.inputError : ''}`}
              placeholder="juan@ejemplo.com"
              autoComplete="email"
            />
            {errores.email && <span className={styles.fieldError}>{errores.email}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password-login" className={styles.label}>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password-login"
                type={mostrarPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errores.password) setErrores({ ...errores, password: '' });
                }}
                className={`${styles.input} ${errores.password ? styles.inputError : ''}`}
                placeholder="Tu contraseña"
                autoComplete="current-password"
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
                  // SVG de "Ojo con barra" (oculto)
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                    <line x1="2" y1="2" x2="22" y2="22"/>
                  </svg>
                ) : (
                  // SVG de "Ojo" (visible)
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {errores.password && <span className={styles.fieldError}>{errores.password}</span>}
          </div>

          <button
            id="btn-login-submit"
            type="submit"
            className={styles.submitBtn}
            disabled={cargando}
          >
            {cargando ? <span className={styles.spinner}></span> : 'Ingresar'}
          </button>
        </form>

        <p className={styles.authSwitch}>
          <Link to="/forgot-password" className={styles.authLink}>¿Olvidaste tu contraseña?</Link>
        </p>

        <p className={styles.authSwitch}>
          ¿No tenés cuenta?{' '}
          <Link to="/register" className={styles.authLink}>Registrate acá</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
