# GUIA RAPIDA - MIGRACIONES DE BASE DE DATOS

```bash
# 1. Clonar e instalar
git clone <repo>
cd backend
npm install

# 2. Configurar .env (copiar y editar)
cp src/env/.env.example src/env/.env
# Editar con tus credenciales de MySQL

# 3. MIGRAR BASE DE DATOS (LISTO!)
npm run migrate:db
```

## Salida Esperada

```
======================================
  MIGRACION DE BASE DE DATOS
======================================

1. Leyendo schema de base de datos...
   Encontrados X statements SQL

2. Tablas actuales en la base de datos...

3. Aplicando migraciones...
   CREADA: Tabla "usuarios"
   CREADA: Tabla "productos"
   ...

======================================
  RESUMEN DE MIGRACION
======================================
Tablas creadas:     10
Errores:            0
======================================

MIGRACION COMPLETADA EXITOSAMENTE
```

## Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run migrate:db` | Migra/actualiza la base de datos |
| `npm run migrate:verify` | Verifica que todas las tablas existan |
| `npm run migrate:info` | Muestra info de tablas y registros |

## Flujo de Trabajo

### Cuando TU cambies la base de datos:

1. Exporta el schema desde MySQL:
   ```bash
   # Desde MySQL Workbench o comando:
   mysqldump -u root -p --no-data pollos > backup.sql
   ```

2. Actualiza [schema.sql](src/database/schema/schema.sql)

3. Prueba localmente:
   ```bash
   npm run migrate:db
   npm run migrate:verify
   ```

4. Commit y push:
   ```bash
   git add src/database/schema/schema.sql
   git commit -m "chore(db): update database schema"
   git push
   ```

### Actualizar:

```bash
git pull
npm run migrate:db
```

Eso es todo!

## Ventajas

- Un solo comando
- Detecta automáticamente qué falta
- No falla si las tablas ya existen
- Schema.sql versionado en Git
- Siempre sincronizado con el equipo

## Solución de Problemas

### No se conecta a MySQL
```bash
mysql -u root -p
# Verificar que MySQL esté corriendo
```

### No existe la base de datos
```bash
mysql -u root -p
mysql> CREATE DATABASE pollos;
npm run migrate:db
```

### Verificar conexión
```bash
npm run migrate:info
# Muestra info si conecta correctamente
```
