// controllers/pet.controller.js
const PetModel = require('../models/pet.model');
const { validationResult } = require('express-validator');

// Controlador para registrar una nueva mascota
exports.createPet = async (req, res) => {
  // Validar los datos que vienen del body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, species, breed, birthDate } = req.body;
  // Obtenemos el ID del dueño (que viene del token)
  const ownerId = req.user.id; 

  try {
    const newPet = await PetModel.create({
      ownerId,
      name,
      species,
      breed,
      birthDate
    });

    res.status(201).json({
      message: 'Mascota registrada exitosamente',
      pet: newPet
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Controlador para obtener TODAS las mascotas del usuario logueado
exports.getMyPets = async (req, res) => {
  try {
    // Usamos el ID del token para buscar las mascotas
    const pets = await PetModel.findByOwnerId(req.user.id);
    
    res.json(pets); // Devuelve un array (puede estar vacío)

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};