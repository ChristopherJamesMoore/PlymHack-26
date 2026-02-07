// src/server.mjs
import express from "express";
import multer from "multer";
import fs from "node:fs";

import { loadModel, detect } from "./yolo.mjs";
import { mapToBin } from "./bins.mjs";

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const PORT = process.env.PORT || 3000;

const labels = JSON.parse(
  fs.readFileSync(new URL("../model/labels.json", import.meta.url), "utf8")
);

app.get("/health", (req, res) => res.json({ ok: true }));

app.post("/detect", upload.single("image"), async (req, res) => {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({ error: "No image uploaded. Use multipart field name 'image'." });
    }

    const detections = await detect(req.file.buffer, {
      inputSize: 640,
      confThres: 0.35,
      iouThres: 0.45,
      maxDet: 5,
    });

    const sorted = [...detections].sort((a, b) => b.conf - a.conf);
    const top = sorted[0] || null;

    const label = top ? (labels[top.classId] ?? `class_${top.classId}`) : "unknown";
    const bin = mapToBin(label);

    res.json({
      top: top ? { ...top, label } : null,
      bin,
      detections: sorted.map(d => ({ ...d, label: labels[d.classId] ?? `class_${d.classId}` })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message ?? "Server error" });
  }
});

async function main() {
  await loadModel("model/yolov8n.onnx");
  app.listen(PORT, () => console.log(`API listening on :${PORT}`));
}

main().catch((err) => {
  console.error("Startup failed:", err);
  process.exit(1);
});
