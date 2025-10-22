// models/post.model.js
const db = require('../utils/db');

// Modelo para crear un nuevo post
exports.create = async ({ authorId, content, petIds }) => {
  // 1. Crear el post principal
  const postQuery = `
    INSERT INTO posts (author_id, content)
    VALUES ($1, $2)
    RETURNING *;
  `;
  const postParams = [authorId, content];
  const { rows } = await db.query(postQuery, postParams);
  const newPost = rows[0];

  // 2. Si hay petIds, insertarlos en la tabla de etiquetas
  if (petIds && petIds.length > 0) {
    // Prepara una consulta de inserción múltiple
    const tagsQuery = 'INSERT INTO post_pet_tags (post_id, pet_id) VALUES ($1, $2)';
    
    // Crea un array de "promesas" de inserción
    const tagPromises = petIds.map(petId => {
      return db.query(tagsQuery, [newPost.post_id, petId]);
    });
    
    // Espera a que todas las etiquetas se inserten
    await Promise.all(tagPromises);
  }

  return newPost; // Devuelve solo el post principal
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
        
        -- Contar los "me gusta"
        (SELECT COUNT(*) FROM post_likes pl_all WHERE pl_all.post_id = p.post_id) AS like_count,
        
        -- Verificar si el usuario actual le dio "me gusta"
        (CASE WHEN $1::UUID IS NOT NULL AND EXISTS (
            SELECT 1 FROM post_likes pl_user 
            WHERE pl_user.post_id = p.post_id AND pl_user.user_id = $1
        ) THEN true ELSE false END) AS user_has_liked,
        
        -- ¡NUEVA SECCIÓN! Agrupar todas las mascotas etiquetadas en un array JSON
        COALESCE(
          (SELECT json_agg(json_build_object(
              'pet_id', pet.pet_id,
              'name', pet.name,
              'profile_picture_url', pet.profile_picture_url
          ))
           FROM post_pet_tags ptt
           JOIN pets pet ON ptt.pet_id = pet.pet_id
           WHERE ptt.post_id = p.post_id),
          '[]'::json
        ) AS tagged_pets
        
    FROM posts p
    
    -- Unir con usuarios (autor)
    JOIN users u ON p.author_id = u.user_id
    
    GROUP BY p.post_id, u.user_id
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