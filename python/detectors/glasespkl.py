# python/detectors/glasespkl.py
import cv2
import pickle
import numpy as np
import threading
import os
import time
import psycopg2
from datetime import datetime
from ultralytics import YOLO
from insightface.app import FaceAnalysis
from flask import Flask, Response
from flask_cors import CORS

# ==========================================
# PATH ABSOLUT DINAMIS & CONFIG DB
# ==========================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Mengarahkan penyimpanan gambar ke Next.js public folder
SAVE_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "..", "public", "captures", "glasses"))
os.makedirs(SAVE_DIR, exist_ok=True)

DB_CONFIG = {
    "dbname": "neoguard",
    "user": "zaky",
    "password": "zaky12345",
    "host": "localhost",
    "port": "5432"
}

# ==========================================
# KONFIGURASI KAMERA
# ==========================================
CAMERA_INDEXES = [2, 3]
CAMERA_LABELS  = ["CAM-1", "CAM-2", "CAM-3"]

GRID_ROWS = 1
GRID_COLS = 3
FRAME_W   = 420   
FRAME_H   = 320   

THRESHOLD = 0.50
COOLDOWN_PERIOD = 60  
violdown_tracker = {}  

# ==========================================
# LOAD DATABASE FACE RECOGNITION & MODEL
# ==========================================
faces_path = os.path.join(BASE_DIR, "faces.pkl")
with open(faces_path, "rb") as f:
    database = pickle.load(f)
print("Database Loaded :", list(database.keys()))

yolo_path = os.path.join(BASE_DIR, "kacamata.pt")
yolo = YOLO(yolo_path)
print("YOLO Classes :", yolo.names)

face_app = FaceAnalysis(name="buffalo_s")
face_app.prepare(ctx_id=-1, det_size=(320, 320))

