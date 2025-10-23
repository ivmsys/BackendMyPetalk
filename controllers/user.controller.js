// controllers/user.controller.js
const UserModel = require('../models/user.model');
const PetModel = require('../models/pet.model');
const FriendshipModel = require('../models/friendship.model');
// controllers/user.controller.js
const cloudinary = require('cloudinary').v2;
// ... (asegúrate de que esté configurado como en pet.controller.js)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});
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
exports.searchUsers = async (req, res) => {
  try {
    // Obtenemos el término de búsqueda de la URL (ej. /search?q=milo)
    // 'q' es el nombre estándar para "query" o término de búsqueda
    const { q } = req.query; 

    // Validamos que el término de búsqueda no esté vacío
    if (!q) {
      return res.status(400).json({ message: 'El término de búsqueda (q) es requerido' });
    }

    // Obtenemos nuestro propio ID del token (añadido por authMiddleware)
    // para no buscarnos a nosotros mismos
    const currentUserId = req.user.id;

    // Llamamos a la nueva función del modelo
    const users = await UserModel.searchByUsername(q, currentUserId);

    res.json(users); // Devuelve el array de usuarios encontrados

  } catch (error) {
    console.error('Error en searchUsers:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// controllers/user.controller.js -> Añade esta función
// Controlador para subir la foto de perfil del usuario logueado
exports.uploadProfilePicture = async (req, res) => {
  const userId = req.user.id; // Del token

  try {
    // 1. Verificar si el archivo se subió
    if (!req.file) {
      return res.status(400).json({ message: 'No se subió ningún archivo' });
    }

    // 2. Subir a Cloudinary (usando el buffer de memoria)
    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: `pet-social/users/${userId}`, // Carpeta específica para usuarios
      public_id: `profile_${userId}`, // Nombre de archivo predecible
      overwrite: true, // Sobrescribe si ya existe
      transformation: [ // Opcional: Recorta a cuadrado y redimensiona
        { width: 300, height: 300, gravity: "face", crop: "thumb" },
        { radius: "max" } // Opcional: Hace la imagen redonda
      ]
    });

    // 3. Guardar la URL segura en la base de datos
    const updatedUser = await UserModel.updateProfilePicture(userId, result.secure_url);

    res.json({
      message: 'Foto de perfil actualizada exitosamente',
      user: updatedUser // Devuelve el usuario con la nueva URL
    });

  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// controllers/user.controller.js -> Añade esta función
// Controlador para obtener el perfil público de otro usuario
// controllers/user.controller.js -> Reemplaza getUserProfile
exports.getUserProfile = async (req, res) => {
  try {
    const userIdToView = req.params.userId;
    const currentUserId = req.user.id;

    if (userIdToView === currentUserId) {
      return res.status(400).json({ message: 'Usa /api/users/me para ver tu propio perfil.' });
    }

    // Buscamos usuario y mascotas en paralelo
    const [userData, petsData] = await Promise.all([
      UserModel.findByIdPublic(userIdToView),
      PetModel.findByOwnerIdPublic(userIdToView)
    ]);

    if (!userData) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // --- ¡NUEVO! Buscar estado de amistad ---
    let friendshipStatus = null;
    const friendship = await FriendshipModel.findExisting(currentUserId, userIdToView);
    if (friendship) {
        friendshipStatus = friendship.status; // 'pending', 'accepted', 'rejected', etc.
        // Podríamos añadir quién envió la solicitud pendiente si quisiéramos ser más específicos
    }
    // --- FIN DE NUEVO ---

    res.json({
      user: userData,
      pets: petsData,
      friendshipStatus: friendshipStatus // <-- Añadimos el estado a la respuesta
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

