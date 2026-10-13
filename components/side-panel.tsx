"use client";

import { useEffect, useRef, useState } from "react";
import { Panel, PanelFoot, PanelHead } from "@/components/element/panel";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import {
  MAX_RADIUS,
  MAX_SLICES,
  MAX_TILE_EDGE,
  MIN_SLICES,
  MIN_TILE_EDGE,
  clampTileEdge,
} from "@/lib/constants";
import { cn } from "@/lib/cn";

const selectedSwatchClass =
  "ring-2 ring-foreground ring-offset-2 ring-offset-background";

function isSameColor(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

const BACKGROUND_PRESETS = [
  { label: "Black", value: "#000000" },
  { label: "White", value: "#f4f4f4" },
  { label: "Light gray", value: "#e0e0e0" },
] as const;

const paletteSwatchStyle = {
  background:
    "conic-gradient(#ff3b30, #ffcc00, #34c759, #32ade6, #5856d6, #ff2d55, #ff3b30)",
} as const;

type SidePanelProps = {
  sliceCount: number;
  tileWidth: number;
  tileHeight: number;
  background: string;
  radius: number;
  hasImage: boolean;
  exporting: boolean;
  error: string | null;
  onSliceCount: (count: number) => void;
  onTileWidth: (width: number) => void;
  onTileHeight: (height: number) => void;
  onBackground: (color: string) => void;
  onRadius: (radius: number) => void;
  onPick: () => void;
  onNew: () => void;
  onPreview: () => void;
  onExport: () => void;
};

export function SidePanel({
  sliceCount,
  tileWidth,
  tileHeight,
  background,
  radius,
  hasImage,
  exporting,
  error,
  onSliceCount,
  onTileWidth,
  onTileHeight,
  onBackground,
  onRadius,
  onPick,
  onNew,
  onPreview,
  onExport,
}: SidePanelProps) {
  const width = tileWidth * sliceCount;
  const [customColor, setCustomColor] = useState<string | null>(null);

  function selectPreset(color: string) {
    setCustomColor(null);
    onBackground(color);
  }

  function selectCustom(color: string) {
    setCustomColor(color);
    onBackground(color);
  }

  return (
    <Panel className="min-h-full">
      <PanelHead
        title="Slice for X"
        description={`Slice picture into tiles.`}
      >
        {hasImage ? (
          <Button type="button" variant="outline" size="sm" onClick={onNew}>
            New
          </Button>
        ) : null}
      </PanelHead>

      <Button type="button" variant="outline" onClick={onPick}>
        {hasImage ? "Add image" : "Choose image"}
      </Button>

      <div className="flex flex-row justify-between items-center gap-stack-tight">
        <span className="text-caption text-muted-foreground">Tile</span>
        <div className="flex items-center gap-1">
          <TileEdgeInput
            label="Tile width"
            value={tileWidth}
            onChange={onTileWidth}
          />
          <span className="text-caption text-muted-foreground">×</span>
          <TileEdgeInput
            label="Tile height"
            value={tileHeight}
            onChange={onTileHeight}
          />
        </div>
      </div>

      <div className="flex flex-row justify-between items-center gap-stack-tight">
        <span className="text-caption text-muted-foreground">Count</span>
        <ButtonGroup aria-label="Tile count">
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label="Fewer tiles"
            disabled={sliceCount <= MIN_SLICES}
            onClick={() => onSliceCount(sliceCount - 1)}
          >
            −
          </Button>
          <Button type="button" variant="outline" size="sm" className="text-md w-8" tabIndex={-1}>
            {sliceCount}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label="More tiles"
            disabled={sliceCount >= MAX_SLICES}
            onClick={() => onSliceCount(sliceCount + 1)}
          >
            +
          </Button>
        </ButtonGroup>
      </div>

      <div className="flex flex-row justify-between items-center gap-stack-tight">
        <p className="text-caption text-muted-foreground">Size</p>
        <p className="text-body text-foreground tabular-nums">
          {width} × {tileHeight}
        </p>
      </div>

      <label className="flex items-center justify-between gap-inline">
        <span className="text-caption text-muted-foreground">Radius</span>
        <Input
          type="number"
          min={0}
          max={MAX_RADIUS}
          step={1}
          value={radius}
          aria-label="Corner radius"
          onValueChange={(value) => {
            const next = Number(value);
            onRadius(Number.isNaN(next) ? 0 : next);
          }}
          size="sm"
          className="w-10 tabular-nums [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&_input[type=number]]:appearance-none"
          style={{
            MozAppearance: "textfield",
          }}
        />
      </label>

      <div className="flex items-center justify-between gap-inline">
        <span className="text-caption text-muted-foreground">Background</span>
        <div className="flex items-center gap-inline">
          {BACKGROUND_PRESETS.map((preset) => {
            const selected =
              customColor == null && isSameColor(background, preset.value);
            return (
              <button
                key={preset.value}
                type="button"
                aria-label={preset.label}
                aria-pressed={selected}
                onClick={() => selectPreset(preset.value)}
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
              "relative size-5 overflow-hidden rounded-control ring-2 ring-foreground/20 hover:ring-foreground/50",
              customColor != null && selectedSwatchClass,
            )}
            style={
              customColor != null
                ? { backgroundColor: customColor }
                : paletteSwatchStyle
            }
          >
            <input
              type="color"
              value={customColor ?? "#ff3b30"}
              aria-label="Custom color"
              aria-pressed={customColor != null}
              onChange={(event) => selectCustom(event.target.value)}
              className="absolute inset-0 size-full cursor-pointer opacity-0"
            />
          </span>
        </div>
      </div>

      {error ? <p className="text-caption text-destructive">{error}</p> : null}

      <PanelFoot>
        <Button
          type="button"
          variant="outline"
          disabled={!hasImage}
          onClick={onPreview}
        >
          Preview
        </Button>
        <Button
          type="button"
          disabled={!hasImage || exporting}
          onClick={onExport}
        >
          {exporting ? "Exporting…" : "Export PNG"}
        </Button>
      </PanelFoot>
    </Panel>
  );
}

function TileEdgeInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
}) {
  const focused = useRef(false);
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    if (!focused.current) setDraft(String(value));
  }, [value]);

  function commit(raw: string) {
    const parsed = Number(raw);
    const next = clampTileEdge(
      raw === "" || Number.isNaN(parsed) ? value : parsed,
    );
    setDraft(String(next));
    onChange(next);
  }

  return (
    <Input
      type="number"
      min={MIN_TILE_EDGE}
      max={MAX_TILE_EDGE}
      step={1}
      value={draft}
      aria-label={label}
      size="sm"
      onFocus={() => {
        focused.current = true;
      }}
      onBlur={() => {
        focused.current = false;
        commit(draft);
      }}
      onValueChange={(next) => {
        setDraft(next);
        const parsed = Number(next);
        if (next === "" || Number.isNaN(parsed)) return;
        onChange(parsed);
      }}
      className="w-13 tabular-nums text-xs [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&_input[type=number]]:appearance-none"
      style={{
        MozAppearance: "textfield",
      }}
    />
  );
}
