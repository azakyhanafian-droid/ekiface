// app/api/dashboard/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // 1. Hitung Total Absensi Hari Ini
    const attendanceRes = await query(`
      SELECT COUNT(DISTINCT employee_id) as total 
      FROM attendance_logs 
      WHERE DATE(waktu_scan) = CURRENT_DATE;
    `);

    // 2. Hitung Karyawan Terlambat Hari Ini (Misal batas jam masuk 08:00)
    const lateRes = await query(`
      SELECT COUNT(DISTINCT employee_id) as total 
      FROM attendance_logs 
      WHERE DATE(waktu_scan) = CURRENT_DATE 
        AND status_absen ILIKE '%late%';
    `);

    // 3. Hitung Total Pelanggaran Kacamata & Sepatu Hari Ini
    const glassesViolationsRes = await query(`
      SELECT COUNT(*) as total FROM glasses_violations WHERE DATE(created_at) = CURRENT_DATE;
    `);
    const shoeViolationsRes = await query(`
      SELECT COUNT(*) as total FROM shoe_violations WHERE DATE(created_at) = CURRENT_DATE;
    `);

    const totalViolations = 
      Number(glassesViolationsRes.rows[0]?.total || 0) + 
      Number(shoeViolationsRes.rows[0]?.total || 0);

    // 4. Hitung Rata-rata Confidence (Akurasi) Deteksi Pelanggaran Hari Ini
    const avgConfRes = await query(`
      SELECT AVG(confidence) as avg_conf 
      FROM (
        SELECT confidence FROM glasses_violations WHERE DATE(created_at) = CURRENT_DATE
        UNION ALL
        SELECT confidence FROM shoe_violations WHERE DATE(created_at) = CURRENT_DATE
      ) as combined_violations;
    `);

    const avgConfidence = avgConfRes.rows[0]?.avg_conf 
      ? parseFloat(avgConfRes.rows[0].avg_conf).toFixed(1) 
      : "0.0";

    return NextResponse.json({
      totalAttendanceToday: Number(attendanceRes.rows[0]?.total || 0),
      lateEmployees: Number(lateRes.rows[0]?.total || 0),
      safetyViolations: totalViolations,
      averageConfidence: parseFloat(avgConfidence),
    });

  } catch (error) {
    console.error('[API Dashboard] Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}