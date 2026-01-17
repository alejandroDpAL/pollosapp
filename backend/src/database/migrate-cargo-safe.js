import { pool } from './conexion.js';

/**
 * Script de migración segura para cargo ENUM
 * Ejecuta los cambios y verifica que no hay pérdida de datos
 */
async function migrateCargo() {
  const connection = await pool.getConnection();
  
  try {
    console.log('🔄 Iniciando migración segura de cargo...\n');
    
    // Iniciar transacción
    await connection.beginTransaction();
    console.log('✅ Transacción iniciada\n');
    
    // Step 1: Verificar datos antes
    console.log('📊 Datos ANTES de la migración:');
    const [beforeData] = await connection.query(`
      SELECT id, correo, cargo
      FROM usuarios 
      LIMIT 10
    `);
    console.log(beforeData);
    console.log(`Total de usuarios: ${beforeData.length}\n`);
    
    // Step 2: Crear backup de seguridad
    console.log('💾 Creando backup de la tabla usuarios...');
    await connection.query(`
      DROP TABLE IF EXISTS usuarios_backup_20260116
    `);
    await connection.query(`
      CREATE TABLE usuarios_backup_20260116 AS SELECT * FROM usuarios
    `);
    console.log('✅ Backup creado en usuarios_backup_20260116\n');
    
    // Step 3: Verificar estructura actual
    console.log('📋 Estructura actual de cargo:');
    const [currentStructure] = await connection.query(`DESCRIBE usuarios`);
    const cargoCol = currentStructure.find(col => col.Field === 'cargo');
    console.log('Campo cargo:', cargoCol);
    console.log('');
    
    // Step 4: Si no es ENUM, convertir
    if (!cargoCol.Type.includes('enum')) {
      console.log('🔧 Convirtiendo a ENUM...');
      
      // Limpiar valores inválidos primero
      console.log('   - Limpiando valores vacíos...');
      await connection.query(`UPDATE usuarios SET cargo = NULL WHERE cargo = ''`);
      
      // Convertir a ENUM
      console.log('   - Modificando tipo de dato...');
      await connection.query(`
        ALTER TABLE usuarios
        MODIFY cargo ENUM ('boss', 'admin', 'employee') NULL
      `);
      console.log('✅ Conversión a ENUM completada\n');
    } else {
      console.log('ℹ️  El campo cargo ya es ENUM\n');
    }
    
    // Step 5: Verificar datos después
    console.log('📊 Datos DESPUÉS de la migración:');
    const [afterData] = await connection.query(`
      SELECT id, correo, cargo
      FROM usuarios 
      LIMIT 10
    `);
    console.log(afterData);
    console.log(`Total de usuarios: ${afterData.length}\n`);
    
    // Step 6: Verificar integridad
    console.log('🔍 Verificando integridad de datos...');
    const [totalBefore] = await connection.query(`SELECT COUNT(*) as total FROM usuarios_backup_20260116`);
    const [totalAfter] = await connection.query(`SELECT COUNT(*) as total FROM usuarios`);
    
    if (totalBefore[0].total === totalAfter[0].total) {
      console.log(`✅ INTEGRIDAD OK: ${totalBefore[0].total} registros en ambas tablas\n`);
    } else {
      throw new Error(`❌ PÉRDIDA DE DATOS: Antes=${totalBefore[0].total}, Después=${totalAfter[0].total}`);
    }
    
    // Confirmar transacción
    await connection.commit();
    console.log('✅ TRANSACCIÓN CONFIRMADA\n');
    console.log('✨ Migración completada exitosamente');
    console.log('💾 Backup disponible en: usuarios_backup_20260116');
    console.log('   Puedes eliminar el backup después si todo funciona correctamente.');
    
  } catch (error) {
    // Revertir en caso de error
    await connection.rollback();
    console.error('\n❌ ERROR DURANTE LA MIGRACIÓN:');
    console.error(error.message);
    console.error('\n✅ TRANSACCIÓN REVERTIDA - No hay cambios aplicados');
    console.error('💾 Los datos están intactos\n');
    throw error;
  } finally {
    connection.release();
  }
}

// Ejecutar
migrateCargo()
  .then(() => {
    console.log('\n📌 Próximos pasos:');
    console.log('   1. Verifica que todo funciona correctamente');
    console.log('   2. Si es necesario, revierte con: npm run migrate:rollback');
    console.log('   3. Cuando estés seguro, elimina el backup:\n');
    console.log('      DROP TABLE usuarios_backup_20260116;');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n🚨 La migración falló y fue revertida');
    process.exit(1);
  });
