// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller.js');

// Definimos la ruta POST /api/auth/register
router.post(
  '/register',
  [
    // Reglas de validación
    body('username', 'El nombre de usuario es requerido').notEmpty(),
    body('email', 'Por favor incluye un email válido').isEmail(),
    body('password', 'La contraseña debe tener 8 o más caracteres').isLength({ min: 8 })
  ],
  authController.register // El controlador que manejará esta ruta
);

// POST /api/auth/login
router.post(
  '/login',
  [
    // Reglas de validación para el login
    body('email', 'Por favor incluye un email válido').isEmail(),
    body('password', 'La contraseña es requerida').notEmpty()
  ],
  authController.login // El nuevo controlador de login
);

module.exports = router;