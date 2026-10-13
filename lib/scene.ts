import type { Frame } from "@/lib/frame";

export type PlacedImage = {
  id: string;
  name: string;
  url: string;
  image: HTMLImageElement;
  frame: Frame;
};

export function clampedRadius(radius: number, frame: Frame) {
  return Math.min(Math.max(0, radius), frame.width / 2, frame.height / 2);
}

export function drawScene(
  ctx: CanvasRenderingContext2D,
  options: {
    sliceCount: number;
    tileWidth: number;
    tileHeight: number;
    background: string;
    radius: number;
    images: Array<Pick<PlacedImage, "image" | "frame">>;
  },
) {
  const width = options.tileWidth * options.sliceCount;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = options.background;
  ctx.fillRect(0, 0, width, options.tileHeight);

  for (const item of options.images) {
    const { frame } = item;
    const radius = clampedRadius(options.radius, frame);
    ctx.save();
    if (radius > 0) {
      ctx.beginPath();
      ctx.roundRect(frame.x, frame.y, frame.width, frame.height, radius);
      ctx.clip();
    }
    ctx.drawImage(item.image, frame.x, frame.y, frame.width, frame.height);
    ctx.restore();
  }
}
