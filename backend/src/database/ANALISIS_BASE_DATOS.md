# Análisis y Documentación de la Base de Datos - Pollos App

**Fecha:** 27 de Diciembre de 2025  
**Proyecto:** Sistema de Trazabilidad de Ventas para Negocios Múltiples  
**Estado:** En Análisis y Reestructuración

---

## Resumen Ejecutivo

Se identificaron **inconsistencias críticas** en la estructura de la base de datos que impedían:
- Trazabilidad completa de ventas
- Relación correcta entre usuarios y sus negocios
- Validación de permisos
- Control de múltiples negocios por usuario

Después del análisis, se **concluyó en una nueva estructura mejorada**.

---

## Problemas Identificados

### **Problema 1: Falta relación Usuario → Negocio**
```
ANTES:
negocio (id, nombre, descripcion, logo, correo, telefono)
  └─ NO TIENE usuario_id
  
NECESARIO:
negocio (id, usuario_id, nombre, descripcion, logo, correo, telefono)
```

**Impacto:** No se podía saber quién es el dueño de cada negocio. Cualquier usuario podría ver/vender productos de cualquier negocio.

---

### **Problema 2: Falta relación Usuario → Producto**
```
ANTES:
productos (id, nombre, negocio_id, cantidad, costo, fecha_compra)
  └─ Solo referencia negocio, no usuario

SERÍA MEJOR:
usuario → negocio → productos
```

**Impacto:** No hay validación de que un usuario pueda gestionar solo sus productos.

---

### **Problema 3: Falta relación Usuario → Lote**
```
ANTES:
lotes (id, producto_id, nombre, cantidad_actual, precio, fecha)
  └─ No se sabe a qué usuario pertenece

SOLUCIÓN:
usuario → negocio → productos → lotes
```

**Impacto:** No se puede filtrar lotes por usuario logueado.

---

### **Problema 4: Clientes sin claridad de pertenencia**
```
AMBIGUO:
clientes (id, usuario_id, nombre, telefono)
  └─ ¿Clientes del usuario o del negocio?

ESTRUCTURA:
clientes (id, usuario_id, nombre, telefono)
  └─ Pertenecen al usuario (ya está bien en BD)
```

**Impacto:** Confusión sobre si un cliente es global del usuario o específico de un negocio.

---

### **Problema 5: Ventas sin trazabilidad completa**
```
INCOMPLETO:
ventas (id, lote_id, cliente_id, usuario_id, cantidad, precio_unitario)
  └─ Falta información del negocio explícita

MEJORADO:
ventas (id, lote_id, cliente_id, usuario_id, cantidad, precio_unitario)
  └─ Se deduce negocio desde lote → producto → negocio
```

**Impacto:** Las ventas estaban registradas pero sin relación clara al negocio de origen.

---

## Caso de Uso Real - Ejemplo Práctico

### Escenario:
**Alejandro tiene 3 negocios y quiere registrar una venta**

```
Alejandro (usuario_id = 1)
├─ Negocio 1: "Granja Pollos El Roble" (negocio_id = 1)
│  ├─ Productos: Pollo Rojo, Pollo Blanco
│  │  ├─ Lotes: 
│  │  │  ├─ Lote Pollos Rojos Enero (100 unidades, 70 disponibles)
│  │  │  └─ Lote Pollos Blancos Enero (80 unidades, 50 disponibles)
│  │  └─ Clientes: Supermercado A, Restaurante B
│
├─ Negocio 2: "Cabaña Conejos Premium" (negocio_id = 2)
│  ├─ Productos: Conejo Blanco, Conejo Gris
│  │  ├─ Lotes:
│  │  │  ├─ Lote Conejos Blancos 2025 (60 unidades, 45 disponibles)
│  │  │  └─ Lote Conejos Grises 2025 (40 unidades, 30 disponibles)
│  │  └─ Clientes: Carnicería C
│
└─ Negocio 3: "Carnicería Premium" (negocio_id = 3)
   ├─ Productos: Carne de Cerdo, Carne de Res, Carne de Pollo
   │  ├─ Lotes:
   │  │  ├─ Lote Carne de Cerdo Enero (500 kg, 400 disponibles)
   │  │  ├─ Lote Carne de Res Enero (400 kg, 300 disponibles)
   │  │  └─ Lote Carne de Pollo Enero (300 kg, 250 disponibles)
   │  └─ Clientes: Hotel D, Restaurante E
```

