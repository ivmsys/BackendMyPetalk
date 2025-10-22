CREATE TABLE post_media (
    media_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL,
    media_url VARCHAR(255) NOT NULL,
    media_type VARCHAR(20) NOT NULL, -- 'image' o 'video'

    CONSTRAINT fk_post
        FOREIGN KEY(post_id) 
        REFERENCES posts(post_id)
        ON DELETE CASCADE
);