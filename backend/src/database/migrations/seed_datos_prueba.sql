-- =====================================================
-- SCRIPT: Datos de Prueba para Pollos App
-- FECHA: 27 de Diciembre de 2025
-- DESCRIPCIÓN: Inserta datos de prueba para validar
--              la nueva estructura con usuario_id
-- =====================================================
-- ADVERTENCIA: Este script inserta datos de prueba
--              NO ejecutar en producción
-- =====================================================

-- 1. INSERTAR USUARIO DE PRUEBA
INSERT INTO usuarios (nombre, identificacion, correo, password, cargo, telefono, estado)
VALUES (
  'Alejandro Pérez',
  '1234567890',
  'alejandro@pollosapp.com',
  '$2b$10$YourHashedPasswordHere',  -- Cambiar por password hasheado real
  'Administrador',
  '3005551234',
  'activo'
);

-- Obtener el ID del usuario insertado (en MySQL puedes usar LAST_INSERT_ID())
SET @usuario_id = LAST_INSERT_ID();

-- 2. INSERTAR NEGOCIOS DEL USUARIO
INSERT INTO negocio (usuario_id, nombre, descripcion, logo, correo, telefono, activo)
VALUES 
(@usuario_id, 'Granja Pollos El Roble', 'Venta de pollos de engorde y gallinas ponedoras', 'pollos_roble.png', 'pollos@elroble.com', 3005551111, 1),
(@usuario_id, 'Cabaña Conejos Premium', 'Cría y venta de conejos blancos y grises', 'conejos_premium.png', 'conejos@premium.com', 3005552222, 1),
(@usuario_id, 'Carnicería La Mejor', 'Venta de carnes de cerdo, res y pollo', 'carniceria_mejor.png', 'ventas@lamejor.com', 3005553333, 1);

-- Obtener IDs de los negocios
SET @negocio_pollos = LAST_INSERT_ID();
SET @negocio_conejos = @negocio_pollos + 1;
SET @negocio_carnes = @negocio_pollos + 2;

-- 3. INSERTAR PRODUCTOS DE CADA NEGOCIO
-- Productos de Pollos
INSERT INTO productos (nombre, negocio_id, cantidad, costo, fecha_compra)
VALUES 
('Pollo Rojo de Engorde', @negocio_pollos, 200, 35000, '2025-01-10'),
('Pollo Blanco de Engorde', @negocio_pollos, 150, 32000, '2025-01-12'),
('Gallina Ponedora', @negocio_pollos, 100, 40000, '2025-01-15');

SET @prod_pollo_rojo = LAST_INSERT_ID();
SET @prod_pollo_blanco = @prod_pollo_rojo + 1;
SET @prod_gallina = @prod_pollo_rojo + 2;

-- Productos de Conejos
INSERT INTO productos (nombre, negocio_id, cantidad, costo, fecha_compra)
VALUES 
('Conejo Blanco', @negocio_conejos, 80, 45000, '2025-01-15'),
('Conejo Gris', @negocio_conejos, 60, 48000, '2025-01-16');

SET @prod_conejo_blanco = LAST_INSERT_ID();
SET @prod_conejo_gris = @prod_conejo_blanco + 1;

-- Productos de Carnicería
INSERT INTO productos (nombre, negocio_id, cantidad, costo, fecha_compra)
VALUES 
('Carne de Cerdo', @negocio_carnes, 500, 28000, '2025-01-20'),
('Carne de Res', @negocio_carnes, 400, 35000, '2025-01-21'),
('Carne de Pollo Procesada', @negocio_carnes, 300, 25000, '2025-01-22');

SET @prod_cerdo = LAST_INSERT_ID();
SET @prod_res = @prod_cerdo + 1;
SET @prod_pollo_proc = @prod_cerdo + 2;

-- 4. INSERTAR LOTES DE CADA PRODUCTO
-- Lotes de Pollos
INSERT INTO lotes (producto_id, cantidad_inicial, cantidad_actual, precio, fecha, nombre, descripcion)
VALUES 
(@prod_pollo_rojo, 100, 70, 45000, '2025-01-10', 'Lote Pollos Rojos Enero 2025', 'Pollos de 2.5 kg promedio, listos para venta'),
(@prod_pollo_blanco, 80, 50, 42000, '2025-01-12', 'Lote Pollos Blancos Enero 2025', 'Pollos de excelente calidad, 2.3 kg promedio'),
(@prod_gallina, 50, 40, 55000, '2025-01-15', 'Lote Gallinas Ponedoras Enero 2025', 'Gallinas en producción activa');

SET @lote_pollo_rojo = LAST_INSERT_ID();
SET @lote_pollo_blanco = @lote_pollo_rojo + 1;
SET @lote_gallina = @lote_pollo_rojo + 2;

-- Lotes de Conejos
INSERT INTO lotes (producto_id, cantidad_inicial, cantidad_actual, precio, fecha, nombre, descripcion)
VALUES 
(@prod_conejo_blanco, 60, 45, 65000, '2025-01-15', 'Lote Conejos Blancos Enero 2025', 'Conejos adultos de 3 kg promedio'),
(@prod_conejo_gris, 40, 30, 68000, '2025-01-16', 'Lote Conejos Grises Enero 2025', 'Conejos para reproducción o venta');

SET @lote_conejo_blanco = LAST_INSERT_ID();
SET @lote_conejo_gris = @lote_conejo_blanco + 1;

