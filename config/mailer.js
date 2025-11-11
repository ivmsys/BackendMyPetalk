// config/mailer.js
const { Resend } = require('resend');
require('dotenv').config(); // Asegura que process.env se cargue

// Inicializa Resend con la API key que pondremos en docker-compose
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Envía un correo electrónico usando Resend.
 * @param {string} to - El destinatario (ej. 'usuario@gmail.com')
 * @param {string} subject - El asunto del correo
 * @param {string} html - El contenido HTML del correo
 */
// config/mailer.js
// ... (const resend = new Resend(...) se queda igual) ...

exports.sendMail = async ({ to, subject, html, fromEmail }) => {
  try {

    // --- LÓGICA ACTUALIZADA ---
    // 1. Usa el 'fromEmail' que nos pasaron, o
    // 2. Cae al 'EMAIL_FROM' del docker-compose.yml, o
    // 3. Usa un correo predeterminado final.
    const fromAddress = fromEmail || process.env.EMAIL_FROM || 'istvanvelamarquez@mypetalk.com'; 
    // --- FIN LÓGICA ---

    const { data, error } = await resend.emails.send({
      // El nombre "PetNet" puede ser dinámico también si quisieras
      from: `MyPetalk <${fromAddress}>`, // <-- USA LA VARIABLE 'fromAddress'
      to: to,
      subject: subject,
      html: html,
    });

    if (error) {
      throw error;
    }

    console.log('Correo enviado (Resend):', data.id);
    return data;
  } catch (error) {
    console.error('Error al enviar correo (Resend):', error);
    throw error;
  }
};