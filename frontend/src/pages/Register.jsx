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
          <div className={styles.logo}>🏟️</div>
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
            <input
              id="password-register"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errores.password) setErrores({ ...errores, password: '' });
              }}
              className={`${styles.input} ${errores.password ? styles.inputError : ''}`}
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
            />
            {errores.password && <span className={styles.fieldError}>{errores.password}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmar-password" className={styles.label}>Confirmar contraseña</label>
            <input
              id="confirmar-password"
              type="password"
              value={confirmarPassword}
              onChange={(e) => {
                setConfirmarPassword(e.target.value);
                if (errores.confirmarPassword) setErrores({ ...errores, confirmarPassword: '' });
              }}
              className={`${styles.input} ${errores.confirmarPassword ? styles.inputError : ''}`}
              placeholder="Repetí tu contraseña"
              autoComplete="new-password"
            />
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
