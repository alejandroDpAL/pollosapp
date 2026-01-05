-- UP: Crear tabla _migrations para rastrear migraciones ejecutadas
CREATE TABLE IF NOT EXISTS _migrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    ejecutado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL,
    INDEX idx_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar migraciones existentes que ya han sido ejecutadas
INSERT IGNORE INTO _migrations (nombre, ejecutado_en) VALUES
('20251227_add_usuario_id_to_negocio.up.sql', NOW()),
('20251227_create_refresh_tokens.up.sql', NOW()),
('20251227_fix_negocio_usuario_fk.sql', NOW()),
('add_ultimo_login_usuarios.sql', NOW());
