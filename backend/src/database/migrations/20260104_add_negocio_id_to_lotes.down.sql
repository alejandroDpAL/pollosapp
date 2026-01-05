-- Rollback: Remover negocio_id de tabla lotes
-- Fecha: 2026-01-04
-- Descripción: Revierte la desnormalización agregada para lotes

-- 1. Remover restricción de foreign key
ALTER TABLE lotes DROP CONSTRAINT fk_lotes_negocio;

-- 2. Remover índices
DROP INDEX idx_lotes_negocio_fecha ON lotes;
DROP INDEX idx_lotes_negocio ON lotes;

-- 3. Remover columna negocio_id
ALTER TABLE lotes DROP COLUMN negocio_id;

-- Verificación
SELECT * FROM lotes LIMIT 1;
