"use client";

import { Panel, PanelFoot, PanelHead } from "@/components/element/panel";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import {
  MAX_RADIUS,
  MAX_SLICES,
  MIN_SLICES,
  TILE_HEIGHT,
  TILE_WIDTH,
} from "@/lib/constants";
import { cn } from "@/lib/cn";

const selectedSwatchClass =
  "ring-2 ring-foreground ring-offset-2 ring-offset-background";

function isSameColor(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

const BACKGROUND_PRESETS = [
  { label: "黑色", value: "#000000" },
  { label: "白色", value: "#ffffff" },
  { label: "浅灰", value: "#f4f4f4" },
] as const;

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
  const customSelected = !BACKGROUND_PRESETS.some((preset) =>
    isSameColor(background, preset.value),
  );

  return (
    <Panel className="min-h-full">
      <PanelHead
        title="Clip for X"
        description={`每张 ${TILE_WIDTH} × ${TILE_HEIGHT}`}
      />

      <Button type="button" variant="outline" onClick={onPick}>
        {hasImage ? "更换图片" : "选择图片"}
      </Button>

      <div className="flex flex-row justify-between items-center gap-stack-tight">
        <span className="text-caption text-muted-foreground">张数</span>
        <ButtonGroup aria-label="张数">
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label="减少张数"
            disabled={sliceCount <= MIN_SLICES}
            onClick={() => onSliceCount(sliceCount - 1)}
          >
            −
          </Button>
          <Button type="button" variant="outline" size="sm" tabIndex={-1}>
            {sliceCount}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label="增加张数"
            disabled={sliceCount >= MAX_SLICES}
            onClick={() => onSliceCount(sliceCount + 1)}
          >
            +
          </Button>
        </ButtonGroup>
      </div>

      <div className="flex flex-row justify-between items-center gap-stack-tight">
        <p className="text-caption text-muted-foreground">尺寸</p>
        <p className="text-body text-foreground tabular-nums">
          {width} × {TILE_HEIGHT}
        </p>
      </div>

      <label className="flex items-center justify-between gap-inline">
        <span className="text-caption text-muted-foreground">圆角</span>
        <Input
          type="number"
          min={0}
          max={MAX_RADIUS}
          step={1}
          value={radius}
          aria-label="圆角"
          onValueChange={(value) => {
            const next = Number(value);
            onRadius(Number.isNaN(next) ? 0 : next);
          }}
          className="w-12 tabular-nums"
        />
      </label>

      <div className="flex items-center justify-between gap-inline">
        <span className="text-caption text-muted-foreground">背景</span>
        <div className="flex items-center gap-inline">
          {BACKGROUND_PRESETS.map((preset) => {
            const selected = isSameColor(background, preset.value);
            return (
              <button
                key={preset.value}
                type="button"
                aria-label={preset.label}
                aria-pressed={selected}
                onClick={() => onBackground(preset.value)}
                className={cn(
                  "size-5 rounded-control ring-2 ring-foreground/20 hover:ring-foreground/50",
                  selected && selectedSwatchClass,
                )}
                style={{ backgroundColor: preset.value }}
              />
            );
          })}
          <span
            className={cn(
              "relative size-5 overflow-hidden rounded-control",
              customSelected && selectedSwatchClass,
            )}
          >
            <input
              type="color"
              value={background}
              aria-label="自定义颜色"
              onChange={(event) => onBackground(event.target.value)}
              className="absolute -inset-1 size-8 -mt-0.5 cursor-pointer border-0 bg-transparent p-0"
            />
          </span>
        </div>
      </div>

      {error ? <p className="text-caption text-destructive">{error}</p> : null}

      <PanelFoot>
        <Button
          type="button"
          disabled={!hasImage || exporting}
          onClick={onExport}
        >
          {exporting ? "导出中…" : "导出 PNG"}
        </Button>
      </PanelFoot>
    </Panel>
  );
}
