# 🏟️ Trabajo Integrador Final - Gestor de Turnos

Hola Profe! 👋 Acá presento mi trabajo final de Backend y Frontend.
Es un sistema para reservar turnos de canchas (fútbol, pádel, tenis).

El proyecto está separado en dos partes (un monorepo):
1. **Backend:** Hecho con Node.js, Express y MongoDB (Mongoose).
2. **Frontend:** Hecho con React y Vite.

---

## 🛠️ Cómo hacer andar el proyecto

### 1. Requisitos
- Tener instalado Node.js
- Tener MongoDB corriendo en local (puerto 27017)

### 2. Instalar dependencias
En la carpeta principal del proyecto (donde está este archivo), abrir una terminal y ejecutar:

```bash
npm run install:all
```
*(Esto va a instalar las cosas del backend y del frontend al mismo tiempo, armé un script en el package.json para que sea más fácil).*

### 3. Configurar el `.env` del Backend
Entrá a la carpeta `backend` y copiá el archivo `.env.example` a uno que se llame solo `.env`.

Ahí vas a ver esto:
```env
PORT=3001
MONGO_URI=mongodb://localhost:27017/gestor-turnos
JWT_SECRET=un_secreto_super_seguro
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=tu_password_de_aplicacion
FRONTEND_URL=http://localhost:5173
```
**Importante:** Para que funcione el registro, tenés que poner un correo de Gmail y una "Contraseña de aplicación" (no tu contraseña normal). Si no tenés ganas de configurarlo, podés buscar los tokens de verificación directamente en la base de datos de MongoDB.

### 4. Cargar las canchas en la base de datos
Como las canchas son fijas, armé un pequeño script para cargarlas en MongoDB. Abrí tu consola de Mongo (`mongosh`) y poné esto:

```javascript
use gestor-turnos

db.canchas.insertMany([
  { nombre: "Cancha Central", tipo: "Fútbol", precio: 2500 },
  { nombre: "Cancha Norte",   tipo: "Pádel",  precio: 1800 },
  { nombre: "Cancha Sur",     tipo: "Tenis",  precio: 2000 },
  { nombre: "Cancha Este",    tipo: "Fútbol", precio: 3000 }
])
```

### 5. Levantar todo el proyecto
Para no tener que abrir dos terminales, armé un comando que levanta el backend y el frontend juntos. En la carpeta principal, ejecutá:

```bash
npm run dev
```

Esto va a levantar:
- El backend en: `http://localhost:3001`
- El frontend en: `http://localhost:5173` (entrá acá desde el navegador)

---

## 📝 Documentación de la API (Backend)

Acá dejo todos los endpoints que armé en el backend por si los querés probar con Postman:

### Autenticación (`/api/auth`)

| Método | Endpoint | ¿Requiere Token? | Qué hace | Body necesario |
|--------|----------|------------------|----------|----------------|
| `POST` | `/api/auth/register` | No | Registra un usuario y le manda un email de confirmación | `{ "nombre": "...", "email": "...", "password": "..." }` |
| `GET` | `/api/auth/verify/:token` | No | Verifica el email del usuario (el link llega al correo) | - |
| `POST` | `/api/auth/login` | No | Inicia sesión y devuelve el token JWT | `{ "email": "...", "password": "..." }` |

### Turnos (`/api/turnos`)
*(Importante: Para usar estos, tenés que mandar el JWT en el header `Authorization: Bearer <tu_token>`)*

| Método | Endpoint | Qué hace | Body necesario |
|--------|----------|----------|----------------|
| `POST` | `/api/turnos` | Crea un turno nuevo. **Valida que no haya otro turno para la misma cancha a esa hora**. | `{ "canchaId": "...", "fecha": "2024-08-25T14:00:00" }` |
| `GET` | `/api/turnos` | Trae todos los turnos confirmados (para mostrarlos en el Dashboard). | - |
| `GET` | `/api/turnos/mis-turnos` | Trae solo los turnos del usuario que está logueado. | - |
| `DELETE` | `/api/turnos/:id` | Cancela un turno. **Valida que el turno sea tuyo antes de borrarlo**. | - |

---

## 🧐 Puntos importantes a corregir / mirar

- **Arquitectura en capas:** El backend lo armé bien prolijo separando en Routes -> Controllers -> Services -> Repositories.
- **Validación de solapamiento:** En `turno.service.js` está la lógica que evita que dos personas reserven la misma cancha a la misma hora.
- **Autenticación:** Uso JWT que dura 4 horas. El token se guarda en el frontend en el localStorage.
- **Manejo de errores:** Hay un `error.middleware.js` centralizado que atrapa todos los errores.
- **Frontend:** Usé CSS Modules para que no se pisen los estilos. Además, armé interceptores de Axios en `AuthContext.jsx` para mandar el token automáticamente en cada petición y desloguear si el token expira.

¡Espero que esté todo bien! Cualquier cosa me avisas.
