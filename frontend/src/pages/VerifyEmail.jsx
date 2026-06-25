import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './VerifyEmail.module.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Estado para saber en qué fase estamos: cargando, exito o error
  const [estado, setEstado] = useState('cargando');
  const [mensaje, setMensaje] = useState('');

  // Al montar el componente leemos el token de la URL y llamamos al backend
  useEffect(() => {
    const token = searchParams.get('token');

    // Si no hay token en la URL mostramos error
    if (!token) {
      setEstado('error');
      setMensaje('No se encontró un token de verificación en el link.');
      return;
    }

    // Llamamos al backend para verificar la cuenta
    const verificarCuenta = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/auth/verify/${token}`);
        setEstado('exito');
        setMensaje(response.data.message);
      } catch (error) {
        setEstado('error');
        setMensaje(
          error.response?.data?.error || 'El link de verificación no es válido o ya expiró.'
        );
      }
    };

    verificarCuenta();
  }, []); // el array vacío hace que solo se ejecute una vez al montar el componente

  return (
    <div className={styles.verifyContainer}>
      <div className={styles.verifyCard}>
        {/* Mientras se verifica mostramos un spinner */}
        {estado === 'cargando' && (
          <>
            <div className={styles.spinner}></div>
            <h2 className={styles.verifyTitle}>Verificando tu cuenta...</h2>
            <p className={styles.verifySubtitle}>Por favor esperá un momento.</p>
          </>
        )}

        {/* Si la verificación fue exitosa */}
        {estado === 'exito' && (
          <>
            <div className={styles.iconSuccess}>✅</div>
            <h2 className={styles.verifyTitle}>¡Cuenta Verificada!</h2>
            <p className={styles.verifySubtitle}>{mensaje}</p>
            <button
              id="btn-ir-login"
              className={styles.btnPrimary}
              onClick={() => navigate('/login')}
            >
              Ir al Login
            </button>
          </>
        )}

        {/* Si hubo algún error */}
        {estado === 'error' && (
          <>
            <div className={styles.iconError}>❌</div>
            <h2 className={styles.verifyTitle}>Error al verificar</h2>
            <p className={styles.verifySubtitle}>{mensaje}</p>
            <button
              id="btn-ir-register"
              className={styles.btnSecondary}
              onClick={() => navigate('/register')}
            >
              Volver al Registro
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
