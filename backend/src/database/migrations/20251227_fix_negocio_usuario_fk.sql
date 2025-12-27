-- =====================================================
-- FIX: Agregar columna usuario_id y FK en negocio
-- Fecha: 27/12/2025
-- Motivo: La BD actual no refleja la relación Usuario → Negocio
-- =====================================================

-- Agregar columna usuario_id si no existe (permitir NULL para transición)
ALTER TABLE negocio 
ADD COLUMN usuario_id INT NULL AFTER id;

-- Crear la foreign key hacia usuarios
ALTER TABLE negocio 
ADD CONSTRAINT fk_negocio_usuario 
FOREIGN KEY (usuario_id) REFERENCES usuarios(id) 
ON DELETE CASCADE;

-- Índice para búsqueda por usuario
CREATE INDEX idx_negocio_usuario ON negocio(usuario_id);
