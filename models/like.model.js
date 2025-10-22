// models/like.model.js
const db = require('../utils/db');

// Modelo para encontrar un like específico
exports.find = async (userId, postId) => {
  const query = 'SELECT * FROM post_likes WHERE user_id = $1 AND post_id = $2';
  const { rows } = await db.query(query, [userId, postId]);
  return rows[0];
};

// Modelo para crear un like
exports.create = async (userId, postId) => {
  const query = 'INSERT INTO post_likes (user_id, post_id) VALUES ($1, $2) RETURNING *';
  const { rows } = await db.query(query, [userId, postId]);
  return rows[0];
};

// Modelo para borrar un like
exports.delete = async (userId, postId) => {
  const query = 'DELETE FROM post_likes WHERE user_id = $1 AND post_id = $2';
  await db.query(query, [userId, postId]);
};

// Modelo para contar los likes de un post
exports.countForPost = async (postId) => {
  const query = 'SELECT COUNT(*) FROM post_likes WHERE post_id = $1';
  const { rows } = await db.query(query, [postId]);
  // Devuelve el conteo como un número entero
  return parseInt(rows[0].count, 10); 
};