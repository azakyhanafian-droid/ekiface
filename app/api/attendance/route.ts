// app/api/attendance/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Menggunakan LEFT JOIN agar log device tidak disembunyikan database saat ID karyawan belum sinkron
    const result = await query(`
      SELECT 
        a.id,
        COALESCE(e.nama, 'Unknown Device (ID: ' || a.employee_id || ')') as nama,
        a.status_absen as status,
        TO_CHAR(a.waktu_scan, 'HH24:MI:SS') as time
      FROM attendance_logs a
      LEFT JOIN employees e ON a.employee_id = e.id
      ORDER BY a.waktu_scan DESC 
      LIMIT 10;
    `);
    
    // Pastikan mengembalikan array kosong jika baris data kosong, menghindari error map() di frontend
    return NextResponse.json(result.rows || []);
  } catch (error: any) {
    console.error('[API Attendance] Error reading logs:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message }, 
      { status: 500 }
    );
  }
}