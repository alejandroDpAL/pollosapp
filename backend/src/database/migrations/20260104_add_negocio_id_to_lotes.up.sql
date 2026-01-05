-- Migración: Agregar negocio_id a tabla lotes para optimizar consultas y trazabilidad
-- Fecha: 2026-01-04
-- Descripción: Desnormalización controlada para mejorar rendimiento y integridad

-- 1. Agregar columna negocio_id
ALTER TABLE lotes ADD COLUMN negocio_id INT NOT NULL DEFAULT 0 AFTER producto_id;

-- 2. Crear índice en negocio_id
CREATE INDEX idx_lotes_negocio ON lotes(negocio_id);

-- 3. Crear índice compuesto para consultas frecuentes
CREATE INDEX idx_lotes_negocio_fecha ON lotes(negocio_id, fecha DESC);

-- 4. Poblar negocio_id basándose en la relación actual producto → negocio
UPDATE lotes l
INNER JOIN productos p ON l.producto_id = p.id
INNER JOIN negocio n ON p.negocio_id = n.id
SET l.negocio_id = n.id;

-- 5. Agregar restricción de foreign key
ALTER TABLE lotes ADD CONSTRAINT fk_lotes_negocio 
FOREIGN KEY (negocio_id) REFERENCES negocio(id) ON DELETE CASCADE;

-- 6. Cambiar columna a NOT NULL después de poblarla
ALTER TABLE lotes MODIFY COLUMN negocio_id INT NOT NULL;

-- Verificación
SELECT COUNT(*) as lotes_sin_negocio FROM lotes WHERE negocio_id = 0;
