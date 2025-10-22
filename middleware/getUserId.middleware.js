// middleware/getUserId.middleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Este middleware es como auth.middleware, pero opcional.
// No falla si no hay token, simplemente no añade req.user.
module.exports = function(req, res, next) {
  const token = req.header('Authorization');

  if (!token) {
    return next(); // No hay token, sigue adelante sin req.user
  }

  try {
    const tokenSinBearer = token.split(' ')[1];
    const decoded = jwt.verify(tokenSinBearer, process.env.JWT_SECRET);
    req.user = decoded.user; // Añade el usuario a la request
    next(); // Sigue adelante
  } catch (error) {
    // Token inválido (ignóralo, como si no hubiera token)
    next();
  }
};