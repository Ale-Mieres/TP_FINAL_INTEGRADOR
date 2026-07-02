import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Importamos todas las páginas
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import MisTurnos from './pages/MisTurnos';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';

// Componente para proteger rutas privadas
// Si el usuario no está logueado, lo redirige al login
const RutaProtegida = ({ children }) => {
  const { estaAutenticado, cargando } = useAuth();

  // Mientras estamos cargando los datos de localStorage mostramos un spinner
  if (cargando) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#0f0f1a',
        color: '#fff',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 44,
            height: 44,
            border: '4px solid #4f46e5',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }}></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado lo mandamos al login
  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Componente para rutas públicas (login, register)
// Si el usuario ya está logueado lo mandamos al dashboard
const RutaPublica = ({ children }) => {
  const { estaAutenticado, cargando } = useAuth();

  if (cargando) return null;

  if (estaAutenticado) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Componente para proteger rutas de admin
// Si el usuario no es admin, lo redirige al dashboard normal
const RutaAdmin = ({ children }) => {
  const { estaAutenticado, esAdmin, cargando } = useAuth();

  if (cargando) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#0f0f1a',
        color: '#fff',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 44,
            height: 44,
            border: '4px solid #f59e0b',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }}></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, lo mandamos al login
  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }

  // Si no es admin, lo mandamos al dashboard de usuario común
  if (!esAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Componente con todas las rutas de la aplicación
const AppRoutes = () => {
  return (
    <Routes>
      {/* Ruta raíz redirige al login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Rutas públicas */}
      <Route path="/login" element={<RutaPublica><Login /></RutaPublica>} />
      <Route path="/register" element={<RutaPublica><Register /></RutaPublica>} />
      <Route path="/forgot-password" element={<RutaPublica><ForgotPassword /></RutaPublica>} />
      <Route path="/reset-password" element={<RutaPublica><ResetPassword /></RutaPublica>} />

      {/* La verificación de email es pública para que funcione el link del correo */}
      <Route path="/verify" element={<VerifyEmail />} />

      {/* Rutas privadas - solo acceden usuarios logueados */}
      <Route path="/dashboard" element={<RutaProtegida><Dashboard /></RutaProtegida>} />
      <Route path="/mis-turnos" element={<RutaProtegida><MisTurnos /></RutaProtegida>} />

      {/* Ruta de admin - solo accede el administrador */}
      <Route path="/admin" element={<RutaAdmin><AdminDashboard /></RutaAdmin>} />

      {/* Cualquier ruta que no existe redirige al login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

// Componente principal de la aplicación
const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
