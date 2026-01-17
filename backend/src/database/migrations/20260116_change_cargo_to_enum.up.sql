-- Migración: Cambiar cargo a ENUM y permitir NULL
-- Fecha: 20260116
-- Propósito: Estandarizar los valores de cargo a ENUM ('boss', 'admin', 'employee')

-- Step 1: Actualizar valores vacíos a NULL antes de cambiar a ENUM
UPDATE usuarios SET cargo = NULL WHERE cargo = '' OR cargo IS NULL;

-- Step 2: Cambiar el tipo de dato a ENUM
ALTER TABLE usuarios
MODIFY cargo ENUM ('boss', 'admin', 'employee') NULL;

-- Verificar que la alteración fue exitosa
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'cargo';
