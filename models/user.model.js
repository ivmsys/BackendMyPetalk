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
    SELECT user_id, username, email, created_at FROM users
    WHERE user_id = $1;
  `;
  const params = [userId];

  const { rows } = await db.query(query, params);
  return rows[0]; // Devuelve el usuario (sin el hash)
};
// Modelo para buscar usuarios por nombre de usuario
// (ILIKE no distingue mayúsculas/minúsculas)
exports.searchByUsername = async (query, currentUserId) => {
  // Añade '%' para buscar coincidencias parciales
  const searchQuery = `%${query}%`; 
  const sql = `
    SELECT user_id, username, email FROM users 
    WHERE username ILIKE $1 
      AND user_id != $2 -- Excluirse a uno mismo de la búsqueda
    LIMIT 10; -- Limitar a 10 resultados
  `;

  const { rows } = await db.query(sql, [searchQuery, currentUserId]);
  return rows; // Devuelve un array de usuarios encontrados (o vacío)
};

