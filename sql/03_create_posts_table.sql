CREATE TABLE posts (
    post_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL,
    pet_id UUID, -- Opcional, puede ser null
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Conecta el post con el autor (usuario)
    CONSTRAINT fk_author
        FOREIGN KEY(author_id) 
        REFERENCES users(user_id)
        ON DELETE CASCADE, -- Si se borra el usuario, se borran sus posts

    -- Conecta el post con la mascota (opcional)
    CONSTRAINT fk_pet
        FOREIGN KEY(pet_id) 
        REFERENCES pets(pet_id)
        ON DELETE SET NULL -- Si se borra la mascota, el post no se borra,
                            -- solo se quita la referencia (pet_id = null)
);