export const DEFAULT_TILE_WIDTH = 1646;
export const DEFAULT_TILE_HEIGHT = 2048;
export const MIN_TILE_EDGE = 64;
export const MAX_TILE_EDGE = 4096;

export function clampTileEdge(value: number) {
  const rounded = Math.round(value);
  if (Number.isNaN(rounded)) return MIN_TILE_EDGE;
  return Math.min(MAX_TILE_EDGE, Math.max(MIN_TILE_EDGE, rounded));
}
export const MIN_SLICES = 1;
export const MAX_SLICES = 4;
export const DEFAULT_SLICES = 2;
export const DEFAULT_BACKGROUND = "#f4f4f4";
export const DEFAULT_RADIUS = 0;
export const MAX_RADIUS = 480;
export const MIN_FRAME_EDGE = 32;
