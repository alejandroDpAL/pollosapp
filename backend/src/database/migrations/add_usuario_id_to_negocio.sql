-- =====================================================
-- MIGRACIÓN: Agregar usuario_id a tabla negocio
-- FECHA: 27 de Diciembre de 2025
-- DESCRIPCIÓN: Establece la relación Usuario → Negocio
--              para trazabilidad completa del sistema
-- =====================================================

-- 1. AGREGAR COLUMNA usuario_id a negocio
-- Se agrega después del campo id
ALTER TABLE negocio 
ADD COLUMN usuario_id INT NULL AFTER id;

-- 2. CREAR CONSTRAINT FOREIGN KEY
-- Relaciona negocio con usuarios
ALTER TABLE negocio 
ADD CONSTRAINT fk_negocio_usuario 
FOREIGN KEY (usuario_id) REFERENCES usuarios(id) 
ON DELETE CASCADE;

-- 3. CREAR ÍNDICES PARA OPTIMIZACIÓN
-- Índice para búsquedas rápidas de negocios por usuario
CREATE INDEX idx_negocio_usuario ON negocio(usuario_id);

-- Índice para productos por negocio (si no existe)
CREATE INDEX IF NOT EXISTS idx_productos_negocio ON productos(negocio_id);

-- Índice para lotes por producto (si no existe)
CREATE INDEX IF NOT EXISTS idx_lotes_producto ON lotes(producto_id);

-- Índice para clientes por usuario (si no existe)
CREATE INDEX IF NOT EXISTS idx_clientes_usuario ON clientes(usuario_id);

-- Índice para ventas por usuario (si no existe)
CREATE INDEX IF NOT EXISTS idx_ventas_usuario ON ventas(usuario_id);

-- Índice para ventas por lote (si no existe)
CREATE INDEX IF NOT EXISTS idx_ventas_lote ON ventas(lote_id);

-- Índice para ventas por cliente (si no existe)
CREATE INDEX IF NOT EXISTS idx_ventas_cliente ON ventas(cliente_id);

-- =====================================================
-- NOTA: Después de ejecutar esta migración:
-- 1. Actualiza los negocios existentes con usuario_id
-- 2. Cambia la columna a NOT NULL si es necesario
-- 3. Ejecuta el script de datos de prueba si es necesario
-- =====================================================
