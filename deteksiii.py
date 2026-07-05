import cv2
import pickle
import numpy as np
import threading

from flask import Flask, Response, jsonify

from ultralytics import YOLO
from insightface.app import FaceAnalysis
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ==========================================
# KONFIGURASI KAMERA
# Ganti index sesuai port USB kamera Anda
# Biasanya: 0 = built-in, 1/2/3 = USB
# ==========================================
CAMERA_INDEXES = [0, 1, 2, 3]
CAMERA_LABELS  = ["CAM-0", "CAM-1", "CAM-2", "CAM-3"]

# ==========================================
# STATUS LIVE CAMERA
# ==========================================
camera_status = [True, True, True, True]

# ==========================================
# LAYOUT GRID (baris x kolom)
# Untuk 3 kamera: 1 baris, 3 kolom
# ==========================================
GRID_ROWS = 1
GRID_COLS = 3
FRAME_W   = 420   # lebar tiap frame
FRAME_H   = 320   # tinggi tiap frame

# ==========================================
# THRESHOLD FACE MATCHING
# ==========================================
THRESHOLD = 0.50

# ==========================================
# LOAD DATABASE FACE RECOGNITION
# ==========================================
with open("faces.pkl", "rb") as f:
    database = pickle.load(f)
print("Database Loaded :", list(database.keys()))

# ==========================================
# LOAD YOLO MODEL
# ==========================================
yolo = YOLO("kacamata.pt")
print("YOLO Classes :", yolo.names)

# ==========================================
# LOAD INSIGHTFACE
# ==========================================
face_app = FaceAnalysis(name="buffalo_s")
face_app.prepare(ctx_id=-1, det_size=(320, 320))

# ==========================================
# COSINE SIMILARITY
# ==========================================
def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

# ==========================================
# PROSES DETEKSI PER FRAME
# ==========================================
def process_frame(frame):
    """
    Jalankan YOLO + face recognition pada satu frame.
    Return frame yang sudah digambar bounding box-nya.
    """
    results = yolo(frame, conf=0.5, verbose=False)[0]

    for box in results.boxes:
        x1, y1, x2, y2 = map(int, box.xyxy[0])
        cls   = int(box.cls[0])
        conf  = float(box.conf[0])
        label = yolo.names[cls]

        # ----------------------------------
        # SAFETY — pakai kacamata/APD
        # ----------------------------------
        if label.lower() == "safety":
            display_text = f"SAFETY {conf*100:.1f}%"
            color = (0, 255, 0)

        # ----------------------------------
        # NO SAFETY — tanpa APD, kenali wajah
        # ----------------------------------
        else:
            best_name  = "Unknown"
            best_score = 0.0

            try:
                margin = 120
                rx1 = max(0, x1 - margin)
                ry1 = max(0, y1 - margin)
                rx2 = min(frame.shape[1], x2 + margin)
                ry2 = min(frame.shape[0], y2 + margin)

                roi   = frame[ry1:ry2, rx1:rx2]
                faces = face_app.get(roi)

                for face in faces:
                    emb = face.embedding
                    for name, db_emb in database.items():
                        score = cosine_similarity(emb, db_emb)
                        if score > best_score:
                            best_score = score
                            best_name  = name
            except Exception:
                pass

            if best_score < THRESHOLD:
                best_name = "Unknown"

            face_conf    = best_score * 100
            display_text = f"{best_name} | NO SAFETY | {face_conf:.1f}%"
            color        = (0, 0, 255)

        # ----------------------------------
        # GAMBAR BOUNDING BOX
        # ----------------------------------
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
        cv2.putText(
            frame, display_text,
            (x1, y1 - 10),
            cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2
        )

    return frame

# ==========================================
# KELAS THREAD PER KAMERA
# ==========================================
class CameraThread(threading.Thread):
    """
    Setiap kamera berjalan di thread terpisah agar
    satu kamera lambat tidak memblokir yang lain.
    """

    def __init__(self, cam_index, cam_label):
        super().__init__(daemon=True)
        self.cam_index  = cam_index
        self.cam_label  = cam_label
        self.cap        = None
        self.frame      = None          # frame terbaru yang sudah diproses
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
                # Buat placeholder frame merah jika kamera tidak ada
                placeholder = np.zeros((FRAME_H, FRAME_W, 3), dtype=np.uint8)
                placeholder[:] = (30, 30, 80)
                cv2.putText(
                    placeholder,
                    f"{self.cam_label}: Tidak Terhubung",
                    (30, FRAME_H // 2),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (100, 100, 255), 2
                )
                with self.lock:
                    self.frame = placeholder
                continue

            ret, raw = self.cap.read()
            
            if not ret:
                self.cap.release()
                self.open()
                continue

            raw = cv2.resize(raw, (FRAME_W, FRAME_H))

            # Proses deteksi
            processed = process_frame(raw)

            # Label nama kamera di pojok kiri atas
            cv2.putText(
                processed, self.cam_label,
                (10, 25),
                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 0), 2
            )

            with self.lock:
                self.frame = processed

    def get_frame(self):
        with self.lock:
            if self.frame is None:
                # Placeholder hitam selama inisialisasi
                blank = np.zeros((FRAME_H, FRAME_W, 3), dtype=np.uint8)
                cv2.putText(
                    blank, f"{self.cam_label}: Memuat...",
                    (30, FRAME_H // 2),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (180, 180, 180), 2
                )
                return blank
            return self.frame.copy()

    def stop(self):
        self.running = False
        if self.cap and self.cap.isOpened():
            self.cap.release()

# ==========================================
# BUAT DAN MULAI SEMUA THREAD KAMERA
# ==========================================
cameras = []
for idx, lbl in zip(CAMERA_INDEXES, CAMERA_LABELS):
    cam = CameraThread(idx, lbl)
    cam.open()
    cam.start()
    cameras.append(cam)

print("\nTekan ESC untuk keluar.\n")

# ==========================================
# MAIN LOOP — SUSUN GRID DAN TAMPILKAN
# ==========================================
@app.route("/start/<int:cam>")
def start(cam):

    camera_status[cam] = True

    return {
        "status":"started"
    }
@app.route("/stop/<int:cam>")
def stop(cam):

    camera_status[cam]=False

    return {"status":"stopped"}

def generate(cam):

    while True:
        frame = cameras[cam].get_frame()

        ret, buffer = cv2.imencode(".jpg", frame)

        yield (
            b'--frame\r\n'
            b'Content-Type: image/jpeg\r\n\r\n' +
            buffer.tobytes() +
            b'\r\n'
        )

@app.route("/video_feed/<int:cam>")
def video_feed(cam):

    if cam >= len(cameras):
        return "Camera Not Found",404

    return Response(
        generate(cam),
        mimetype="multipart/x-mixed-replace; boundary=frame"
    )

@app.route("/status")
def status():

    return jsonify({

        "camera":[
            {
                "id":i,
                "online":cam.connected
            }

            for i,cam in enumerate(cameras)
        ]
    })
if __name__=="__main__":

    app.run(

        host="0.0.0.0",

        port=5000,

        threaded=True

    )