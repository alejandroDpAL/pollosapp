-- Script para verificar los datos de un negocio
-- Reemplaza {NEGOCIO_ID} con el ID del negocio que quieres verificar

SET @negocio_id = 1; -- Cambia este número por el ID de tu negocio

-- 1. Verificar que el negocio existe
SELECT '=== NEGOCIO ===' as seccion;
SELECT id, nombre, correo, activo, fecha 
FROM negocio 
WHERE id = @negocio_id;

-- 2. Verificar clientes del negocio
SELECT '=== CLIENTES ===' as seccion;
SELECT COUNT(*) as total_clientes 
FROM clientes 
WHERE negocio_id = @negocio_id AND estado = 1;

-- 3. Verificar productos del negocio
SELECT '=== PRODUCTOS ===' as seccion;
SELECT COUNT(*) as total_productos 
FROM productos 
WHERE negocio_id = @negocio_id;

SELECT id, nombre 
FROM productos 
WHERE negocio_id = @negocio_id 
LIMIT 5;

-- 4. Verificar lotes de los productos
SELECT '=== LOTES ===' as seccion;
SELECT COUNT(*) as total_lotes_activos
FROM lotes l
JOIN productos p ON l.producto_id = p.id
WHERE p.negocio_id = @negocio_id AND cantidad_actual > 0;

SELECT l.id, l.nombre, p.nombre as producto, l.cantidad_actual, l.precio
FROM lotes l
JOIN productos p ON l.producto_id = p.id
WHERE p.negocio_id = @negocio_id
ORDER BY l.fecha DESC
LIMIT 5;

-- 5. Verificar ventas
SELECT '=== VENTAS ===' as seccion;
SELECT 
    COUNT(*) as total_ventas,
    SUM(CASE WHEN estado = 'realizada' OR estado = 'pagado' THEN 1 ELSE 0 END) as completadas,
    SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
    SUM(valor_total) as ingreso_total
FROM ventas v
JOIN lotes l ON v.lote_id = l.id
JOIN productos p ON l.producto_id = p.id
WHERE p.negocio_id = @negocio_id;

-- 6. Verificar costos
SELECT '=== COSTOS ===' as seccion;
SELECT 
    COUNT(*) as cantidad_costos,
    SUM(valor) as total_costos
FROM costos c
JOIN lotes l ON c.lote_id = l.id
JOIN productos p ON l.producto_id = p.id
WHERE p.negocio_id = @negocio_id;

-- 7. Verificar pérdidas
SELECT '=== PÉRDIDAS ===' as seccion;
SELECT 
    COUNT(*) as total_eventos,
    SUM(cantidad) as cantidad_perdida
FROM perdidas pd
JOIN lotes l ON pd.lote_id = l.id
JOIN productos p ON l.producto_id = p.id
WHERE p.negocio_id = @negocio_id;

-- 8. Resumen general
SELECT '=== RESUMEN ===' as seccion;
SELECT 
    (SELECT COUNT(*) FROM clientes WHERE negocio_id = @negocio_id AND estado = 1) as clientes,
    (SELECT COUNT(*) FROM productos WHERE negocio_id = @negocio_id) as productos,
    (SELECT COUNT(*) FROM lotes l JOIN productos p ON l.producto_id = p.id WHERE p.negocio_id = @negocio_id AND cantidad_actual > 0) as lotes_activos,
    (SELECT COUNT(*) FROM ventas v JOIN lotes l ON v.lote_id = l.id JOIN productos p ON l.producto_id = p.id WHERE p.negocio_id = @negocio_id) as total_ventas,
    (SELECT COALESCE(SUM(valor_total), 0) FROM ventas v JOIN lotes l ON v.lote_id = l.id JOIN productos p ON l.producto_id = p.id WHERE p.negocio_id = @negocio_id) as ingresos,
    (SELECT COALESCE(SUM(valor), 0) FROM costos c JOIN lotes l ON c.lote_id = l.id JOIN productos p ON l.producto_id = p.id WHERE p.negocio_id = @negocio_id) as costos;