# ==========================================
# FUNGSI DATABASE (ASYNC VIA THREAD)
# ==========================================
def save_violation_worker(employee_name, confidence, cam_label, violation_status, frame_to_save):
    current_time = datetime.now()
    timestamp_str = current_time.strftime("%Y%m%d_%H%M%S")
    
    filename = f"glasses_{employee_name.lower()}_{timestamp_str}.jpg"
    filepath = os.path.join(SAVE_DIR, filename)
    
    # Menulis gambar (sekarang sudah otomatis membawa bounding box & teks label)
    is_saved = cv2.imwrite(filepath, frame_to_save)
    if not is_saved:
        print(f"[FOLDER WARNING] Gagal menulis file gambar ke {filepath}. Periksa permissions folder Anda!")
        
    db_img_path = f"/captures/glasses/{filename}"
    
    conn = None
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        with conn.cursor() as cur:
            # Pengecekan apakah nama karyawan terdaftar di database
            cur.execute("SELECT id FROM employees WHERE nama ILIKE %s LIMIT 1;", (employee_name,))
            res = cur.fetchone()
            employee_id = res[0] if res else None
            
            if employee_id is None:
                print(f"[DB WARNING] Nama '{employee_name}' terdeteksi secara visual, tetapi TIDAK DITEMUKAN di tabel 'employees' database!")
            
            query = """
                INSERT INTO glasses_violations (employee_id, nama, camera_name, violation_status, confidence, image_path, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s);
            """
            cur.execute(query, (employee_id, employee_name, cam_label, violation_status, confidence, db_img_path, current_time))
            conn.commit()
            print(f"[DB SUCCESS] Pelanggaran [{violation_status}] oleh {employee_name} di {cam_label} BERHASIL DICATAT KE DATABASE.")
    except Exception as e:
        print(f"[DB ERROR] Gagal menyimpan log pelanggaran untuk Karyawan: {employee_name}.")
        print(f"[DB ERROR DETAIL]: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

# ==========================================
# COSINE SIMILARITY
# ==========================================
def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

# ==========================================
# PROSES DETEKSI PER FRAME
# ==========================================
def process_frame(frame, cam_label):
    global violdown_tracker
    results = yolo(frame, conf=0.5, verbose=False)[0]

    for box in results.boxes:
        x1, y1, x2, y2 = map(int, box.xyxy[0])
        cls   = int(box.cls[0])
        conf  = float(box.conf[0])
        label = yolo.names[cls]

        if label.lower() == "safety":
            display_text = f"SAFETY {conf*100:.1f}%"
            color = (0, 255, 0)
            
            # Langsung gambar label SAFETY ke frame
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            cv2.putText(frame, display_text, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
        else:
            best_name  = "Unknown"
            best_score = 0.0

            try:
                margin = 120
                rx1 = max(0, x1 - margin)
                ry1 = max(0, y1 - margin)
                rx2 = min(frame.shape[1], x2 + margin)
                ry2 = min(frame.shape[0], y2 + margin)

                roi = frame[ry1:ry2, rx1:rx2]
                
                if roi.size > 0:
                    faces = face_app.get(roi)
                    for face in faces:
                        emb = face.embedding
                        for name, db_emb in database.items():
                            score = cosine_similarity(emb, db_emb)
                            if score > best_score:
                                best_score = score
                                best_name  = name
            except Exception as e:
                print(f"[FACE ERROR] Gagal mengekstrak wajah: {e}")

            if best_score < THRESHOLD:
                best_name = "Unknown"

            face_conf    = best_score * 100 if best_name != "Unknown" else conf * 100
            display_text = f"{best_name} | NO SAFETY | {face_conf:.1f}%"
            color        = (0, 0, 255)

            # ✅ PERBAIKAN UTAMA: Gambar kotak merah dan teks label DULU ke frame asli
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            cv2.putText(frame, display_text, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

            now = time.time()
            last_saved = violdown_tracker.get(best_name, 0)
            
            if now - last_saved > COOLDOWN_PERIOD:
                violdown_tracker[best_name] = now
                dynamic_status = f"NO SAFETY ({label.upper()})"
                
                print(f"[TRACKER LOG] Memicu antrean penyimpanan DB untuk: {best_name} dengan status [{dynamic_status}]")
                
                # ✅ KARENA SUDAH DIGAMBAR DI ATAS: frame.copy() di bawah ini otomatis membawa kotak merah + teks nama
                threading.Thread(
                    target=save_violation_worker, 
                    args=(best_name, face_conf, cam_label, dynamic_status, frame.copy()), 
                    daemon=True
                ).start()

    return frame

# ==========================================
# KELAS THREAD PER KAMERA
# ==========================================
class CameraThread(threading.Thread):
    def __init__(self, cam_index, cam_label):
        super().__init__(daemon=True)
        self.cam_index  = cam_index
        self.cam_label  = cam_label
        self.cap        = None
        self.frame      = None 
        self.lock       = threading.Lock()
        self.running    = False
        self.connected  = False

    def open(self):
        self.cap = cv2.VideoCapture(self.cam_index)
        if self.cap.isOpened():
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, FRAME_W)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, FRAME_H)
            self.connected = True
            print(f"[{self.cam_label}] Terhubung (index {self.cam_index})")
        else:
            self.connected = False
            print(f"[{self.cam_label}] GAGAL terhubung (index {self.cam_index})")

    def run(self):
        self.running = True
        while self.running:
            if not self.connected:
                placeholder = np.zeros((FRAME_H, FRAME_W, 3), dtype=np.uint8)
                placeholder[:] = (30, 30, 80)
                cv2.putText(placeholder, f"{self.cam_label}: Tidak Terhubung", (30, FRAME_H // 2),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (100, 100, 255), 2)
                with self.lock:
                    self.frame = placeholder
                time.sleep(1)
                continue

            ret, raw = self.cap.read()
            if not ret:
                self.connected = False
                continue

            raw = cv2.resize(raw, (FRAME_W, FRAME_H))
            processed = process_frame(raw, self.cam_label)
            cv2.putText(processed, self.cam_label, (10, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 0), 2)

            with self.lock:
                self.frame = processed

    def get_frame(self):
        with self.lock:
            if self.frame is None:
                blank = np.zeros((FRAME_H, FRAME_W, 3), dtype=np.uint8)
                cv2.putText(blank, f"{self.cam_label}: Memuat...", (30, FRAME_H // 2),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (180, 180, 180), 2)
                return blank
            return self.frame.copy()

    def stop(self):
        self.running = False
        if self.cap and self.cap.isOpened():
            self.cap.release()

# ==========================================
# SERVER WEB STREAMING INTEGRASI (FLASK)
# ==========================================
flask_app = Flask(__name__)
CORS(flask_app)

def generate_mjpeg_stream(camera_thread):
    while True:
        frame = camera_thread.get_frame()
        if frame is None:
            time.sleep(0.04)
            continue
        ret, jpeg = cv2.imencode('.jpg', frame)
        if not ret:
            continue
        frame_bytes = jpeg.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        time.sleep(0.04)

@flask_app.route('/video_feed_<cam_id>')
def video_feed(cam_id):
    cam_mapping = {"CAM001": 0, "CAM002": 1, "CAM003": 2}
    
    if cam_id in cam_mapping:
        target_index = cam_mapping[cam_id]
        if target_index < len(cameras):
            return Response(generate_mjpeg_stream(cameras[target_index]),
                            mimetype='multipart/x-mixed-replace; boundary=frame')
            
    return "Camera Not Found", 404

# ==========================================
# MAIN EXECUTION
# ==========================================
cameras = []
for idx, lbl in zip(CAMERA_INDEXES, CAMERA_LABELS):
    cam = CameraThread(idx, lbl)
    cam.open()
    cam.start()
    cameras.append(cam)

if __name__ == '__main__':
    try:
        print("\n[INFO] Menjalankan Server Stream Web pada http://localhost:5000")
        flask_app.run(host='0.0.0.0', port=5000, threaded=True, debug=False)
    finally:
        for cam in cameras:
            cam.stop()
        print("Program NeoGuard dihentikan.")