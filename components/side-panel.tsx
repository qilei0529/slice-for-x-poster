"use client";

import { Panel, PanelFoot, PanelHead } from "@/components/element/panel";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  SliderControl,
  SliderIndicator,
  SliderLabel,
  SliderRoot,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "@/components/ui/slider";
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
    <Panel className="min-h-full rounded-none border-0">
      <PanelHead
        title="Clip for X"
        description={`每张 ${TILE_WIDTH} × ${TILE_HEIGHT}`}
      />

      <Button type="button" variant="outline" onClick={onPick}>
        {hasImage ? "更换图片" : "选择图片"}
      </Button>

      <div className="flex flex-col gap-stack-tight">
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

      <div className="flex flex-col gap-stack-tight">
        <p className="text-caption text-muted-foreground">尺寸</p>
        <p className="text-body text-foreground tabular-nums">
          {width} × {TILE_HEIGHT}
        </p>
      </div>

      <SliderRoot
        min={0}
        max={MAX_RADIUS}
        step={1}
        value={radius}
        onValueChange={(value) => {
          onRadius(typeof value === "number" ? value : (value[0] ?? 0));
        }}
      >
        <div className="flex items-center justify-between gap-inline">
          <SliderLabel>圆角</SliderLabel>
          <SliderValue />
        </div>
        <SliderControl>
          <SliderTrack size="sm">
            <SliderIndicator size="sm" />
            <SliderThumb size="sm" />
          </SliderTrack>
        </SliderControl>
      </SliderRoot>

      <label className="flex items-center justify-between gap-inline">
        <span className="text-caption text-muted-foreground">背景</span>
        <span className="relative size-8 overflow-hidden rounded-control border border-border">
          <input
            type="color"
            value={background}
            aria-label="背景色"
            onChange={(event) => onBackground(event.target.value)}
            className="absolute -inset-1 size-12 cursor-pointer border-0 bg-transparent p-0"
          />
        </span>
      </label>

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
