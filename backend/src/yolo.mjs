import ort from "onnxruntime-node";
import { preprocessToTensor } from "./preprocess.mjs";
import { postprocessDetections } from "./postprocess.mjs";

let session = null;

export async function loadModel(modelPath = "model/yolov8n.onnx") {
  if (session) return session;
  session = await ort.InferenceSession.create(modelPath, {
    executionProviders: ["cpu"]
  });
  return session;
}

export async function detect(imageBuffer, opts = {}) {
  if (!session) throw new Error("Model not loaded. Call loadModel() first.");

  const inputSize = opts.inputSize ?? 640;
  const confThres = opts.confThres ?? 0.35;
  const iouThres = opts.iouThres ?? 0.45;
  const maxDet = opts.maxDet ?? 10;

  const { tensor, meta } = await preprocessToTensor(imageBuffer, inputSize);

  const inputName = session.inputNames[0];
  const results = await session.run({ [inputName]: tensor });

  const outputName = session.outputNames[0];
  const output = results[outputName];

  return postprocessDetections(output, meta, { confThres, iouThres, maxDet });
}
