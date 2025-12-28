import { pool } from '../conexion.js';

async function run() {
  try {
    const [dbRows] = await pool.query('SELECT DATABASE() AS db');
    console.log(`DB: ${dbRows?.[0]?.db}`);

    console.log('Intentando agregar columna usuario_id...');
    await pool.query('ALTER TABLE negocio ADD COLUMN usuario_id INT NULL AFTER id');
    console.log('Columna agregada.');

    console.log('Intentando agregar FK fk_negocio_usuario...');
    await pool.query('ALTER TABLE negocio ADD CONSTRAINT fk_negocio_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE');
    console.log('FK agregada.');

    console.log('Intentando crear índice idx_negocio_usuario...');
    await pool.query('CREATE INDEX idx_negocio_usuario ON negocio(usuario_id)');
    console.log('Índice creado.');
  } catch (err) {
    console.error('Error en alter:', err.message);
  } finally {
    pool.end();
  }
}

run();
