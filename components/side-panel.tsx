"use client";

import { useEffect, useRef, useState } from "react";
import { version } from "@/package.json";
import { FieldGroup } from "@/components/element/field-group";
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

const fieldLabelClass = "text-body text-muted-foreground";

function isSameColor(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

const BACKGROUND_PRESETS = [
  { label: "Black", value: "#000000", agent: "bg-black" },
  { label: "White", value: "#f4f4f4", agent: "bg-white" },
  { label: "Light gray", value: "#e0e0e0", agent: "bg-light-gray" },
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
  displayWidth: number;
  displayHeight: number;
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
  displayWidth,
  displayHeight,
}: SidePanelProps) {
  const width = tileWidth * sliceCount;
  const shown =
    displayWidth > 0 && displayHeight > 0
      ? `${Math.round(displayWidth)} × ${Math.round(displayHeight)}`
      : null;
  const scale =
    shown != null && width > 0
      ? `${Math.round((displayWidth / width) * 100)}%`
      : null;
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
        version={`v${version}`}
        description={`Slice picture into tiles.`}
      >
        {hasImage ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-agent="new"
            onClick={onNew}
          >
            New
          </Button>
        ) : null}
      </PanelHead>

      <div className="flex flex-col gap-text-block">
        <FieldGroup label="Canvas">
          <div className="flex flex-row justify-between items-center gap-stack-tight">
            <span className={fieldLabelClass}>Tile</span>
            <div className="flex items-center gap-1">
              <TileEdgeInput
                label="Tile width"
                agent="tile-width"
                value={tileWidth}
                onChange={onTileWidth}
              />
              <span className={fieldLabelClass}>×</span>
              <TileEdgeInput
                label="Tile height"
                agent="tile-height"
                value={tileHeight}
                onChange={onTileHeight}
              />
            </div>
          </div>

          <div className="flex flex-row justify-between items-center gap-stack-tight">
            <span className={fieldLabelClass}>Count</span>
            <ButtonGroup aria-label="Tile count">
              <Button
                type="button"
                variant="outline"
                size="sm"
                aria-label="Fewer tiles"
                data-agent="fewer-tiles"
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
                data-agent="more-tiles"
                disabled={sliceCount >= MAX_SLICES}
                onClick={() => onSliceCount(sliceCount + 1)}
              >
                +
              </Button>
            </ButtonGroup>
          </div>

          <div className="flex flex-row justify-between items-center gap-stack-tight">
            <p className={fieldLabelClass}>Size</p>
            <p className="text-body text-foreground tabular-nums">
              {width} × {tileHeight}
            </p>
          </div>

          <div className="flex flex-row justify-between items-center gap-stack-tight">
            <p className={fieldLabelClass}>Shown</p>
            <p className="text-body text-foreground tabular-nums">
              {shown ?? "—"}
            </p>
          </div>

          <div className="flex flex-row justify-between items-center gap-stack-tight">
            <p className={fieldLabelClass}>Scale</p>
            <p className="text-body text-foreground tabular-nums">
              {scale ?? "—"}
            </p>
          </div>

          <div className="flex items-center justify-between gap-inline">
            <span className={fieldLabelClass}>Background</span>
            <div className="flex items-center gap-inline">
              {BACKGROUND_PRESETS.map((preset) => {
                const selected =
                  customColor == null && isSameColor(background, preset.value);
                return (
                  <button
                    key={preset.value}
                    type="button"
                    aria-label={preset.label}
                    data-agent={preset.agent}
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
                  data-agent="bg-custom"
                  aria-pressed={customColor != null}
                  onChange={(event) => selectCustom(event.target.value)}
                  className="absolute inset-0 size-full cursor-pointer opacity-0"
                />
              </span>
            </div>
          </div>
        </FieldGroup>

        <FieldGroup label="Image">
          <Button
            type="button"
            variant="outline"
            data-agent="choose-image"
            onClick={onPick}
          >
            {hasImage ? "Add image" : "Choose image"}
          </Button>

          <label className="flex items-center justify-between gap-inline">
            <span className={fieldLabelClass}>Radius</span>
            <Input
              type="number"
              min={0}
              max={MAX_RADIUS}
              step={1}
              value={radius}
              aria-label="Corner radius"
              data-agent="corner-radius"
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
        </FieldGroup>
      </div>

      {error ? <p className="text-caption text-destructive">{error}</p> : null}

      <PanelFoot>
        <Button
          type="button"
          variant="outline"
          data-agent="preview"
          disabled={!hasImage}
          onClick={onPreview}
        >
          Preview
        </Button>
        <Button
          type="button"
          data-agent="export"
          disabled={!hasImage || exporting}
          onClick={onExport}
        >
          {exporting ? "Exporting…" : "Export JPG"}
        </Button>
      </PanelFoot>
    </Panel>
  );
}

function TileEdgeInput({
  label,
  agent,
  value,
  onChange,
}: {
  label: string;
  agent: string;
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
      data-agent={agent}
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
