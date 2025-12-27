-- UP: Agregar columna usuario_id y FK a negocio
ALTER TABLE negocio ADD COLUMN usuario_id INT NULL AFTER id;
ALTER TABLE negocio ADD CONSTRAINT fk_negocio_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE;
ALTER TABLE negocio ADD INDEX idx_negocio_usuario (usuario_id);
