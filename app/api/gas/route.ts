// app/api/gas/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Ambil 10 data pembacaan kadar asap/gas terbaru
    const result = await query(`
      SELECT id, gas_value as value, status_gas as status, created_at
      FROM sensor_logs 
      ORDER BY created_at DESC 
      LIMIT 10;
    `);
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('[API Gas] Error reading logs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}