# 🏟️ Frontend - Gestor de Turnos

Hola Profe! Este es el código del frontend. Lo hice usando React y Vite.

## Estructura del proyecto

- `src/main.jsx`: Es el punto de entrada de React.
- `src/App.jsx`: Acá puse todas las rutas usando React Router. También hay dos componentes que armé (`RutaProtegida` y `RutaPublica`) para evitar que un usuario sin loguearse entre al dashboard.
- `src/context/AuthContext.jsx`: Acá manejé todo el estado global del usuario (si está logueado o no). También configuré `axios.interceptors` para que le pegue automáticamente el token JWT a todas las peticiones, así no tenía que hacerlo a mano en cada archivo.
- `src/pages/`: Acá están las pantallas principales:
  - `Login.jsx` y `Register.jsx`: Formularios para entrar y crear cuenta. Tienen validaciones y mensajes de error.
  - `VerifyEmail.jsx`: Es la pantalla que se abre cuando el usuario hace clic en el link que le llega al mail. Lee el token de la URL y avisa al backend.
  - `Dashboard.jsx`: Es la vista principal donde se ven las canchas y se pueden sacar turnos.
  - `MisTurnos.jsx`: Acá se ven los turnos del usuario logueado y se pueden cancelar.

## Estilos

Traté de que quede con un diseño moderno ("modo oscuro" y efecto de vidrio/glassmorphism). Usé **CSS Modules** (los archivos que terminan en `.module.css`) para que las clases no se choquen entre sí.

## Configuración especial de Vite

En el archivo `vite.config.js` le agregué un proxy:
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:3001',
    changeOrigin: true,
  },
}
```
Esto me sirvió para no tener problemas de CORS durante el desarrollo y para poder hacer las peticiones usando rutas relativas (como `axios.post('/api/auth/login')`).
