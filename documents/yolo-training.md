
# Training YOLO for Recyclable Materials + Real-Time JS Frontend

## Part 1: Training YOLOv8 for Recyclables

### 1. Choose Classes (keep small)
Recommended 5–8 classes:
- plastic_bottle
- aluminum_can
- glass_bottle
- cardboard
- paper
- trash

### 2. Dataset
Options:
- Public datasets (TACO, TrashNet)
- Your own photos (50–150 images per class)

Images must be labeled with bounding boxes.

### 3. Labeling
Use a tool that exports YOLO format:
- Roboflow
- Label Studio
- CVAT

Expected dataset structure:
dataset/
  images/
    train/
    val/
  labels/
    train/
    val/
  data.yaml

Example data.yaml:
path: dataset
train: images/train
val: images/val
names:
  0: plastic_bottle
  1: aluminum_can
  2: glass_bottle
  3: cardboard
  4: paper
  5: trash

### 4. Train (Python)
```bash
python3 -m venv .venv-train
source .venv-train/bin/activate
pip install ultralytics
yolo detect train model=yolov8n.pt data=dataset/data.yaml imgsz=640 epochs=30 batch=16
```

### 5. Export to ONNX
```bash
yolo export model=runs/detect/train/weights/best.pt format=onnx opset=12 simplify
mv runs/detect/train/weights/best.onnx backend/model/yolo.onnx
```

Create labels.json:
```bash
["plastic_bottle","aluminum_can","glass_bottle","cardboard","paper","trash"]
```

---

## Part 2: Real-Time Frontend (React Web)

### Architecture
Camera → throttle frames → backend /detect → response

### Capture Frame
```bash
export function captureJpeg(video, canvas, maxWidth = 640) {
  const scale = Math.min(1, maxWidth / video.videoWidth);
  canvas.width = video.videoWidth * scale;
  canvas.height = video.videoHeight * scale;
  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.7);
}
```

### Send to Backend
```bash
async function sendFrame(dataUrl) {
  const blob = await (await fetch(dataUrl)).blob();
  const form = new FormData();
  form.append("image", blob, "frame.jpg");
  const res = await fetch("http://localhost:3000/detect", { method: "POST", body: form });
  return res.json();
}
```

### Throttled Loop
```bash
while (true) {
  const frame = captureJpeg(video, canvas);
  if (frame) setResult(await sendFrame(frame));
  await new Promise(r => setTimeout(r, 333));
}
```

---

## Notes
- Throttle to 2–4 FPS
- Resize frames before upload
- Same backend works for web and mobile
