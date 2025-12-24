-- Migración: Agregar campo ultimo_login a tabla usuarios
-- Fecha: 2025-12-24
-- Descripción: Agrega campo para rastrear el último login y poder invalidar tokens antiguos

ALTER TABLE usuarios 
ADD COLUMN ultimo_login DATETIME NULL DEFAULT NULL
COMMENT 'Fecha y hora del último login exitoso. Se usa para invalidar tokens anteriores';

-- Actualizar el valor inicial para usuarios existentes
UPDATE usuarios SET ultimo_login = NOW() WHERE ultimo_login IS NULL;
