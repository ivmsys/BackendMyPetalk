// models/friendship.model.js
const db = require('../utils/db');

// Find any existing friendship between two users, regardless of status
exports.findExisting = async (userId1, userId2) => {
  const query = `
    SELECT * FROM friendships 
    WHERE (user_id1 = $1 AND user_id2 = $2) OR (user_id1 = $2 AND user_id2 = $1)
  `;
  const { rows } = await db.query(query, [userId1, userId2]);
  return rows[0];
};

// Find a specific friendship by its ID and the recipient's ID (for accepting/rejecting)
exports.findByIdAndRecipient = async (friendshipId, recipientId) => {
  const query = `
    SELECT * FROM friendships 
    WHERE friendship_id = $1           -- Busca por el ID de la amistad
      AND status = 'pending'           -- Asegura que esté pendiente
      AND (user_id1 = $2 OR user_id2 = $2) -- Asegura que el usuario sea parte de la amistad
      AND action_user_id != $2;        -- Asegura que la última acción NO la hizo el usuario actual
                                       -- (es decir, el OTRO usuario envió la solicitud)
  `;
  const { rows } = await db.query(query, [friendshipId, recipientId]);
  return rows[0]; // Devuelve la solicitud si cumple todas las condiciones
};

// Create a new friend request
// models/friendship.model.js - CORRECTED CODE
exports.createRequest = async (senderId, receiverId) => {
  // Ensure user_id1 < user_id2 for consistency with the unique index
  const userId1 = senderId < receiverId ? senderId : receiverId;
  const userId2 = senderId > receiverId ? senderId : receiverId;

  // CORRECTED QUERY: Uses $1, $2, $3 for the three distinct values
  const query = `
    INSERT INTO friendships (user_id1, user_id2, status, action_user_id)
    VALUES ($1, $2, 'pending', $3) 
    RETURNING *;
  `;
  // CORRECTED PARAMS: Matches the placeholders in the query
  const params = [userId1, userId2, senderId]; 

  const { rows } = await db.query(query, params); 
  return rows[0];
};

// Update the status of a friendship (accept/reject)
exports.updateStatus = async (friendshipId, newStatus, actionUserId) => {
  const query = `
    UPDATE friendships 
    SET status = $1, action_user_id = $2, updated_at = CURRENT_TIMESTAMP
    WHERE friendship_id = $3
    RETURNING *;
  `;
  const { rows } = await db.query(query, [newStatus, actionUserId, friendshipId]);
  return rows[0];
};

// Get all accepted friends for a user
exports.findFriends = async (userId) => {
  const query = `
    SELECT 
      f.friendship_id, 
      f.status,
      -- Select the friend's details (the one who ISN'T the current user)
      CASE 
        WHEN f.user_id1 = $1 THEN f.user_id2 
        ELSE f.user_id1 
      END as friend_user_id,
      CASE 
        WHEN f.user_id1 = $1 THEN u2.username 
        ELSE u1.username 
      END as friend_username
    FROM friendships f
    JOIN users u1 ON f.user_id1 = u1.user_id
    JOIN users u2 ON f.user_id2 = u2.user_id
    WHERE (f.user_id1 = $1 OR f.user_id2 = $1) AND f.status = 'accepted';
  `;
  const { rows } = await db.query(query, [userId]);
  return rows;
};

// Get all pending friend requests received by a user
exports.findPendingRequests = async (userId) => {
  const query = `
    SELECT 
      f.friendship_id, 
      f.status,
      f.user_id1 AS sender_id, -- The sender is always user_id1 in a pending request sent to user_id2
      u1.username AS sender_username,
      f.created_at
    FROM friendships f
    JOIN users u1 ON f.user_id1 = u1.user_id -- Join to get sender's username
    WHERE f.user_id2 = $1 AND f.status = 'pending' AND f.action_user_id = f.user_id1;
    -- action_user_id = user_id1 ensures we only get requests sent BY user1 TO user2
  `;
  const { rows } = await db.query(query, [userId]);
  return rows;
};