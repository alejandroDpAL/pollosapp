-- DOWN: Remover FK, índice y columna usuario_id de negocio
SET FOREIGN_KEY_CHECKS=0;
ALTER TABLE negocio DROP FOREIGN KEY fk_negocio_usuario;
ALTER TABLE negocio DROP INDEX idx_negocio_usuario;
ALTER TABLE negocio DROP COLUMN usuario_id;
SET FOREIGN_KEY_CHECKS=1;
