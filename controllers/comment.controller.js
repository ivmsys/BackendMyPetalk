// controllers/comment.controller.js
const CommentModel = require('../models/comment.model');
const PostModel = require('../models/post.model'); // Para verificar que el post exista
const UserModel = require('../models/user.model'); // Para obtener datos del autor
const { validationResult } = require('express-validator');

// Controlador para añadir un comentario a un post
exports.addComment = async (req, res) => {
  // Validar input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const authorId = req.user.id; // Del token
  const { postId } = req.params; // De la URL
  const { content } = req.body;

  try {
    // (Opcional pero recomendado: verificar si el post existe antes de comentar)
    // const postExists = await PostModel.findById(postId); // Necesitaríamos añadir findById a PostModel
    // if (!postExists) {
    //   return res.status(404).json({ message: 'Post no encontrado' });
    // }

    // Crear el comentario
    const newComment = await CommentModel.create({ postId, authorId, content });

    // Obtener el nombre de usuario para devolverlo en la respuesta
    // (Alternativa: Modificar CommentModel.create para que devuelva el username)
    const author = await UserModel.findById(authorId); 

    // Devolvemos el comentario incluyendo el nombre del autor
    res.status(201).json({
      message: 'Comentario añadido exitosamente',
      comment: {
          ...newComment,
          author_username: author ? author.username : 'Usuario Desconocido' 
      }
    });

  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Controlador para obtener los comentarios de un post
exports.getComments = async (req, res) => {
  const { postId } = req.params; // De la URL

  try {
    const comments = await CommentModel.findByPostId(postId);
    res.json(comments); // Devuelve array (puede estar vacío)

  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};