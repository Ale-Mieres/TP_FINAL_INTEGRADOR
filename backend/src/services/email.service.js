// Usamos nodemailer para enviar emails
const nodemailer = require('nodemailer');

// Función para enviar el email de verificación de cuenta
const sendVerificationEmail = async (emailDestino, verificationToken) => {
  // Configuramos el transporter con los datos de Gmail
  // Las credenciales vienen del archivo .env
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Armamos el link de verificación que incluye el token
  const linkVerificacion = `${process.env.FRONTEND_URL}/verify?token=${verificationToken}`;

  // Configuramos el email: de dónde viene, a dónde va, asunto y cuerpo
  const mailOptions = {
    from: `"Gestor de Turnos" <${process.env.EMAIL_USER}>`,
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
  await transporter.sendMail(mailOptions);
  console.log('Email de verificación enviado a:', emailDestino);
};

module.exports = { sendVerificationEmail };
