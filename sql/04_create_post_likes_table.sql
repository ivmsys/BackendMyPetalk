CREATE TABLE post_likes (
    user_id UUID NOT NULL,
    post_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Llaves foráneas
    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_post FOREIGN KEY(post_id) REFERENCES posts(post_id) ON DELETE CASCADE,

    -- La llave primaria compuesta
    PRIMARY KEY (user_id, post_id)
);