-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Dec 27, 2025 at 08:34 PM
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
(2, 1, 'Juan Pérez', '555-123456', 'juanperez@example.com', 'Av. Principal 123, Ciudad', 1, '2025-11-14 14:50:49'),
(3, 1, 'Juan Pérez', '555-123456', 'juanperez@example.com', 'Av. Principal 123, Ciudad', 1, '2025-11-15 02:50:33'),
(4, NULL, 'Juan Pérez', '555-123456', 'juanperez@example.com', 'Av. Principal 123, Ciudad', 1, '2025-12-24 06:07:14');

-- --------------------------------------------------------

--
-- Table structure for table `costos`
--

CREATE TABLE `costos` (
  `id` int NOT NULL,
  `lote_id` int NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  `fecha_compra` date NOT NULL,
  `observaciones` text COLLATE utf8mb4_general_ci,
  `fecha_creacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `costos`
--

INSERT INTO `costos` (`id`, `lote_id`, `nombre`, `valor`, `fecha_compra`, `observaciones`, `fecha_creacion`) VALUES
(6, 5, '11', 1.00, '2025-08-07', '1', '2025-08-30 05:02:24');

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
  `descripcion` text COLLATE utf8mb4_general_ci,
  `nombre` varchar(50) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lotes`
--

INSERT INTO `lotes` (`id`, `producto_id`, `cantidad_inicial`, `cantidad_actual`, `precio`, `fecha`, `descripcion`, `nombre`) VALUES
(4, 2, 100, 80, 12.50, '2025-08-25', 'Primer lote de producto 15', 'Lote-001'),
(5, 2, 100, 60, 12.50, '2025-08-25', 'Primer lote de producto 15', 'Lote-001'),
(8, 2, 100, 50, 25000.00, '2025-12-27', NULL, 'Lote Enero 2025');

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
(1, 'Restaurante El Sabor', 'Comida típica y casera', 1, 'logo_restaurante.png', 'contacto@sabor.com', '2025-08-25', 555123456),
(2, 'Mi Negocio de Pollos', 'Venta de pollos', 1, 'logo.png', 'negocio@example.com', NULL, 1234567890);

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
(4, 5, 5, 'mortalidad', '5 aves murieron por enfermedad', '2025-08-25', '2025-11-14 14:55:49');

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
  `fecha_compra` date DEFAULT NULL,
  `fecha_venta` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `productos`
--

INSERT INTO `productos` (`id`, `nombre`, `negocio_id`, `cantidad`, `costo`, `fecha_compra`, `fecha_venta`) VALUES
(2, 'Arroz Premium', 1, 100, 2500, '2025-08-20', '2025-08-25'),
(3, 'Pollo Campero', 1, 100, 15000, '2025-12-27', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `refresh_tokens`
--

CREATE TABLE `refresh_tokens` (
  `id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `token` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expira_en` datetime NOT NULL,
  `revocado` tinyint(1) DEFAULT '0',
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `revocado_en` timestamp NULL DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `refresh_tokens`
--

INSERT INTO `refresh_tokens` (`id`, `usuario_id`, `token`, `expira_en`, `revocado`, `creado_en`, `revocado_en`, `ip_address`, `user_agent`) VALUES
(1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3NjY1NDI5ODgsImV4cCI6MTc2NzE0Nzc4OCwiYXVkIjoicG9sbG9zYXBwLXJlZnJlc2giLCJpc3MiOiJwb2xsb3NhcHAifQ.4GTWq7oNdcSq9UOS7vXN2XGijwlX9HL72Rq4chfCAuI', '2025-12-30 21:23:09', 1, '2025-12-24 02:23:08', '2025-12-24 05:57:36', '127.0.0.1', 'PostmanRuntime/7.51.0'),
(2, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3NjY1NDM4NDAsImV4cCI6MTc2NzE0ODY0MCwiYXVkIjoicG9sbG9zYXBwLXJlZnJlc2giLCJpc3MiOiJwb2xsb3NhcHAifQ.GE0qwrUfBQ29pIpWnXIisfgwlvxq4lWYT6FfeXny86M', '2025-12-30 21:37:20', 1, '2025-12-24 02:37:20', '2025-12-24 05:57:36', '127.0.0.1', 'PostmanRuntime/7.51.0'),
(3, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3NjY1NTQ5MzcsImV4cCI6MTc2NzE1OTczNywiYXVkIjoicG9sbG9zYXBwLXJlZnJlc2giLCJpc3MiOiJwb2xsb3NhcHAifQ.Ni2VWwRPy0cUNb-Tc5PV1C38Y6Dv-Pz3lkTZhfbGgWc', '2025-12-31 00:42:17', 1, '2025-12-24 05:42:17', '2025-12-24 05:57:36', '127.0.0.1', 'PostmanRuntime/7.51.0'),
(4, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3NjY1NTUyMzIsImV4cCI6MTc2NzE2MDAzMiwiYXVkIjoicG9sbG9zYXBwLXJlZnJlc2giLCJpc3MiOiJwb2xsb3NhcHAifQ.Ldkp6BbcmnpnIczejhBgak_KdYVZeH0HZImAMgueHxw', '2025-12-31 00:47:12', 1, '2025-12-24 05:47:12', '2025-12-24 05:57:36', '127.0.0.1', 'PostmanRuntime/7.51.0'),
(5, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3NjY1NTUyNTgsImV4cCI6MTc2NzE2MDA1OCwiYXVkIjoicG9sbG9zYXBwLXJlZnJlc2giLCJpc3MiOiJwb2xsb3NhcHAifQ.6kyhzVV7anIDrT4z2sXhVPdvTvkKFxZ2PxNf6PA-kzI', '2025-12-31 00:47:39', 1, '2025-12-24 05:47:38', '2025-12-24 05:57:36', '127.0.0.1', 'PostmanRuntime/7.51.0'),
(6, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3NjY1NTUyNzAsImV4cCI6MTc2NzE2MDA3MCwiYXVkIjoicG9sbG9zYXBwLXJlZnJlc2giLCJpc3MiOiJwb2xsb3NhcHAifQ.uwnQtGtjRPWdWcE_Y8259h9zVi1fWO5EBH1p8IMHugM', '2025-12-31 00:47:50', 1, '2025-12-24 05:47:50', '2025-12-24 05:57:36', '127.0.0.1', 'PostmanRuntime/7.51.0'),
(7, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3NjY1NTUyODEsImV4cCI6MTc2NzE2MDA4MSwiYXVkIjoicG9sbG9zYXBwLXJlZnJlc2giLCJpc3MiOiJwb2xsb3NhcHAifQ.lYQ43Vgv8MElOT-mNaPYWsR1TwTigwFP9btEE2N6X3M', '2025-12-31 00:48:02', 1, '2025-12-24 05:48:01', '2025-12-24 05:57:36', '127.0.0.1', 'PostmanRuntime/7.51.0'),
(8, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3NjY1NTU1MjgsImV4cCI6MTc2NzE2MDMyOCwiYXVkIjoicG9sbG9zYXBwLXJlZnJlc2giLCJpc3MiOiJwb2xsb3NhcHAifQ.0FGBuQOF15QYgI1IVTI-vvP4_adHXDHt4YMFbDp-OTE', '2025-12-31 00:52:09', 1, '2025-12-24 05:52:08', '2025-12-24 05:57:36', '127.0.0.1', 'PostmanRuntime/7.51.0'),
(9, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3NjY1NTU4NTYsImV4cCI6MTc2NzE2MDY1NiwiYXVkIjoicG9sbG9zYXBwLXJlZnJlc2giLCJpc3MiOiJwb2xsb3NhcHAifQ.GNfhjAYKf4kCdZZj1OTkdb_XojLUhic-XZ1bRmVMQyA', '2025-12-31 00:57:37', 1, '2025-12-24 05:57:36', '2025-12-24 05:57:48', '127.0.0.1', 'PostmanRuntime/7.51.0'),
(10, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3NjY1NTU4NjgsImV4cCI6MTc2NzE2MDY2OCwiYXVkIjoicG9sbG9zYXBwLXJlZnJlc2giLCJpc3MiOiJwb2xsb3NhcHAifQ.b6PoWDMuet285xDVZtPnE4Rp8agRC9tufw4nyU9nvlY', '2025-12-31 00:57:49', 1, '2025-12-24 05:57:48', '2025-12-24 05:58:09', '127.0.0.1', 'PostmanRuntime/7.51.0'),
(11, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3NjY1NTU4ODksImV4cCI6MTc2NzE2MDY4OSwiYXVkIjoicG9sbG9zYXBwLXJlZnJlc2giLCJpc3MiOiJwb2xsb3NhcHAifQ.v6yn_BrAJJEZ3hIRTS8weLbZ8M-mFfpZHjmClrqJXTs', '2025-12-31 00:58:09', 1, '2025-12-24 05:58:09', '2025-12-24 05:58:12', '127.0.0.1', 'PostmanRuntime/7.51.0'),
(12, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3NjY1NTU4OTIsImV4cCI6MTc2NzE2MDY5MiwiYXVkIjoicG9sbG9zYXBwLXJlZnJlc2giLCJpc3MiOiJwb2xsb3NhcHAifQ.eWaJeVVWi_k5seBSgqtyELf_mOI6WghlR5YEdJsRTZA', '2025-12-31 00:58:12', 1, '2025-12-24 05:58:12', '2025-12-24 05:58:58', '127.0.0.1', 'PostmanRuntime/7.51.0'),
(13, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3NjY1NTU5MzgsImV4cCI6MTc2NzE2MDczOCwiYXVkIjoicG9sbG9zYXBwLXJlZnJlc2giLCJpc3MiOiJwb2xsb3NhcHAifQ.9ZyYY8gzcWWmsAx_oFgt08ykuPYMbbb0mqeEENIxyMk', '2025-12-31 00:58:58', 1, '2025-12-24 05:58:58', '2025-12-24 06:03:05', '127.0.0.1', 'PostmanRuntime/7.51.0'),
(14, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3NjY1NTYxODUsImV4cCI6MTc2NzE2MDk4NSwiYXVkIjoicG9sbG9zYXBwLXJlZnJlc2giLCJpc3MiOiJwb2xsb3NhcHAifQ.IMtKw_zybw1TdxU_3CrFvXoDgnWbsI7d07UGjqR6QOc', '2025-12-31 01:03:05', 0, '2025-12-24 06:03:05', NULL, '127.0.0.1', 'PostmanRuntime/7.51.0'),
(15, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3NjY2MzMwNTQsImV4cCI6MTc2NzIzNzg1NCwiYXVkIjoicG9sbG9zYXBwLXJlZnJlc2giLCJpc3MiOiJwb2xsb3NhcHAifQ.emWug-zmQ7IPGjEk_zPChXhevCpWPgQ69IkYA71DBAY', '2025-12-31 22:24:14', 0, '2025-12-25 03:24:14', NULL, '127.0.0.1', 'PostmanRuntime/7.51.0'),
(16, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3NjY2MzMxMDIsImV4cCI6MTc2NzIzNzkwMiwiYXVkIjoicG9sbG9zYXBwLXJlZnJlc2giLCJpc3MiOiJwb2xsb3NhcHAifQ.BND-VPg64x5UYtmFdGVHN1knsfSWYA5JTOnpEbfecLE', '2025-12-31 22:25:02', 0, '2025-12-25 03:25:02', NULL, '127.0.0.1', 'PostmanRuntime/7.51.0'),
(17, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3NjY2NDA1MTQsImV4cCI6MTc2NzI0NTMxNCwiYXVkIjoicG9sbG9zYXBwLXJlZnJlc2giLCJpc3MiOiJwb2xsb3NhcHAifQ.XNiGyOcj_qdJHk-q-2wspcM7j9pPbzhTiZHjrXBrE44', '2026-01-01 00:28:34', 0, '2025-12-25 05:28:34', NULL, '127.0.0.1', 'PostmanRuntime/7.51.0'),
(18, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3NjY2NDA1MTgsImV4cCI6MTc2NzI0NTMxOCwiYXVkIjoicG9sbG9zYXBwLXJlZnJlc2giLCJpc3MiOiJwb2xsb3NhcHAifQ.4Y6LCUVYh71NCrEz9bOBM-HosUBFFnaTLtZy4FPmHIc', '2026-01-01 00:28:38', 0, '2025-12-25 05:28:38', NULL, '192.168.100.11', 'okhttp/4.12.0'),
(19, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3NjY2NDA4MTksImV4cCI6MTc2NzI0NTYxOSwiYXVkIjoicG9sbG9zYXBwLXJlZnJlc2giLCJpc3MiOiJwb2xsb3NhcHAifQ.ERVdiNT-FDO4JnvQVP4stP-WmKAY5mqdKPlfkeaKJdE', '2026-01-01 00:33:40', 0, '2025-12-25 05:33:39', NULL, '127.0.0.1', 'PostmanRuntime/7.51.0'),
(20, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3NjY2NDA4ODYsImV4cCI6MTc2NzI0NTY4NiwiYXVkIjoicG9sbG9zYXBwLXJlZnJlc2giLCJpc3MiOiJwb2xsb3NhcHAifQ.kPBmNZ7uN_oV2DRVr9mTYzfHlsguhS9HbpT55Gt1dOs', '2026-01-01 00:34:47', 0, '2025-12-25 05:34:46', NULL, '192.168.100.11', 'okhttp/4.12.0'),
(21, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3NjY2Nzc5OTAsImV4cCI6MTc2NzI4Mjc5MCwiYXVkIjoicG9sbG9zYXBwLXJlZnJlc2giLCJpc3MiOiJwb2xsb3NhcHAifQ.W4utG3hKMZVzz3V54vMPW0a8CPxv-lG0mDJju9kbUNc', '2026-01-01 10:53:10', 0, '2025-12-25 15:53:10', NULL, '192.168.100.11', 'okhttp/4.12.0'),
(22, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3NjY2Nzg4MzQsImV4cCI6MTc2NzI4MzYzNCwiYXVkIjoicG9sbG9zYXBwLXJlZnJlc2giLCJpc3MiOiJwb2xsb3NhcHAifQ.HorkvqI_uSvzZDiUAjho-ejqITMwmhxmVldcOfi8Vd8', '2026-01-01 11:07:15', 0, '2025-12-25 16:07:14', NULL, '192.168.100.11', 'okhttp/4.12.0'),
(23, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3NjY2OTc2MzUsImV4cCI6MTc2NzMwMjQzNSwiYXVkIjoicG9sbG9zYXBwLXJlZnJlc2giLCJpc3MiOiJwb2xsb3NhcHAifQ.BArI2BaU81JhzqnPOggfcnJSGlBLB3czrEwqyA3YiU0', '2026-01-01 16:20:36', 0, '2025-12-25 21:20:35', NULL, '192.168.100.11', 'okhttp/4.12.0'),
(24, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3NjY4MDYyNTksImV4cCI6MTc2NzQxMTA1OSwiYXVkIjoicG9sbG9zYXBwLXJlZnJlc2giLCJpc3MiOiJwb2xsb3NhcHAifQ.HfRpv4fcBRNLGa4VQbybzoYkSqE-AyCP7XFozzVpX8k', '2026-01-02 22:31:00', 0, '2025-12-27 03:30:59', NULL, '192.168.100.8', 'okhttp/4.12.0'),
(25, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3NjY4MDYzNzAsImV4cCI6MTc2NzQxMTE3MCwiYXVkIjoicG9sbG9zYXBwLXJlZnJlc2giLCJpc3MiOiJwb2xsb3NhcHAifQ.MvVcehkfeEnbEhqd1Q8IRvCNR1Or595oklA_VchvOwY', '2026-01-02 22:32:50', 0, '2025-12-27 03:32:50', NULL, '192.168.100.8', 'okhttp/4.12.0'),
(26, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3NjY4MDY2NjQsImV4cCI6MTc2NzQxMTQ2NCwiYXVkIjoicG9sbG9zYXBwLXJlZnJlc2giLCJpc3MiOiJwb2xsb3NhcHAifQ.D9oFoutD3WmalMdJVkaFyCu8n_OoHkJBrmUBuKPn2PA', '2026-01-02 22:37:44', 0, '2025-12-27 03:37:44', NULL, '192.168.100.8', 'okhttp/4.12.0'),
(27, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3NjY4MTA3ODcsImV4cCI6MTc2NzQxNTU4NywiYXVkIjoicG9sbG9zYXBwLXJlZnJlc2giLCJpc3MiOiJwb2xsb3NhcHAifQ.d1oCMKOPRUWh6pOvkISU-UKVDKTKekxNzxaQaaaiB3g', '2026-01-02 23:46:28', 0, '2025-12-27 04:46:27', NULL, '192.168.100.8', 'okhttp/4.12.0');

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
  `fecha_generacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `usuario_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reportes_lote`
--

INSERT INTO `reportes_lote` (`id`, `lote_id`, `cantidad_inicial`, `cantidad_vendida`, `cantidad_perdida`, `cantidad_restante`, `total_ingresos`, `total_costos`, `ganancia_neta`, `porcentaje_mortalidad`, `fecha_generacion`, `usuario_id`) VALUES
(3, 5, 1000, 600, 50, 350, 15000.50, 8000.00, 7000.50, 5.00, '2025-11-14 14:56:01', 1);

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
  `estado` enum('activo','inactivo') COLLATE utf8mb4_general_ci DEFAULT 'activo',
  `ultimo_login` datetime DEFAULT NULL COMMENT 'Fecha y hora del último login exitoso'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `identificacion`, `telefono`, `correo`, `password`, `cargo`, `estado`, `ultimo_login`) VALUES
(1, 'Carlos Pérez', '123456789', '3001234567', 'carlos@example.com', '$2b$10$hEBjpjvdVKQ6vencQkSueurDH0P0EE2T.3OSPK3gCTnRDgFxd/s7m', 'Administrador', 'activo', '2025-12-24 01:03:05'),
(3, 'pablo Pérez', '183456789', '3001234567', 'pablo@example.com', '$2b$10$JUM0xqfoas6TKh815n1nsOk0QwSLITm/QWyIfMQoECX64lTBCm9AO', 'Administrador', 'activo', NULL);

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
  `fecha_creacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `producto_id` int DEFAULT NULL,
  `estado` enum('pendiente','realizada','pagado','parcial','anulado') COLLATE utf8mb4_general_ci DEFAULT 'pendiente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ventas`
--

INSERT INTO `ventas` (`id`, `lote_id`, `cliente_id`, `usuario_id`, `cantidad`, `precio_unitario`, `valor_total`, `fecha`, `observaciones`, `fecha_creacion`, `producto_id`, `estado`) VALUES
(1, 5, 2, 1, 10, 2500.50, 25005.00, '2025-08-25 14:30:00', 'Venta a cliente frecuente con descuento aplicado', '2025-11-14 14:56:18', NULL, 'pendiente'),
(2, 5, 2, 1, 5, 15000.00, 75000.00, '2025-11-14 10:15:18', 'Venta de prueba para validar producto_id', '2025-11-14 15:15:18', 2, 'realizada'),
(3, 5, 2, 1, 5, 15000.00, 75000.00, '2025-02-16 14:30:00', 'Venta de prueba para validar producto_id', '2025-11-15 03:42:35', 2, 'pagado'),
(4, 5, 2, 1, 5, 15000.00, 75000.00, '2025-02-16 14:30:00', 'Venta de prueba para validar producto_id', '2025-11-15 03:57:16', 2, 'pendiente');

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
  ADD KEY `idx_costos_fecha` (`fecha_compra`),
  ADD KEY `lote_id` (`lote_id`);

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
-- Indexes for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_usuario_id` (`usuario_id`),
  ADD KEY `idx_token` (`token`(255)),
  ADD KEY `idx_revocado` (`revocado`),
  ADD KEY `idx_expira_en` (`expira_en`);

--
-- Indexes for table `reportes_lote`
--
ALTER TABLE `reportes_lote`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `lote_id` (`lote_id`),
  ADD KEY `fk_reportes_usuarios` (`usuario_id`);

--
-- Indexes for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `correo` (`correo`),
  ADD UNIQUE KEY `identificacion` (`identificacion`);

--
-- Indexes for table `ventas`
--
ALTER TABLE `ventas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_ventas_usuarios` (`usuario_id`),
  ADD KEY `cliente_id` (`cliente_id`),
  ADD KEY `idx_ventas_fecha` (`fecha`),
  ADD KEY `lote_id` (`lote_id`),
  ADD KEY `idx_ventas_producto_id` (`producto_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `costos`
--
ALTER TABLE `costos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `lotes`
--
ALTER TABLE `lotes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `negocio`
--
ALTER TABLE `negocio`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `perdidas`
--
ALTER TABLE `perdidas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `reportes_lote`
--
ALTER TABLE `reportes_lote`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `ventas`
--
ALTER TABLE `ventas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

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
-- Constraints for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD CONSTRAINT `refresh_tokens_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reportes_lote`
--
ALTER TABLE `reportes_lote`
  ADD CONSTRAINT `fk_reportes_usuarios` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `reportes_lote_ibfk_1` FOREIGN KEY (`lote_id`) REFERENCES `lotes` (`id`);

--
-- Constraints for table `ventas`
--
ALTER TABLE `ventas`
  ADD CONSTRAINT `fk_ventas_productos` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`),
  ADD CONSTRAINT `fk_ventas_usuarios` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `ventas_ibfk_1` FOREIGN KEY (`lote_id`) REFERENCES `lotes` (`id`),
  ADD CONSTRAINT `ventas_ibfk_2` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
