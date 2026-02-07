function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function iou(a, b) {
  const x1 = Math.max(a.x1, b.x1);
  const y1 = Math.max(a.y1, b.y1);
  const x2 = Math.min(a.x2, b.x2);
  const y2 = Math.min(a.y2, b.y2);

  const interW = Math.max(0, x2 - x1);
  const interH = Math.max(0, y2 - y1);
  const inter = interW * interH;

  const areaA = Math.max(0, a.x2 - a.x1) * Math.max(0, a.y2 - a.y1);
  const areaB = Math.max(0, b.x2 - b.x1) * Math.max(0, b.y2 - b.y1);

  return inter / (areaA + areaB - inter + 1e-9);
}

function nms(dets, iouThres = 0.45, maxDet = 10) {
  dets.sort((a, b) => b.conf - a.conf);
  const kept = [];

  for (const d of dets) {
    let keep = true;
    for (const k of kept) {
      if (d.classId === k.classId && iou(d, k) > iouThres) {
        keep = false;
        break;
      }
    }
    if (keep) kept.push(d);
    if (kept.length >= maxDet) break;
  }
  return kept;
}

function unletterbox(box, meta) {
  const { scale, padX, padY, origW, origH } = meta;

  const x1 = (box.x1 - padX) / scale;
  const y1 = (box.y1 - padY) / scale;
  const x2 = (box.x2 - padX) / scale;
  const y2 = (box.y2 - padY) / scale;

  return {
    ...box,
    x1: Math.max(0, Math.min(origW, x1)),
    y1: Math.max(0, Math.min(origH, y1)),
    x2: Math.max(0, Math.min(origW, x2)),
    y2: Math.max(0, Math.min(origH, y2))
  };
}

export function postprocessDetections(outputTensor, meta, opts) {
  const { confThres = 0.35, iouThres = 0.45, maxDet = 10 } = opts ?? {};
  const data = outputTensor.data;
  const dims = outputTensor.dims;

  if (!Array.isArray(dims) || dims.length !== 3 || dims[0] !== 1) {
    throw new Error(`Unexpected output dims: ${dims?.join("x")}`);
  }

  let N, K, layout;
  // YOLOv8 ONNX commonly outputs shape [1, (4+classes), num_dets]
  // e.g. [1,10,8400] for 6 classes. Treat that as KxN.
  if (dims[1] <= 128 && dims[2] > dims[1]) {
    layout = "KxN";
    K = dims[1];
    N = dims[2];
  } else if (dims[1] > dims[2]) {
    layout = "KxN";
    K = dims[1];
    N = dims[2];
  } else {
    layout = "NxK";
    N = dims[1];
    K = dims[2];
  }

  const numClasses = K - 4;
  const dets = [];

  for (let i = 0; i < N; i++) {
    let cx, cy, w, h;

    if (layout === "NxK") {
      const base = i * K;
      cx = data[base + 0];
      cy = data[base + 1];
      w  = data[base + 2];
      h  = data[base + 3];

      let best = -Infinity;
      let bestId = -1;
      for (let c = 0; c < numClasses; c++) {
        const s = data[base + 4 + c];
        if (s > best) { best = s; bestId = c; }
      }

      const conf = sigmoid(best);
      if (conf < confThres) continue;

      dets.push({
        x1: cx - w / 2,
        y1: cy - h / 2,
        x2: cx + w / 2,
        y2: cy + h / 2,
        conf,
        classId: bestId
      });
    } else {
      cx = data[0 * N + i];
      cy = data[1 * N + i];
      w  = data[2 * N + i];
      h  = data[3 * N + i];

      let best = -Infinity;
      let bestId = -1;
      for (let c = 0; c < numClasses; c++) {
        const s = data[(4 + c) * N + i];
        if (s > best) { best = s; bestId = c; }
      }

      const conf = sigmoid(best);
      if (conf < confThres) continue;

      dets.push({
        x1: cx - w / 2,
        y1: cy - h / 2,
        x2: cx + w / 2,
        y2: cy + h / 2,
        conf,
        classId: bestId
      });
    }
  }

  const kept = nms(dets, iouThres, maxDet);
  return kept.map(d => unletterbox(d, meta));
}
