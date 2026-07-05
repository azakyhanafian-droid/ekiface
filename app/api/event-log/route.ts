// app/api/event-log/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const date = searchParams.get('date') || '';
    const type = searchParams.get('type') || 'all'; // 'all', 'shoes', 'glasses'
    
    let glassesConditions: string[] = [];
    let shoeConditions: string[] = [];
    let params: any[] = [];
    let paramIndex = 1;
    
    if (date) {
      glassesConditions.push(`DATE(g.created_at) = $${paramIndex}`);
      shoeConditions.push(`DATE(s.created_at) = $${paramIndex}`);
      params.push(date);
      paramIndex++;
    }
    
    if (search) {
      glassesConditions.push(`(COALESCE(e.nama, g.nama, 'Unknown') ILIKE $${paramIndex} OR CAST(g.employee_id AS TEXT) ILIKE $${paramIndex})`);
      shoeConditions.push(`(COALESCE(e.nama, 'Karyawan Tidak Dikenal (ID: ' || s.employee_id || ')') ILIKE $${paramIndex} OR CAST(s.employee_id AS TEXT) ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    const glassesWhere = glassesConditions.length ? 'WHERE ' + glassesConditions.join(' AND ') : '';
    const shoeWhere = shoeConditions.length ? 'WHERE ' + shoeConditions.join(' AND ') : '';
    
    let sql = '';
    
    if (type === 'glasses') {
      sql = `
        SELECT 
          'glasses' AS type,
          g.id,
          g.employee_id AS "employeeId",
          COALESCE(e.nama, g.nama, 'Unknown') AS "employeeName",
          g.camera_name AS camera,
          g.violation_status AS "violationType",
          g.confidence,
          g.image_path,
          TO_CHAR(g.created_at, 'YYYY-MM-DD HH24:MI:SS') AS timestamp
        FROM glasses_violations g
        LEFT JOIN employees e ON g.employee_id = e.id
        ${glassesWhere}
        ORDER BY timestamp DESC
        LIMIT 50;
      `;
    } else if (type === 'shoes') {
      sql = `
        SELECT 
          'shoes' AS type,
          s.id,
          s.employee_id AS "employeeId",
          COALESCE(e.nama, 'Karyawan Tidak Dikenal (ID: ' || s.employee_id || ')') AS "employeeName",
          s.camera_name AS camera,
          s.violation_status AS "violationType",
          s.confidence,
          s.image_path,
          TO_CHAR(s.created_at, 'YYYY-MM-DD HH24:MI:SS') AS timestamp
        FROM shoe_violations s
        LEFT JOIN employees e ON s.employee_id = e.id
        ${shoeWhere}
        ORDER BY timestamp DESC
        LIMIT 50;
      `;
    } else {
      // both
      sql = `
        SELECT * FROM (
          SELECT 
            'glasses' AS type,
            g.id,
            g.employee_id AS "employeeId",
            COALESCE(e.nama, g.nama, 'Unknown') AS "employeeName",
            g.camera_name AS camera,
            g.violation_status AS "violationType",
            g.confidence,
            g.image_path,
            TO_CHAR(g.created_at, 'YYYY-MM-DD HH24:MI:SS') AS timestamp
          FROM glasses_violations g
          LEFT JOIN employees e ON g.employee_id = e.id
          ${glassesWhere}
          
          UNION ALL
          
          SELECT 
            'shoes' AS type,
            s.id,
            s.employee_id AS "employeeId",
            COALESCE(e.nama, 'Karyawan Tidak Dikenal (ID: ' || s.employee_id || ')') AS "employeeName",
            s.camera_name AS camera,
            s.violation_status AS "violationType",
            s.confidence,
            s.image_path,
            TO_CHAR(s.created_at, 'YYYY-MM-DD HH24:MI:SS') AS timestamp
          FROM shoe_violations s
          LEFT JOIN employees e ON s.employee_id = e.id
          ${shoeWhere}
        ) combined
        ORDER BY timestamp DESC
        LIMIT 100;
      `;
    }
    
    const result = await query(sql, params);
    return NextResponse.json(result.rows || []);
  } catch (error: any) {
    console.error('[API Event Log] Error reading logs:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message }, 
      { status: 500 }
    );
  }
}
