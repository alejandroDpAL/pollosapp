-- ============================================
-- SCHEMA COMPLETO - POLLOS APP
-- ============================================
-- Este archivo contiene el schema completo de la base de datos
-- Actualizado: 23 de diciembre de 2025

-- ============================================
-- TABLA: negocio
-- ============================================
CREATE TABLE IF NOT EXISTS negocio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT NULL,
    activo TINYINT(1) DEFAULT 1 NULL,
    logo VARCHAR(50) NOT NULL,
    correo VARCHAR(50) NOT NULL,
    fecha DATE NULL,
    telefono INT NOT NULL,
    CONSTRAINT nombre UNIQUE (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- TABLA: usuarios
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    identificacion VARCHAR(50) NOT NULL,
    telefono VARCHAR(20) NULL,
    correo VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    cargo VARCHAR(50) NULL,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo' NULL,
    CONSTRAINT correo UNIQUE (correo),
    CONSTRAINT identificacion UNIQUE (identificacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- TABLA: productos
-- ============================================
CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    negocio_id INT NOT NULL,
    cantidad INT NOT NULL,
    costo INT NOT NULL,
    fecha_compra DATE NULL,
    fecha_venta DATE NULL,
    INDEX tipo_negocio_id (negocio_id),
    CONSTRAINT productos_ibfk_1 
        FOREIGN KEY (negocio_id) REFERENCES negocio(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- TABLA: lotes
-- ============================================
CREATE TABLE IF NOT EXISTS lotes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT NOT NULL,
    cantidad_inicial INT NOT NULL,
    cantidad_actual INT NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    fecha DATE NOT NULL,
    descripcion TEXT NULL,
    nombre VARCHAR(50) NOT NULL,
    INDEX producto_id (producto_id),
    CONSTRAINT lotes_ibfk_1 
        FOREIGN KEY (producto_id) REFERENCES productos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- TABLA: clientes
-- ============================================
CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NULL,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NULL,
    correo VARCHAR(100) NULL,
    direccion TEXT NULL,
    estado TINYINT(1) DEFAULT 1 NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_clientes_usuarios 
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- TABLA: costos
-- ============================================
CREATE TABLE IF NOT EXISTS costos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lote_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    fecha_compra DATE NOT NULL,
    observaciones TEXT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    INDEX lote_id (lote_id),
    INDEX idx_costos_fecha (fecha_compra),
    CONSTRAINT costos_ibfk_1 
        FOREIGN KEY (lote_id) REFERENCES lotes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- TABLA: perdidas
-- ============================================
CREATE TABLE IF NOT EXISTS perdidas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lote_id INT NOT NULL,
    cantidad INT NOT NULL,
    motivo ENUM('mortalidad', 'enfermedad', 'accidente', 'otro') NOT NULL,
    descripcion TEXT NULL,
    fecha_perdida DATE NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    INDEX lote_id (lote_id),
    CONSTRAINT perdidas_ibfk_1 
        FOREIGN KEY (lote_id) REFERENCES lotes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- TABLA: refresh_tokens (SEGURIDAD JWT)
-- ============================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    token VARCHAR(500) NOT NULL,
    expira_en DATETIME NOT NULL,
    revocado TINYINT(1) DEFAULT 0 NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL,
    revocado_en TIMESTAMP NULL,
    ip_address VARCHAR(45) NULL,
    user_agent VARCHAR(255) NULL,
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_token (token(255)),
    INDEX idx_revocado (revocado),
    INDEX idx_expira_en (expira_en),
    CONSTRAINT refresh_tokens_ibfk_1 
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: reportes_lote
-- ============================================
CREATE TABLE IF NOT EXISTS reportes_lote (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lote_id INT NOT NULL,
    cantidad_inicial INT NOT NULL,
    cantidad_vendida INT NOT NULL,
    cantidad_perdida INT NOT NULL,
    cantidad_restante INT NOT NULL,
    total_ingresos DECIMAL(12, 2) NOT NULL,
    total_costos DECIMAL(12, 2) NOT NULL,
    ganancia_neta DECIMAL(12, 2) NOT NULL,
    porcentaje_mortalidad DECIMAL(5, 2) NOT NULL,
    fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usuario_id INT NULL,
    CONSTRAINT lote_id UNIQUE (lote_id),
    CONSTRAINT fk_reportes_usuarios 
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    CONSTRAINT reportes_lote_ibfk_1 
        FOREIGN KEY (lote_id) REFERENCES lotes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- TABLA: ventas
-- ============================================
CREATE TABLE IF NOT EXISTS ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lote_id INT NOT NULL,
    cliente_id INT NULL,
    usuario_id INT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    valor_total DECIMAL(10, 2) NOT NULL,
    fecha DATETIME NOT NULL,
    observaciones TEXT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    producto_id INT NULL,
    estado ENUM('pendiente', 'realizada', 'pagado', 'parcial', 'anulado') DEFAULT 'pendiente' NULL,
    INDEX lote_id (lote_id),
    INDEX cliente_id (cliente_id),
    INDEX idx_ventas_fecha (fecha),
    INDEX idx_ventas_producto_id (producto_id),
    CONSTRAINT fk_ventas_productos 
        FOREIGN KEY (producto_id) REFERENCES productos(id),
    CONSTRAINT fk_ventas_usuarios 
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    CONSTRAINT ventas_ibfk_1 
        FOREIGN KEY (lote_id) REFERENCES lotes(id),
    CONSTRAINT ventas_ibfk_2 
        FOREIGN KEY (cliente_id) REFERENCES clientes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;