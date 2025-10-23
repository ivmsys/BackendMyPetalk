-- Tabla para almacenar las relaciones de amistad (SIN la restricción UNIQUE interna)
CREATE TABLE friendships (
    friendship_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id1 UUID NOT NULL, 
    user_id2 UUID NOT NULL, 
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')), 
    action_user_id UUID NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user1 FOREIGN KEY(user_id1) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_user2 FOREIGN KEY(user_id2) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_action_user FOREIGN KEY(action_user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ¡NUEVO! Crear un índice único para evitar duplicados (A-B y B-A)
-- Esto logra el mismo objetivo que la restricción anterior.
CREATE UNIQUE INDEX idx_unique_friendship ON friendships (LEAST(user_id1, user_id2), GREATEST(user_id1, user_id2));

-- Tabla para almacenar notificaciones (SIN CAMBIOS)
CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, 
    type VARCHAR(50) NOT NULL, 
    sender_id UUID, 
    related_entity_id UUID, 
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_sender FOREIGN KEY(sender_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Índices (SIN CAMBIOS)
CREATE INDEX idx_friendships_users ON friendships (user_id1, user_id2);
CREATE INDEX idx_notifications_user ON notifications (user_id);