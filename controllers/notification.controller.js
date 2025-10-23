// controllers/notification.controller.js
const NotificationModel = require('../models/notification.model');

// Get unread notifications for the logged-in user
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await NotificationModel.findUnreadByUserId(req.user.id);
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Mark notifications as read
exports.markAsRead = async (req, res) => {
  // Expecting an array of notification IDs in the request body
  const { notificationIds } = req.body; 

  if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
    return res.status(400).json({ message: 'Se requiere un array de notificationIds.' });
  }

  try {
    // Optional: Verify that all notificationIds belong to req.user.id before marking

    const markedCount = await NotificationModel.markAsRead(notificationIds);
    res.json({ message: `${markedCount} notificaciones marcadas como leídas.` });

  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};