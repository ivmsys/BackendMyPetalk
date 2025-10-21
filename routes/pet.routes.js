// routes/pet.routes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const petController = require('../controllers/pet.controller');
const authMiddleware = require('../middleware/auth.middleware');

// ¡¡Aplicamos el middleware a TODAS las rutas de este archivo!!
// Cualquier petición a /api/pets/* primero pasará por el guardia.
router.use(authMiddleware);

// --- Rutas ---

// POST /api/pets/
// (Para crear una nueva mascota)
router.post(
  '/',
  [
    // Reglas de validación
    body('name', 'El nombre de la mascota es requerido').notEmpty(),
    body('birthDate', 'La fecha de nacimiento debe ser válida (YYYY-MM-DD)').optional().isISO8601()
  ],
  petController.createPet
);

// GET /api/pets/
// (Para obtener todas mis mascotas)
router.get('/', petController.getMyPets);

module.exports = router;