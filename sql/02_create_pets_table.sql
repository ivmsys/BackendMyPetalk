CREATE TABLE pets (
    pet_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    species VARCHAR(50),
    breed VARCHAR(50),
    birth_date DATE,
    profile_picture_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_owner
        FOREIGN KEY(owner_id) 
        REFERENCES users(user_id)
        ON DELETE CASCADE
);