// app/api/shoe-violations/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Menggunakan LEFT JOIN agar data pelanggaran visual dari AI (shoe.py) tetap tampil 
    // meskipun employee_id belum sinkron sempurna di tabel master employees.
    const result = await query(`
      SELECT 
        s.id,
        COALESCE(e.nama, 'Karyawan Tidak Dikenal (ID: ' || s.employee_id || ')') as nama,
        s.violation_status,
        s.camera_name,
        s.confidence,
        s.image_path,
        s.created_at
      FROM shoe_violations s
      LEFT JOIN employees e ON s.employee_id = e.id
      ORDER BY s.created_at DESC 
      LIMIT 10;
    `);
    
    // Proteksi Frontend: Memastikan selalu mengembalikan array (walaupun kosong)
    // untuk mencegah error fungsi .map() atau .length pecah di UI Live Monitoring.
    return NextResponse.json(result.rows || []);
  } catch (error: any) {
    // Logging internal untuk mempermudah debugging jika query SQL bermasalah
    console.error('[API Shoe Violations] Database Error:', error);
    
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message }, 
      { status: 500 }
    );
  }
}