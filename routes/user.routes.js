// routes/user.routes.js
const express = require('express');
const router = express.Router();

// Import controllers and middleware
const userController = require('../controllers/user.controller'); 
const authMiddleware = require('../middleware/auth.middleware');
const uploadMiddleware = require('../middleware/upload.middleware');
// --- User Routes ---

// GET /api/users/me
// Gets the profile information of the currently logged-in user.
// 1. Passes through authMiddleware to ensure the user is logged in and get req.user.id.
// 2. Calls userController.getMe to fetch and return user data.
router.get(
  '/me',
  authMiddleware,   // Requires login
  userController.getMe 
);

// GET /api/users/search?q=...
// Searches for users by username based on the 'q' query parameter.
// 1. Passes through authMiddleware to ensure only logged-in users can search.
// 2. Calls userController.searchUsers to perform the search and return results.
router.get(
  '/search',        
  authMiddleware,   // Requires login
  userController.searchUsers 
);

module.exports = router; // Export the router for use in index.js

router.post(
  '/me/picture',
  authMiddleware,                   // Requiere login
  uploadMiddleware.single('image'), // Espera UN archivo llamado 'image'
  userController.uploadProfilePicture
);