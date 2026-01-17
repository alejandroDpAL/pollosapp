import { pool } from './conexion.js';

async function testSQL() {
  try {
    console.log(' Testeando SQL para modificar columna cargo...\n');
    
    // Primero, mostrar estructura actual
    console.log(' Estructura actual de la tabla usuarios:');
    const [columns] = await pool.query(`DESCRIBE usuarios`);
    const cargoColumn = columns.find(col => col.Field === 'cargo');
    console.log('Campo cargo actual:', cargoColumn);
    console.log('');
    
    // Mostrar valores actuales en la columna cargo
    console.log('📊 Valores actuales en la columna cargo:');
    const [values] = await pool.query(`
      SELECT cargo, COUNT(*) as cantidad 
      FROM usuarios 
      GROUP BY cargo
    `);
    console.log(values);
    console.log('');
    
    // Step 1: Limpiar valores inválidos
    console.log('🔧 Step 1: Limpiando valores vacíos...');
    await pool.query(`UPDATE usuarios SET cargo = NULL WHERE cargo = '' OR cargo IS NULL`);
    console.log('✅ Valores vacíos convertidos a NULL\n');
    
    // Step 2: Testear el SQL
    console.log('🔧 Step 2: Ejecutando ALTER TABLE...');
    await pool.query(`
      ALTER TABLE usuarios
      MODIFY cargo ENUM ('boss', 'admin', 'employee') NULL
    `);
    console.log('✅ Alteración ejecutada exitosamente\n');
    
    // Verificar cambio
    console.log('📋 Nueva estructura de la tabla usuarios:');
    const [newColumns] = await pool.query(`DESCRIBE usuarios`);
    const newCargoColumn = newColumns.find(col => col.Field === 'cargo');
    console.log('Campo cargo después:', newCargoColumn);
    console.log('');
    
    // Mostrar datos nuevamente
    console.log('📊 Valores finales en la columna cargo:');
    const [finalValues] = await pool.query(`
      SELECT cargo, COUNT(*) as cantidad 
      FROM usuarios 
      GROUP BY cargo
    `);
    console.log(finalValues);
    console.log('');
    
    console.log('✨ Test completado con éxito');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante el test:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
}

testSQL();
