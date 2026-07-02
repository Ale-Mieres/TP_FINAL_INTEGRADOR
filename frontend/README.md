# 🏟️ Gestor de Turnos — Frontend

Aplicación web construida con **React + Vite** para gestionar reservas de canchas deportivas.  
Consume la API del backend y provee una interfaz responsiva (320px a 2000px).

---

## 📋 Requisitos previos

- Node.js >= 18
- npm >= 9
- El backend corriendo (ver `../backend/README.md`)

---

## 🚀 Instalación y ejecución local

```bash
# 1. Clonar el repositorio
git clone <URL_REPO_FRONTEND>
cd frontend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con la URL de tu backend

# 4. Iniciar el servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

---

## ⚙️ Variables de entorno

| Variable        | Descripción                    | Ejemplo                       |
|-----------------|--------------------------------|-------------------------------|
| `VITE_API_URL`  | URL base de la API del backend | `http://localhost:3001/api`   |

---

## 🗺️ Rutas de la aplicación

| Ruta              | Descripción                                    | Acceso          |
|-------------------|------------------------------------------------|-----------------|
| `/login`          | Pantalla de inicio de sesión                   | Público         |
| `/register`       | Registro de nueva cuenta                       | Público         |
| `/verify`         | Verificación de email (desde link del correo)  | Público         |
| `/forgot-password`| Solicitar recuperación de contraseña           | Público         |
| `/reset-password` | Establecer nueva contraseña                    | Público         |
| `/dashboard`      | Panel principal con canchas y reservas         | Autenticado     |
| `/mis-turnos`     | Ver y cancelar mis reservas                    | Autenticado     |
| `/admin`          | Panel de administración                        | Solo admin      |

---

## 🧩 Funcionalidades implementadas

### Autenticación
- ✅ Registro de usuario con validación
- ✅ Login con JWT (token guardado en localStorage)
- ✅ Verificación de cuenta por email
- ✅ Recuperación y reseteo de contraseña
- ✅ Cierre de sesión automático al vencer el token (interceptor Axios)
- ✅ Rutas protegidas por rol (usuario / admin)

### Gestión de Turnos (CRUD)
- ✅ **Create**: Reservar un turno seleccionando cancha, fecha y hora
- ✅ **Read**: Ver agenda completa de turnos y mis propios turnos
- ✅ **Update**: Editar la fecha/hora de un turno en "Mis Turnos"
- ✅ **Delete**: Cancelar una reserva propia

### Panel de Admin
- ✅ Estadísticas de recaudación total
- ✅ Listado completo de reservas del sistema
- ✅ Disponibilidad de canchas filtrada por tipo (próximos 7 días)

---

## 🛠️ Stack tecnológico

| Herramienta       | Uso                                |
|-------------------|------------------------------------|
| React 18          | Framework UI                       |
| Vite              | Bundler y servidor de desarrollo   |
| React Router DOM  | Enrutamiento SPA                   |
| Axios             | Cliente HTTP + interceptores JWT   |
| CSS Modules       | Estilos scoped por componente      |

---

## 🛠️ Scripts disponibles

| Script           | Descripción                           |
|------------------|---------------------------------------|
| `npm run dev`    | Servidor de desarrollo con hot reload |
| `npm run build`  | Genera el bundle de producción        |
| `npm run preview`| Vista previa del build de producción  |

---

## 👤 Credenciales de prueba

| Rol    | Email                     | Password    |
|--------|---------------------------|-------------|
| Admin  | `admin@gestorturnos.com`  | `Admin123!` |

> El usuario admin viene precargado en la base de datos con email verificado.
