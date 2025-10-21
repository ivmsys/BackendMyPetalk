// 1. Cargar variables de entorno (el .env)
require('dotenv').config();

// 2. Importar las librerías
const express = require('express');
const { Pool } = require('pg'); // Importar el conector de PostgreSQL
const cors = require('cors');
// 3. Crear la App de Express
const app = express();
const port = process.env.PORT || 3000; // Usar el puerto 3000 por defecto

app.use(cors());
// 4. Configurar el "Pool" de Conexión a la BD
//    pg usará automáticamente la variable DATABASE_URL que pusimos en .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // --- ¡ESTA ES LA CORRECCIÓN! ---
  // Forzamos SSL para TODAS las conexiones (locales y de producción)
  // ya que Render lo requiere para conexiones externas.
  ssl: {
    rejectUnauthorized: false
  }
});

// 5. Crear una ruta de prueba (Endpoint)
app.get('/', (req, res) => {
  res.send('¡Hola Mundo! La API está funcionando.');
});

// 6. Crear una ruta para PROBAR la conexión a la BD
app.get('/pingdb', async (req, res) => {
  try {
    const client = await pool.connect(); // Intenta conectar
    const result = await client.query('SELECT NOW()'); // Pide la hora actual a la BD

    res.json({
      message: '¡Conexión a la BD exitosa!',
      hora_db: result.rows[0].now
    });

    client.release(); // Libera la conexión
  } catch (error) {
    // Si falla, muestra el error
    res.status(500).json({
      message: '¡Error al conectar a la BD!',
      error: error.message
    });
  }
});

// 7. Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});