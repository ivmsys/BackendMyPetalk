// models/pet.model.js
const db = require('../utils/db');

// Modelo para crear una nueva mascota
exports.create = async ({ ownerId, name, species, breed, birthDate }) => {
  const query = `
    INSERT INTO pets (owner_id, name, species, breed, birth_date)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  // birthDate puede ser null, así que lo manejamos
  const params = [ownerId, name, species || null, breed || null, birthDate || null];
  
  const { rows } = await db.query(query, params);
  return rows[0]; // Devuelve la mascota recién creada
};

// Modelo para encontrar todas las mascotas de un dueño
exports.findByOwnerId = async (ownerId) => {
  const query = `
    SELECT * FROM pets
    WHERE owner_id = $1
    ORDER BY created_at DESC;
  `;
  const params = [ownerId];

  const { rows } = await db.query(query, params);
  return rows; // Devuelve un array de mascotas
};