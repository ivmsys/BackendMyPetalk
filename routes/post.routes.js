// routes/post.routes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const postController = require('../controllers/post.controller');
const authMiddleware = require('../middleware/auth.middleware');

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

// GET /api/posts/
// (Para obtener el feed de todos los posts - PÚBLICA)
router.get('/', postController.getAllPosts);

module.exports = router;