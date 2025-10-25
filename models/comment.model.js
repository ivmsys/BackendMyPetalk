// models/comment.model.js
const db = require('../utils/db');

// Modelo para crear un nuevo comentario
exports.create = async ({ postId, authorId, content }) => {
  const query = `
    INSERT INTO comments (post_id, author_id, content)
    VALUES ($1, $2, $3)
    RETURNING comment_id, post_id, author_id, content, created_at; 
    -- Devolvemos el comentario sin info del autor aún
  `;
  const params = [postId, authorId, content];
  const { rows } = await db.query(query, params);
  return rows[0];
};

// Modelo para obtener todos los comentarios de un post (con autor)
exports.findByPostId = async (postId) => {
  const query = `
    SELECT 
      c.comment_id,
      c.post_id,
      c.author_id,
      c.content,
      c.created_at,
      u.username AS author_username -- Añadimos el nombre del autor
    FROM comments c
    JOIN users u ON c.author_id = u.user_id -- Unimos con la tabla users
    WHERE c.post_id = $1
    ORDER BY c.created_at ASC; -- Mostrar comentarios del más antiguo al más nuevo
  `;
  const { rows } = await db.query(query, [postId]);
  return rows; // Devuelve un array de comentarios
};