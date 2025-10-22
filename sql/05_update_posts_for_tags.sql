-- 1. Eliminar la vieja llave foránea
ALTER TABLE posts DROP CONSTRAINT IF EXISTS fk_pet;

-- 2. Eliminar la vieja columna de una sola mascota
ALTER TABLE posts DROP COLUMN IF EXISTS pet_id;

-- 3. Crear la nueva tabla de unión para múltiples etiquetas
CREATE TABLE post_pet_tags (
    post_id UUID NOT NULL,
    pet_id UUID NOT NULL,

    -- Llaves foráneas
    CONSTRAINT fk_post FOREIGN KEY(post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    CONSTRAINT fk_pet FOREIGN KEY(pet_id) REFERENCES pets(pet_id) ON DELETE CASCADE,

    -- Llave primaria compuesta (evita etiquetar a la misma mascota dos veces)
    PRIMARY KEY (post_id, pet_id)
);