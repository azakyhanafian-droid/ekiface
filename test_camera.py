import cv2

for i in range(10):
    cap = cv2.VideoCapture(i, cv2.CAP_DSHOW)

    if cap.isOpened():
        ret, frame = cap.read()
        print(f"Index {i}: Open={cap.isOpened()}, Frame={ret}")
    else:
        print(f"Index {i}: Tidak terbuka")

    cap.release()