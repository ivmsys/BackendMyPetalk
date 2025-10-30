// controllers/post.controller.js
const PostModel = require('../models/post.model');
const LikeModel = require('../models/like.model');
const NotificationModel = require('../models/notification.model');
const { validationResult } = require('express-validator');
const cloudinary = require('cloudinary').v2;

// Controlador para crear un nuevo post
exports.createPost = async (req, res) => {
  // 1. Validar los datos que vienen del body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // 2. Obtener datos. ¡petIds viene como STRING desde FormData!
  const { content } = req.body;
  const petIds = req.body.petIds ? JSON.parse(req.body.petIds) : []; // Convertir de string a array
  const authorId = req.user.id;
  const files = req.files; // Array de archivos de Multer
  
  let mediaUrls = []; // Array para guardar las URLs de Cloudinary

  try {
    // 3. Subir archivos a Cloudinary (si existen)
    if (files && files.length > 0) {
      // Usamos Promise.all para subir todos en paralelo
      const uploadPromises = files.map(file => {
        // Convertir el buffer a data-uri
        const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        // Detectar si es video
        const resourceType = file.mimetype.startsWith('video') ? 'video' : 'image';
        
        return cloudinary.uploader.upload(dataUri, {
          folder: `pet-social/posts/${authorId}`,
          resource_type: resourceType // Decirle a Cloudinary si es video o imagen
        });
      });
      
      const uploadResults = await Promise.all(uploadPromises);
      
      // Guardar solo la URL y el tipo
      mediaUrls = uploadResults.map(result => ({
        url: result.secure_url,
        type: result.resource_type
      }));
    }

    // 4. Crear el post en la base de datos
    const newPost = await PostModel.create({
      authorId,
      content,
      petIds,
      mediaUrls // Pasamos el array de URLs
    });

    res.status(201).json({
      message: 'Post creado exitosamente',
      post: newPost
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Controlador para obtener todos los posts (el feed)
exports.getAllPosts = async (req, res) => {
  try {
    // req.user puede existir o no, gracias a nuestro nuevo middleware
    const currentUserId = req.user ? req.user.id : null;

    const posts = await PostModel.findAll(currentUserId);
    res.json(posts);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Controlador para alternar "Me Gusta" en un post
exports.toggleLike = async (req, res) => {
  try {
    const userId = req.user.id; // Requiere login
    const { postId } = req.params; // De la URL

    // 1. Verificar si el "me gusta" ya existe
    const existingLike = await LikeModel.find(userId, postId);

    let userHasLiked;

    if (existingLike) {
      // 2. Si existe, borrarlo (unlike)
      await LikeModel.delete(userId, postId);
      userHasLiked = false;
    } else {
      // 3. Si no existe, crearlo (like)
      await LikeModel.create(userId, postId);
      userHasLiked = true;

      const post = await PostModel.findById(postId);
      if (post && post.author_id !== userId) { // Verificar que el post existe y no es propio
        await NotificationModel.create({
          userId: post.author_id,   // Notificación para el autor del post
          type: 'like',             // Tipo: like
          senderId: userId,         // Quién dio like
          relatedEntityId: postId   // ID del post que recibió el like
        });
      }
    }

    // 4. Obtener el nuevo conteo total
    const newLikeCount = await LikeModel.countForPost(postId);

    // 5. Responder al frontend
    res.json({
      message: userHasLiked ? 'Like añadido' : 'Like eliminado',
      userHasLiked,
      newLikeCount
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};
// Controlador para eliminar un post
exports.deletePost = async (req, res) => {
  const authorId = req.user.id; // Del token
  const { postId } = req.params; // De la URL

  try {
    const deleted = await PostModel.deleteByIdAndAuthor(postId, authorId);

    if (!deleted) {
      return res.status(404).json({ message: 'Post no encontrado o no tienes permiso para eliminarlo.' });
    }

    res.json({ message: 'Post eliminado exitosamente.' });

  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};