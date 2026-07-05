import { NextResponse } from 'next/server';
import mqtt from 'mqtt';
import { Pool } from 'pg';

// Konfigurasi pool database
const pool = new Pool({
  user: 'zaky',
  host: 'localhost',
  database: 'neoguard',
  password: 'zaky12345',
  port: 5432,
});

// 🟢 Perbaikan 1: Tambahkan tipe balikan eksplisit ": Promise<Response>" agar dikenali oleh Next.js Validator
export async function POST(request: Request): Promise<Response> {
  try {
    const { id, nama, jabatan, departemen } = await request.json();

    if (!id || !nama) {
      return NextResponse.json({ success: false, message: "Slot ID dan Nama wajib diisi!" }, { status: 400 });
    }

    // 1. Simpan atau Update Master Data Karyawan di PostgreSQL
    const queryDb = `
      INSERT INTO employees (fingerprint_id, nama, jabatan, departemen)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (fingerprint_id) 
      DO UPDATE SET nama = EXCLUDED.nama, jabatan = EXCLUDED.jabatan, departemen = EXCLUDED.departemen
      RETURNING id;
    `;
    const values = [parseInt(id, 10), nama, jabatan || '-', departemen || '-'];
    await pool.query(queryDb, values);

    // 2. Kirim instruksi Enroll ke Hardware via MQTT Broker
    const client = mqtt.connect('mqtt://broker.hivemq.com:1883');

    // 🟢 Perbaikan 2: Definisikan tipe resolve Promise secara eksplisit menjadi <Response>
    return new Promise<Response>((resolve) => {
      client.on('connect', () => {
        const payload = JSON.stringify({
          cmd: "enroll",
          id: parseInt(id, 10),
          nama: nama
        });

        client.publish('iot/neoguard/cmd', payload, { qos: 1 }, (err) => {
          client.end();
          if (err) {
            console.error("MQTT Publish Error:", err);
            resolve(NextResponse.json({ success: false, message: "Karyawan tersimpan di DB, namun gagal mengirim komando ke alat." }, { status: 500 }));
          } else {
            console.log(`MQTT Enroll Terkirim: ${payload}`);
            resolve(NextResponse.json({ success: true, message: "Karyawan tersimpan. Perangkat R307 siap menerima sidik jari!" }));
          }
        });
      });

      client.on('error', (err) => {
        console.error("MQTT Connection Error:", err);
        client.end();
        resolve(NextResponse.json({ success: false, message: "Gagal terhubung ke broker MQTT." }, { status: 500 }));
      });
    });

  } catch (error: any) {
    console.error("Enroll API Error:", error.message);
    // 🟢 Perbaikan 3: Tetap mengembalikan NextResponse yang valid di dalam blok catch
    return NextResponse.json({ success: false, message: `Internal Server Error: ${error.message}` }, { status: 500 });
  }
}