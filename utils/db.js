// utils/db.js
const { Pool } = require('pg');

// pg usará automáticamente la variable DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Exportamos una función para hacer "queries"
module.exports = {
  query: (text, params) => pool.query(text, params),
};