import { TILE_HEIGHT, TILE_WIDTH } from "@/lib/constants";
import { drawScene, type PlacedImage } from "@/lib/scene";

export async function exportSlices(options: {
  images: PlacedImage[];
  sliceCount: number;
  background: string;
  radius: number;
  fileName: string;
}) {
  const { zip } = await import("fflate");
  const canvas = document.createElement("canvas");
  canvas.width = TILE_WIDTH * options.sliceCount;
  canvas.height = TILE_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas unavailable");
  }

  drawScene(ctx, {
    sliceCount: options.sliceCount,
    background: options.background,
    radius: options.radius,
    images: options.images,
  });

  const base = exportBaseName(options.fileName);
  const files: Record<string, Uint8Array> = {};

  for (let index = 0; index < options.sliceCount; index += 1) {
    const slice = document.createElement("canvas");
    slice.width = TILE_WIDTH;
    slice.height = TILE_HEIGHT;
    const sliceCtx = slice.getContext("2d");
    if (!sliceCtx) {
      throw new Error("Canvas unavailable");
    }
    sliceCtx.drawImage(
      canvas,
      index * TILE_WIDTH,
      0,
      TILE_WIDTH,
      TILE_HEIGHT,
      0,
      0,
      TILE_WIDTH,
      TILE_HEIGHT,
    );
    files[`${base}-${index + 1}.png`] = await canvasToPng(slice);
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

function canvasToPng(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("PNG export failed"));
        return;
      }
      blob.arrayBuffer().then(
        (buffer) => resolve(new Uint8Array(buffer)),
        reject,
      );
    }, "image/png");
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
  return cleaned || "clip";
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
