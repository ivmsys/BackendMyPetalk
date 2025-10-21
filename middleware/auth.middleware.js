// middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function(req, res, next) {
  // 1. Obtener el token del "header" de la petición
  const token = req.header('Authorization');

  // 2. Si no hay token, enviar error
  if (!token) {
    return res.status(401).json({ message: 'No hay token, permiso denegado' });
  }

  // 3. Verificar el token
  try {
    // El token viene como "Bearer <token>", solo queremos el <token>
    const tokenSinBearer = token.split(' ')[1];
    
    // jwt.verify descifra el token usando nuestro secreto
    const decoded = jwt.verify(tokenSinBearer, process.env.JWT_SECRET);

    // 4. Si es válido, guardamos el "payload" (los datos del user)
    //    en el objeto `req` para que las futuras rutas lo usen
    req.user = decoded.user;
    
    // 5. Llamamos a next() para que la petición continúe
    next();

  } catch (error) {
    res.status(401).json({ message: 'Token no es válido' });
  }
};