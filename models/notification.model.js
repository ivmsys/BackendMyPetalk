// models/notification.model.js
const db = require('../utils/db');

// Create a new notification
exports.create = async ({ userId, type, senderId, relatedEntityId }) => {
  const query = `
    INSERT INTO notifications (user_id, type, sender_id, related_entity_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const params = [userId, type, senderId || null, relatedEntityId || null];
  const { rows } = await db.query(query, params);
  return rows[0];
};
// Encontrar una notificación por su related_entity_id y tipo
exports.findByRelatedIdAndType = async (relatedId, type) => {
  const query = `
    SELECT notification_id FROM notifications 
    WHERE related_entity_id = $1 AND type = $2 AND is_read = FALSE 
    LIMIT 1;`; // Asumimos que solo hay una notificación de solicitud activa por amistad
  const { rows } = await db.query(query, [relatedId, type]);
  return rows[0];
};
// Get unread notifications for a user, including sender's username
exports.findUnreadByUserId = async (userId) => {
  const query = `
    SELECT 
      n.notification_id, 
      n.type, 
      n.related_entity_id, 
      n.is_read, 
      n.created_at,
      n.sender_id,
      u.username AS sender_username -- Include sender's username
    FROM notifications n
    LEFT JOIN users u ON n.sender_id = u.user_id -- LEFT JOIN in case sender is null
    WHERE n.user_id = $1 AND n.is_read = FALSE
    ORDER BY n.created_at DESC;
  `;
  const { rows } = await db.query(query, [userId]);
  return rows;
};

// Mark specific notifications as read
exports.markAsRead = async (notificationIds) => {
  // Ensure notificationIds is an array
  if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
    return 0; // No notifications to mark
  }
  // Use ANY($1::uuid[]) to check against an array of UUIDs
  const query = `
    UPDATE notifications 
    SET is_read = TRUE 
    WHERE notification_id = ANY($1::uuid[]) AND is_read = FALSE; 
  `;
  // The result contains rowCount, which is the number of rows affected
  const result = await db.query(query, [notificationIds]);
  return result.rowCount;
};