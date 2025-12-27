import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createConnection } from 'mysql2/promise';

// Cargar .env desde src/env/.env
dotenv.config({ path: path.resolve('src/env/.env') });

// Usar DB_DATABASE por defecto (coincide con conexion.js) y aceptar DB_NAME si existiera
const DB_NAME = process.env.DB_DATABASE || process.env.DB_NAME || 'pollos';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_HOST = process.env.DB_HOST || 'localhost';
// Permitir sobreescribir la ruta del dump por CLI o env
const argPath = process.argv[2];
const envPath = process.env.DB_DUMP_PATH;
const DUMP_PATH = path.resolve(argPath || envPath || 'src/database/backups/pollos_dump.sql');

function run(cmd) {
  execSync(cmd, { stdio: 'inherit' });
}

function hasMysqlCli() {
  try {
    const out = execSync('mysql --version', { stdio: 'pipe' }).toString();
    return /mysql/i.test(out);
  } catch {
    return false;
  }
}

function splitSqlStatements(sql) {
  return sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
}

async function main() {
  console.log(`Usando dump: ${DUMP_PATH}`);

  if (!existsSync(DUMP_PATH)) {
    console.error(`No se encontró el dump en: ${DUMP_PATH}\n` +
      `Opciones:\n` +
      `  1) Copia tu archivo a src/database/backups/ y renómbralo a pollos_dump.sql\n` +
      `  2) Pasa la ruta completa: npm run db:rollback -- "C:\\ruta\\mi_dump.sql"\n` +
      `  3) Usa env DB_DUMP_PATH con la ruta al archivo`);
    process.exit(1);
  }

  console.log('Restaurando base de datos desde dump...');

  if (hasMysqlCli()) {
    // Vía CLI
    const dropCreate = `mysql -h ${DB_HOST} -u ${DB_USER} -p${DB_PASSWORD} -e "DROP DATABASE IF EXISTS ${DB_NAME}; CREATE DATABASE ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"`;
    run(dropCreate);
    const importCmd = `mysql -h ${DB_HOST} -u ${DB_USER} -p${DB_PASSWORD} ${DB_NAME} < "${DUMP_PATH}"`;
    run(importCmd);
    console.log('Base restaurada con éxito (CLI).');
  } else {
    // Fallback con mysql2/promise
    console.log('mysql CLI no encontrado. Usando método alternativo (mysql2).');

    const conn = await createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      multipleStatements: true
    });
    await conn.query(`DROP DATABASE IF EXISTS \`${DB_NAME}\``);
    await conn.query(`CREATE DATABASE \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci`);
    await conn.end();

    const dbConn = await createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      multipleStatements: true
    });

    const dumpSql = readFileSync(DUMP_PATH, 'utf8');
    try {
      // Intento 1: ejecutar el dump completo de una vez
      await dbConn.query(dumpSql);
      console.log('Base restaurada con éxito (mysql2, bulk).');
    } catch (bulkErr) {
      console.log('Fallo ejecución bulk, intentando por statements...', bulkErr.message);
      const statements = splitSqlStatements(dumpSql);
      let executed = 0;
      for (const stmt of statements) {
        if (/^LOCK TABLES/i.test(stmt) || /^UNLOCK TABLES/i.test(stmt)) continue;
        try {
          await dbConn.query(stmt);
          executed++;
          if (executed % 100 === 0) console.log(`   Ejecutados: ${executed}`);
        } catch (err) {
          console.error(`   Error ejecutando statement: ${err.message}`);
          throw err;
        }
      }
      console.log(`Base restaurada con éxito (mysql2). Statements: ${executed}`);
    } finally {
      await dbConn.end();
    }
  }
}

main();
