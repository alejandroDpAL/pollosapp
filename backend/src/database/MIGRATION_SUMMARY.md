📋 RESUMEN DE LA MIGRACIÓN - cargo ENUM
=====================================

✅ ESTADO: COMPLETADO Y REGISTRADO

Migración:
  • Nombre: 20260116_change_cargo_to_enum
  • ID en BD: 10
  • Ejecutada: 2026-01-17 03:41:03

Base de Datos:
  • Campo: usuarios.cargo
  • Tipo: ENUM('boss','admin','employee')
  • NULL: SÍ (permitido)
  • Usuarios actuales: 2 (con cargo = NULL)

Archivos Creados:
  ✅ /src/database/migrations/20260116_change_cargo_to_enum.up.sql
  ✅ /src/database/migrations/20260116_change_cargo_to_enum.down.sql

Backup de Seguridad:
  ✅ usuarios_backup_20260116 (tabla de respaldo)

COMANDOS DISPONIBLES:
=====================

1. Revertir la migración (si algo falla):
   $ npm run migrate:rollback

2. Eliminar el backup cuando estés seguro:
   $ mysql -u usuario -p -e "DROP TABLE usuarios_backup_20260116;"

3. Ver historial de migraciones:
   $ npm run migrate:status

VALORES ACEPTADOS EN cargo:
============================
  • 'boss'
  • 'admin'
  • 'employee'
  • NULL

PRÓXIMOS PASOS:
================
1. ✓ Reinicia el servidor backend (npm start)
2. ✓ Prueba los endpoints de usuarios
3. ✓ Cuando todo funcione, elimina el backup
4. ✓ Haz commit del cambio a Git
