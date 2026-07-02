// Usamos nodemailer para enviar emails
const nodemailer = require('nodemailer');

// Función auxiliar para obtener el transporter de Ethereal (cuenta de prueba gratuita)
// NOTA: Para producción, reemplazar con credenciales reales de Gmail (App Password)
// y cambiar la condición para que use Gmail cuando EMAIL_PASS sea un App Password válido.
const getTransporter = async () => {
  // Usamos Ethereal para desarrollo/prueba — el link del email se imprime en la consola
  console.log('📧 Usando Ethereal (cuenta de prueba). El link aparecerá en la consola del servidor...');
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

// Función para enviar el email de verificación de cuenta
const sendVerificationEmail = async (emailDestino, verificationToken) => {
  const transporter = await getTransporter();

  // Armamos el link de verificación que incluye el token
  const linkVerificacion = `${process.env.FRONTEND_URL}/verify?token=${verificationToken}`;

  // Configuramos el email: de dónde viene, a dónde va, asunto y cuerpo
  const mailOptions = {
    from: `"Gestor de Turnos" <${process.env.EMAIL_USER || 'test@example.com'}>`,
    to: emailDestino,
    subject: 'Verificá tu cuenta - Gestor de Turnos de Canchas',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #4f46e5;">Gestor de Turnos de Canchas 🏟️</h1>
        <h2>¡Bienvenido/a!</h2>
        <p>Gracias por registrarte. Para activar tu cuenta hacé clic en el botón de abajo:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${linkVerificacion}" 
             style="background-color: #4f46e5; color: white; padding: 14px 28px; 
                    border-radius: 6px; text-decoration: none; font-size: 16px;">
            Verificar mi cuenta
          </a>
        </div>
        <p>Si no podés hacer clic, copiá este link en el navegador:</p>
        <p style="color: #4f46e5;">${linkVerificacion}</p>
        <p style="color: #999; font-size: 12px; margin-top: 20px;">
          Si no creaste esta cuenta, ignorá este mensaje.
        </p>
      </div>
    `,
  };

  // Enviamos el email
  const info = await transporter.sendMail(mailOptions);
  console.log('Email de verificación "enviado" a:', emailDestino);
  
  // Si usamos Ethereal, imprimimos el link para verlo
  const testUrl = nodemailer.getTestMessageUrl(info);
  if (testUrl) {
    console.log('👀 ¡MIRAR CORREO DE PRUEBA AQUÍ! ->', testUrl);
  }
};

// Función para enviar el email de recuperación de contraseña
const sendPasswordResetEmail = async (emailDestino, resetToken) => {
  const transporter = await getTransporter();

  const linkReseteo = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"Gestor de Turnos" <${process.env.EMAIL_USER || 'test@example.com'}>`,
    to: emailDestino,
    subject: 'Recuperá tu contraseña - Gestor de Turnos de Canchas',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #4f46e5;">Gestor de Turnos de Canchas 🏟️</h1>
        <h2>Recuperación de Contraseña</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña. Hacé clic en el botón de abajo para crear una nueva:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${linkReseteo}" 
             style="background-color: #4f46e5; color: white; padding: 14px 28px; 
                    border-radius: 6px; text-decoration: none; font-size: 16px;">
            Restablecer Contraseña
          </a>
        </div>
        <p>Si no podés hacer clic, copiá este link en el navegador:</p>
        <p style="color: #4f46e5;">${linkReseteo}</p>
        <p style="color: #999; font-size: 12px; margin-top: 20px;">
          Este link expirará en 1 hora. Si no solicitaste este cambio, podés ignorar este mensaje de forma segura.
        </p>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('Email de recuperación "enviado" a:', emailDestino);

  // Si usamos Ethereal, imprimimos el link para verlo
  const testUrl = nodemailer.getTestMessageUrl(info);
  if (testUrl) {
    console.log('👀 ¡MIRAR CORREO DE PRUEBA AQUÍ! ->', testUrl);
  }
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
