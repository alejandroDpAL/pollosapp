# Comandos de Migración

Sistema de migraciones de base de datos con control automático de versiones.

## Comandos Disponibles

```bash
# Ejecutar migraciones pendientes
npm run migrate

# Ejecutar migraciones + insertar datos de prueba
npm run migrate:seed

# Ver estado de la base de datos
npm run db:status

# Solo insertar datos de prueba
npm run seed
```

## ¿Qué hace cada comando?

### `npm run migrate`
- Detecta si la BD está vacía y crea el schema inicial
- Ejecuta solo las migraciones que faltan
- Registra qué migraciones ya se ejecutaron
- Seguro para ejecutar múltiples veces

### `npm run migrate:seed`
- Hace todo lo de `npm run migrate`
- Además inserta datos de prueba (usuario, negocios, productos, lotes, clientes, ventas)
- **NO usar en producción**

### `npm run db:status`
- Muestra total de tablas creadas
- Lista migraciones ejecutadas
- Estado actual de la base de datos

### `npm run seed`
- Solo inserta datos de prueba
- Requiere que las migraciones ya estén ejecutadas

---

**Documentación completa:** [src/database/README.md](src/database/README.md)
