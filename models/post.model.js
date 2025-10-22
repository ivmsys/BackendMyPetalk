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
exports.findAll = async (currentUserId) => {
  const query = `
    SELECT 
        p.post_id,
        p.content,
        p.created_at,
        u.user_id AS author_id,
        u.username AS author_username,
        pet.pet_id,
        pet.name AS pet_name,
        pet.profile_picture_url AS pet_picture_url,
        
        -- Contar TODOS los "me gusta" para este post
        COUNT(pl_all.user_id) AS like_count,
        
        -- Verificar si el USUARIO ACTUAL (si existe) le dio "me gusta"
        (CASE WHEN $1::UUID IS NOT NULL AND EXISTS (
            SELECT 1 FROM post_likes pl_user 
            WHERE pl_user.post_id = p.post_id AND pl_user.user_id = $1
        ) THEN true ELSE false END) AS user_has_liked
        
    FROM posts p
    
    -- Unir con usuarios (autor)
    JOIN users u ON p.author_id = u.user_id
    
    -- Unir con mascotas (opcional)
    LEFT JOIN pets pet ON p.pet_id = pet.pet_id
    
    -- Unir con TODOS los "me gusta" para el conteo
    LEFT JOIN post_likes pl_all ON p.post_id = pl_all.post_id
    
    GROUP BY p.post_id, u.user_id, pet.pet_id
    ORDER BY p.created_at DESC -- Mostrar los más nuevos primero
    LIMIT 50;
  `;
  
  const { rows } = await db.query(query, [currentUserId]);
  // Convertimos el conteo (que es un string) a número
  return rows.map(row => ({
    ...row,
    like_count: parseInt(row.like_count, 10)
  }));
};