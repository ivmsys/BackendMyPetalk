// controllers/post.controller.js
const PostModel = require('../models/post.model');
const LikeModel = require('../models/like.model');
const { validationResult } = require('express-validator');

// Controlador para crear un nuevo post
exports.createPost = async (req, res) => {
  // Validar los datos que vienen del body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { content, petId } = req.body;
  // Obtenemos el ID del autor (que viene del token)
  const authorId = req.user.id; 

  try {
    // Aquí podrías añadir una verificación:
    // ¿El 'petId' (si existe) realmente le pertenece al 'authorId'?
    // (Por ahora lo omitiremos para simplificar, pero es una mejora de seguridad)

    const newPost = await PostModel.create({
      authorId,
      content,
      petId
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