import sharp from "sharp";
import ort from "onnxruntime-node";

export async function preprocessToTensor(buffer, size = 640) {
  const img = sharp(buffer).removeAlpha();
  const meta = await img.metadata();

  const origW = meta.width;
  const origH = meta.height;

  const scale = Math.min(size / origW, size / origH);
  const w = Math.round(origW * scale);
  const h = Math.round(origH * scale);
  const padX = Math.floor((size - w) / 2);
  const padY = Math.floor((size - h) / 2);

  const { data } = await img
    .resize(w, h)
    .extend({
      top: padY,
      bottom: size - h - padY,
      left: padX,
      right: size - w - padX,
      background: { r: 114, g: 114, b: 114 }
    })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const hw = size * size;
  const input = new Float32Array(3 * hw);

  for (let i = 0; i < hw; i++) {
    input[i] = data[i * 3] / 255;
    input[i + hw] = data[i * 3 + 1] / 255;
    input[i + 2 * hw] = data[i * 3 + 2] / 255;
  }

  return {
    tensor: new ort.Tensor("float32", input, [1, 3, size, size]),
    meta: { size, scale, padX, padY, origW, origH }
  };
}
