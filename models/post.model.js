// models/post.model.js
const db = require('../utils/db');

// Modelo para crear un nuevo post
exports.create = async ({ authorId, content, petIds, mediaUrls }) => {
  // 1. Crear el post principal
  const postQuery = `
    INSERT INTO posts (author_id, content)
    VALUES ($1, $2)
    RETURNING *;
  `;
  const postParams = [authorId, content];
  const { rows } = await db.query(postQuery, postParams);
  const newPost = rows[0];

  // 2. Insertar las etiquetas de mascotas (si existen)
  if (petIds && petIds.length > 0) {
    const tagsQuery = 'INSERT INTO post_pet_tags (post_id, pet_id) VALUES ($1, $2)';
    const tagPromises = petIds.map(petId => {
      return db.query(tagsQuery, [newPost.post_id, petId]);
    });
    await Promise.all(tagPromises);
  }

  // 3. ¡NUEVO! Insertar los archivos multimedia (si existen)
  if (mediaUrls && mediaUrls.length > 0) {
    const mediaQuery = 'INSERT INTO post_media (post_id, media_url, media_type) VALUES ($1, $2, $3)';
    const mediaPromises = mediaUrls.map(media => {
      return db.query(mediaQuery, [newPost.post_id, media.url, media.type]);
    });
    await Promise.all(mediaPromises);
  }

  return newPost; // Devuelve solo el post principal
};

// Modelo para obtener todos los posts (el feed)
// models/post.model.js
// ...
exports.findAll = async (currentUserId) => {
  const query = `
    SELECT 
      p.post_id,
      p.content,
      p.created_at,
      u.user_id AS author_id,
      u.username AS author_username,
      (SELECT COUNT(*) FROM post_likes pl_all WHERE pl_all.post_id = p.post_id) AS like_count,
      (CASE WHEN $1::UUID IS NOT NULL AND EXISTS (
        SELECT 1 FROM post_likes pl_user 
        WHERE pl_user.post_id = p.post_id AND pl_user.user_id = $1
      ) THEN true ELSE false END) AS user_has_liked,
      
      -- ⭐ NUEVO: Contador de comentarios
      (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.post_id) AS comment_count,
      
      COALESCE(
        (SELECT json_agg(json_build_object(
          'pet_id', pet.pet_id, 'name', pet.name
        ))
        FROM post_pet_tags ptt
        JOIN pets pet ON ptt.pet_id = pet.pet_id
        WHERE ptt.post_id = p.post_id),
        '[]'::json
      ) AS tagged_pets,
      
      -- Agrupar todos los media en un array JSON
      COALESCE(
        (SELECT json_agg(json_build_object(
          'media_id', pm.media_id,
          'url', pm.media_url,
          'type', pm.media_type
        ))
        FROM post_media pm
        WHERE pm.post_id = p.post_id),
        '[]'::json
      ) AS media
    FROM posts p
    JOIN users u ON p.author_id = u.user_id
    GROUP BY p.post_id, u.user_id
    ORDER BY p.created_at DESC
    LIMIT 50;
  `;
  
  const { rows } = await db.query(query, [currentUserId]);
  
  return rows.map(row => ({
    ...row,
    like_count: parseInt(row.like_count, 10),
    comment_count: parseInt(row.comment_count, 10) // ⭐ Convertir a número también
  }));
};


// models/post.model.js -> Añade esta función
// Modelo para eliminar un post por su ID y el ID del autor
exports.deleteByIdAndAuthor = async (postId, authorId) => {
  const query = `
    DELETE FROM posts
    WHERE post_id = $1 AND author_id = $2
    RETURNING post_id; -- Devuelve el ID si se borró algo
  `;
  const { rows } = await db.query(query, [postId, authorId]);
  return rows.length > 0; // Devuelve true si se borró, false si no
};