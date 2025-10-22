// routes/post.routes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const postController = require('../controllers/post.controller');
const authMiddleware = require('../middleware/auth.middleware');
const uploadMiddleware = require('../middleware/upload.middleware');
const getUserIdMiddleware = require('../middleware/getUserId.middleware');

// --- Rutas ---
// POST /api/posts/
router.post(
  '/',
  authMiddleware, // 1. Requiere login
  uploadMiddleware.array('media', 4), // 2. Acepta hasta 4 archivos llamados 'media'
  [
    // 3. Reglas de validación
    body('content', 'El contenido del post es requerido').notEmpty(),
    body('petIds', 'petIds debe ser un string JSON válido').optional().isJSON()  
  ],
  postController.createPost // 4. Pasa al controlador
);

// GET /api/posts/ (PÚBLICA, pero "consciente" del usuario)
router.get(
  '/',
  getUserIdMiddleware, // <-- AÑADE ESTO
  postController.getAllPosts
);


// POST /api/posts/:postId/like
// (Para dar/quitar "me gusta" - PROTEGIDA)
router.post(
  '/:postId/like',
  authMiddleware, // <-- Requiere login
  postController.toggleLike
);

module.exports = router;