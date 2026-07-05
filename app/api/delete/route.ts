import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import mqtt from 'mqtt';

const pool = new Pool({
  user: 'zaky',
  host: 'localhost',
  database: 'neoguard',
  password: 'zaky12345',
  port: 5432,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { id } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "ID kosong atau tidak valid" }, { status: 400 });
    }

    // Konversi string ID menjadi angka murni
    const targetId = parseInt(String(id).replace('#', ''), 10);
    
    if (isNaN(targetId)) {
      return NextResponse.json({ success: false, message: "ID harus berupa angka murni" }, { status: 400 });
    }

    console.log(`[API Delete] Menjalankan query hapus untuk ID: ${targetId}`);

    // 1. Jalankan Query Hapus ke PostgreSQL
    const deleteQuery = 'DELETE FROM employees WHERE fingerprint_id = $1';
    const dbResult = await pool.query(deleteQuery, [targetId]);
    
    // Log apakah baris data benar-benar ada di DB atau tidak
    if (dbResult.rowCount === 0) {
      console.log(`[⚠️ DB Warning] ID #${targetId} tidak ditemukan di database, tetapi perintah hapus tetap diteruskan ke Arduino.`);
    } else {
      console.log(`[🟢 DB Success] ID #${targetId} berhasil dihapus dari PostgreSQL.`);
    }

    // 2. Kirim sinyal hapus ke broker MQTT HiveMQ dengan Promise agar Next.js tidak 404
    await new Promise<void>((resolve, reject) => {
      const mqttClient = mqtt.connect('mqtt://broker.hivemq.com:1883', {
        connectTimeout: 4000
      });

      mqttClient.on('connect', () => {
        const payload = JSON.stringify({
          cmd: "delete",
          id: targetId
        });
        
        mqttClient.publish('iot/neoguard/cmd', payload, { qos: 1 }, (err) => {
          if (err) {
            console.error("[MQTT Error] Gagal kirim perintah:", err);
            mqttClient.end();
            reject(err);
          } else {
            console.log(`[MQTT Success] Perintah hapus dikirim ke Arduino: ${payload}`);
            mqttClient.end();
            resolve();
          }
        });
      });

      mqttClient.on('error', (err) => {
        mqttClient.end();
        reject(err);
      });
    });

    return NextResponse.json({ 
      success: true, 
      message: `Proses selesai. ID #${targetId} dibersihkan.` 
    });

  } catch (error: any) {
    console.error("❌ Error Total pada API Delete:", error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}