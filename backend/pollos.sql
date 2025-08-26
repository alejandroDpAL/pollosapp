-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Aug 26, 2025 at 12:20 AM
-- Server version: 8.4.3
-- PHP Version: 8.3.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pollos`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `CerrarLote` (IN `p_lote_id` INT)   BEGIN
    DECLARE v_cantidad_inicial, v_cantidad_actual, v_cantidad_vendida, v_cantidad_perdida INT;
    DECLARE v_total_ingresos, v_total_costos, v_ganancia_neta DECIMAL(12,2);
    DECLARE v_porcentaje_mortalidad DECIMAL(5,2);
    
    -- Obtener datos del lote
    SELECT cantidad_inicial, cantidad_actual INTO v_cantidad_inicial, v_cantidad_actual
    FROM lotes WHERE id = p_lote_id;
    
    -- Calcular totales
    SELECT COALESCE(SUM(cantidad), 0) INTO v_cantidad_vendida FROM ventas WHERE lote_id = p_lote_id;
    SELECT COALESCE(SUM(cantidad), 0) INTO v_cantidad_perdida FROM perdidas WHERE lote_id = p_lote_id;
    SELECT COALESCE(SUM(valor_total), 0) INTO v_total_ingresos FROM ventas WHERE lote_id = p_lote_id;
    SELECT COALESCE(SUM(monto), 0) INTO v_total_costos FROM costos WHERE lote_id = p_lote_id;
    
    SET v_ganancia_neta = v_total_ingresos - v_total_costos;
    SET v_porcentaje_mortalidad = (v_cantidad_perdida * 100.0) / v_cantidad_inicial;
    
    -- Cerrar lote
    UPDATE lotes SET estado = 'cerrado', fecha_cierre = CURDATE() WHERE id = p_lote_id;
    
    -- Generar reporte
    INSERT INTO reportes_lote (
        lote_id, cantidad_inicial, cantidad_vendida, cantidad_perdida, cantidad_restante,
        total_ingresos, total_costos, ganancia_neta, porcentaje_mortalidad
    ) VALUES (
        p_lote_id, v_cantidad_inicial, v_cantidad_vendida, v_cantidad_perdida, v_cantidad_actual,
        v_total_ingresos, v_total_costos, v_ganancia_neta, v_porcentaje_mortalidad
    );
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `RegistrarPerdida` (IN `p_lote_id` INT, IN `p_cantidad` INT, IN `p_motivo` VARCHAR(20), IN `p_descripcion` TEXT)   BEGIN
    -- Insertar pérdida
    INSERT INTO perdidas (lote_id, cantidad, motivo, descripcion, fecha_perdida) 
    VALUES (p_lote_id, p_cantidad, p_motivo, p_descripcion, CURDATE());
    
    -- Actualizar inventario
    UPDATE lotes SET cantidad_actual = cantidad_actual - p_cantidad WHERE id = p_lote_id;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `RegistrarVenta` (IN `p_lote_id` INT, IN `p_cliente_id` INT, IN `p_cantidad` INT, IN `p_precio_unitario` DECIMAL(10,2), IN `p_observaciones` TEXT)   BEGIN
    DECLARE v_stock_actual INT;
    DECLARE v_valor_total DECIMAL(10,2);
    
    -- Verificar stock
    SELECT cantidad_actual INTO v_stock_actual 
    FROM lotes WHERE id = p_lote_id AND estado = 'activo';
    
    IF v_stock_actual < p_cantidad THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Stock insuficiente';
    END IF;
    
    SET v_valor_total = p_cantidad * p_precio_unitario;
    
    -- Insertar venta
    INSERT INTO ventas (lote_id, cliente_id, cantidad, precio_unitario, valor_total, fecha_venta, observaciones) 
    VALUES (p_lote_id, p_cliente_id, p_cantidad, p_precio_unitario, v_valor_total, NOW(), p_observaciones);
    
    -- Actualizar inventario
    UPDATE lotes SET cantidad_actual = cantidad_actual - p_cantidad WHERE id = p_lote_id;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `clientes`
--

CREATE TABLE `clientes` (
  `id` int NOT NULL,
  `usuario_id` int DEFAULT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `correo` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `direccion` text COLLATE utf8mb4_general_ci,
  `estado` tinyint(1) DEFAULT '1',
  `fecha` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `clientes`
--

INSERT INTO `clientes` (`id`, `usuario_id`, `nombre`, `telefono`, `correo`, `direccion`, `estado`, `fecha`) VALUES
(1, NULL, 'Cliente General', '000-0000000', NULL, NULL, 1, '2025-07-30 14:12:17');

-- --------------------------------------------------------

--
-- Table structure for table `costos`
--

CREATE TABLE `costos` (
  `id` int NOT NULL,
  `lote_id` int NOT NULL,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  `fecha_compra` date NOT NULL,
  `observaciones` text COLLATE utf8mb4_general_ci,
  `fecha_creacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `costos`
