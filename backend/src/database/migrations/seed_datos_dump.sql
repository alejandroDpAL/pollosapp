-- Seed de datos de ejemplo basado en el dump pollos(1).sql
-- Asume que el schema ya está creado (ejecuta primero: npm run migrate)
-- Inserta datos de demo consistentes con la lógica del sistema

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE ventas;
TRUNCATE TABLE perdidas;
TRUNCATE TABLE costos;
TRUNCATE TABLE lotes;
TRUNCATE TABLE productos;
TRUNCATE TABLE clientes;
TRUNCATE TABLE negocio;
TRUNCATE TABLE usuarios;
TRUNCATE TABLE refresh_tokens;
SET FOREIGN_KEY_CHECKS = 1;

-- Usuarios
INSERT INTO usuarios (id, nombre, identificacion, telefono, correo, password, cargo, estado) VALUES
(1, 'Administrador Demo', 'CC-0001', '555-0000', 'demo@pollos.local', '$2b$10$CwTycUXWue0Thq9StjUM0uJ8tC5vWf.bJ..dUV2.L9YbH/5pGq9y6', 'admin', 'activo');

-- Negocios (asignados al usuario 1)
INSERT INTO negocio (id, usuario_id, nombre, descripcion, activo, logo, correo, fecha, telefono) VALUES
(1, 1, 'Restaurante El Sabor', 'Comida típica y casera', 1, 'logo_restaurante.png', 'contacto@sabor.com', '2025-08-25', 555123456),
(2, 1, 'Mi Negocio de Pollos', 'Venta de pollos', 1, 'logo.png', 'negocio@example.com', NULL, 1234567890);

-- Productos (del dump)
INSERT INTO productos (id, nombre, negocio_id, cantidad, costo, fecha_compra, fecha_venta) VALUES
(2, 'Arroz Premium', 1, 100, 2500, '2025-08-20', '2025-08-25'),
(3, 'Pollo Campero', 1, 100, 15000, '2025-12-27', NULL);

-- Lotes (del dump)
INSERT INTO lotes (id, producto_id, cantidad_inicial, cantidad_actual, precio, fecha, descripcion, nombre) VALUES
(4, 2, 100, 80, 12.50, '2025-08-25', 'Primer lote de producto 15', 'Lote-001'),
(5, 2, 100, 60, 12.50, '2025-08-25', 'Primer lote de producto 15', 'Lote-001'),
(8, 2, 100, 50, 25000.00, '2025-12-27', NULL, 'Lote Enero 2025');

-- Clientes (del dump, ajustando usuario_id nulos a 1)
INSERT INTO clientes (id, usuario_id, nombre, telefono, correo, direccion, estado, fecha) VALUES
(2, 1, 'Juan Pérez', '555-123456', 'juanperez@example.com', 'Av. Principal 123, Ciudad', 1, '2025-11-14 14:50:49'),
(3, 1, 'Juan Pérez', '555-123456', 'juanperez@example.com', 'Av. Principal 123, Ciudad', 1, '2025-11-15 02:50:33'),
(4, 1, 'Juan Pérez', '555-123456', 'juanperez@example.com', 'Av. Principal 123, Ciudad', 1, '2025-12-24 06:07:14');

-- Costos
INSERT INTO costos (id, lote_id, nombre, valor, fecha_compra, observaciones, fecha_creacion) VALUES
(6, 5, '11', 1.00, '2025-08-07', '1', '2025-08-30 05:02:24');

-- Perdidas
INSERT INTO perdidas (id, lote_id, cantidad, motivo, descripcion, fecha_perdida, fecha_creacion) VALUES
(4, 5, 5, 'mortalidad', '5 aves murieron por enfermedad', '2025-08-25', '2025-11-14 14:55:49');

-- Venta de ejemplo
INSERT INTO ventas (id, lote_id, cliente_id, usuario_id, cantidad, precio_unitario, valor_total, fecha, observaciones, fecha_creacion, producto_id, estado) VALUES
(1, 4, 2, 1, 20, 12500.00, 250000.00, '2025-12-28 10:00:00', 'Venta demo basada en dump', '2025-12-28 10:00:00', 2, 'realizada');

-- Opcional: tokens (vacío para evitar ruido en pruebas)

-- Reporte de lote (consistente con el dump)
INSERT INTO reportes_lote (id, lote_id, cantidad_inicial, cantidad_vendida, cantidad_perdida, cantidad_restante, total_ingresos, total_costos, ganancia_neta, porcentaje_mortalidad, fecha_generacion, usuario_id) VALUES
(3, 5, 1000, 600, 50, 350, 15000.50, 8000.00, 7000.50, 5.00, '2025-11-14 14:56:01', 1);

COMMIT;
