# Sistema de Migraciones y Base de Datos - Pollos App

Sistema profesional de migraciones de base de datos con control automático de versiones y trazabilidad completa.

---

## Inicio Rápido (3 Pasos)

### 1. Crear Base de Datos
```bash
mysql -u root -p
```
```sql
CREATE DATABASE pollosapp CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
exit;
```

### 2. Configurar Conexión
Edita `backend/src/database/conexion.js` con tus credenciales MySQL.

### 3. Ejecutar Migraciones
```bash
cd backend
npm run migrate:seed
```

**¡Listo!** Tu base de datos está configurada con datos de prueba.

---

## Comandos Disponibles

### 1. **Ejecutar Migraciones** (Recomendado)
```bash
npm run migrate
```
**¿Qué hace?**
- Detecta si la base de datos está vacía y crea el schema inicial
- Verifica migraciones pendientes y las ejecuta automáticamente
- Registra qué migraciones ya se ejecutaron (tabla `_migrations`)
- Es seguro ejecutarlo múltiples veces (no duplica datos)

---

### 2. **Ejecutar Migraciones + Datos de Prueba**
```bash
npm run migrate:seed
```
**¿Qué hace?**
- Todo lo de `npm run migrate`
- Inserta datos de prueba (usuario, negocios, productos, lotes, clientes, ventas)
- **ADVERTENCIA: NO ejecutar en producción**

---

### 3. **Ver Estado de la Base de Datos**
```bash
npm run db:status
```
**¿Qué muestra?**
- Total de tablas creadas
- Migraciones ejecutadas
- Lista de tablas y migraciones

---

### 4. **Ejecutar Solo Seed (Datos de Prueba)**
```bash
npm run seed
```
**¿Qué hace?**
- Inserta solo datos de prueba
- Requiere que las migraciones ya estén ejecutadas

---

## Flujo de Migraciones

### **Escenario 1: Primera Vez (BD Vacía)**
```
npm run migrate

→ Detecta BD vacía
→ Crea schema inicial (usuarios, negocio, productos, lotes, etc.)
→ Ejecuta migraciones pendientes (add_usuario_id_to_negocio.sql)
→ Registra migraciones en tabla _migrations
→ Base de datos lista
```

### **Escenario 2: Base de Datos Existente**
```
npm run migrate

→ Detecta BD existente
→ Revisa migraciones pendientes
→ Ejecuta solo las que faltan
→ Registra en tabla _migrations
→ Base de datos actualizada
```

### **Escenario 3: Agregar Datos de Prueba**
```
npm run migrate:seed

→ Ejecuta migraciones pendientes
→ Inserta datos de prueba:
   - Usuario: Alejandro
   - 3 Negocios (Pollos, Conejos, Carnicería)
   - 8 Productos
   - 8 Lotes con stock
   - 5 Clientes
   - 8 Ventas
→ Sistema listo para probar
```

---

## Estructura del Proyecto

```
backend/src/database/
├── migrate.js                    <- Sistema de migraciones
├── conexion.js                   <- Conexión a BD
├── migrations/                   <- Carpeta de migraciones
│   ├── create_refresh_tokens.sql        <- Migración 1
│   ├── add_usuario_id_to_negocio.sql    <- Migración 2 (CRÍTICA)
│   └── seed_datos_prueba.sql            <- Datos de prueba
├── schema/
│   └── schema.sql                <- Schema inicial (solo primera vez)
└── README.md                     <- Esta documentación
```

---

## Análisis de la Base de Datos

### Problema Detectado

El sistema necesitaba **trazabilidad completa** para responder:

> "¿Quién vendió?, ¿Qué vendió?, ¿De qué negocio?, ¿A qué cliente?"

**Antes de la migración:**
- La tabla `negocio` NO tenía `usuario_id`
- No se podía saber quién era el dueño de cada negocio
- Cualquier usuario podría vender productos de cualquier negocio
- Falta de validación de permisos

**Después de la migración:**
- Trazabilidad completa: Usuario → Negocio → Producto → Lote → Venta
- Cada usuario ve solo sus negocios, productos y lotes
- Validación automática de permisos
- Soporte para múltiples negocios por usuario

---

### Caso de Uso Real

**Alejandro tiene 3 negocios:**

```
Usuario: Alejandro (usuario_id = 1)
├─ Negocio 1: "Granja Pollos El Roble"
│  ├─ Productos: Pollo Rojo, Pollo Blanco
│  │  ├─ Lotes: 
│  │  │  ├─ Lote Pollos Rojos Enero (100 unidades, 70 disponibles)
│  │  │  └─ Lote Pollos Blancos Enero (80 unidades, 50 disponibles)
│  ├─ Clientes: Supermercado A, Restaurante B
│  └─ Ventas: 20 pollos a Supermercado A
│
├─ Negocio 2: "Cabaña Conejos Premium"
│  ├─ Productos: Conejo Blanco, Conejo Gris
│  │  ├─ Lotes: Lote Conejos Blancos 2025 (60, 45 disponibles)
│  ├─ Clientes: Carnicería C
│  └─ Ventas: 10 conejos a Carnicería C
│
└─ Negocio 3: "Carnicería Premium"
   ├─ Productos: Carne de Cerdo, Res, Pollo
   │  ├─ Lotes: Lote Cerdo Enero (500 kg, 400 disponibles)
   ├─ Clientes: Hotel D, Restaurante E
   └─ Ventas: 25 kg Carne Cerdo a Hotel D
```

