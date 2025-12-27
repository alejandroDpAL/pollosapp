# 🚀 Sistema de Migraciones - Pollos App

Sistema profesional de migraciones de base de datos con control de versiones y tracking automático.

---

## 📋 Comandos Disponibles

### 1. **Ejecutar Migraciones** (Recomendado)
```bash
npm run migrate
```
**¿Qué hace?**
- ✅ Detecta si la base de datos está vacía → Crea el schema inicial
- ✅ Verifica migraciones pendientes → Las ejecuta automáticamente
- ✅ Registra qué migraciones ya se ejecutaron (tabla `_migrations`)
- ✅ Es seguro ejecutarlo múltiples veces (no duplica datos)

---

### 2. **Ejecutar Migraciones + Datos de Prueba**
```bash
npm run migrate:seed
```
**¿Qué hace?**
- ✅ Todo lo de `npm run migrate`
- ✅ Inserta datos de prueba (usuario, negocios, productos, lotes, clientes, ventas)
- ⚠️ **NO ejecutar en producción**

---

### 3. **Ver Estado de la Base de Datos**
```bash
node src/database/migrate.js
```
**¿Qué muestra?**
- 📊 Total de tablas creadas
- 🔄 Migraciones ejecutadas
- 📝 Lista de tablas y migraciones

---

### 4. **Ejecutar Solo Seed (Datos de Prueba)**
```bash
npm run seed
```
**¿Qué hace?**
- 🌱 Inserta solo datos de prueba
- ⚠️ Requiere que las migraciones ya estén ejecutadas

---

## 🔄 Flujo de Migraciones

### **Escenario 1: Primera Vez (BD Vacía)**
```
npm run migrate

→ Detecta BD vacía
→ Crea schema inicial (usuarios, negocio, productos, lotes, etc.)
→ Ejecuta migraciones pendientes (add_usuario_id_to_negocio.sql)
→ Registra migraciones en tabla _migrations
✅ Base de datos lista
```

### **Escenario 2: Base de Datos Existente**
```
npm run migrate

→ Detecta BD existente
→ Revisa migraciones pendientes
→ Ejecuta solo las que faltan
→ Registra en tabla _migrations
✅ Base de datos actualizada
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
✅ Sistema listo para probar
```

---

## 📁 Estructura de Migraciones

```
backend/src/database/
├── migrate.js                    ← Sistema de migraciones
├── conexion.js                   ← Conexión a BD
├── migrations/                   ← Carpeta de migraciones
│   ├── create_refresh_tokens.sql        ← Migración 1
│   ├── add_usuario_id_to_negocio.sql    ← Migración 2 (CRÍTICA)
│   └── seed_datos_prueba.sql            ← Datos de prueba
├── schema/
│   └── schema.sql                ← Schema inicial (solo primera vez)
└── README_MIGRACIONES.md         ← Esta documentación
```

---

## 📖 Historial de Migraciones

### ✅ **create_refresh_tokens.sql**
**Fecha:** Inicial  
**Descripción:** Crea tabla para tokens JWT de refresh

**Cambios:**
- Tabla `refresh_tokens` con tracking de sesiones

---

### 🆕 **add_usuario_id_to_negocio.sql** (27/12/2025)
**Estado:** ⚠️ **CRÍTICA**  
**Descripción:** Establece relación Usuario → Negocio para trazabilidad completa

**Cambios:**
- ✅ Agrega columna `usuario_id` a tabla `negocio`
- ✅ Crea foreign key `fk_negocio_usuario`
- ✅ Crea índices de optimización:
  - `idx_negocio_usuario`
  - `idx_productos_negocio`
  - `idx_lotes_producto`
  - `idx_clientes_usuario`
  - `idx_ventas_usuario`
  - `idx_ventas_lote`
  - `idx_ventas_cliente`

**Por qué es importante:**
Esta migración resuelve el problema de trazabilidad detectado. Sin ella:
- ❌ No se puede saber qué negocio pertenece a qué usuario
- ❌ No se puede validar permisos de venta
- ❌ Cualquier usuario podría vender de cualquier negocio

Con ella:
- ✅ Trazabilidad completa: Usuario → Negocio → Producto → Lote → Venta
- ✅ Validación de permisos automática
- ✅ Soporte para múltiples negocios por usuario

---

### 🌱 **seed_datos_prueba.sql** (27/12/2025)
**Estado:** Opcional  
**Descripción:** Inserta datos de prueba realistas

**Contenido:**
- 1 Usuario: Alejandro
- 3 Negocios: Pollos, Conejos, Carnicería
- 8 Productos variados
- 8 Lotes con stock disponible
- 5 Clientes
- 8 Ventas de ejemplo
- Costos y pérdidas

