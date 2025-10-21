// middleware/upload.middleware.js
const multer = require('multer');

// Configurar para guardar el archivo en la memoria (RAM)
const storage = multer.memoryStorage();

// Crear la instancia de Multer
const upload = multer({ storage: storage });

module.exports = upload;