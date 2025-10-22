// middleware/upload.middleware.js
const multer = require('multer');

// Configurar para guardar el archivo en la memoria (RAM)
const storage = multer.memoryStorage();

// Crear la instancia de Multer
const multerInstance = multer({ storage: storage });

// Exportamos dos middlewares separados
module.exports = {
  // Para un solo archivo (como la foto de perfil de la mascota)
  single: (fieldName) => multerInstance.single(fieldName),
  
  // Para múltiples archivos (hasta 4)
  array: (fieldName, maxCount) => multerInstance.array(fieldName, maxCount)
};