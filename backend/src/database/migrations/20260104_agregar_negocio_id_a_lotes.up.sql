-- ============================================
-- MIGRACIÓN: Agregar negocio_id a tabla lotes
-- Propósito: Implementar trazabilidad completa
-- Negocio → Producto → Lote
-- ============================================

-- 1. Agregar columna negocio_id (inicialmente nullable)
ALTER TABLE lotes 
ADD COLUMN negocio_id INT NULL AFTER producto_id;

-- 2. Poblar negocio_id basado en la relación producto → negocio
UPDATE lotes l
SET l.negocio_id = (
    SELECT p.negocio_id 
    FROM productos p 
    WHERE p.id = l.producto_id
)
WHERE l.negocio_id IS NULL;

-- 3. Hacer la columna NOT NULL después de poblar datos
ALTER TABLE lotes 
MODIFY COLUMN negocio_id INT NOT NULL;

-- 4. Crear índice para consultas rápidas por negocio
CREATE INDEX idx_lotes_negocio ON lotes(negocio_id);

-- 5. Crear índice compuesto para ordenamiento por negocio y fecha
CREATE INDEX idx_lotes_negocio_fecha ON lotes(negocio_id, fecha DESC);

-- 6. Agregar Foreign Key constraint
ALTER TABLE lotes
ADD CONSTRAINT fk_lotes_negocio
    FOREIGN KEY (negocio_id) REFERENCES negocio(id) ON DELETE CASCADE;

-- 7. Crear índice para relación producto-negocio
CREATE INDEX idx_lotes_producto_negocio ON lotes(producto_id, negocio_id);
