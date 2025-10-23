// routes/friendship.routes.js
const express = require('express');
const router = express.Router();
const friendshipController = require('../controllers/friendship.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Apply auth middleware to ALL routes in this file
// All friendship actions require the user to be logged in
router.use(authMiddleware);

// --- Friendship Routes ---

// POST /api/friendships/request/:userId
// Send a friend request to the user specified by :userId
router.post('/request/:userId', friendshipController.sendRequest);

// POST /api/friendships/:friendshipId/accept
// Accept a pending friend request specified by :friendshipId
router.post('/:friendshipId/accept', friendshipController.acceptRequest);

// POST /api/friendships/:friendshipId/reject
// Reject a pending friend request specified by :friendshipId
router.post('/:friendshipId/reject', friendshipController.rejectRequest);

// GET /api/friendships/
// Get the current user's list of accepted friends
router.get('/', friendshipController.getFriends);

// GET /api/friendships/pending
// Get pending friend requests received by the current user
router.get('/pending', friendshipController.getPendingRequests);

module.exports = router;