### Registrar Venta:

**Alejandro dice:** "Vendí 20 pollos rojos al Supermercado A"

```
Datos a registrar:
- usuario_id: 1 (Alejandro) ← Automático del JWT
- lote_id: 1 (Lote Pollos Rojos Enero) ← Usuario selecciona
- cliente_id: 1 (Supermercado A) ← Usuario selecciona
- cantidad: 20 ← Usuario ingresa
- precio_unitario: 45000 ← Sistema calcula o usuario ingresa
- valor_total: 900000 (20 * 45000)
- negocio_id: 1 ← Se deduce automático (lote.producto.negocio)
- fecha: 2025-01-27
- estado: 'realizada'

Trazabilidad completa:
Venta (id=1) 
  → Usuario: Alejandro
  → Negocio: Granja Pollos El Roble
  → Lote: Lote Pollos Rojos Enero
  → Producto: Pollo Rojo
  → Cliente: Supermercado A
  → Cantidad: 20 unidades
  → Valor: $900.000
```

---

## Estructura Correcta Propuesta

### **Relaciones necesarias:**

```
usuarios
  ↓
negocio (usuario_id)
  ↓
productos (negocio_id)
  ↓
lotes (producto_id)
  ↓
ventas (lote_id, usuario_id, cliente_id)

clientes (usuario_id)
perdidas (lote_id)
costos (lote_id)
reportes_lote (lote_id, usuario_id)
```

### **Script SQL de Implementación:**

