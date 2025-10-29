// controllers/friendship.controller.js
const FriendshipModel = require('../models/friendship.model');
const NotificationModel = require('../models/notification.model');

// Send a friend request
exports.sendRequest = async (req, res) => {
  const senderId = req.user.id; // From authMiddleware
  const receiverId = req.params.userId; // From URL: /api/friendships/:userId

  // Prevent sending request to oneself
  if (senderId === receiverId) {
    return res.status(400).json({ message: 'No puedes enviarte una solicitud a ti mismo.' });
  }

  try {
    // Check if a friendship/request already exists
    const existingFriendship = await FriendshipModel.findExisting(senderId, receiverId);
    if (existingFriendship) {
      if (existingFriendship.status === 'accepted') {
        return res.status(400).json({ message: 'Ya son amigos.' });
      } else if (existingFriendship.status === 'pending') {
        return res.status(400).json({ message: 'Ya existe una solicitud pendiente.' });
      } // Could add checks for 'rejected' or 'blocked' if needed
    }

    // Create the 'pending' friendship entry
    const newFriendship = await FriendshipModel.createRequest(senderId, receiverId);

    // Create a notification for the receiver
    await NotificationModel.create({
      userId: receiverId,
      type: 'friend_request',
      senderId: senderId,
      relatedEntityId: newFriendship.friendship_id
    });

    res.status(201).json({ message: 'Solicitud de amistad enviada.', friendship: newFriendship });

  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Accept a friend request
exports.acceptRequest = async (req, res) => {
  const recipientId = req.user.id; // The user accepting the request
  const { friendshipId } = req.params; // From URL: /api/friendships/:friendshipId/accept

  try {
    // Find the pending request where the current user is the recipient
    const friendship = await FriendshipModel.findByIdAndRecipient(friendshipId, recipientId);

    if (!friendship) {
      return res.status(404).json({ message: 'Solicitud no encontrada o ya no está pendiente.' });
    }

    // Update the status to 'accepted'
    const updatedFriendship = await FriendshipModel.updateStatus(friendshipId, 'accepted', recipientId);
    const notification = await NotificationModel.findByRelatedIdAndType(friendshipId, 'friend_request');
    if (notification) {
        await NotificationModel.markAsRead([notification.notification_id]);
    }
    // Crear notificación para el usuario QUE ENVIÓ la solicitud original
    // El 'recipientId' es quien ACEPTA. El 'senderId' es el otro usuario.
    const senderId = (updatedFriendship.user_id1 === recipientId) 
                      ? updatedFriendship.user_id2 
                      : updatedFriendship.user_id1;

    await NotificationModel.create({ 
        userId: senderId,               // Usuario que recibe esta nueva notificación
        type: 'friend_accepted',        // Tipo de notificación
        senderId: recipientId,          // Quién aceptó (tú)
        relatedEntityId: friendshipId   // ID de la amistad
    });

    res.json({ message: 'Solicitud de amistad aceptada.', friendship: updatedFriendship });

  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Reject a friend request
exports.rejectRequest = async (req, res) => {
  const recipientId = req.user.id; // The user rejecting
  const { friendshipId } = req.params; // From URL

  try {
    const friendship = await FriendshipModel.findByIdAndRecipient(friendshipId, recipientId);

    if (!friendship) {
      return res.status(404).json({ message: 'Solicitud no encontrada o ya no está pendiente.' });
    }

    // Update status to 'rejected'
    // Alternative: could delete the row entirely
    const updatedFriendship = await FriendshipModel.updateStatus(friendshipId, 'rejected', recipientId);
    // Buscar y marcar la notificación de solicitud como leída
    const notification = await NotificationModel.findByRelatedIdAndType(friendshipId, 'friend_request');
    if (notification) {
        await NotificationModel.markAsRead([notification.notification_id]);
    }
    // Optional: Delete the original friend_request notification?

    res.json({ message: 'Solicitud de amistad rechazada.', friendship: updatedFriendship });

  } catch (error) {
    console.error('Error rejecting friend request:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Get the user's list of accepted friends
exports.getFriends = async (req, res) => {
  try {
    const friends = await FriendshipModel.findFriends(req.user.id);
    res.json(friends);
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Get pending friend requests received by the user
exports.getPendingRequests = async (req, res) => {
  try {
    const requests = await FriendshipModel.findPendingRequests(req.user.id);
    res.json(requests);
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};