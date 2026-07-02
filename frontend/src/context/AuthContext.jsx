import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Creamos el contexto de autenticación
const AuthContext = createContext(null);

// La URL base del backend viene del archivo .env
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Este provider envuelve toda la app y da acceso al estado de auth
export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [cargando, setCargando] = useState(true); // mientras cargamos desde localStorage

  // Configuramos el interceptor de Axios para que mande el token en cada petición
  useEffect(() => {
    // Interceptor de request: agrega el header Authorization automáticamente
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const tokenGuardado = localStorage.getItem('token');
        if (tokenGuardado) {
          config.headers['Authorization'] = `Bearer ${tokenGuardado}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor de response: si el servidor responde 401, limpiamos la sesión
    // Usamos localStorage directamente para evitar problemas de referencia circular con logout
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          const tokenActual = localStorage.getItem('token');
          // Solo cerramos sesión si había un token (evita loop en rutas públicas)
          if (tokenActual) {
            console.log('Token expirado o inválido, cerrando sesión...');
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            // Forzamos recarga para que el AuthProvider limpie el estado
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );

    // Limpiamos los interceptores cuando el componente se desmonta
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Al cargar la app, recuperamos el token y el usuario guardados en localStorage
  useEffect(() => {
    const tokenGuardado = localStorage.getItem('token');
    const usuarioGuardado = localStorage.getItem('usuario');

    if (tokenGuardado && usuarioGuardado) {
      try {
        setToken(tokenGuardado);
        setUsuario(JSON.parse(usuarioGuardado));
        console.log('Sesión recuperada desde localStorage');
      } catch (error) {
        // Si hay algún error parseando los datos, limpiamos el localStorage
        console.log('Error al recuperar la sesión:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
      }
    }

    setCargando(false);
  }, []);

  // Función de login: llama a la API y guarda los datos en localStorage
  const login = async (email, password) => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });

    const { token: nuevoToken, usuario: nuevoUsuario } = response.data;

    // Guardamos en localStorage para mantener la sesión aunque se recargue la página
    localStorage.setItem('token', nuevoToken);
    localStorage.setItem('usuario', JSON.stringify(nuevoUsuario));

    setToken(nuevoToken);
    setUsuario(nuevoUsuario);

    console.log('Login exitoso:', nuevoUsuario.email);
    return response.data;
  };

  // Función de logout: limpia todo
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setToken(null);
    setUsuario(null);
    console.log('Sesión cerrada');
  };

  // Si hay token y usuario, el usuario está autenticado
  const estaAutenticado = !!token && !!usuario;

  // Verificamos si el usuario tiene rol de admin
  const esAdmin = usuario?.rol === 'admin';

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout, estaAutenticado, esAdmin, cargando }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto más fácilmente
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth tiene que usarse dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;
