// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Importar nuestras rutas
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const petRoutes = require('./routes/pet.routes');
const postRoutes = require('./routes/post.routes');
const friendshipRoutes = require('./routes/friendship.routes');
const notificationRoutes = require('./routes/notification.routes');

const app = express();
const port = process.env.PORT || 3000;

// --- Configuración de Middlewares ---

// Configurar CORS con una "whitelist"
// Habilita CORS para TODOS los dominios
app.use(cors());
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
app.use('/api/friendships', friendshipRoutes);
app.use('/api/notifications', notificationRoutes);
// (El pool de BD también lo borramos de aquí, ahora está en utils/db.js)

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});