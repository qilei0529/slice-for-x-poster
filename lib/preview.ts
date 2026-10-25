import { drawScene, type PlacedImage } from "@/lib/scene";

export function revokePreviewUrls(urls: string[]) {
  for (const url of urls) URL.revokeObjectURL(url);
}

export async function renderPreviewSlices(options: {
  images: PlacedImage[];
  sliceCount: number;
  tileWidth: number;
  tileHeight: number;
  background: string;
  radius: number;
}) {
  // Match export pixel size so preview tiles are the same dimensions as the zip.
  const { tileWidth: tileW, tileHeight: tileH } = options;
  const full = document.createElement("canvas");
  full.width = tileW * options.sliceCount;
  full.height = tileH;
  const ctx = full.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  drawScene(ctx, {
    sliceCount: options.sliceCount,
    tileWidth: options.tileWidth,
    tileHeight: options.tileHeight,
    background: options.background,
    radius: options.radius,
    images: options.images,
  });

  const urls: string[] = [];
  try {
    for (let index = 0; index < options.sliceCount; index += 1) {
      const slice = document.createElement("canvas");
      slice.width = tileW;
      slice.height = tileH;
      const sliceCtx = slice.getContext("2d");
      if (!sliceCtx) throw new Error("Canvas unavailable");
      sliceCtx.drawImage(
        full,
        index * tileW,
        0,
        tileW,
        tileH,
        0,
        0,
        tileW,
        tileH,
      );
      urls.push(URL.createObjectURL(await canvasToBlob(slice)));
    }
    return urls;
  } catch (error) {
    revokePreviewUrls(urls);
    throw error;
  }
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Preview failed"));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}
