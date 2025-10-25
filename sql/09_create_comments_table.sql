CREATE TABLE comments (
    comment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL,          -- El post al que pertenece
    author_id UUID NOT NULL,        -- El usuario que escribió el comentario
    content TEXT NOT NULL,          -- El texto del comentario
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Llaves foráneas
    CONSTRAINT fk_post FOREIGN KEY(post_id) REFERENCES posts(post_id) ON DELETE CASCADE, -- Si se borra el post, se borran sus comentarios
    CONSTRAINT fk_author FOREIGN KEY(author_id) REFERENCES users(user_id) ON DELETE CASCADE -- Si se borra el usuario, se borran sus comentarios
);

-- Índice para buscar comentarios por post rápidamente
CREATE INDEX idx_comments_post_id ON comments(post_id);