import { pool } from './conexion.js';

async function registerMigration() {
  try {
    console.log('🔍 Verificando estado de la migración cargo...\n');
    
    // Verificar si ya está registrada
    const [existing] = await pool.query(
      'SELECT * FROM _migrations WHERE nombre = ?',
      ['20260116_change_cargo_to_enum.up.sql']
    );
    
    if (existing.length > 0) {
      console.log('✅ La migración YA está registrada:');
      console.log(existing[0]);
      console.log('\nNo es necesario hacer nada más.');
      process.exit(0);
    }
    
    // Registrar la migración
    console.log('📝 Registrando la migración en _migrations...');
    await pool.query(
      'INSERT INTO _migrations (nombre) VALUES (?)',
      ['20260116_change_cargo_to_enum.up.sql']
    );
    
    console.log('✅ Migración registrada exitosamente\n');
    
    // Mostrar todas las migraciones
    console.log('📋 Historial de migraciones:');
    const [all] = await pool.query('SELECT * FROM _migrations ORDER BY id DESC LIMIT 10');
    console.table(all);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

registerMigration();
