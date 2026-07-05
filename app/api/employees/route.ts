import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  user: 'zaky',
  host: 'localhost',
  database: 'neoguard',
  password: 'zaky12345',
  port: 5432,
});

export async function GET() {
  try {
    // Mengambil data diurutkan dari ID terkecil (slot 1, 2, 3...)
    const query = `
      SELECT 
        fingerprint_id AS id, 
        nama AS name,
        'registered' AS "fingerprintStatus"
      FROM employees 
      ORDER BY fingerprint_id ASC;
    `;
    
    const result = await pool.query(query);
    
    // Kembalikan data dalam bentuk JSON array
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error: any) {
    console.error("Gagal mengambil data karyawan:", error.message);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}