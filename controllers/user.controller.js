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
// Controlador para buscar usuarios
exports.searchUsers = async (req, res) => {
  try {
    // Obtenemos el término de búsqueda de la URL (ej. /search?q=milo)
    const { q } = req.query; 
    
    if (!q) {
      return res.status(400).json({ message: 'El término de búsqueda (q) es requerido' });
    }
    
    // Obtenemos nuestro propio ID del token para no buscarnos a nosotros mismos
    const currentUserId = req.user.id;

    const users = await UserModel.searchByUsername(q, currentUserId);
    
    res.json(users); // Devuelve un array de usuarios

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};