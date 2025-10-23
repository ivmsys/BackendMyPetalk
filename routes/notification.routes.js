// routes/notification.routes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Apply auth middleware to ALL routes in this file
// Accessing notifications requires the user to be logged in
router.use(authMiddleware);

// --- Notification Routes ---

// GET /api/notifications/
// Get all unread notifications for the current user
router.get('/', notificationController.getNotifications);

// POST /api/notifications/read
// Mark specific notifications as read (expects an array of IDs in the body)
router.post('/read', notificationController.markAsRead);

module.exports = router;