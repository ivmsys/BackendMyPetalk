// middleware/upload.middleware.js
const multer = require('multer');

// Configurar dónde se guardarán los archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Carpeta de destino
  },
  filename: function (req, file, cb) {
    // Usar un nombre único (fecha + nombre original)
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Crear la instancia de Multer
const upload = multer({ storage: storage });

module.exports = upload;