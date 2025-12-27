import { pool } from './conexion.js';

async function addUltimoLoginColumn() {
    try {
        console.log('Agregando columna ultimo_login a tabla usuarios...');
        
        await pool.query(`
            ALTER TABLE usuarios 
            ADD COLUMN ultimo_login DATETIME NULL DEFAULT NULL
            COMMENT 'Fecha y hora del último login exitoso'
        `);
        
        console.log('✓ Columna agregada exitosamente');
        
        // Actualizar usuarios existentes
        await pool.query(`UPDATE usuarios SET ultimo_login = NOW() WHERE ultimo_login IS NULL`);
        console.log('✓ Usuarios existentes actualizados');
        
        process.exit(0);
    } catch (error) {
        if (error.message.includes('Duplicate column name')) {
            console.log('✓ La columna ya existe');
            process.exit(0);
        } else {
            console.error('✗ Error:', error.message);
            process.exit(1);
        }
    }
}

addUltimoLoginColumn();