```sql
-- 1. AGREGAR usuario_id a negocio
ALTER TABLE negocio 
ADD COLUMN usuario_id INT NOT NULL AFTER id;

ALTER TABLE negocio 
ADD CONSTRAINT fk_negocio_usuario 
FOREIGN KEY (usuario_id) REFERENCES usuarios(id);

-- 2. Crear índices para optimizar búsquedas
CREATE INDEX idx_negocio_usuario ON negocio(usuario_id);
CREATE INDEX idx_productos_negocio ON productos(negocio_id);
CREATE INDEX idx_lotes_producto ON lotes(producto_id);
CREATE INDEX idx_clientes_usuario ON clientes(usuario_id);
CREATE INDEX idx_ventas_usuario ON ventas(usuario_id);
CREATE INDEX idx_ventas_lote ON ventas(lote_id);
CREATE INDEX idx_ventas_cliente ON ventas(cliente_id);
CREATE INDEX idx_ventas_fecha ON ventas(fecha);

-- 3. DATOS DE PRUEBA REALISTAS
-- Insertar Usuario
INSERT INTO usuarios (nombre, identificacion, correo, password, cargo, telefono, estado)
VALUES (
  'Alejandro Perez',
  '1234567890',
  'alejandro@pollosapp.com',
  '$2b$10$...',  -- Password hasheado
  'Administrador',
  '3005551234',
  'activo'
);

-- Insertar Negocios del Usuario (usuario_id = 1)
INSERT INTO negocio (usuario_id, nombre, descripcion, logo, correo, telefono, activo)
VALUES 
(1, 'Granja Pollos El Roble', 'Venta de pollos de engorde', 'pollos.png', 'pollos@negocio.com', 3005551111, 1),
(1, 'Cabaña Conejos Premium', 'Cría y venta de conejos', 'conejos.png', 'conejos@negocio.com', 3005552222, 1),
(1, 'Carnicería Premium', 'Venta de carnes variadas', 'carnes.png', 'carnes@negocio.com', 3005553333, 1);

-- Productos de cada negocio
INSERT INTO productos (nombre, negocio_id, cantidad, costo, fecha_compra)
VALUES 
-- Negocio 1: Pollos
(1, 'Pollo Rojo', 200, 35000, '2025-01-10'),
(1, 'Pollo Blanco', 150, 32000, '2025-01-12'),
-- Negocio 2: Conejos
(2, 'Conejo Blanco', 80, 45000, '2025-01-15'),
(2, 'Conejo Gris', 60, 48000, '2025-01-16'),
-- Negocio 3: Carnes
(3, 'Carne de Cerdo', 500, 28000, '2025-01-20'),
(3, 'Carne de Res', 400, 35000, '2025-01-21'),
(3, 'Carne de Pollo', 300, 25000, '2025-01-22');

-- Lotes de cada producto
INSERT INTO lotes (producto_id, cantidad_inicial, cantidad_actual, precio, fecha, nombre, descripcion)
VALUES 
-- Pollos
(1, 100, 70, 45000, '2025-01-10', 'Lote Pollos Rojos Enero', 'Pollos listos para venta'),
(2, 80, 50, 42000, '2025-01-12', 'Lote Pollos Blancos Enero', 'Pollos de excelente calidad'),
-- Conejos
(3, 60, 45, 65000, '2025-01-15', 'Lote Conejos Blancos 2025', 'Conejos adultos'),
(4, 40, 30, 68000, '2025-01-16', 'Lote Conejos Grises 2025', 'Conejos para reproducción'),
-- Carnes
(5, 500, 400, 28000, '2025-01-20', 'Lote Carne de Cerdo Enero', '500 kg disponibles'),
(6, 400, 300, 38000, '2025-01-21', 'Lote Carne de Res Enero', '400 kg disponibles'),
(7, 300, 250, 26000, '2025-01-22', 'Lote Carne de Pollo Enero', '300 kg disponibles');

-- Clientes del Usuario
INSERT INTO clientes (usuario_id, nombre, telefono, correo, direccion, estado)
VALUES 
(1, 'Supermercado A', '3005554444', 'compras@superA.com', 'Calle 1 #100', 1),
(1, 'Restaurante B', '3005555555', 'compras@restauranteb.com', 'Calle 2 #200', 1),
(1, 'Carnicería C', '3005556666', 'gerente@carniceriac.com', 'Calle 3 #300', 1),
(1, 'Hotel D', '3005557777', 'compras@hoteld.com', 'Calle 4 #400', 1),
(1, 'Restaurante E', '3005558888', 'admin@restaurantee.com', 'Calle 5 #500', 1);

-- Ventas registradas
INSERT INTO ventas (lote_id, cliente_id, usuario_id, cantidad, precio_unitario, valor_total, fecha, observaciones, producto_id, estado)
VALUES 
(1, 1, 1, 20, 45000, 900000, NOW(), 'Venta de pollos rojos a Supermercado', 1, 'realizada'),
(2, 2, 1, 15, 42000, 630000, NOW(), 'Venta de pollos blancos a Restaurante', 2, 'realizada'),
(3, 3, 1, 10, 65000, 650000, NOW(), 'Venta de conejos a Carnicería', 3, 'realizada'),
(5, 4, 1, 25, 28000, 700000, NOW(), 'Venta de carne de cerdo a Hotel', 5, 'pagado'),
(6, 5, 1, 30, 38000, 1140000, NOW(), 'Venta de carne de res a Restaurante', 6, 'pendiente');
```

---

## Flujo de Usuario - Registrar Venta

```
┌─────────────────────────────────────────────────┐
│ Usuario: Alejandro (JWT: usuario_id = 1)       │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
    ┌──────────────────────────────┐
    │ Pantalla: Nueva Venta        │
    │ "Mis Lotes Disponibles"      │
    └────────────┬─────────────────┘
                 │
                 ▼
    ┌──────────────────────────────────────────┐
    │ SELECT lotes con stock > 0               │
    │ WHERE producto.negocio.usuario = 1       │
    │                                          │
    │ - Lote Pollos Rojos (70 disponibles)    │
    │ - Lote Pollos Blancos (50 disponibles)  │
    │ - Lote Conejos Blancos (45 disponibles) │
    │ - Lote Conejos Grises (30 disponibles)  │
    │ - Lote Carne de Cerdo (400 disponibles) │
    └────────────┬─────────────────────────────┘
                 │
                 ▼ Usuario selecciona lote
    ┌──────────────────────────────────────┐
    │ "¿A qué cliente vendiste?"           │
    │ SELECT clientes WHERE usuario_id = 1│
    │                                      │
    │ - Supermercado A                    │
    │ - Restaurante B                     │
    │ - Carnicería C                      │
    │ - Hotel D                           │
    │ - Restaurante E                     │
    └────────────┬────────────────────────┘
                 │
                 ▼ Usuario selecciona cliente
    ┌──────────────────────────────────────┐
    │ "¿Cuánta cantidad?"                  │
    │ Cantidad: 20                         │
    │ Precio: 45000 (del lote)             │
    │ Total: 900000                        │
    └────────────┬────────────────────────┘
                 │
                 ▼ Usuario confirma
    ┌──────────────────────────────────────┐
    │ INSERT INTO ventas                   │
    │ usuario_id: 1 ← JWT                  │
    │ lote_id: 1 ← Seleccionado            │
    │ cliente_id: 1 ← Seleccionado         │
    │ cantidad: 20 ← Ingresado             │
    │ negocio_id: 1 ← Deducido             │
    └────────────┬────────────────────────┘
                 │
                 ▼
    ┌──────────────────────────────────────┐
    │ UPDATE lotes SET                     │
    │ cantidad_actual = 50 (70 - 20)       │
    └────────────┬────────────────────────┘
                 │
                 ▼
    ┌──────────────────────────────────────┐
    │ Venta registrada exitosamente        │
    │ ID: 1                               │
    │ Negocio: Granja Pollos El Roble     │
    │ Cliente: Supermercado A             │
    │ Valor: $900.000                     │
    └──────────────────────────────────────┘
```

