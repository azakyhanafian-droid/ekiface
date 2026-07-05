# python/detectors/shoe.py
import os
import cv2
import time
import torch
import numpy as np
import psycopg2
import threading
from datetime import datetime
from ultralytics import YOLO
from flask import Flask, request, jsonify, Response
from flask_cors import CORS

# =====================================================
# PATH ABSOLUT DINAMIS & CONFIG DB
# =====================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Mengarahkan penyimpanan snapshot pelanggaran ke folder Next.js public
SAVE_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "..", "public", "captures", "shoes"))
os.makedirs(SAVE_DIR, exist_ok=True)

DB_CONFIG = {
    "dbname": "neoguard",
    "user": "postgres",
    "password": "",
    "host": "192.168.0.120",
    "port": "5432"
}

# =====================================================
# LOAD MODEL & CONFIG DEVICE
# =====================================================
model_path = os.path.join(BASE_DIR, "sepatu1.pt")
model = YOLO(model_path)

device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)
print(f"[INFO] Menggunakan device: {device}")
print(f"[INFO] YOLO Shoes Classes: {model.names}")

# =====================================================
# INSTANSIASI KAMERA & BUFFER CONTROLLER
# =====================================================
# 1. Ubah index ke 0 sesuai dengan /dev/video0 yang aktif
CAMERA_INDEX = 0  

# 2. Hapus cv2.CAP_DSHOW, atau ganti dengan cv2.CAP_V4L2 (API standar Linux)
cap = cv2.VideoCapture(CAMERA_INDEX, cv2.CAP_V4L2)

if not cap.isOpened():
    print(f"[ERROR] Gagal membuka kamera USB dengan index {CAMERA_INDEX}")
    exit()

cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
cap.set(cv2.CAP_PROP_FPS, 30)
cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

current_raw_frame = None
camera_lock = threading.Lock()
camera_running = True

