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
exports.sendMail = async ({ to, subject, html }) => {
  try {

    // ¡Importante! Usa el correo de tu dominio verificado
    // Reemplaza 'hola@mypetalk.com' si usaste otro
    const fromEmail = process.env.EMAIL_FROM || 'istvanvelamarquez@mypetalk.com'; 

    const { data, error } = await resend.emails.send({
      from: `PetNet <${fromEmail}>`, // El remitente DEBE ser de tu dominio verificado
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