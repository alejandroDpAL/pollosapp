-- Amplía el tamaño de la columna logo en negocio para permitir URLs completas
ALTER TABLE negocio
  MODIFY logo VARCHAR(255) NOT NULL;
