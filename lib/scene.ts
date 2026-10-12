import { TILE_HEIGHT, TILE_WIDTH } from "@/lib/constants";
import type { Frame } from "@/lib/frame";

export function clampedRadius(radius: number, frame: Frame) {
  return Math.min(Math.max(0, radius), frame.width / 2, frame.height / 2);
}

export function drawScene(
  ctx: CanvasRenderingContext2D,
  options: {
    sliceCount: number;
    background: string;
    radius: number;
    image: CanvasImageSource | null;
    frame: Frame | null;
  },
) {
  const width = TILE_WIDTH * options.sliceCount;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = options.background;
  ctx.fillRect(0, 0, width, TILE_HEIGHT);

  if (!options.image || !options.frame) return;

  const { frame } = options;
  const radius = clampedRadius(options.radius, frame);
  ctx.save();
  if (radius > 0) {
    ctx.beginPath();
    ctx.roundRect(frame.x, frame.y, frame.width, frame.height, radius);
    ctx.clip();
  }
  ctx.drawImage(options.image, frame.x, frame.y, frame.width, frame.height);
  ctx.restore();
}
