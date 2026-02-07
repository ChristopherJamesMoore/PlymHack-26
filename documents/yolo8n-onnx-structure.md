# YOLOv8n Backend (ONNX + Node.js + Docker)

This document describes how to:
- Export YOLOv8n to ONNX (one-time, Python only)
- Run a JavaScript-only backend using Node.js and Docker
- Expose a `/detect` API for real-time object detection

This setup is intended for a hackathon-scale project.

---

## 1. Export YOLOv8n to ONNX (One-Time Step)

Python is only required for this export step.
The backend runtime does not require Python.

### 1.1 Create a virtual environment

```bash
python3 -m venv .venv-yolo
source .venv-yolo/bin/activate
pip install --upgrade pip
```

### 1.2 Install Ultralytics

```bash
pip install ultralytics
```

### 1.3 Export YOLOv8n to ONNX

```bash
yolo export model=yolov8n.pt format=onnx opset=12 simplify
```

This produces a file named:

```
yolov8n.onnx
```

### 1.4 Move the model into the backend

```bash
mkdir -p backend/model
mv yolov8n.onnx backend/model/yolov8n.onnx
deactivate
```

---

## 2. Backend Dependencies (Node.js)

From the `/backend` directory:

```bash
npm init -y
npm install express multer sharp onnxruntime-node
```

---

## 3. Backend File Structure

```
backend/
  model/
    yolov8n.onnx
    labels.json
  src/
    server.js
    yolo.js
    preprocess.js
    postprocess.js
    bins.js
  Dockerfile
  package.json
```