**Registrar Venta:**
```
Usuario dice: "Vendí 20 pollos rojos al Supermercado A"

Sistema registra automáticamente:
- usuario_id: 1 (Alejandro) <- Del JWT
- lote_id: 1 (Lote Pollos Rojos) <- Usuario selecciona
- cliente_id: 1 (Supermercado A) <- Usuario selecciona
- cantidad: 20 <- Usuario ingresa
- negocio_id: 1 <- Se deduce automático (lote → producto → negocio)
- valor_total: 900.000 <- Calculado

Trazabilidad completa registrada
```

---

## Historial de Migraciones

### **create_refresh_tokens.sql**
**Fecha:** Inicial  
**Descripción:** Crea tabla para tokens JWT de refresh

**Cambios:**
- Tabla `refresh_tokens` con tracking de sesiones

---

### **add_usuario_id_to_negocio.sql** (27/12/2025)
**Estado:** CRÍTICA  
**Descripción:** Establece relación Usuario → Negocio para trazabilidad completa

**Cambios:**
- Agrega columna `usuario_id` a tabla `negocio`
- Crea foreign key `fk_negocio_usuario`
- Crea índices de optimización:
  - `idx_negocio_usuario`
  - `idx_productos_negocio`
  - `idx_lotes_producto`
  - `idx_clientes_usuario`
  - `idx_ventas_usuario`
  - `idx_ventas_lote`
  - `idx_ventas_cliente`

**Por qué es importante:**
Esta migración resuelve el problema de trazabilidad. Con ella:
- Cada usuario ve solo sus negocios, productos y lotes
- Validación automática de permisos en ventas
- Soporte para múltiples negocios por usuario
- Control completo de inventario por usuario

---

### **seed_datos_prueba.sql** (27/12/2025)
**Estado:** Opcional  
**Descripción:** Inserta datos de prueba realistas

**Contenido:**
- 1 Usuario: Alejandro Pérez
- 3 Negocios: Granja Pollos, Cabaña Conejos, Carnicería
- 8 Productos variados
- 8 Lotes con stock disponible
- 5 Clientes
- 8 Ventas de ejemplo
- Costos y pérdidas

**ADVERTENCIA: NO ejecutar en producción**

---

## IMPORTANTE: Antes de Ejecutar

### 1. **Backup de la Base de Datos**
Siempre haz backup antes de ejecutar migraciones:

```bash
# MySQL/MariaDB
mysqldump -u root -p pollosapp > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar si algo sale mal
mysql -u root -p pollosapp < backup_20251227_123000.sql
```

---

### 2. **Si Ya Tienes Negocios Existentes**

Si tu base de datos **ya tiene negocios registrados**, debes asignarles un `usuario_id` antes de ejecutar la migración:

```sql
-- 1. Ver negocios sin usuario_id
SELECT * FROM negocio WHERE usuario_id IS NULL;

-- 2. Asignar todos los negocios al usuario ID 1
UPDATE negocio SET usuario_id = 1 WHERE usuario_id IS NULL;

-- 3. Ahora sí ejecuta la migración
npm run migrate
```

---

### 3. **Configurar Conexión a BD**

Asegúrate de tener configurado `src/database/conexion.js`:

```javascript
// backend/src/database/conexion.js
export const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'tu_password',
    database: 'pollosapp',
    waitForConnections: true,
    connectionLimit: 10
});
```

---

## Verificar Migración Exitosa

### **Opción 1: Desde terminal**
```bash
# Ver estado de la BD
npm run db:status

# Salida esperada:
# Estado actual de la base de datos:
#    Total de tablas: 11
#    Migraciones ejecutadas: 2
```

### **Opción 2: Desde MySQL**
```sql
-- Ver estructura de negocio
DESCRIBE negocio;

-- Debe mostrar la columna usuario_id

-- Ver migraciones ejecutadas
SELECT * FROM _migrations;

-- Ver relación Usuario → Negocio
SELECT u.nombre AS usuario, n.nombre AS negocio 
FROM usuarios u 
JOIN negocio n ON u.id = n.usuario_id;
```

