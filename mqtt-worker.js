const mqtt = require('mqtt');
const { Pool } = require('pg');

// ==========================================
// 1. KONEKSI DATABASE POSTGRESQL
// ==========================================
const pool = new Pool({
    user: 'zaky',           
    host: 'localhost',      
    database: 'neoguard',   
    password: 'zaky12345',  
    port: 5432,
});

pool.connect((err, client, release) => {
    if (err) {
        return console.error('❌ Gagal koneksi ke PostgreSQL:', err.stack);
    }
    console.log('✅ MQTT Worker NeoGuard sukses terhubung ke database [neoguard]!');
    release();
});

// ==========================================
// 2. KONEKSI MQTT BROKER & TOPIK
// ==========================================
const brokerUrl = 'mqtt://broker.hivemq.com:1883'; 
const client = mqtt.connect(brokerUrl);

const topicGas = 'iot/neoguard/gas';          
const topicFinger = 'iot/neoguard/attendance'; 
const topicCmd = 'iot/neoguard/cmd'; 

client.on('connect', () => {
    console.log('✅ Berhasil terhubung ke Broker MQTT (broker.hivemq.com)!');
    
    client.subscribe([topicGas, topicFinger, topicCmd], (err) => {
        if (!err) {
            console.log(`📡 Mendengarkan topik aktif: \n - ${topicGas} \n - ${topicFinger} \n - ${topicCmd}`);
        } else {
            console.error('❌ Gagal subscribe ke topik:', err);
        }
    });
});

// ==========================================
// 3. LOGIKA PENANGKAP DAN PENYIMPANAN DATA
// ==========================================
client.on('message', async (topic, message) => {
    const rawData = message.toString();
    console.log(`\n📩 [Pesan Masuk] Topik: ${topic} | Data: ${rawData}`);

    try {
        const payload = JSON.parse(rawData);

        // ----------------------------------------------------
        // A. DATA DARI SENSOR ASAP / GAS (ESP32)
        // ----------------------------------------------------
        if (topic === topicGas) {
            const gasValue = payload.gas_value || payload.value;
            const statusGas = payload.status_gas || payload.status || 'SAFE';

            if (statusGas.toUpperCase() !== 'AMAN' && statusGas.toUpperCase() !== 'SAFE') {
                const queryGas = `
                    INSERT INTO sensor_logs (gas_value, status_gas, created_at) 
                    VALUES ($1, $2, NOW())
                `;
                const valuesGas = [gasValue, statusGas];
                await pool.query(queryGas, valuesGas);
                console.log(`⚠️ [BAHAYA] Data GAS (${gasValue} PPM - Status: ${statusGas}) BERHASIL disimpan ke database!`);
            } else {
                console.log(`ℹ️ [DIABAIKAN] Data GAS (${gasValue} PPM) tidak disimpan karena status masih ${statusGas}.`);
            }
        } 
        
        // ----------------------------------------------------
        // B. DATA ABSENSI DARI SENSOR FINGERPRINT (ESP8266)
        //    *Diteruskan ke Python Server untuk Scan APD via YOLO*
        // ----------------------------------------------------
        else if (topic === topicFinger) {
            const rawId = payload.id || payload.employee_id;
            const fingerprintId = rawId ? parseInt(rawId, 10) : null;

            if (!fingerprintId || isNaN(fingerprintId)) {
                console.warn('⚠️ Gagal memproses absensi: ID sidik jari kosong/tidak valid!', payload);
                return;
            }

            console.log(`🔄 Meneruskan Fingerprint ID #${fingerprintId} ke AI Processing Unit (shoe.py)...`);

            // Mengirim trigger ke skrip Python shoe.py yang berjalan di port 5001
            try {
                const response = await fetch('http://localhost:5001/api/trigger-attendance', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fingerprint_id: fingerprintId })
                });

                if (response.ok) {
                    const resData = await response.json();
                    console.log(`✅ Sinyal trigger sukses terkirim. Respon AI unit:`, resData);
                } else {
                    console.error(`❌ Python Server merespon dengan status error: ${response.status}`);
                }
            } catch (fetchError) {
                console.error('❌ Gagal menghubungi Python Server. Pastikan "shoe.py" telah berjalan di port 5001!');
            }
        }

        // ----------------------------------------------------
        // C. DATA PERINTAH ENROLL / DELETE (DARI WEB NEXT.JS)
        // ----------------------------------------------------
        else if (topic === topicCmd) {
            const { cmd, id, nama } = payload;
            const fingerprintId = parseInt(id, 10);

            if (!cmd || isNaN(fingerprintId)) {
                console.warn('⚠️ Komando Web tidak valid (id/cmd kosong):', payload);
                return;
            }

            if (cmd === 'enroll') {
                const queryEnroll = `
                    INSERT INTO employees (fingerprint_id, nama, jabatan, departemen)
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT (fingerprint_id) 
                    DO UPDATE SET nama = EXCLUDED.nama, created_at = NOW()
                    RETURNING id;
                `;
                const valuesEnroll = [fingerprintId, nama || 'Karyawan Baru', '-', '-'];
                await pool.query(queryEnroll, valuesEnroll);
                console.log(`📝 [DB Sync] Berhasil mendaftarkan/memperbarui data Master Karyawan [${nama}] dengan Fingerprint ID #${fingerprintId} di DB.`);
            } 
            else if (cmd === 'delete') {
                const queryDelete = `DELETE FROM employees WHERE fingerprint_id = $1 RETURNING id;`;
                const resDelete = await pool.query(queryDelete, [fingerprintId]);
                
                if (resDelete.rowCount > 0) {
                    console.log(`🗑️ [DB Sync] Berhasil menghapus Master Karyawan dengan Fingerprint ID #${fingerprintId} dari database.`);
                } else {
                    console.log(`ℹ️ [DB Sync] Perintah hapus diterima, namun ID #${fingerprintId} memang tidak ada di database.`);
                }
            }
        }

    } catch (error) {
        console.error('⚠️ Gagal memproses payload atau Query database error:', error.message);
    }
});

client.on('error', (err) => {
    console.error('❌ MQTT Client Error:', err);
});