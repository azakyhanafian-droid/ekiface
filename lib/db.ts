// lib/db.ts
import { Pool, PoolClient, QueryResult } from 'pg';

// 1. Konfigurasi Database disesuaikan dengan DB_CONFIG di Python & Skema PostgreSQL Anda
const dbConfig = {
  user: 'zaky',
  host: 'localhost',
  database: 'neoguard',
  password: 'zaky12345',
  port: 5432,
  max: 10, // Jumlah maksimal koneksi simultan dalam pool
  idleTimeoutMillis: 30000, // Menutup koneksi yang idle setelah 30 detik
  connectionTimeoutMillis: 2000, // Waktu tunggu maksimal untuk terhubung ke DB (2 detik)
};

// 2. Mencegah overload koneksi database saat hot-reload di Next.js (Singleton Pattern)
const globalForPg = globalThis as unknown as {
  actualPool: Pool | undefined;
};

export const pool = globalForPg.actualPool ?? new Pool(dbConfig);

if (process.env.NODE_ENV !== 'production') {
  globalForPg.actualPool = pool;
}

// 3. Helper Fungsi Query Utama
// Digunakan untuk query standar (SELECT, INSERT, UPDATE, DELETE) yang langsung otomatis memanage koneksi
export const query = async (text: string, params?: any[]): Promise<QueryResult> => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    // Log ini sangat berguna untuk debugging performa query di terminal server Next.js
    console.log(`[DB Query] Executed in ${duration}ms | Rows: ${res.rowCount}`);
    return res;
  } catch (error) {
    console.error('[DB Error] Query failed:', error);
    throw error;
  }
};

// 4. Helper Fungsi Transaction Client
// Berguna jika nanti Anda butuh proses DB kompleks yang memerlukan BEGIN, COMMIT, atau ROLLBACK
export const getClient = async (): Promise<PoolClient> => {
  const client = await pool.connect();
  return client;
};