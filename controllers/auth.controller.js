// controllers/auth.controller.js
const UserModel = require('../models/user.model');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // <-- AÑADE ESTA LÍNEA
const { sendMail } = require('../config/mailer');
require('dotenv').config(); // <-- AÑADE ESTA LÍNEA (para leer process.env.JWT_SECRET)

exports.register = async (req, res) => {
  // 1. Validar los datos que vienen del body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;

  try {
    // 2. Verificar si el usuario ya existe
    let user = await UserModel.findByEmailOrUsername({ email, username });
    if (user) {
      return res.status(400).json({ message: 'El email o username ya están en uso' });
    }

    // 3. Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Crear el nuevo usuario usando el modelo
    const newUser = await UserModel.create({
      username,
      email,
      passwordHash
    });
    // 4b. Enviar correo de bienvenida
    try {
      await sendMail({
        to: newUser.email,
        subject: '¡Bienvenido a MyPetalk!',
        html: `<h1>¡Hola ${newUser.username}!</h1>
              <p>Gracias por registrarte en MyPetalk, la red social para tus mascotas.</p>`
      });
    } catch (emailError) {
      // Si el correo falla, no rompemos el registro.
      // Solo lo reportamos en los logs del servidor.
      console.error('Error al enviar correo de bienvenida:', emailError);
    }
    // 5. Responder al cliente (sin enviar el hash de la contraseña)
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        user_id: newUser.user_id,
        username: newUser.username,
        email: newUser.email,
        created_at: newUser.created_at
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

exports.login = async (req, res) => {
  // 1. Validar los datos que vienen del body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // 2. Verificar si el usuario existe (usamos el email)
    let user = await UserModel.findByEmailOrUsername({ email, username: email });
    if (!user) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    // 3. Comparar la contraseña enviada con la guardada (hasheada)
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    // 4. Si todo es correcto, crear el "Payload" del JWT
    //    (Es la información que guardaremos dentro del token)
    const payload = {
      user: {
        id: user.user_id,
        username: user.username
      }
    };

    // 5. Firmar el token
    jwt.sign(
      payload,
      process.env.JWT_SECRET, // Usamos nuestro secreto del .env
      { expiresIn: '7d' }, // El token expira en 7 días
      (error, token) => {
        if (error) throw error;
        // 6. Enviar el token al cliente
        res.json({
          message: 'Login exitoso',
          token: token
        });
      }
    );

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};