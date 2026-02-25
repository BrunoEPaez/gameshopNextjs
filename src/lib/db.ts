import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL no está definida");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, 
});

export const query = (text: string, params?: any[]) => {
  console.log('DB_EXECUTE:', text);
  return pool.query(text, params);
};