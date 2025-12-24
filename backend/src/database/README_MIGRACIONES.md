# Sistema de Migraciones de Base de Datos

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
