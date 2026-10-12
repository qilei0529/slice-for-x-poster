"use client";

import {
  MAX_RADIUS,
  MAX_SLICES,
  MIN_SLICES,
  TILE_HEIGHT,
  TILE_WIDTH,
} from "@/lib/constants";

type SidePanelProps = {
  sliceCount: number;
  background: string;
  radius: number;
  hasImage: boolean;
  exporting: boolean;
  error: string | null;
  onSliceCount: (count: number) => void;
  onBackground: (color: string) => void;
  onRadius: (radius: number) => void;
  onPick: () => void;
  onExport: () => void;
};

export function SidePanel({
  sliceCount,
  background,
  radius,
  hasImage,
  exporting,
  error,
  onSliceCount,
  onBackground,
  onRadius,
  onPick,
  onExport,
}: SidePanelProps) {
  const width = TILE_WIDTH * sliceCount;

  return (
    <aside className="absolute top-4 left-4 z-20 flex max-h-[calc(100dvh-2rem)] w-[272px] flex-col gap-5 overflow-auto rounded-2xl border border-white/10 bg-[#161616]/95 p-4 shadow-[0_16px_50px_rgba(0,0,0,0.45)] backdrop-blur-md">
      <div>
        <p className="text-[11px] font-medium tracking-[0.16em] text-white/45 uppercase">
          Clip for X
        </p>
        <p className="mt-1 text-sm text-white/70">
          每张 {TILE_WIDTH} × {TILE_HEIGHT}
        </p>
      </div>

      <button
        type="button"
        onClick={onPick}
        className="h-9 rounded-lg border border-white/15 text-sm text-white hover:bg-white/5"
      >
        {hasImage ? "更换图片" : "选择图片"}
      </button>

      <div className="flex flex-col gap-2">
        <span className="text-xs text-white/50">张数</span>
        <div className="flex items-center justify-between rounded-lg border border-white/10">
          <button
            type="button"
            aria-label="减少张数"
            disabled={sliceCount <= MIN_SLICES}
            onClick={() => onSliceCount(sliceCount - 1)}
            className="h-9 w-10 text-lg text-white disabled:text-white/25"
          >
            −
          </button>
          <span className="text-sm tabular-nums">{sliceCount}</span>
          <button
            type="button"
            aria-label="增加张数"
            disabled={sliceCount >= MAX_SLICES}
            onClick={() => onSliceCount(sliceCount + 1)}
            className="h-9 w-10 text-lg text-white disabled:text-white/25"
          >
            +
          </button>
        </div>
      </div>

      <div>
        <p className="text-xs text-white/50">尺寸</p>
        <p className="mt-1 text-sm tabular-nums">
          {width} × {TILE_HEIGHT}
        </p>
      </div>

      <label className="flex flex-col gap-2">
        <span className="flex items-center justify-between text-xs text-white/50">
          <span>圆角</span>
          <span className="tabular-nums text-white/80">{radius} px</span>
        </span>
        <input
          type="range"
          min={0}
          max={MAX_RADIUS}
          step={1}
          value={radius}
          aria-label="圆角"
          onChange={(event) => onRadius(Number(event.target.value))}
          className="h-1.5 w-full cursor-pointer accent-white"
        />
      </label>

      <label className="flex items-center justify-between gap-3">
        <span className="text-xs text-white/50">背景</span>
        <span className="relative h-8 w-8 overflow-hidden rounded-md border border-white/15">
          <input
            type="color"
            value={background}
            aria-label="背景色"
            onChange={(event) => onBackground(event.target.value)}
            className="absolute -inset-1 h-12 w-12 cursor-pointer border-0 bg-transparent p-0"
          />
        </span>
      </label>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          disabled={!hasImage || exporting}
          onClick={onExport}
          className="h-10 rounded-lg bg-[#f5f5f4] text-sm font-medium text-[#111] disabled:cursor-not-allowed disabled:opacity-35"
        >
          {exporting ? "导出中…" : "导出 PNG"}
        </button>
        {error ? <p className="text-xs text-red-300">{error}</p> : null}
      </div>
    </aside>
  );
}
