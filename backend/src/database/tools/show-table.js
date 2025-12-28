import { pool } from '../conexion.js';

async function showTableCreate(table) {
  try {
    const [dbRows] = await pool.query('SELECT DATABASE() AS db');
    console.log(`Base de datos actual: ${dbRows?.[0]?.db}`);
    const [rows] = await pool.query(`SHOW CREATE TABLE \`${table}\``);
    const createSql = rows?.[0]?.['Create Table'] || rows?.[0]?.CreateTable || JSON.stringify(rows[0]);
    console.log(`\n===== SHOW CREATE TABLE ${table} =====\n`);
    console.log(createSql);
    console.log('\n=====================================\n');
  } catch (err) {
    console.error(`Error mostrando estructura de ${table}:`, err.message);
  } finally {
    pool.end();
  }
}

const table = process.argv[2] || 'negocio';
showTableCreate(table);