--

INSERT INTO `costos` (`id`, `lote_id`, `nombre`, `valor`, `fecha_compra`, `observaciones`, `fecha_creacion`) VALUES
(2, 1, '11', 1.00, '2025-08-07', '1', '2025-08-30 05:02:24'),
(3, 1, 'Compra de maíz', 1500.50, '2025-08-17', 'Compra de maíz para alimentar pollos', '2025-08-21 05:05:11');

-- --------------------------------------------------------

--
-- Table structure for table `lotes`
--

CREATE TABLE `lotes` (
  `id` int NOT NULL,
  `producto_id` int NOT NULL,
  `cantidad_inicial` int NOT NULL,
  `cantidad_actual` int NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `fecha` date NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `nombre` varchar(50) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lotes`
--

INSERT INTO `lotes` (`id`, `producto_id`, `cantidad_inicial`, `cantidad_actual`, `precio`, `fecha`, `descripcion`, `nombre`) VALUES
(1, 4, 1, 1, 12.00, '2025-08-13', NULL, '');

-- --------------------------------------------------------

--
-- Table structure for table `negocio`
--

CREATE TABLE `negocio` (
  `id` int NOT NULL,
  `nombre` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_general_ci,
  `activo` tinyint(1) DEFAULT '1',
  `logo` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `correo` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `fecha` date DEFAULT NULL,
  `telefono` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `negocio`
--

INSERT INTO `negocio` (`id`, `nombre`, `descripcion`, `activo`, `logo`, `correo`, `fecha`, `telefono`) VALUES
(1, 'Pollos', 'Crianza y venta de pollos', 1, '', '', NULL, 0),
(2, 'Cerdos', 'Crianza y venta de cerdos', 1, '', '', NULL, 0),
(3, 'Ropa', 'Venta de productos textiles', 1, '', '', NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `perdidas`
--

CREATE TABLE `perdidas` (
  `id` int NOT NULL,
  `lote_id` int NOT NULL,
  `cantidad` int NOT NULL,
  `motivo` enum('mortalidad','enfermedad','accidente','otro') COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_general_ci,
  `fecha_perdida` date NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `perdidas`
--

INSERT INTO `perdidas` (`id`, `lote_id`, `cantidad`, `motivo`, `descripcion`, `fecha_perdida`, `fecha_creacion`) VALUES
(2, 1, 1, 'enfermedad', '11', '2025-08-20', '2025-08-22 05:02:51'),
(3, 1, 10, 'mortalidad', 'Pollos muertos por calor', '2025-08-15', '2025-08-21 05:04:49');

-- --------------------------------------------------------

--
-- Table structure for table `productos`
--

CREATE TABLE `productos` (
  `id` int NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `negocio_id` int NOT NULL,
  `cantidad` int NOT NULL,
  `costo` int NOT NULL,
  `fecha_compra` int NOT NULL,
  `fecha_venta` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `productos`
--

INSERT INTO `productos` (`id`, `nombre`, `negocio_id`, `cantidad`, `costo`, `fecha_compra`, `fecha_venta`) VALUES
(1, 'Pollo Broiler', 1, 0, 0, 0, 0),
(2, 'Pollo Criollo', 1, 0, 0, 0, 0),
(3, 'Cerdo', 2, 0, 0, 0, 0),
(4, 'Camisa', 3, 0, 0, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `reportes_lote`
--

CREATE TABLE `reportes_lote` (
  `id` int NOT NULL,
  `lote_id` int NOT NULL,
  `cantidad_inicial` int NOT NULL,
  `cantidad_vendida` int NOT NULL,
  `cantidad_perdida` int NOT NULL,
  `cantidad_restante` int NOT NULL,
  `total_ingresos` decimal(12,2) NOT NULL,
  `total_costos` decimal(12,2) NOT NULL,
  `ganancia_neta` decimal(12,2) NOT NULL,
  `porcentaje_mortalidad` decimal(5,2) NOT NULL,
  `fecha_generacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reportes_lote`
--

INSERT INTO `reportes_lote` (`id`, `lote_id`, `cantidad_inicial`, `cantidad_vendida`, `cantidad_perdida`, `cantidad_restante`, `total_ingresos`, `total_costos`, `ganancia_neta`, `porcentaje_mortalidad`, `fecha_generacion`) VALUES
(1, 1, 11, 1, 1, 1, 1.00, 1.00, 1.00, 1.00, '2025-08-22 05:03:22');

-- --------------------------------------------------------

--
-- Table structure for table `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `identificacion` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `correo` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `cargo` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `estado` enum('activo','inactivo') COLLATE utf8mb4_general_ci DEFAULT 'activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ventas`
--

CREATE TABLE `ventas` (
  `id` int NOT NULL,
  `lote_id` int NOT NULL,
  `cliente_id` int DEFAULT NULL,
  `usuario_id` int DEFAULT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `valor_total` decimal(10,2) NOT NULL,
  `fecha` datetime NOT NULL,
  `observaciones` text COLLATE utf8mb4_general_ci,
  `fecha_creacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ventas`
--

INSERT INTO `ventas` (`id`, `lote_id`, `cliente_id`, `usuario_id`, `cantidad`, `precio_unitario`, `valor_total`, `fecha`, `observaciones`, `fecha_creacion`) VALUES
(1, 1, 1, NULL, 1, 1.00, 1.00, '2025-08-13 00:03:55', '1', '2025-08-20 05:03:55');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_clientes_usuarios` (`usuario_id`);

--
-- Indexes for table `costos`
--
ALTER TABLE `costos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lote_id` (`lote_id`),
  ADD KEY `idx_costos_fecha` (`fecha_compra`);

--
-- Indexes for table `lotes`
--
ALTER TABLE `lotes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `producto_id` (`producto_id`);

--
-- Indexes for table `negocio`
--
ALTER TABLE `negocio`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indexes for table `perdidas`
--
ALTER TABLE `perdidas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lote_id` (`lote_id`);

--
-- Indexes for table `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tipo_negocio_id` (`negocio_id`);

--
-- Indexes for table `reportes_lote`
--
ALTER TABLE `reportes_lote`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `lote_id` (`lote_id`);

--
-- Indexes for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `identificacion` (`identificacion`),
  ADD UNIQUE KEY `correo` (`correo`);

--
-- Indexes for table `ventas`
--
ALTER TABLE `ventas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lote_id` (`lote_id`),
  ADD KEY `cliente_id` (`cliente_id`),
  ADD KEY `idx_ventas_fecha` (`fecha`),
  ADD KEY `fk_ventas_usuarios` (`usuario_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `costos`
--
ALTER TABLE `costos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `lotes`
--
ALTER TABLE `lotes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `negocio`
--
ALTER TABLE `negocio`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `perdidas`
--
ALTER TABLE `perdidas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `reportes_lote`
--
ALTER TABLE `reportes_lote`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ventas`
--
ALTER TABLE `ventas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `clientes`
--
ALTER TABLE `clientes`
  ADD CONSTRAINT `fk_clientes_usuarios` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Constraints for table `costos`
--
ALTER TABLE `costos`
  ADD CONSTRAINT `costos_ibfk_1` FOREIGN KEY (`lote_id`) REFERENCES `lotes` (`id`);

--
-- Constraints for table `lotes`
--
ALTER TABLE `lotes`
  ADD CONSTRAINT `lotes_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`);

--
-- Constraints for table `perdidas`
--
ALTER TABLE `perdidas`
  ADD CONSTRAINT `perdidas_ibfk_1` FOREIGN KEY (`lote_id`) REFERENCES `lotes` (`id`);

--
-- Constraints for table `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`negocio_id`) REFERENCES `negocio` (`id`);

--
-- Constraints for table `reportes_lote`
--
ALTER TABLE `reportes_lote`
  ADD CONSTRAINT `reportes_lote_ibfk_1` FOREIGN KEY (`lote_id`) REFERENCES `lotes` (`id`);

--
-- Constraints for table `ventas`
--
ALTER TABLE `ventas`
  ADD CONSTRAINT `fk_ventas_usuarios` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `ventas_ibfk_1` FOREIGN KEY (`lote_id`) REFERENCES `lotes` (`id`),
  ADD CONSTRAINT `ventas_ibfk_2` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
