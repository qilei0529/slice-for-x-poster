import { MIN_FRAME_EDGE } from "@/lib/constants";

export type Frame = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Point = {
  x: number;
  y: number;
};

export type Corner = "nw" | "ne" | "sw" | "se";

export function containFrame(
  imageWidth: number,
  imageHeight: number,
  canvasWidth: number,
  canvasHeight: number,
): Frame {
  const scale = Math.min(canvasWidth / imageWidth, canvasHeight / imageHeight);
  const width = imageWidth * scale;
  const height = imageHeight * scale;

  return {
    x: (canvasWidth - width) / 2,
    y: (canvasHeight - height) / 2,
    width,
    height,
  };
}

export function resizeFrame(start: Frame, corner: Corner, pointer: Point): Frame {
  const anchor = oppositeCorner(corner, start);
  const handle = cornerPoint(corner, start);
  const originX = handle.x - anchor.x;
  const originY = handle.y - anchor.y;
  const pointerX = pointer.x - anchor.x;
  const pointerY = pointer.y - anchor.y;
  const denominator = originX * originX + originY * originY;
  const projected =
    denominator === 0
      ? 1
      : (pointerX * originX + pointerY * originY) / denominator;
  const minScale = MIN_FRAME_EDGE / Math.max(start.width, start.height);
  const scale = Math.max(projected, minScale);
  const width = start.width * scale;
  const height = start.height * scale;

  return {
    x: originX < 0 ? anchor.x - width : anchor.x,
    y: originY < 0 ? anchor.y - height : anchor.y,
    width,
    height,
  };
}

function oppositeCorner(corner: Corner, frame: Frame): Point {
  const right = frame.x + frame.width;
  const bottom = frame.y + frame.height;

  switch (corner) {
    case "nw":
      return { x: right, y: bottom };
    case "ne":
      return { x: frame.x, y: bottom };
    case "sw":
      return { x: right, y: frame.y };
    case "se":
      return { x: frame.x, y: frame.y };
  }
}

function cornerPoint(corner: Corner, frame: Frame): Point {
  const right = frame.x + frame.width;
  const bottom = frame.y + frame.height;

  switch (corner) {
    case "nw":
      return { x: frame.x, y: frame.y };
    case "ne":
      return { x: right, y: frame.y };
    case "sw":
      return { x: frame.x, y: bottom };
    case "se":
      return { x: right, y: bottom };
  }
}
