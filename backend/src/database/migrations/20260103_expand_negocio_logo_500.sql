-- Amplía nuevamente el tamaño de la columna logo en negocio para URLs largas
ALTER TABLE negocio
  MODIFY logo VARCHAR(500) NOT NULL;
