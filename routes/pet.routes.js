// routes/pet.routes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const petController = require('../controllers/pet.controller');
const authMiddleware = require('../middleware/auth.middleware');
const uploadMiddleware = require('../middleware/upload.middleware');
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

// POST /api/pets/:petId/upload-picture
// (Para subir la foto de una mascota)
router.post(
  '/:petId/upload-picture',
  // Usamos el middleware de Multer para manejar un solo archivo llamado "image"
  uploadMiddleware.single('image'), 
  petController.uploadPetPicture
);
// DELETE /api/pets/:petId
// (Para eliminar una mascota - PROTEGIDA)
router.delete(
  '/:petId',
  petController.deletePet // Ya tenemos authMiddleware aplicado a todo el router
);

module.exports = router;