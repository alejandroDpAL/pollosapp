-- Agrega precio y cantidad a productos
ALTER TABLE productos
  ADD COLUMN precio DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER negocio_id,
  ADD COLUMN cantidad INT NOT NULL DEFAULT 0 AFTER precio;
