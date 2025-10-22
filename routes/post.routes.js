// routes/post.routes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const postController = require('../controllers/post.controller');
const authMiddleware = require('../middleware/auth.middleware');
const getUserIdMiddleware = require('../middleware/getUserId.middleware');

// --- Rutas ---

// POST /api/posts/
// (Para crear un nuevo post - PROTEGIDA)
router.post(
  '/',
  authMiddleware, // <-- Requiere login
  [
    // Reglas de validación
    body('content', 'El contenido del post es requerido').notEmpty()
  ],
  postController.createPost
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