⚠️ **NO ejecutar en producción**

---

## 🛠️ Scripts en package.json

Agrega estos scripts a tu `backend/package.json`:

```json
{
  "scripts": {
    "migrate": "node src/database/migrate.js",
    "migrate:seed": "node src/database/migrate.js --seed",
    "seed": "node src/database/migrate.js --seed",
    "db:status": "node src/database/migrate.js"
  }
}
```

---

## ⚠️ IMPORTANTE: Antes de Ejecutar

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

Si tu base de datos **ya tiene negocios registrados**, debes asignarles un `usuario_id` antes de que la migración haga la columna NOT NULL:

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

## 🔍 Verificar Migración Exitosa

### **Opción 1: Desde terminal**
```bash
# Ver tablas creadas
npm run db:status

# Salida esperada:
# 📊 Estado actual de la base de datos:
#    📋 Total de tablas: 10
#    🔄 Migraciones ejecutadas: 2
```

### **Opción 2: Desde MySQL**
```sql
-- Ver estructura de negocio
DESCRIBE negocio;

-- Debe mostrar la columna usuario_id

-- Ver foreign keys
SHOW CREATE TABLE negocio;

-- Ver índices
SHOW INDEX FROM negocio;

-- Ver migraciones ejecutadas
SELECT * FROM _migrations;
```

### **Opción 3: Verificar trazabilidad completa**
```sql
-- Ver relación completa Usuario → Negocio → Producto → Lote
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

## 🐛 Troubleshooting (Solución de Problemas)

### **Error: "Access denied for user"**
```bash
# Solución: Verifica credenciales en conexion.js
# O ejecuta con usuario correcto:
mysql -u root -p pollosapp < migrations/add_usuario_id_to_negocio.sql
```

### **Error: "Table already exists"**
```bash
# No es un error crítico, la migración detecta esto
# El sistema continúa automáticamente
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

## 📚 Documentación Adicional

### **Ver análisis completo de la base de datos:**
📄 `ANALISIS_BASE_DATOS.md`

Incluye:
- Problemas identificados
- Caso de uso real
- Estructura correcta propuesta
- Flujo de usuario
- Validaciones necesarias

### **Ver schema completo:**
📄 `schema/schema.sql`

### **Ver migraciones:**
📁 `migrations/`

---

## 🎯 Casos de Uso

### **Caso 1: Desarrollador nuevo en el proyecto**
```bash
# 1. Clonar repositorio
git clone https://github.com/alejandroDpAL/pollosapp.git

# 2. Instalar dependencias
cd backend
npm install

# 3. Configurar .env
cp .env.example .env
# Editar credenciales de BD

# 4. Crear BD y ejecutar migraciones
mysql -u root -p
CREATE DATABASE pollosapp;
exit;

npm run migrate:seed

# ✅ Listo para desarrollar
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

# ✅ BD limpia con datos de prueba
```

---

## 💡 Tips y Buenas Prácticas

1. ✅ **Siempre** haz backup antes de migrar
2. ✅ Ejecuta `npm run migrate` después de hacer `git pull`
3. ✅ Usa `--seed` solo en desarrollo/testing
4. ✅ Cada nueva columna/tabla → Nueva migración
5. ✅ Nombra las migraciones con fecha: `YYYY-MM-DD_descripcion.sql`
6. ❌ No modifiques migraciones ya ejecutadas
7. ❌ No ejecutes seed en producción

---

## 📞 Soporte

**¿Problemas con las migraciones?**
1. Revisa logs en consola
2. Verifica conexión a BD
3. Consulta `ANALISIS_BASE_DATOS.md`
4. Revisa troubleshooting arriba

---

**Última actualización:** 27 de Diciembre de 2025  
**Sistema:** Profesional con tracking automático  
**Estado:** ✅ Listo para usar de Base de Datos

## Uso Rápido

### Para tu amigo (o cualquier desarrollador nuevo):

```bash
# 1. Clonar el proyecto
git clone <repo>
cd backend

# 2. Instalar dependencias
npm install

# 3. Configurar .env (copiar de .env.example)
cp src/env/.env.example src/env/.env
# Editar .env con las credenciales de MySQL

# 4. Migrar base de datos (ESTO ES TODO LO QUE NECESITA)
npm run migrate:db
```

## Comandos Disponibles

### Comando Principal

```bash
npm run migrate:db
```
Este comando:
- Lee el archivo `src/database/schema/schema.sql`
- Crea todas las tablas si no existen
- Actualiza la estructura si hay cambios
- Muestra un resumen de lo que se hizo

