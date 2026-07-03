# Gestor de Turnos de Canchas

Proyecto integral (Full-Stack) para la gestion de reservas de canchas deportivas. Permite a los usuarios registrarse, verificar su cuenta mediante correo electronico, reservar turnos y administrar sus reservas. Tambien cuenta con un panel administrativo para controlar las estadisticas y gestionar la disponibilidad de las canchas.

Creado por: Ale Mieres

## Tecnologias y Librerias Utilizadas

### Frontend
- React 18
- Vite
- React Router DOM (Manejo de rutas)
- Axios (Cliente HTTP)
- CSS Vanilla (Estilos personalizados)

### Backend
- Node.js
- Express.js
- MongoDB & Mongoose (Base de datos y ODM)
- JSON Web Tokens (Autenticacion y autorizacion)
- Bcryptjs (Encriptacion de contrasenas)
- Nodemailer (Envio de correos electronicos)
- Cors & Dotenv

## Estructura de Carpetas

```text
.
├── backend/
│   ├── api/                    # Configuracion Serverless para Vercel
│   ├── src/
│   │   ├── config/             # Configuracion de base de datos
│   │   ├── controllers/        # Controladores de las rutas (logica de peticiones)
│   │   ├── middleware/         # Interceptores (Auth, Roles, Manejo de Errores)
│   │   ├── models/             # Esquemas de datos (Mongoose)
│   │   ├── repositories/       # Abstraccion de consultas a la base de datos
│   │   ├── routes/             # Definicion de endpoints (API REST)
│   │   ├── services/           # Logica de negocio y envio de correos
│   │   ├── utils/              # Funciones auxiliares (Generacion de JWT)
│   │   ├── app.js              # Configuracion global de Express
│   │   └── index.js            # Punto de entrada local y seeding de datos
│   ├── .env.example
│   ├── package.json
│   └── vercel.json
└── frontend/
    ├── src/
    │   ├── components/         # Componentes reutilizables de UI
    │   ├── context/            # Estado global de autenticacion (AuthContext)
    │   ├── pages/              # Vistas principales de la aplicacion
    │   ├── App.jsx             # Enrutador principal
    │   ├── index.css           # Estilos globales
    │   └── main.jsx            # Punto de entrada de React
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── vercel.json
    └── vite.config.js
```

## Endpoints de la API (Backend)

La API base se encuentra bajo el prefijo `/api`.

### Autenticacion (/api/auth)
- `POST /register`: Registra un nuevo usuario y envia el correo de verificacion.
- `GET /verify/:token`: Verifica la cuenta del usuario mediante el token recibido por correo.
- `POST /login`: Inicia sesion y devuelve un token JWT junto con los datos del usuario.
- `POST /forgot-password`: Solicita la recuperacion de contrasena enviando un correo electronico.
- `POST /reset-password`: Restablece la contrasena utilizando el token de recuperacion.

### Turnos (/api/turnos) - Requiere Autenticacion (JWT Bearer)
- `GET /`: Obtiene todos los turnos del sistema (Admin).
- `GET /mis-turnos`: Obtiene los turnos correspondientes al usuario autenticado.
- `POST /`: Crea una nueva reserva de turno.
- `GET /:id`: Obtiene los detalles de un turno especifico.
- `PUT /:id`: Modifica un turno existente (solo creador o Admin).
- `PATCH /:id/pagar`: Marca un turno como pagado.
- `DELETE /:id`: Cancela una reserva de turno.

### Canchas (/api/canchas)
- `GET /`: Lista todas las canchas disponibles.
- `GET /:id`: Obtiene el detalle de una cancha especifica.
- `POST /`: Crea una nueva cancha (Requiere rol Admin).
- `PUT /:id`: Actualiza la informacion de una cancha (Requiere rol Admin).
- `DELETE /:id`: Elimina una cancha del sistema (Requiere rol Admin).

### Administracion (/api/admin) - Requiere Rol Admin
- `GET /estadisticas`: Devuelve los ingresos totales, conteo de canchas y turnos globales.
- `GET /disponibilidad?tipo={tipo}`: Devuelve las canchas filtradas por tipo de deporte.

## Instalacion Local

1. Clonar el repositorio.
2. Navegar a la carpeta `backend` e instalar dependencias con `npm install`.
3. Renombrar `.env.example` a `.env` en la carpeta `backend` y completar los datos de conexion (MongoDB URI, JWT Secret, Credenciales de correo y Frontend URL).
4. Ejecutar el servidor backend con `npm run dev` (por defecto en el puerto 3001).
5. En una nueva terminal, navegar a la carpeta `frontend` e instalar dependencias con `npm install`.
6. Renombrar `.env.example` a `.env` en la carpeta `frontend` y configurar `VITE_API_URL` apuntando al backend local.
7. Ejecutar el frontend con `npm run dev` (por defecto en el puerto 5173).

## Despliegue (Vercel)

El proyecto cuenta con archivos `vercel.json` en ambas carpetas. Permite desplegar el backend como funciones Serverless de Node.js y el frontend como un proyecto estatico de Vite, asegurando el correcto enrutamiento y configuracion de modulos. Asegurese de cargar correctamente las variables de entorno en el panel de Vercel.
