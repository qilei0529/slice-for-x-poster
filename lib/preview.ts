import { TILE_HEIGHT, TILE_WIDTH } from "@/lib/constants";
import { drawScene, type PlacedImage } from "@/lib/scene";

const PREVIEW_TILE_WIDTH = 400;

export function revokePreviewUrls(urls: string[]) {
  for (const url of urls) URL.revokeObjectURL(url);
}

export async function renderPreviewSlices(options: {
  images: PlacedImage[];
  sliceCount: number;
  background: string;
  radius: number;
}) {
  const scale = PREVIEW_TILE_WIDTH / TILE_WIDTH;
  const tileW = PREVIEW_TILE_WIDTH;
  const tileH = Math.round(TILE_HEIGHT * scale);
  const full = document.createElement("canvas");
  full.width = tileW * options.sliceCount;
  full.height = tileH;
  const ctx = full.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  drawScene(ctx, options);

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
