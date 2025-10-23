// models/user.model.js
const db = require('../utils/db'); // Importamos nuestra utilidad de BD

// Modelo para crear un nuevo usuario
exports.create = async ({ username, email, passwordHash }) => {
  const query = `
    INSERT INTO users (username, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING user_id, username, email, created_at;
  `;
  const params = [username, email, passwordHash];

  const { rows } = await db.query(query, params);
  return rows[0]; // Devuelve el usuario recién creado
};

// Modelo para encontrar un usuario por email o username
exports.findByEmailOrUsername = async ({ email, username }) => {
  const query = `
    SELECT * FROM users
    WHERE email = $1 OR username = $2;
  `;
  const params = [email, username];

  const { rows } = await db.query(query, params);
  return rows[0]; // Devuelve el usuario si existe, o undefined si no
};

// Modelo para encontrar un usuario por su ID (seguro, sin contraseña)
exports.findById = async (userId) => {
  const query = `
    SELECT user_id, username, email, created_at, profile_picture_url -- <-- AÑADE ESTA COLUMNA
    FROM users
    WHERE user_id = $1;
  `;
  const params = [userId];

  const { rows } = await db.query(query, params);
  return rows[0]; // Devuelve el usuario (sin el hash)
};
// Modelo para buscar usuarios por nombre de usuario
// (ILIKE no distingue mayúsculas/minúsculas)
// models/user.model.js -> Reemplaza searchByUsername
exports.searchByUsername = async (query, currentUserId) => {
  const searchQuery = `%${query}%`;
  const sql = `
    SELECT 
      u.user_id, 
      u.username, 
      u.email, -- Todavía lo necesitamos aquí para buscar, pero no lo mostraremos siempre
      u.profile_picture_url,
      -- Subconsulta para encontrar el estado de amistad con el usuario actual
      (SELECT status FROM friendships f
       WHERE (f.user_id1 = $2 AND f.user_id2 = u.user_id)
          OR (f.user_id1 = u.user_id AND f.user_id2 = $2)
      ) as friendship_status -- Puede ser 'pending', 'accepted', 'rejected', null
    FROM users u
    WHERE u.username ILIKE $1 
      AND u.user_id != $2 -- Excluirse a uno mismo
    LIMIT 10;
  `;

  const { rows } = await db.query(sql, [searchQuery, currentUserId]);
  // Quitar el email antes de devolver (solo lo usamos para buscar)
  return rows.map(({ email, ...rest }) => rest);
};

// models/user.model.js -> Añade esta función
// Modelo para actualizar la URL de la foto de perfil del usuario
exports.updateProfilePicture = async (userId, profilePictureUrl) => {
  const query = `
    UPDATE users
    SET profile_picture_url = $1
    WHERE user_id = $2
    RETURNING user_id, username, email, created_at, profile_picture_url; -- Devuelve el usuario actualizado
  `;
  const { rows } = await db.query(query, [profilePictureUrl, userId]);
  return rows[0];
};
// models/user.model.js -> Añade esta función
// Modelo para obtener datos públicos de un usuario por ID
exports.findByIdPublic = async (userId) => {
  const query = `
    SELECT user_id, username, created_at, profile_picture_url 
    FROM users
    WHERE user_id = $1;
  `;
  const { rows } = await db.query(query, [userId]);
  return rows[0];
};