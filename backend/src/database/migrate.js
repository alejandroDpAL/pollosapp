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
        this.direction = 'up';
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

    async unmarkMigration(migrationName) {
        await pool.query('DELETE FROM _migrations WHERE nombre = ?', [migrationName]);
    }

    /**
     * Obtiene todas las tablas actuales
     */
    async getCurrentTables() {
        try {
            const [tables] = await pool.query('SHOW TABLES');
            return tables.map(t => Object.values(t)[0]);
        } catch (error) {
            console.error('Error obteniendo tablas:', error.message);
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
        console.log('\nCreando schema inicial de la base de datos...');
        
        if (!existsSync(this.schemaPath)) {
            throw new Error(`No se encontró el archivo schema: ${this.schemaPath}`);
        }

        const schema = readFileSync(this.schemaPath, 'utf8');
        
        // Dividir en statements individuales
        const statements = schema
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        console.log(`   Encontrados ${statements.length} statements SQL`);

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
                    console.error(`\n   Error: ${error.message}`);
                }
            }
        }

        console.log(`\n   Schema inicial creado: ${executed} statements ejecutados`);
        if (errors > 0) {
            console.log(`   Errores: ${errors}`);
        }
    }

    /**
     * Ejecuta las migraciones pendientes
     */
    async runPendingMigrations() {
        console.log('\nVerificando migraciones pendientes...');

        // Crear tabla de control si no existe
        await this.createMigrationsTable();

        // Obtener migraciones ya ejecutadas
        const executedMigrations = await this.getExecutedMigrations();
        console.log(`   Migraciones ejecutadas: ${executedMigrations.length}`);

        // Obtener archivos de migración disponibles
        if (!existsSync(this.migrationsPath)) {
            console.log('   WARNING: No existe carpeta de migraciones');
            return;
        }

        const migrationFiles = readdirSync(this.migrationsPath)
            .filter(f => f.endsWith('.up.sql'))
            .sort();

        console.log(`   Archivos de migración encontrados: ${migrationFiles.length}`);

        // Filtrar migraciones pendientes
        const pendingMigrations = migrationFiles.filter(
            file => !executedMigrations.includes(file)
        );

        if (pendingMigrations.length === 0) {
            console.log('   No hay migraciones pendientes');
            return;
        }

        console.log(`\nEjecutando ${pendingMigrations.length} migración(es) pendiente(s):\n`);

        // Ejecutar cada migración pendiente
        for (const migrationFile of pendingMigrations) {
            console.log(`   ${migrationFile}`);
            
            try {
                const migrationPath = join(this.migrationsPath, migrationFile);
                const sql = readFileSync(migrationPath, 'utf8');

                // Limpiar comentarios SQL (líneas que comienzan con --) antes de procesar
                const cleanSql = sql
                    .split('\n')
                    .filter(line => !line.trim().startsWith('--'))
                    .join('\n');

                // Dividir en statements por punto y coma
                const statements = cleanSql
                    .split(';')
                    .map(s => s.trim())
                    .filter(s => s.length > 0);

                for (const statement of statements) {
                    try {
                        await pool.query(statement);
                    } catch (error) {
                        // Ignorar errores idempotentes en migraciones UP
                        const msg = (error && error.message) ? error.message : '';
                        const code = error && error.code ? error.code : '';
                        const ignorable = (
                            msg.includes('already exists') ||
                            msg.includes('Duplicate') ||
                            msg.includes('Duplicate entry') ||
                            code === 'ER_DUP_FIELDNAME' ||
                            code === 'ER_DUP_KEYNAME'
                        );
                        if (ignorable) {
                            console.log(`      WARNING (continuing): ${msg}`);
                            continue;
                        }
                        throw error;
                    }
                }

                // Marcar como ejecutada
                await this.markMigrationAsExecuted(migrationFile);
                console.log(`      Ejecutada correctamente`);

            } catch (error) {
                console.error(`      Error: ${error.message}`);
                throw error;
            }
        }

        console.log(`\n   Todas las migraciones ejecutadas correctamente`);
    }

    async runRollback(options = {}) {
        console.log('\nEjecutando rollback de migraciones...');

        await this.createMigrationsTable();
        const executed = await this.getExecutedMigrations();
        if (executed.length === 0) {
            console.log('   No hay migraciones para revertir');
            return;
        }

        // Determinar cuántas revertir
        let toRevert = executed.slice();
        if (options.steps && Number(options.steps) > 0) {
            toRevert = executed.slice(-Number(options.steps));
        } else if (options.to) {
            const idx = executed.indexOf(options.to);
            if (idx === -1) {
                console.log(`   WARNING: La migración destino no está aplicada: ${options.to}`);
                return;
            }
            // Revertir todo desde el final hasta llegar a 'to' (inclusive)
            toRevert = executed.slice(idx).reverse();
        } else {
            // Por defecto, revertir la última
            toRevert = executed.slice(-1);
        }

        // Ejecutar .down.sql por cada migración en orden inverso
        for (const appliedName of toRevert.reverse()) {
            let downFile = appliedName.endsWith('.up.sql')
                ? appliedName.replace('.up.sql', '.down.sql')
                : null;

            let downPath = downFile ? join(this.migrationsPath, downFile) : null;
            if (!downFile || !existsSync(downPath)) {
                // Intentar encontrar un *.down.sql emparejado por base name cuando el registro es legado (sin .up.sql)
                const base = appliedName.replace(/\.sql$/, '');
                const candidates = readdirSync(this.migrationsPath)
                    .filter(f => f.endsWith('.down.sql') && f.includes(base));
                if (candidates.length > 0) {
                    downFile = candidates[0];
                    downPath = join(this.migrationsPath, downFile);
                }
            }

            console.log(`   Revirtiendo ${appliedName}`);
            if (!downPath || !existsSync(downPath)) {
                console.log(`      WARNING: No se encontró archivo DOWN para: ${appliedName}`);
                continue;
            }
            try {
                const sql = readFileSync(downPath, 'utf8');
                const statements = sql
                    .split(';')
                    .map(s => s.trim())
                    .filter(s => s.length > 0 && !s.startsWith('--'));
                for (const statement of statements) {
                    try {
                        await pool.query(statement);
                    } catch (err) {
                        const msg = (err && err.message) ? err.message : '';
                        const code = err && err.code ? err.code : '';
                        const ignorable = (
                            code === 'ER_CANT_DROP_FIELD_OR_KEY' ||
                            code === 'ER_DROP_INDEX_FK' ||
                            /doesn\'t exist/i.test(msg) ||
                            /check that column\/key exists/i.test(msg)
                        );
                        if (ignorable) {
                            console.log(`      Aviso (continuando): ${msg}`);
                            continue;
                        }
                        throw err;
                    }
                }
                await this.unmarkMigration(appliedName);
                console.log('      Revertida');
            } catch (error) {
                console.error(`      Error revirtiendo ${appliedName}: ${error.message}`);
                throw error;
            }
        }

        console.log('\n   Rollback completado');
    }

    /**
     * Ejecuta el seed de datos de prueba
     */
    async runSeed() {
        console.log('\nEjecutando seed de datos de prueba...');

        const seedFile = join(this.migrationsPath, 'seed_datos_prueba.sql');
        
        if (!existsSync(seedFile)) {
            console.log('   WARNING: No se encontró archivo de seed');
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
                        console.error(`   Error en statement: ${error.message}`);
                    }
                }
            }

            console.log('   Datos de prueba insertados correctamente');

        } catch (error) {
            console.error(`   Error ejecutando seed: ${error.message}`);
        }
    }

    /**
     * Muestra el estado actual de la base de datos
     */
    async showStatus() {
        console.log('\nEstado actual de la base de datos:\n');

        const tables = await this.getCurrentTables();
        console.log(`   Total de tablas: ${tables.length}`);
        
        if (tables.length > 0) {
            console.log(`   Tablas: ${tables.join(', ')}`);
        }

        const executedMigrations = await this.getExecutedMigrations();
        console.log(`\n   Migraciones ejecutadas: ${executedMigrations.length}`);
        
        if (executedMigrations.length > 0) {
            executedMigrations.forEach(m => console.log(`      - ${m}`));
        }
    }

    /**
     * Proceso principal de migración
     */
    async migrate(options = {}) {
        console.log('\n========================================');
        console.log('   SISTEMA DE MIGRACIONES');
        console.log('========================================');

        try {
            // Verificar si existe la base de datos
            const dbExists = await this.databaseExists();

            if (!dbExists) {
                console.log('\nWARNING: Base de datos vacía detectada');
                await this.createInitialSchema();
            } else {
                console.log('\nBase de datos existente detectada');
            }

            // Ejecutar migraciones pendientes o rollback
            if (options.down || options.to || options.steps) {
                await this.runRollback({ steps: options.steps, to: options.to });
            } else {
                await this.runPendingMigrations();
            }

            // Ejecutar seed si se solicita
            if (options.seed) {
                await this.runSeed();
            }

            // Mostrar estado final
            await this.showStatus();

            console.log('\n========================================');
            console.log('   MIGRACION COMPLETADA');
            console.log('========================================\n');

            return true;

        } catch (error) {
            console.error('\n========================================');
            console.error('   ERROR EN MIGRACION');
            console.error('========================================');
            console.error(`\n${error.message}\n`);
            throw error;
        }
    }
}

// Ejecutar migraciones si se llama directamente (compatible Windows/ESM)
const isDirectRun = (() => {
    try {
        const thisFile = fileURLToPath(import.meta.url);
        const entryFile = process.argv[1];
        if (!entryFile) return false;
        // Normalizar separadores para comparar
        const normalize = (p) => p.replace(/\\/g, '/');
        return normalize(thisFile) === normalize(entryFile);
    } catch {
        return false;
    }
})();

if (isDirectRun) {
    const migrator = new DatabaseMigrator();
    
    const args = process.argv.slice(2);
    const options = {
        seed: args.includes('--seed') || args.includes('-s'),
        down: args.includes('--down') || args.includes('--rollback'),
        steps: (() => {
            const sArg = args.find(a => a.startsWith('--down=') || a.startsWith('--rollback='));
            if (sArg) return sArg.split('=')[1];
            const sNum = args.find(a => /^\d+$/.test(a));
            return sNum;
        })(),
        to: (() => {
            const tIndex = args.indexOf('--to');
            if (tIndex !== -1 && args[tIndex + 1]) return args[tIndex + 1];
            return undefined;
        })()
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
// Fin del módulo
