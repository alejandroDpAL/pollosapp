import { pool } from '../conexion.js';

async function run() {
  const usuarioId = parseInt(process.argv[2], 10);
  if (!usuarioId) {
    console.error('Uso: node src/database/tools/assign-negocio-user.js <usuario_id>');
    process.exit(1);
  }
  try {
    const [dbRows] = await pool.query('SELECT DATABASE() AS db');
    console.log(`DB: ${dbRows?.[0]?.db}`);

    const [r1] = await pool.query('SELECT COUNT(*) AS cnt FROM negocio WHERE usuario_id IS NULL');
    console.log(`Negocios sin usuario_id: ${r1[0].cnt}`);

    const [upd] = await pool.query('UPDATE negocio SET usuario_id = ? WHERE usuario_id IS NULL', [usuarioId]);
    console.log(`Actualizados: ${upd.affectedRows}`);

    const [r2] = await pool.query('SELECT COUNT(*) AS cnt FROM negocio WHERE usuario_id IS NULL');
    console.log(`Pendientes: ${r2[0].cnt}`);
  } catch (err) {
    console.error('Error asignando usuario_id a negocio:', err.message);
  } finally {
    pool.end();
  }
}

run();
