-- Cambia telefono a VARCHAR(20) para permitir números más largos y evitar overflow del INT
ALTER TABLE negocio
  MODIFY telefono VARCHAR(20) NOT NULL;
