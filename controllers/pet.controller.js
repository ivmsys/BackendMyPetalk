// controllers/pet.controller.js
const PetModel = require('../models/pet.model');
const { validationResult } = require('express-validator');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

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

// Controlador para subir la foto de perfil de una mascota
exports.uploadPetPicture = async (req, res) => {
  try {
    const { petId } = req.params; // ID de la mascota (de la URL)
    const ownerId = req.user.id; // ID del dueño (del token)

    // 1. Verificar si el archivo se subió
    if (!req.file) {
      return res.status(400).json({ message: 'No se subió ningún archivo' });
    }

    // 2. Verificar que la mascota le pertenece al usuario
    const pet = await PetModel.findByIdAndOwner(petId, ownerId);
    if (!pet) {
      // Si no le pertenece, borrar el archivo subido y denegar
      fs.unlinkSync(req.file.path); // Borra el archivo temporal
      return res.status(403).json({ message: 'Permiso denegado. Esta mascota no es tuya.' });
    }

    // 3. Convertir el buffer (archivo en memoria) a un string data-uri
    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // Subir el data-uri a Cloudinary
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: `pet-social/${ownerId}`, // Organiza en carpetas por usuario
      public_id: `${petId}_profile` // Nombre del archivo en Cloudinary
    });


    // 5. Guardar la URL segura en la base de datos
    const updatedPet = await PetModel.updateProfilePicture(petId, result.secure_url);

    res.json({
      message: 'Foto de perfil actualizada exitosamente',
      pet: updatedPet
    });

  } catch (error) {
  console.error(error);
  // ¡Ya no necesitamos borrar el archivo, no existe en disco!
  res.status(500).json({ message: 'Error en el servidor' });
}
};

// Controlador para eliminar una mascota
exports.deletePet = async (req, res) => {
  const ownerId = req.user.id; // Del token
  const { petId } = req.params; // De la URL

  try {
    const deleted = await PetModel.deleteByIdAndOwner(petId, ownerId);

    if (!deleted) {
      // Si no se borró, es porque no existe o no le pertenece
      return res.status(404).json({ message: 'Mascota no encontrada o no tienes permiso para eliminarla.' });
    }

    res.json({ message: 'Mascota eliminada exitosamente.' });

  } catch (error) {
    console.error('Error deleting pet:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};