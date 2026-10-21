import { createPool } from 'mysql2/promise.js';

export const pool = createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

export async function pingDB(): Promise<void> {
  const conn = await pool.getConnection();
  try {
    await conn.ping();
    console.log('MySQL connected');
  } finally {
    conn.release();
  }
}
