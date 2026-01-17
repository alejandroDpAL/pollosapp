-- Rollback: Revertir cargo a VARCHAR
-- Restaura el estado anterior antes de la migración

ALTER TABLE usuarios
MODIFY cargo VARCHAR(50) NULL;

-- Establecer valores NULL a vacío si lo prefieres (opcional)
-- UPDATE usuarios SET cargo = '' WHERE cargo IS NULL;
