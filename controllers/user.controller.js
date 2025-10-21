// controllers/user.controller.js
const UserModel = require('../models/user.model');

// Controlador para obtener el perfil del usuario logueado
exports.getMe = async (req, res) => {
  try {
    // req.user.id fue añadido por el auth.middleware
    const user = await UserModel.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(user); // Devuelve los datos del usuario

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};