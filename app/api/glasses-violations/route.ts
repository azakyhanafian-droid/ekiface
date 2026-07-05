// app/api/glasses-violations/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db'; // Menggunakan helper terpusat yang aman dari hot-reload memory leak

export async function GET() {
  try {
    // Mengambil data dari tabel glasses_violations sesuai skema PostgreSQL kamu
    // Menggunakan COALESCE agar jika relasi employee_id NULL, tetap menampilkan nama hasil Face Rec Python
    const result = await query(`
      SELECT 
        g.id,
        g.employee_id,
        COALESCE(e.nama, g.nama, 'Unknown') as nama,
        g.camera_name,
        g.violation_status,
        g.confidence,
        g.image_path,
        g.created_at
      FROM glasses_violations g
      LEFT JOIN employees e ON g.employee_id = e.id
      ORDER BY g.created_at DESC 
      LIMIT 20;
    `);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('[API Glasses Violations] Database Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) }, 
      { status: 500 }
    );
  }
}