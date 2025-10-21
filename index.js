// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Importar nuestras rutas
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const petRoutes = require('./routes/pet.routes');
const postRoutes = require('./routes/post.routes');
// (Aquí importaremos más rutas en el futuro, ej: post.routes.js)

const app = express();
const port = process.env.PORT || 3000;

// --- Configuración de Middlewares ---

// Configurar CORS con una "whitelist"
const whitelist = [
  'http://localhost:5500', // Tu Live Server local
  'https://petnetwork.netlify.app/' // ¡¡CAMBIA ESTO POR TU URL REAL DE NETLIFY!!
];

const corsOptions = {
  origin: function (origin, callback) {
    // !origin permite peticiones sin origen (como Postman o apps móviles)
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  }
};

app.use(cors(corsOptions)); // <-- ¡Usa la nueva configuración!
app.use(express.json()); // Permite que Express entienda JSON

// (El resto de tu index.js sigue igual...)

// --- Definición de Rutas ---
app.get('/', (req, res) => {
  res.send('¡Hola Mundo! La API de mascotas está funcionando.');
});

// Usamos las rutas de autenticación
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/posts', postRoutes);
// (Tu ruta de /pingdb ya no es necesaria, la borramos)
// (El pool de BD también lo borramos de aquí, ahora está en utils/db.js)

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});