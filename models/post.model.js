// models/post.model.js
const db = require('../utils/db');

// Modelo para crear un nuevo post
exports.create = async ({ authorId, content, petId }) => {
  const query = `
    INSERT INTO posts (author_id, content, pet_id)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const params = [authorId, content, petId || null];
  
  const { rows } = await db.query(query, params);
  return rows[0]; // Devuelve el post recién creado
};

// Modelo para obtener todos los posts (el feed)
exports.findAll = async () => {
  const query = `
    SELECT 
        p.post_id,
        p.content,
        p.created_at,
        u.user_id AS author_id,
        u.username AS author_username,
        pet.pet_id,
        pet.name AS pet_name,
        pet.profile_picture_url AS pet_picture_url
    FROM posts p
    -- Unir con la tabla de usuarios para obtener el nombre del autor
    JOIN users u ON p.author_id = u.user_id
    -- Unir con la tabla de mascotas (opcional, por eso es LEFT JOIN)
    LEFT JOIN pets pet ON p.pet_id = pet.pet_id
    ORDER BY p.created_at DESC -- Mostrar los más nuevos primero
    LIMIT 50; -- Limitar a los 50 posts más recientes
  `;
  
  const { rows } = await db.query(query);
  return rows; // Devuelve un array de posts con info del autor/mascota
};