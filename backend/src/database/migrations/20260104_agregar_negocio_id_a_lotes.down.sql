-- ============================================
-- ROLLBACK: Remover negocio_id de tabla lotes
-- ============================================

-- 1. Remover Foreign Key
ALTER TABLE lotes
DROP FOREIGN KEY fk_lotes_negocio;

-- 2. Remover índices
DROP INDEX idx_lotes_producto_negocio ON lotes;
DROP INDEX idx_lotes_negocio_fecha ON lotes;
DROP INDEX idx_lotes_negocio ON lotes;

-- 3. Remover columna
ALTER TABLE lotes 
DROP COLUMN negocio_id;