def camera_stream_reader():
    """Background thread membaca kamera & menjalankan preview gambar terannotasi"""
    global current_raw_frame, camera_running
    while camera_running:
        ret, frame = cap.read()
        if ret:
            # Klone frame asli untuk diproses visualnya agar konstan
            frame = cv2.resize(frame, (1280, 720))
            frame = cv2.convertScaleAbs(frame, alpha=1.2, beta=15)
            
            # Tambahkan visual deteksi konstan (Inference ringan untuk kebutuhan stream web)
            results = model.predict(source=frame, conf=0.50, imgsz=640, device=device, verbose=False)[0]
            
            for box in results.boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                conf = float(box.conf[0])
                cls = int(box.cls[0])
                label = model.names[cls]
                
                area = (x2 - x1) * (y2 - y1)
                if area < 5000:
                    continue
                    
                color = (0, 255, 0) if label.lower() == "safety" else (0, 0, 255)
                status_txt = f"Safety ({conf*100:.1f}%)" if label.lower() == "safety" else f"No Safety ({conf*100:.1f}%)"
                
                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 3)
                cv2.putText(frame, status_txt, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
            
            with camera_lock:
                current_raw_frame = frame.copy()
        time.sleep(0.03) # Membatasi pembacaan sekitar ~30 FPS agar CPU stabil

threading.Thread(target=camera_stream_reader, daemon=True).start()

# =====================================================
# FLASK APPLICATION SETUP
# =====================================================
flask_app = Flask(__name__)
CORS(flask_app)

# =====================================================
# LOGIKA DETEKSI APD & PENULISAN KE POSTGRESQL (TRIGGERED)
# =====================================================
def process_attendance_and_shoes(fingerprint_id):
    global current_raw_frame
    
    with camera_lock:
        if current_raw_frame is None:
            print("[WARN] Frame kamera belum siap.")
            return
        frame = current_raw_frame.copy()

    current_time = datetime.now()
    timestamp_str = current_time.strftime("%Y%m%d_%H%M%S")

    conn = None
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        with conn.cursor() as cur:
            cur.execute("SELECT id, nama FROM employees WHERE fingerprint_id = %s LIMIT 1;", (fingerprint_id,))
            employee_data = cur.fetchone()

            if not employee_data:
                print(f"[DATABASE WARN] Fingerprint ID {fingerprint_id} tidak ditemukan di master employees.")
                return

            employee_id = employee_data[0]
            employee_name = employee_data[1]
            print(f"[EVENT TRIGGERED] Pemindaian sidik jari terdeteksi: {employee_name} (ID: {fingerprint_id})")

            # Jalankan deteksi ulang dengan konfiden tinggi khusus untuk validasi ke DB berkas log
            results = model.predict(source=frame, conf=0.60, imgsz=640, device=device, verbose=False)[0]

            has_safety_shoes = False
            max_violation_conf = 0.0
            
            for box in results.boxes:
                cls = int(box.cls[0])
                conf = float(box.conf[0])
                label = model.names[cls]
                if label.lower() == "safety":
                    has_safety_shoes = True
                else:
                    if conf > max_violation_conf:
                        max_violation_conf = conf

            if has_safety_shoes:
                print(f"[ABSEN OK] {employee_name} memakai Sepatu Safety.")
                cur.execute("""
                    INSERT INTO attendance_logs (employee_id, status_absen, waktu_scan)
                    VALUES (%s, 'ON TIME', %s);
                """, (employee_id, current_time))
            else:
                print(f"[PELANGGARAN DETEKSI] {employee_name} TIDAK memakai Sepatu Safety!")
                filename = f"shoes_{employee_name.lower()}_{timestamp_str}.jpg"
                filepath = os.path.join(SAVE_DIR, filename)
                cv2.imwrite(filepath, frame)

                db_img_path = f"/captures/shoes/{filename}"
                confidence_val = max_violation_conf * 100 if max_violation_conf > 0 else 90.0

                cur.execute("""
                    INSERT INTO shoe_violations (employee_id, camera_name, violation_status, confidence, image_path, created_at)
                    VALUES (%s, 'CAM-4', 'NO SAFETY SHOES', %s, %s, %s);
                """, (employee_id, confidence_val, db_img_path, current_time))

                cur.execute("""
                    INSERT INTO attendance_logs (employee_id, status_absen, waktu_scan)
                    VALUES (%s, 'LATE / NO PPE', %s);
                """, (employee_id, current_time))

            conn.commit()
            print(f"[DB LOG SUCCESS] Transaksi absensi {employee_name} berhasil disimpan.")

    except Exception as e:
        print(f"[DB ERROR] Gagal mengeksekusi logika database: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

# =====================================================
# ENDPOINT UNTUK STREAMING VIDEO MJPEG (UNTUK WEB IMAGE)
# =====================================================
def generate_video_stream():
    global current_raw_frame
    while True:
        frame = None
        with camera_lock:
            if current_raw_frame is not None:
                frame = current_raw_frame.copy()
        
        # Perbaikan Optimasi: Jika frame kosong, beri jeda waktu agar tidak memakan CPU 100%
        if frame is None:
            time.sleep(0.04)
            continue
            
        ret, jpeg = cv2.imencode('.jpg', frame)
        if not ret:
            continue
            
        frame_bytes = jpeg.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        time.sleep(0.04) # Batasi keluaran stream sekitar ~25 FPS agar CPU adem

# ✅ PERBAIKAN: Mengubah rute rute /video_feed/1 menjadi /video_feed agar match dengan Next.js (CAM-4)
@flask_app.route('/video_feed')
def video_feed():
    return Response(generate_video_stream(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

# =====================================================
# DUMMY FALLBACKS (Mencegah Error 404 Noisy Logs di Terminal)
# =====================================================
def generate_dummy_stream(cam_name):
    """Menghasilkan frame hitam statis untuk area monitoring yang belum aktif"""
    while True:
        img = np.zeros((720, 1280, 3), np.uint8)
        cv2.putText(img, f"{cam_name} - Stream Disconnected (5001)", (320, 360), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1.1, (100, 100, 100), 2)
        ret, jpeg = cv2.imencode('.jpg', img)
        if ret:
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + jpeg.tobytes() + b'\r\n')
        time.sleep(0.2)

@flask_app.route('/video_feed_CAM001')
def video_feed_cam1():
    return Response(generate_dummy_stream("CAM-1 (Welding Area 1)"), mimetype='multipart/x-mixed-replace; boundary=frame')

@flask_app.route('/video_feed_CAM002')
def video_feed_cam2():
    return Response(generate_dummy_stream("CAM-2 (Welding Area 2)"), mimetype='multipart/x-mixed-replace; boundary=frame')

@flask_app.route('/video_feed_CAM003')
def video_feed_cam3():
    return Response(generate_dummy_stream("CAM-3 (Welding Area 3)"), mimetype='multipart/x-mixed-replace; boundary=frame')


# =====================================================
# API TRIGGER ABSENSI
# =====================================================
@flask_app.route('/api/trigger-attendance', methods=['POST'])
def trigger_attendance():
    data = request.json
    if not data or 'fingerprint_id' not in data:
        return jsonify({"error": "Missing parameter fingerprint_id"}), 400
    
    fingerprint_id = int(data['fingerprint_id'])
    threading.Thread(target=process_attendance_and_shoes, args=(fingerprint_id,), daemon=True).start()
    
    return jsonify({
        "status": "Trigger received",
        "fingerprint_id": fingerprint_id
    }), 200

# =====================================================
# SERVER RUNNER
# =====================================================
if __name__ == '__main__':
    try:
        print("\n[INFO] Server Validasi & Live Streaming Sepatu Aktif di http://localhost:5001")
        flask_app.run(host='0.0.0.0', port=5001, threaded=True, debug=False)
    finally:
        camera_running = False
        time.sleep(0.2)
        cap.release()