**Salida esperada:**
```
======================================
  MIGRACION DE BASE DE DATOS
======================================

1. Leyendo schema de base de datos...
   Encontrados 45 statements SQL

2. Tablas actuales en la base de datos:
   (ninguna - base de datos vacía)

3. Aplicando migraciones...

   CREADA: Tabla "negocio"
   CREADA: Tabla "usuarios"
   CREADA: Tabla "productos"
   CREADA: Tabla "lotes"
   CREADA: Tabla "clientes"
   CREADA: Tabla "costos"
   CREADA: Tabla "perdidas"
   CREADA: Tabla "refresh_tokens"
   CREADA: Tabla "reportes_lote"
   CREADA: Tabla "ventas"

4. Verificando estructura final...
   Total de tablas: 10

======================================
  RESUMEN DE MIGRACION
======================================
Tablas creadas:     10
Tablas actualizadas: 0
Errores:            0
======================================

MIGRACION COMPLETADA EXITOSAMENTE
```

### Verificar Estructura

```bash
npm run migrate:verify
```
Verifica que todas las tablas requeridas existan.

**Salida esperada:**
```
======================================
  VERIFICACION DE BASE DE DATOS
======================================

Verificando tablas requeridas:

  ✓ usuarios            OK
  ✓ negocio             OK
  ✓ productos           OK
  ✓ lotes               OK
  ✓ clientes            OK
  ✓ ventas              OK
  ✓ costos              OK
  ✓ perdidas            OK
  ✓ refresh_tokens      OK
  ✓ reportes_lote       OK

======================================
TODAS LAS TABLAS ESTAN CORRECTAS
======================================
```

### Ver Información

```bash
npm run migrate:info
```
Muestra información detallada de la base de datos.

**Salida esperada:**
```
======================================
  INFORMACION DE BASE DE DATOS
======================================

Total de tablas: 10

Tabla: usuarios
  Columnas: 7
  Registros: 5

Tabla: productos
  Columnas: 7
  Registros: 12

...
```

## Estructura del Sistema

```
backend/
├── src/
│   └── database/
│       ├── conexion.js           # Conexión a MySQL
│       ├── migrate.js            # Sistema de migraciones (NUEVO)
│       ├── run-migration.js      # Script legacy (mantener)
│       └── schema/
│           └── schema.sql        # Schema completo (FUENTE DE VERDAD)
```

## Flujo de Trabajo

### Para Desarrolladores

1. **Primera vez:**
   ```bash
   npm run migrate:db
   ```

2. **Actualizar base de datos:**
   - Editar `src/database/schema/schema.sql`
   - Ejecutar `npm run migrate:db`
   - Commit y push

3. **Tu amigo actualiza:**
   ```bash
   git pull
   npm run migrate:db
   ```

### Actualizar el Schema

Cuando hagas cambios en la base de datos:

1. **Exportar schema actualizado:**
   ```bash
   # Desde MySQL Workbench: Forward Engineer
   # O con mysqldump:
   mysqldump -u root -p --no-data pollos > schema_backup.sql
   ```

2. **Actualizar schema.sql:**
   - Copiar cambios a `src/database/schema/schema.sql`
   - Asegurar que tenga `CREATE TABLE IF NOT EXISTS`

3. **Probar:**
   ```bash
   npm run migrate:db
   ```

4. **Commit:**
   ```bash
   git add src/database/schema/schema.sql
   git commit -m "chore(db): update database schema"
   git push
   ```

## Solución de Problemas

### Error: Cannot connect to MySQL

```bash
# Verificar que MySQL esté corriendo
mysql -u root -p

# Verificar .env
cat src/env/.env
```

### Error: Database does not exist

```bash
# Crear la base de datos manualmente
mysql -u root -p
mysql> CREATE DATABASE pollos;
mysql> exit;

# Luego ejecutar migración
npm run migrate:db
```

### Las tablas ya existen

No hay problema. El script detecta tablas existentes y las deja intactas.

## Ventajas de Este Sistema

1. **Simple:** Un solo comando para todo
2. **Seguro:** Usa `CREATE TABLE IF NOT EXISTS`
3. **Automático:** Detecta qué falta y lo crea
4. **Versionado:** El schema.sql está en Git
5. **Verificable:** Comando para verificar estructura

## Archivo Fuente: schema.sql

Este archivo es la **única fuente de verdad** para la estructura de la base de datos.

**Características:**
- Usa `CREATE TABLE IF NOT EXISTS` (no falla si existe)
- Usa `CREATE INDEX IF NOT EXISTS` (no falla si existe)
- Orden correcto de tablas (respeta foreign keys)
- Comentarios explicativos

**Mantener actualizado:**
- Cada vez que cambies la BD, actualiza este archivo
- Haz commit del archivo en Git
- Tu equipo solo ejecuta `npm run migrate:db`
