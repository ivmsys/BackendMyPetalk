// controllers/post.controller.js
const PostModel = require('../models/post.model');
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
    const posts = await PostModel.findAll();
    res.json(posts); // Devuelve un array de posts

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};