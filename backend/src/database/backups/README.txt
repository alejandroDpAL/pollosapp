Coloca aquí tu respaldo de base de datos para restaurarlo con el comando:

  npm run db:restore:dump

Requisitos:
- Archivo: pollos_dump.sql (renombra tu backup, por ejemplo desde "pollos (1).sql")
- Depende de variables de entorno: DB_USER, DB_PASSWORD, DB_NAME
- Necesitas tener instalado el cliente mysql en tu PATH

Uso:
1) Copia tu archivo .sql aquí con el nombre pollos_dump.sql
2) Ejecuta: npm run db:restore:dump

Nota: El comando ejecuta mysql -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% < pollos_dump.sql