### **Opción 3: Verificar trazabilidad completa**
```sql
-- Ver cadena completa: Usuario → Negocio → Producto → Lote
SELECT 
    u.nombre AS usuario,
    n.nombre AS negocio,
    p.nombre AS producto,
    l.nombre AS lote,
    l.cantidad_actual AS stock
FROM lotes l
INNER JOIN productos p ON l.producto_id = p.id
INNER JOIN negocio n ON p.negocio_id = n.id
INNER JOIN usuarios u ON n.usuario_id = u.id
ORDER BY u.nombre, n.nombre;
```

---

## Troubleshooting (Solución de Problemas)

### **Error: "Access denied for user"**
```bash
# Solución: Verifica credenciales en conexion.js
```

### **Error: "Table already exists"**
```bash
# No es un error crítico, el sistema detecta esto y continúa
```

### **Error: "Cannot add foreign key constraint"**
```bash
# Solución: Asegúrate de que todos los negocios tengan usuario_id
UPDATE negocio SET usuario_id = 1 WHERE usuario_id IS NULL;
```

### **Error: "Unknown database 'pollosapp'"**
```bash
# Solución: Crear la base de datos primero
mysql -u root -p
CREATE DATABASE pollosapp CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
exit;

# Luego ejecuta las migraciones
npm run migrate
```

---

## Casos de Uso

### **Caso 1: Desarrollador nuevo en el proyecto**
```bash
# 1. Clonar repositorio
git clone https://github.com/alejandroDpAL/pollosapp.git

# 2. Instalar dependencias
cd backend
npm install

# 3. Configurar conexión BD en conexion.js

# 4. Crear BD y ejecutar migraciones
mysql -u root -p
CREATE DATABASE pollosapp;
exit;

npm run migrate:seed

# Listo para desarrollar
```

### **Caso 2: Actualizar BD en producción**
```bash
# 1. Backup
mysqldump -u root -p pollosapp > backup_antes_migrar.sql

# 2. Ejecutar solo migraciones (sin seed)
npm run migrate

# 3. Verificar
npm run db:status

# 4. Si algo falla, restaurar backup
mysql -u root -p pollosapp < backup_antes_migrar.sql
```

### **Caso 3: Reset completo de BD para testing**
```bash
# 1. Eliminar BD
mysql -u root -p
DROP DATABASE pollosapp;
CREATE DATABASE pollosapp;
exit;

# 2. Recrear con datos de prueba
npm run migrate:seed

# BD limpia con datos de prueba
```

---

## Tips y Buenas Prácticas

1. **Siempre** haz backup antes de migrar
2. Ejecuta `npm run migrate` después de hacer `git pull`
3. Usa `--seed` solo en desarrollo/testing
4. Cada nueva columna/tabla → Nueva migración
5. Nombra las migraciones con fecha: `YYYY-MM-DD_descripcion.sql`
6. No modifiques migraciones ya ejecutadas
7. No ejecutes seed en producción

---

## Estructura de Relaciones Final

```
usuarios
  ↓
negocio (usuario_id) <- AGREGADO CON MIGRACIÓN
  ↓
productos (negocio_id)
  ↓
lotes (producto_id)
  ↓
ventas (lote_id, usuario_id, cliente_id)

Tablas adicionales:
├─ clientes (usuario_id)
├─ perdidas (lote_id)
├─ costos (lote_id)
└─ reportes_lote (lote_id, usuario_id)
```

---

## Flujo de Venta Completo

```
┌─────────────────────────────────────┐
│ Usuario login (JWT: usuario_id = 1) │
└────────────┬────────────────────────┘
             │
             ▼
    ┌────────────────────────────┐
    │ SELECT lotes con stock > 0 │
    │ WHERE negocio.usuario = 1  │
    │                            │
    │ * Lote Pollos Rojos (70)   │
    │ * Lote Conejos (45)        │
    │ * Lote Carne Cerdo (400)   │
    └────────────┬───────────────┘
                 │
                 ▼ Usuario selecciona
    ┌────────────────────────────┐
    │ SELECT clientes            │
    │ WHERE usuario_id = 1       │
    │                            │
    │ * Supermercado A           │
    │ * Restaurante B            │
    └────────────┬───────────────┘
                 │
                 ▼ Usuario selecciona
    ┌────────────────────────────┐
    │ Cantidad: 20               │
    │ Precio: 45000              │
    │ Total: 900000              │
    └────────────┬───────────────┘
                 │
                 ▼ Confirma
    ┌────────────────────────────┐
    │ INSERT INTO ventas         │
    │ UPDATE lotes stock         │
    └────────────┬───────────────┘
                 │
                 ▼
    ┌────────────────────────────┐
    │ Venta registrada           │
    └────────────────────────────┘
```

---

## Soporte

**¿Problemas con las migraciones?**
1. Revisa logs en consola
2. Verifica conexión a BD
3. Consulta troubleshooting arriba
4. Verifica que tengas permisos MySQL

---

**Última actualización:** 27 de Diciembre de 2025  
**Sistema:** Profesional con tracking automático  
**Estado:** Listo para usar