-- Lotes de Carnicería (en kilogramos)
INSERT INTO lotes (producto_id, cantidad_inicial, cantidad_actual, precio, fecha, nombre, descripcion)
VALUES 
(@prod_cerdo, 500, 400, 28000, '2025-01-20', 'Lote Carne Cerdo Enero 2025', '500 kg de carne de cerdo premium'),
(@prod_res, 400, 300, 38000, '2025-01-21', 'Lote Carne Res Enero 2025', '400 kg de carne de res seleccionada'),
(@prod_pollo_proc, 300, 250, 26000, '2025-01-22', 'Lote Carne Pollo Enero 2025', '300 kg de carne de pollo procesada');

SET @lote_cerdo = LAST_INSERT_ID();
SET @lote_res = @lote_cerdo + 1;
SET @lote_pollo_proc = @lote_cerdo + 2;

-- 5. INSERTAR CLIENTES DEL USUARIO
INSERT INTO clientes (usuario_id, nombre, telefono, correo, direccion, estado)
VALUES 
(@usuario_id, 'Supermercado Éxito', '3005554444', 'compras@exito.com', 'Av. Principal #100-50', 1),
(@usuario_id, 'Restaurante El Buen Sabor', '3005555555', 'gerente@buensabor.com', 'Calle 50 #25-30', 1),
(@usuario_id, 'Carnicería Central', '3005556666', 'ventas@carniceriacentral.com', 'Carrera 10 #15-20', 1),
(@usuario_id, 'Hotel Plaza Real', '3005557777', 'compras@plazareal.com', 'Av. Libertadores #200', 1),
(@usuario_id, 'Restaurante Sabor Gourmet', '3005558888', 'admin@saborgourmet.com', 'Calle 70 #30-15', 1);

SET @cliente_super = LAST_INSERT_ID();
SET @cliente_rest1 = @cliente_super + 1;
SET @cliente_carni = @cliente_super + 2;
SET @cliente_hotel = @cliente_super + 3;
SET @cliente_rest2 = @cliente_super + 4;

-- 6. INSERTAR VENTAS DE EJEMPLO
INSERT INTO ventas (lote_id, cliente_id, usuario_id, producto_id, cantidad, precio_unitario, valor_total, fecha, observaciones, estado)
VALUES 
-- Ventas de pollos
(@lote_pollo_rojo, @cliente_super, @usuario_id, @prod_pollo_rojo, 20, 45000, 900000, '2025-01-25 10:30:00', 'Entrega en sucursal norte', 'realizada'),
(@lote_pollo_blanco, @cliente_rest1, @usuario_id, @prod_pollo_blanco, 15, 42000, 630000, '2025-01-25 14:15:00', 'Pollos para menu del día', 'realizada'),
(@lote_gallina, @cliente_carni, @usuario_id, @prod_gallina, 10, 55000, 550000, '2025-01-26 09:00:00', 'Gallinas para reventa', 'pagado'),

-- Ventas de conejos
(@lote_conejo_blanco, @cliente_rest2, @usuario_id, @prod_conejo_blanco, 10, 65000, 650000, '2025-01-26 11:30:00', 'Para plato especial', 'realizada'),
(@lote_conejo_gris, @cliente_hotel, @usuario_id, @prod_conejo_gris, 5, 68000, 340000, '2025-01-26 16:00:00', 'Evento especial hotel', 'pendiente'),

-- Ventas de carnes
(@lote_cerdo, @cliente_hotel, @usuario_id, @prod_cerdo, 50, 28000, 1400000, '2025-01-27 08:00:00', '50 kg carne de cerdo', 'pagado'),
(@lote_res, @cliente_rest1, @usuario_id, @prod_res, 30, 38000, 1140000, '2025-01-27 10:30:00', '30 kg carne de res', 'realizada'),
(@lote_pollo_proc, @cliente_super, @usuario_id, @prod_pollo_proc, 40, 26000, 1040000, '2025-01-27 12:00:00', '40 kg carne de pollo', 'pendiente');

-- 7. INSERTAR COSTOS DE EJEMPLO (opcional)
INSERT INTO costos (lote_id, nombre, valor, fecha_compra, observaciones)
VALUES 
(@lote_pollo_rojo, 'Alimento concentrado', 500000, '2025-01-10', 'Bultos de concentrado para pollos'),
(@lote_pollo_rojo, 'Vacunas y medicamentos', 150000, '2025-01-10', 'Vacunas preventivas'),
(@lote_conejo_blanco, 'Alimento para conejos', 300000, '2025-01-15', 'Alimento especializado'),
(@lote_cerdo, 'Transporte y empaque', 80000, '2025-01-20', 'Transporte refrigerado');

-- 8. INSERTAR PÉRDIDAS DE EJEMPLO (opcional)
INSERT INTO perdidas (lote_id, cantidad, motivo, descripcion, fecha_perdida)
VALUES 
(@lote_pollo_rojo, 10, 'mortalidad', 'Mortalidad natural durante crianza', '2025-01-15'),
(@lote_conejo_blanco, 5, 'enfermedad', 'Enfermedad respiratoria tratada', '2025-01-18'),
(@lote_pollo_blanco, 5, 'mortalidad', 'Mortalidad por calor extremo', '2025-01-20');

-- =====================================================
-- SCRIPT FINALIZADO
-- =====================================================
-- Para verificar que todo se insertó correctamente:
-- SELECT * FROM negocio WHERE usuario_id = @usuario_id;
-- SELECT * FROM productos WHERE negocio_id IN (@negocio_pollos, @negocio_conejos, @negocio_carnes);
-- SELECT * FROM lotes WHERE producto_id IN (SELECT id FROM productos WHERE negocio_id IN (@negocio_pollos, @negocio_conejos, @negocio_carnes));
-- SELECT * FROM ventas WHERE usuario_id = @usuario_id;
-- =====================================================
