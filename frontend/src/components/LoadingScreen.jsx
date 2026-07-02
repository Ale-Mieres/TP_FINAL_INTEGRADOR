import React, { useEffect } from 'react';
import styles from './LoadingScreen.module.css';

// Usaremos la imagen desde la carpeta "public" para que no rompa el proyecto si no existe.
const bgImage = '/cargando.jpg'; 

const LoadingScreen = ({ onComplete }) => {
  useEffect(() => {
    // La pantalla de carga dura 2.8 segundos para dar tiempo a la animación
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={styles.loadingContainer}>
      {/* Contenedor de la imagen con animación de zoom y temblor (simula la acción) */}
      <div 
        className={styles.backgroundImage} 
        style={{ backgroundImage: `url(${bgImage})` }}
      ></div>
      
      {/* Efecto de flash/luces de estadio para darle dinamismo */}
      <div className={styles.stadiumLights}></div>

      {/* Capa de scanlines tipo videojuego retro para que pegue con el Pixel Art */}
      <div className={styles.scanlines}></div>

      {/* Texto y barra de carga animada */}
      <div className={styles.loadingTextContainer}>
        <h1 className={styles.loadingText}>CARGANDO PARTIDO...</h1>
        <div className={styles.loadingBar}>
          <div className={styles.loadingProgress}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
