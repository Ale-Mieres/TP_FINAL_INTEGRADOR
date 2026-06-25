import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Estado del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Estado para los mensajes de error
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');

  // Estado de carga mientras se hace el request
  const [cargando, setCargando] = useState(false);

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
      await login(email, password);
      // Si el login fue exitoso, vamos al dashboard
      navigate('/dashboard');
    } catch (error) {
      // Mostramos el mensaje de error que devuelve el backend
      setErrorGeneral(error.response?.data?.error || 'Error al iniciar sesión, intentá de nuevo');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <div className={styles.logo}>🏟️</div>
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
            <input
              id="password-login"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errores.password) setErrores({ ...errores, password: '' });
              }}
              className={`${styles.input} ${errores.password ? styles.inputError : ''}`}
              placeholder="Tu contraseña"
              autoComplete="current-password"
            />
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
          ¿No tenés cuenta?{' '}
          <Link to="/register" className={styles.authLink}>Registrate acá</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
