import { drawScene, type PlacedImage } from "@/lib/scene";

const EXPORT_JPEG_QUALITY = 0.92;

export async function exportSlices(options: {
  images: PlacedImage[];
  sliceCount: number;
  tileWidth: number;
  tileHeight: number;
  background: string;
  radius: number;
  fileName: string;
}) {
  const { zip } = await import("fflate");
  const { tileWidth, tileHeight } = options;
  const canvas = document.createElement("canvas");
  canvas.width = tileWidth * options.sliceCount;
  canvas.height = tileHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas unavailable");
  }

  drawScene(ctx, {
    sliceCount: options.sliceCount,
    tileWidth,
    tileHeight,
    background: options.background,
    radius: options.radius,
    images: options.images,
  });

  const base = exportBaseName(options.fileName);
  const files: Record<string, Uint8Array> = {};

  for (let index = 0; index < options.sliceCount; index += 1) {
    const slice = document.createElement("canvas");
    slice.width = tileWidth;
    slice.height = tileHeight;
    const sliceCtx = slice.getContext("2d");
    if (!sliceCtx) {
      throw new Error("Canvas unavailable");
    }
    sliceCtx.drawImage(
      canvas,
      index * tileWidth,
      0,
      tileWidth,
      tileHeight,
      0,
      0,
      tileWidth,
      tileHeight,
    );
    files[`${base}-${index + 1}.jpg`] = await canvasToJpeg(slice);
  }

  const zipped = await new Promise<Uint8Array>((resolve, reject) => {
    zip(files, { level: 0 }, (error, data) => {
      if (error || !data) {
        reject(error ?? new Error("Zip failed"));
        return;
      }
      resolve(data);
    });
  });

  downloadBytes(zipped, `${base}.zip`);
}

function canvasToJpeg(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("JPEG export failed"));
          return;
        }
        blob.arrayBuffer().then(
          (buffer) => resolve(new Uint8Array(buffer)),
          reject,
        );
      },
      "image/jpeg",
      EXPORT_JPEG_QUALITY,
    );
  });
}

function exportBaseName(fileName: string, date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const name = sanitizeBaseName(fileName).slice(0, 8);
  return `${year}${month}${day}-${name}`;
}

function sanitizeBaseName(fileName: string) {
  const cleaned = fileName.replace(/[\\/:*?"<>|]+/g, "").trim();
  return cleaned || "slice";
}

function downloadBytes(data: Uint8Array, filename: string) {
  const bytes = new Uint8Array(data.byteLength);
  bytes.set(data);
  const blob = new Blob([bytes], { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
