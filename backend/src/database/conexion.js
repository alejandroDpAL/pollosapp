import { createPool } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: './src/env/.env' });

export const pool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE
});

// Verificar conexión
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conectado exitosamente a la base de datos');
    connection.release(); // Libera la conexión
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error.message);
  }
})();
