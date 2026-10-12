import { TILE_HEIGHT, TILE_WIDTH } from "@/lib/constants";
import type { Frame } from "@/lib/frame";

export function drawScene(
  ctx: CanvasRenderingContext2D,
  options: {
    sliceCount: number;
    background: string;
    image: CanvasImageSource | null;
    frame: Frame | null;
  },
) {
  const width = TILE_WIDTH * options.sliceCount;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = options.background;
  ctx.fillRect(0, 0, width, TILE_HEIGHT);

  if (options.image && options.frame) {
    ctx.drawImage(
      options.image,
      options.frame.x,
      options.frame.y,
      options.frame.width,
      options.frame.height,
    );
  }
}
