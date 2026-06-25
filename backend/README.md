# 🏟️ Backend - Gestor de Turnos

Hola Profe! Este es el código del backend de mi trabajo final integrador.

## Arquitectura

Decidí separarlo en capas como vimos en clase para que quede más ordenado:

1. **Routes (`/routes`)**: Solo declaran los endpoints y los apuntan a su controlador correspondiente. También aplican el middleware de auth si la ruta es privada.
2. **Controllers (`/controllers`)**: Reciben el `req` y el `res`. Toman los datos, llaman al servicio y devuelven la respuesta al frontend (o mandan el error al next).
3. **Services (`/services`)**: Tienen toda la lógica del negocio. Por ejemplo, en `turno.service.js` está la validación para que no se solapen los turnos.
4. **Repositories (`/repositories`)**: Se encargan de hablar directo con la base de datos a través de Mongoose.
5. **Models (`/models`)**: Los schemas de MongoDB (Cancha, Turno, Usuario).

## Middlewares

- `auth.middleware.js`: Se fija si viene el token JWT en la cabecera `Authorization`. Si el token es válido, busca al usuario en la BD y lo guarda en `req.user` para que los controladores sepan quién está haciendo la petición.
- `error.middleware.js`: Un manejador centralizado de errores. Todos los controladores tienen un bloque try/catch y le pasan el error al `next(error)`. Este middleware lo ataja y le devuelve un JSON ordenado al frontend.

## Autenticación y Seguridad

- Uso **bcryptjs** para encriptar las contraseñas antes de guardarlas en MongoDB.
- Uso **jsonwebtoken** (JWT) para mantener la sesión. El token dura 4 horas.
- Usé **nodemailer** para la parte de verificación de cuentas. Cuando alguien se registra, su cuenta queda `isVerified: false` hasta que abra el mail y haga clic en el link.

## Datos

Las canchas las cargué directamente por consola en MongoDB porque no pedían un ABM de canchas, sino un gestor de turnos. Los turnos y usuarios sí se manejan todo por la API.

¡Cualquier duda sobre el código estoy a disposición!
