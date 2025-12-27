-- UP: Crear tabla refresh_tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    token VARCHAR(500) NOT NULL,
    expira_en DATETIME NOT NULL,
    revocado TINYINT(1) DEFAULT 0,
    creado_en TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    revocado_en TIMESTAMP NULL,
    ip_address VARCHAR(45) NULL,
    user_agent VARCHAR(255) NULL,
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_token (token(255)),
    INDEX idx_revocado (revocado),
    INDEX idx_expira_en (expira_en),
    CONSTRAINT refresh_tokens_ibfk_1 FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
