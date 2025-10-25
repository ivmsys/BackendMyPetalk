// routes/comment.routes.js
const express = require('express');
// Usamos mergeParams: true para poder acceder a :postId desde post.routes.js
const router = express.Router({ mergeParams: true }); 
const { body } = require('express-validator');
const commentController = require('../controllers/comment.controller');
const authMiddleware = require('../middleware/auth.middleware');

// --- Comment Routes ---
// Note: Estas rutas se montarán bajo /api/posts/:postId/comments

// POST /api/posts/:postId/comments/
// (Añadir un comentario - PROTEGIDA)
router.post(
  '/',
  authMiddleware, // Requiere login para comentar
  [
    // Validación
    body('content', 'El contenido del comentario es requerido').notEmpty()
  ],
  commentController.addComment
);

// GET /api/posts/:postId/comments/
// (Obtener comentarios de un post - PÚBLICA)
router.get(
  '/',
  commentController.getComments
);

module.exports = router;