---

## Cambios en Controladores Necesarios

### **1. Controlador de Lotes**
```javascript
// ANTES: Obtenía todos los lotes
const [rows] = await pool.query("SELECT * FROM lotes");

// DESPUÉS: Obtiene solo lotes del usuario
const sql = `
  SELECT l.*, p.nombre AS producto_nombre, n.id AS negocio_id, n.nombre AS negocio_nombre
  FROM lotes l
  INNER JOIN productos p ON l.producto_id = p.id
  INNER JOIN negocio n ON p.negocio_id = n.id
  WHERE n.usuario_id = ? AND l.cantidad_actual > 0
  ORDER BY l.fecha DESC
`;
const [rows] = await pool.query(sql, [usuario_id]);
```

### **2. Controlador de Clientes**
```javascript
// ANTES: Confusión sobre a quién pertenecen
const [rows] = await pool.query("SELECT * FROM clientes");

// DESPUÉS: Solo clientes del usuario logueado
const sql = "SELECT * FROM clientes WHERE usuario_id = ? ORDER BY nombre";
const [rows] = await pool.query(sql, [usuario_id]);
```

### **3. Controlador de Ventas**
```javascript
// VALIDACIONES NECESARIAS:
1. El lote existe
2. El producto del lote existe
3. El negocio del producto pertenece al usuario ← CRÍTICO
4. El cliente existe y pertenece al usuario ← CRÍTICO
5. Hay stock disponible
6. Registrar venta con negocio_id deducido
```

---

## Checklist de Implementación

- [ ] Ejecutar ALTER TABLE para agregar usuario_id a negocio
- [ ] Crear índices de optimización
- [ ] Insertar datos de prueba (usuario, negocios, productos, lotes, clientes)
- [ ] Actualizar controlador de lotes
- [ ] Actualizar controlador de clientes
- [ ] Actualizar controlador de ventas con validaciones
- [ ] Actualizar controlador de negocio para crear/editar
- [ ] Actualizar controlador de productos
- [ ] Probar flujo completo de venta
- [ ] Documentar API endpoints

---

## Conclusiones

### **Diagnóstico Final:**

La estructura original tenía **3 inconsistencias críticas**:
1. Falta de relación usuario-negocio
2. Imposibilidad de filtrar datos por usuario
3. Falta de trazabilidad clara en ventas

### **Solución Propuesta:**

- Agregar `usuario_id` a tabla `negocio`  
- Actualizar controladores para validar pertenencia  
- Crear índices para optimizar búsquedas  
- Insertar datos de prueba realistas  

### **Beneficios:**

- Cada usuario ve solo sus negocios, productos y lotes
- Trazabilidad completa: Usuario → Negocio → Producto → Lote → Venta
- Validación de permisos en cada operación
- Soporte para múltiples negocios por usuario
- Datos seguros y consistentes

---

## Referencia

**Conversación:** Análisis de estructura BD - 27 de Diciembre 2025  
**Desarrollador:** GitHub Copilot  
**Estado:** Listo para implementación  
