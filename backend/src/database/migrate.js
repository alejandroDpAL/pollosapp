import { pool } from './conexion.js';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class DatabaseMigrator {
    constructor() {
        this.schemaPath = join(__dirname, './schema/schema.sql');
        this.migrationsPath = join(__dirname, './migrations');
    }

    /**
     * Crea la tabla de control de migraciones
     */
    async createMigrationsTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS _migrations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(255) NOT NULL UNIQUE,
                ejecutado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_nombre (nombre)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `;
        
        await pool.query(sql);
    }

    /**
     * Obtiene las migraciones ya ejecutadas
     */
    async getExecutedMigrations() {
        try {
            const [rows] = await pool.query('SELECT nombre FROM _migrations ORDER BY id');
            return rows.map(r => r.nombre);
        } catch (error) {
            return [];
        }
    }

    /**
     * Marca una migración como ejecutada
     */
    async markMigrationAsExecuted(migrationName) {
        await pool.query('INSERT INTO _migrations (nombre) VALUES (?)', [migrationName]);
    }

    /**
     * Obtiene todas las tablas actuales
     */
    async getCurrentTables() {
        try {
            const [tables] = await pool.query('SHOW TABLES');
            return tables.map(t => Object.values(t)[0]);
        } catch (error) {
            console.error('❌ Error obteniendo tablas:', error.message);
            return [];
        }
    }

    /**
     * Verifica si existe la base de datos
     */
    async databaseExists() {
        const tables = await this.getCurrentTables();
        return tables.length > 0;
    }

    /**
     * Crea el schema inicial de la base de datos
     */
    async createInitialSchema() {
        console.log('\n📦 Creando schema inicial de la base de datos...');
        
        if (!existsSync(this.schemaPath)) {
            throw new Error(`❌ No se encontró el archivo schema: ${this.schemaPath}`);
        }

        const schema = readFileSync(this.schemaPath, 'utf8');
        
        // Dividir en statements individuales
        const statements = schema
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        console.log(`   📄 Encontrados ${statements.length} statements SQL`);

        let executed = 0;
        let errors = 0;

        for (const statement of statements) {
            try {
                await pool.query(statement);
                executed++;
                process.stdout.write(`\r   ✓ Ejecutados: ${executed}/${statements.length}`);
            } catch (error) {
                if (!error.message.includes('already exists')) {
                    errors++;
                    console.error(`\n   ❌ Error: ${error.message}`);
                }
            }
        }

        console.log(`\n   ✅ Schema inicial creado: ${executed} statements ejecutados`);
        if (errors > 0) {
            console.log(`   ⚠️  Errores: ${errors}`);
        }
    }

    /**
     * Ejecuta las migraciones pendientes
     */
    async runPendingMigrations() {
        console.log('\n🔄 Verificando migraciones pendientes...');

        // Crear tabla de control si no existe
        await this.createMigrationsTable();

        // Obtener migraciones ya ejecutadas
        const executedMigrations = await this.getExecutedMigrations();
        console.log(`   📋 Migraciones ejecutadas: ${executedMigrations.length}`);

        // Obtener archivos de migración disponibles
        if (!existsSync(this.migrationsPath)) {
            console.log('   ⚠️  No existe carpeta de migraciones');
            return;
        }

        const migrationFiles = readdirSync(this.migrationsPath)
            .filter(f => f.endsWith('.sql'))
            .filter(f => !f.startsWith('seed_'))  // Excluir seeds por defecto
            .sort();

        console.log(`   📁 Archivos de migración encontrados: ${migrationFiles.length}`);

        // Filtrar migraciones pendientes
        const pendingMigrations = migrationFiles.filter(
            file => !executedMigrations.includes(file)
        );

        if (pendingMigrations.length === 0) {
            console.log('   ✅ No hay migraciones pendientes');
            return;
        }

        console.log(`\n⚡ Ejecutando ${pendingMigrations.length} migración(es) pendiente(s):\n`);

        // Ejecutar cada migración pendiente
        for (const migrationFile of pendingMigrations) {
            console.log(`   📝 ${migrationFile}`);
            
            try {
                const migrationPath = join(this.migrationsPath, migrationFile);
                const sql = readFileSync(migrationPath, 'utf8');

                // Ejecutar SQL
                const statements = sql
                    .split(';')
                    .map(s => s.trim())
                    .filter(s => s.length > 0 && !s.startsWith('--'));

                for (const statement of statements) {
                    try {
                        await pool.query(statement);
                    } catch (error) {
                        // Ignorar errores de "ya existe" en migraciones
                        if (!error.message.includes('already exists') && 
                            !error.message.includes('Duplicate')) {
                            throw error;
                        }
                    }
                }

                // Marcar como ejecutada
                await this.markMigrationAsExecuted(migrationFile);
                console.log(`      ✅ Ejecutada correctamente`);

            } catch (error) {
                console.error(`      ❌ Error: ${error.message}`);
                throw error;
            }
        }

        console.log(`\n   🎉 Todas las migraciones ejecutadas correctamente`);
    }

    /**
     * Ejecuta el seed de datos de prueba
     */
    async runSeed() {
        console.log('\n🌱 Ejecutando seed de datos de prueba...');

        const seedFile = join(this.migrationsPath, 'seed_datos_prueba.sql');
        
        if (!existsSync(seedFile)) {
            console.log('   ⚠️  No se encontró archivo de seed');
            return;
        }

        try {
            const sql = readFileSync(seedFile, 'utf8');
            
            // Ejecutar SQL
            const statements = sql
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0 && !s.startsWith('--'));

            for (const statement of statements) {
                try {
                    await pool.query(statement);
                } catch (error) {
                    if (!error.message.includes('Duplicate')) {
                        console.error(`   ❌ Error en statement: ${error.message}`);
                    }
                }
            }

            console.log('   ✅ Datos de prueba insertados correctamente');

        } catch (error) {
            console.error(`   ❌ Error ejecutando seed: ${error.message}`);
        }
    }

    /**
     * Muestra el estado actual de la base de datos
     */
    async showStatus() {
        console.log('\n📊 Estado actual de la base de datos:\n');

        const tables = await this.getCurrentTables();
        console.log(`   📋 Total de tablas: ${tables.length}`);
        
        if (tables.length > 0) {
            console.log(`   📝 Tablas: ${tables.join(', ')}`);
        }

        const executedMigrations = await this.getExecutedMigrations();
        console.log(`\n   🔄 Migraciones ejecutadas: ${executedMigrations.length}`);
        
        if (executedMigrations.length > 0) {
            executedMigrations.forEach(m => console.log(`      - ${m}`));
        }
    }

    /**
     * Proceso principal de migración
     */
    async migrate(options = {}) {
        console.log('\n========================================');
        console.log('   🚀 SISTEMA DE MIGRACIONES');
        console.log('========================================');

        try {
            // Verificar si existe la base de datos
            const dbExists = await this.databaseExists();

            if (!dbExists) {
                console.log('\n⚠️  Base de datos vacía detectada');
                await this.createInitialSchema();
            } else {
                console.log('\n✅ Base de datos existente detectada');
            }

            // Ejecutar migraciones pendientes
            await this.runPendingMigrations();

            // Ejecutar seed si se solicita
            if (options.seed) {
                await this.runSeed();
            }

            // Mostrar estado final
            await this.showStatus();

            console.log('\n========================================');
            console.log('   ✅ MIGRACION COMPLETADA');
            console.log('========================================\n');

            return true;

        } catch (error) {
            console.error('\n========================================');
            console.error('   ❌ ERROR EN MIGRACION');
            console.error('========================================');
            console.error(`\n${error.message}\n`);
            throw error;
        }
    }
}

// Ejecutar migraciones si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    const migrator = new DatabaseMigrator();
    
    const args = process.argv.slice(2);
    const options = {
        seed: args.includes('--seed') || args.includes('-s')
    };

    migrator.migrate(options)
        .then(() => {
            process.exit(0);
        })
        .catch((error) => {
            console.error('Error fatal:', error);
            process.exit(1);
        })
        .finally(() => {
            pool.end();
        });
}

export default DatabaseMigrator;
                console.log('   (ninguna - base de datos vacía)');
            } else {
                currentTables.forEach(t => console.log(`   - ${t}`));
            }
            console.log('');

            // Ejecutar cada statement
            console.log('3. Aplicando migraciones...\n');
            let created = 0;
            let updated = 0;
            let errors = 0;

            for (const statement of statements) {
                try {
                    // Detectar tipo de statement
                    const isCreateTable = statement.toUpperCase().includes('CREATE TABLE');
                    const isCreateIndex = statement.toUpperCase().includes('CREATE INDEX');
                    
                    if (isCreateTable) {
                        const match = statement.match(/CREATE TABLE (?:IF NOT EXISTS )?(\w+)/i);
                        if (match) {
                            const tableName = match[1];
                            const existed = await this.tableExists(tableName);
                            
                            await pool.query(statement);
                            
                            if (!existed) {
                                console.log(`   CREADA: Tabla "${tableName}"`);
                                created++;
                            } else {
                                console.log(`   OK: Tabla "${tableName}" ya existe`);
                            }
                        }
                    } else if (isCreateIndex) {
                        // Ejecutar índices silenciosamente 
                        try {
                            await pool.query(statement);
                        } catch (err) {
                            // Ignorar errores de índices duplicados
                            if (!err.message.includes('Duplicate key name')) {
                                throw err;
                            }
                        }
                    } else {
                        await pool.query(statement);
                    }
                } catch (error) {
                    if (error.message.includes('already exists')) {
                        // Ignorar errores de elementos que ya existen
                        continue;
                    }
                    console.error(`   ERROR: ${error.message}`);
                    errors++;
                }
            }

            console.log('\n4. Verificando estructura final...');
            const finalTables = await this.getCurrentTables();
            console.log(`   Total de tablas: ${finalTables.length}\n`);

            // Mostrar resumen
            console.log('======================================');
            console.log('  RESUMEN DE MIGRACION');
            console.log('======================================');
            console.log(`Tablas creadas:     ${created}`);
            console.log(`Tablas actualizadas: ${updated}`);
            console.log(`Errores:            ${errors}`);
            console.log('======================================\n');

            if (errors === 0) {
                console.log('MIGRACION COMPLETADA EXITOSAMENTE\n');
            } else {
                console.log('MIGRACION COMPLETADA CON ADVERTENCIAS\n');
            }

            // Mostrar tablas finales
            console.log('Estructura actual de la base de datos:');
            finalTables.forEach(t => console.log(`  - ${t}`));
            console.log('');

            return true;
        } catch (error) {
            console.error('\nERROR CRITICO EN MIGRACION:', error.message);
            return false;
        }
    }

    async verifyDatabase() {
        console.log('======================================');
        console.log('  VERIFICACION DE BASE DE DATOS');
        console.log('======================================\n');

        const requiredTables = [
            'usuarios',
            'negocio',
            'productos',
            'lotes',
            'clientes',
            'ventas',
            'costos',
            'perdidas',
            'refresh_tokens',
            'reportes_lote'
        ];

        console.log('Verificando tablas requeridas:\n');

        let allExists = true;
        for (const table of requiredTables) {
            const exists = await this.tableExists(table);
            const status = exists ? 'OK' : 'FALTA';
            const symbol = exists ? '✓' : '✗';
            console.log(`  ${symbol} ${table.padEnd(20)} ${status}`);
            
            if (!exists) allExists = false;
        }

        console.log('\n======================================');
        if (allExists) {
            console.log('TODAS LAS TABLAS ESTAN CORRECTAS');
        } else {
            console.log('FALTAN ALGUNAS TABLAS - EJECUTA LA MIGRACION');
        }
        console.log('======================================\n');

        return allExists;
    }

    async getTableInfo(tableName) {
        try {
            const [columns] = await pool.query(`DESCRIBE ${tableName}`);
            return columns;
        } catch (error) {
            return [];
        }
    }

    async showDatabaseInfo() {
        console.log('======================================');
        console.log('  INFORMACION DE BASE DE DATOS');
        console.log('======================================\n');

        const tables = await this.getCurrentTables();
        
        console.log(`Total de tablas: ${tables.length}\n`);

        for (const table of tables) {
            const columns = await this.getTableInfo(table);
            console.log(`Tabla: ${table}`);
            console.log(`  Columnas: ${columns.length}`);
            
            const [count] = await pool.query(`SELECT COUNT(*) as total FROM ${table}`);
            console.log(`  Registros: ${count[0].total}`);
            console.log('');
        }
    }
}

// Función principal
async function main() {
    const migrator = new DatabaseMigrator();
    const command = process.argv[2] || 'migrate';

    try {
        switch (command) {
            case 'migrate':
                const success = await migrator.runMigration();
                process.exit(success ? 0 : 1);
                break;

            case 'verify':
                const valid = await migrator.verifyDatabase();
                process.exit(valid ? 0 : 1);
                break;

            case 'info':
                await migrator.showDatabaseInfo();
                process.exit(0);
                break;

            default:
                console.log('Comandos disponibles:');
                console.log('  npm run migrate:db          - Migrar base de datos');
                console.log('  npm run migrate:verify      - Verificar estructura');
                console.log('  npm run migrate:info        - Mostrar información');
                process.exit(1);
        }
    } catch (error) {
        console.error('Error fatal:', error);
        process.exit(1);
    }
}

main();
