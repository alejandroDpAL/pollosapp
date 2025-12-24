// Script para ejecutar la migración de refresh_tokens
import { pool } from './conexion.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
    try {
        console.log('📦 Ejecutando migración de refresh_tokens...');

        // Leer el archivo SQL
        const sqlFile = join(__dirname, 'migrations', 'create_refresh_tokens.sql');
        const sql = readFileSync(sqlFile, 'utf8');

        // Ejecutar el SQL
        await pool.query(sql);

        console.log('✅ Migración completada exitosamente');
        console.log('📊 Tabla refresh_tokens creada');

        // Verificar que la tabla existe
        const [tables] = await pool.query(
            "SHOW TABLES LIKE 'refresh_tokens'"
        );

        if (tables.length > 0) {
            console.log('✓ Verificado: Tabla refresh_tokens existe');
            
            // Mostrar estructura
            const [columns] = await pool.query(
                "DESCRIBE refresh_tokens"
            );
            console.log('\n📋 Estructura de la tabla:');
            columns.forEach(col => {
                console.log(`  - ${col.Field}: ${col.Type}`);
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error ejecutando migración:', error.message);
        
        // Si la tabla ya existe, no es un error crítico
        if (error.message.includes('already exists')) {
            console.log('ℹ️  La tabla ya existe, continuando...');
            process.exit(0);
        }
        
        process.exit(1);
    }
}

runMigration();
