# 🏟️ Gestor de Turnos — Backend

API REST construida con **Node.js + Express + MongoDB (Mongoose)**.  
Implementa autenticación segura con JWT + bcrypt + verificación por email.

---

## 📋 Requisitos previos

- Node.js >= 18
- npm >= 9
- Una base de datos MongoDB (local o Atlas)
- Una cuenta de Gmail con una [App Password](https://support.google.com/accounts/answer/185833) habilitada (para el envío de emails)

---

## 🚀 Instalación y ejecución local

```bash
# 1. Clonar el repositorio
git clone <URL_REPO_BACKEND>
cd backend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar el archivo .env con tus credenciales reales

# 4. Iniciar el servidor en modo desarrollo
npm run dev

# 5. Para producción
npm start
```

El servidor levanta en `http://localhost:3001` por defecto.

---

## ⚙️ Variables de entorno

| Variable       | Descripción                                      | Ejemplo                        |
|----------------|--------------------------------------------------|--------------------------------|
| `PORT`         | Puerto del servidor                              | `3001`                         |
| `MONGO_URI`    | URI de conexión a MongoDB                        | `mongodb+srv://...`            |
| `JWT_SECRET`   | Secreto para firmar/verificar tokens JWT         | `un_secreto_largo_y_aleatorio` |
| `EMAIL_USER`   | Email remitente (Gmail)                          | `tu@gmail.com`                 |
| `EMAIL_PASS`   | App Password de Gmail                            | `abcd efgh ijkl mnop`          |
| `FRONTEND_URL` | URL del frontend (para CORS y links en emails)   | `http://localhost:5173`        |

---

## 🗂️ Arquitectura en capas

```
src/
├── config/
│   └── db.js                  # Conexión a MongoDB
├── models/                    # Esquemas Mongoose
│   ├── Usuario.js
│   ├── Turno.js
│   └── Cancha.js
├── repositories/              # Acceso a la base de datos (queries)
│   ├── auth.repository.js
│   ├── turno.repository.js
│   └── cancha.repository.js
├── services/                  # Lógica de negocio
│   ├── auth.service.js
│   ├── turno.service.js
│   ├── cancha.service.js
│   ├── admin.service.js
│   └── email.service.js
├── controllers/               # Manejan req/res y delegan a services
│   ├── auth.controller.js
│   ├── turno.controller.js
│   ├── cancha.controller.js
│   └── admin.controller.js
├── routes/                    # Express Router
│   ├── auth.routes.js
│   ├── turno.routes.js
│   ├── cancha.routes.js
│   └── admin.routes.js
├── middleware/                # Middlewares reutilizables
│   ├── auth.middleware.js     # Verifica JWT Bearer token
│   ├── admin.middleware.js    # Verifica rol admin
│   └── error.middleware.js    # Manejo centralizado de errores
├── utils/
│   └── jwt.js                 # Helpers para firmar/verificar JWT
├── app.js                     # Configuración de Express
└── index.js                   # Punto de entrada + seeding inicial
```

---

## 📡 Documentación de Endpoints

### 🔐 Autenticación — `/api/auth`

| Método | Endpoint                   | Descripción                                  | Auth requerida |
|--------|----------------------------|----------------------------------------------|----------------|
| POST   | `/api/auth/register`       | Registra un usuario y envía email de verificación | No          |
| GET    | `/api/auth/verify/:token`  | Activa la cuenta con el token del email      | No             |
| POST   | `/api/auth/login`          | Login: devuelve JWT + datos del usuario      | No             |
| POST   | `/api/auth/forgot-password`| Envía email para recuperar contraseña        | No             |
| POST   | `/api/auth/reset-password` | Restablece la contraseña con el token        | No             |

**Body de `/register`:**
```json
{ "nombre": "Juan", "email": "juan@mail.com", "password": "123456" }
```

**Body de `/login`:**
```json
{ "email": "juan@mail.com", "password": "123456" }
```
**Respuesta de `/login`:**
```json
{
  "token": "eyJhbGc...",
  "usuario": { "id": "...", "nombre": "Juan", "email": "juan@mail.com", "rol": "usuario" }
}
```

---

### 📅 Turnos — `/api/turnos` *(requieren Bearer JWT)*

| Método | Endpoint                  | Descripción                                        |
|--------|---------------------------|----------------------------------------------------|
| POST   | `/api/turnos`             | Crea un nuevo turno (Create)                       |
| GET    | `/api/turnos`             | Lista todos los turnos confirmados                 |
| GET    | `/api/turnos/mis-turnos`  | Lista solo los turnos del usuario autenticado      |
| GET    | `/api/turnos/:id`         | Detalle de un turno                                |
| PUT    | `/api/turnos/:id`         | Actualiza fecha/cancha de un turno (dueño)         |
| DELETE | `/api/turnos/:id`         | Cancela un turno (dueño)                           |

**Body de POST `/api/turnos`:**
```json
{ "canchaId": "64a2f8b9d3b14a2c9f1a2b3c", "fecha": "2025-08-15T10:00:00.000Z" }
```

---

### 🏟️ Canchas — `/api/canchas`

| Método | Endpoint             | Descripción                            | Auth requerida |
|--------|----------------------|----------------------------------------|----------------|
| GET    | `/api/canchas`       | Lista todas las canchas                | No             |
| GET    | `/api/canchas/:id`   | Detalle de una cancha                  | No             |
| POST   | `/api/canchas`       | Crea una nueva cancha                  | Admin JWT      |
| PUT    | `/api/canchas/:id`   | Actualiza una cancha                   | Admin JWT      |
| DELETE | `/api/canchas/:id`   | Elimina una cancha                     | Admin JWT      |

**Body de POST/PUT `/api/canchas`:**
```json
{ "nombre": "Cancha Central", "tipo": "Fútbol", "precio": 2500 }
```

---

### 🛡️ Admin — `/api/admin` *(requieren Bearer JWT + rol admin)*

| Método | Endpoint                      | Descripción                                     |
|--------|-------------------------------|-------------------------------------------------|
| GET    | `/api/admin/estadisticas`     | Recaudación total, reservas y lista completa    |
| GET    | `/api/admin/disponibilidad`   | Disponibilidad de canchas (query: `?tipo=Fútbol`) |

---

## 🔒 Seguridad implementada

- **Hashing de contraseñas**: bcryptjs con salt factor 10
- **JWT**: Tokens con expiración de 4 horas (Bearer token)
- **Verificación de email**: Token aleatorio (crypto.randomBytes) enviado por nodemailer
- **Recuperación de contraseña**: Token con expiración de 1 hora
- **Variables de entorno**: dotenv (nunca se hardcodean credenciales)
- **CORS**: Configurado para aceptar solo el origen del frontend
- **Manejo de errores centralizado**: middleware de error con statusCode personalizado

---

## 👤 Credenciales de prueba

| Rol    | Email                        | Password   | Estado      |
|--------|------------------------------|------------|-------------|
| Admin  | `admin@gestorturnos.com`     | `Admin123!` | Verificado |
| Usuario| Crear con `/api/auth/register` | —        | Ver email   |

> El usuario admin se crea automáticamente al arrancar el servidor por primera vez.

---

## 🛠️ Scripts disponibles

| Script      | Descripción                      |
|-------------|----------------------------------|
| `npm run dev` | Inicia con nodemon (hot reload) |
| `npm start`  | Inicia en modo producción        |
