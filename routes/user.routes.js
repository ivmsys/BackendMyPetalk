// routes/user.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/user.controller');

// Importamos nuestro "guardia"
const authMiddleware = require('../middleware/auth.middleware');

// GET /api/users/me
// 1. La petición llega
// 2. Pasa por authMiddleware (el guardia)
// 3. Si el token es válido, pasa a authController.getMe
router.get(
  '/me',
  authMiddleware, // <-- ¡AQUÍ ESTÁ LA MAGIA!
  authController.getMe
);
// GET /api/users/search?q=...
// (Para buscar usuarios - PROTEGIDA)
router.get(
  '/search',
  authMiddleware, // Requiere login para buscar
  authController.searchUsers
);

module.exports = router;