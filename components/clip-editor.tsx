"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { SidePanel } from "@/components/side-panel";
import { Stage } from "@/components/stage";
import {
  DEFAULT_BACKGROUND,
  DEFAULT_RADIUS,
  DEFAULT_SLICES,
  MAX_RADIUS,
  MAX_SLICES,
  MIN_SLICES,
  TILE_HEIGHT,
  TILE_WIDTH,
} from "@/lib/constants";
import { exportSlices } from "@/lib/export";
import { containFrame, type Frame } from "@/lib/frame";

export function ClipEditor() {
  const inputRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<string | null>(null);
  const sliceCountRef = useRef(DEFAULT_SLICES);
  const loadIdRef = useRef(0);
  const [sliceCount, setSliceCount] = useState(DEFAULT_SLICES);
  const [background, setBackground] = useState(DEFAULT_BACKGROUND);
  const [radius, setRadius] = useState(DEFAULT_RADIUS);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState("clip");
  const [frame, setFrame] = useState<Frame | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isExporting, startExport] = useTransition();

  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  function updateSliceCount(count: number) {
    const next = Math.min(MAX_SLICES, Math.max(MIN_SLICES, count));
    sliceCountRef.current = next;
    setSliceCount(next);
  }

  function updateRadius(next: number) {
    setRadius(Math.min(MAX_RADIUS, Math.max(0, next)));
  }

  function openPicker() {
    inputRef.current?.click();
  }

  function loadFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("请选择图片文件");
      return;
    }

    setError(null);
    const loadId = loadIdRef.current + 1;
    loadIdRef.current = loadId;
    const url = URL.createObjectURL(file);
    const previous = urlRef.current;
    urlRef.current = url;
    const img = new Image();
    img.onload = () => {
      if (loadIdRef.current !== loadId) {
        URL.revokeObjectURL(url);
        return;
      }
      if (img.naturalWidth === 0 || img.naturalHeight === 0) {
        URL.revokeObjectURL(url);
        if (urlRef.current === url) urlRef.current = previous;
        setError("无法读取这张图片");
        return;
      }
      if (previous) URL.revokeObjectURL(previous);
      const count = sliceCountRef.current;
      const dot = file.name.lastIndexOf(".");
      const base = dot > 0 ? file.name.slice(0, dot) : file.name;
      setImage(img);
      setFileName(base || "clip");
      setFrame(
        containFrame(
          img.naturalWidth,
          img.naturalHeight,
          TILE_WIDTH * count,
          TILE_HEIGHT,
        ),
      );
    };
    img.onerror = () => {
      if (loadIdRef.current !== loadId) {
        URL.revokeObjectURL(url);
        return;
      }
      URL.revokeObjectURL(url);
      if (urlRef.current === url) urlRef.current = previous;
      setError("无法读取这张图片");
    };
    img.src = url;
  }

  function handleExport() {
    if (!image || !frame) return;
    setError(null);
    startExport(async () => {
      try {
        await exportSlices({
          image,
          frame,
          sliceCount,
          background,
          radius,
          fileName,
        });
      } catch {
        setError("导出失败，请重试");
      }
    });
  }

  return (
    <div
      className="flex h-dvh overflow-hidden bg-background text-foreground select-none"
      onDragOver={(event) => {
        event.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={(event) => {
        const next = event.relatedTarget;
        if (next instanceof Node && event.currentTarget.contains(next)) return;
        setDragOver(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragOver(false);
        const file = event.dataTransfer.files[0];
        if (file) loadFile(file);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) loadFile(file);
          event.target.value = "";
        }}
      />
      <aside className="flex h-full w-72 shrink-0 flex-col overflow-auto border-r border-border bg-background">
        <SidePanel
          sliceCount={sliceCount}
          background={background}
          radius={radius}
          hasImage={image !== null && frame !== null}
          exporting={isExporting}
          error={error}
          onSliceCount={updateSliceCount}
          onBackground={setBackground}
          onRadius={updateRadius}
          onPick={openPicker}
          onExport={handleExport}
        />
      </aside>
      <div className="min-h-0 min-w-0 flex-1 bg-muted">
        <Stage
          sliceCount={sliceCount}
          background={background}
          radius={radius}
          image={image}
          frame={frame}
          dragOver={dragOver}
          onFrameChange={setFrame}
          onPick={openPicker}
        />
      </div>
    </div>
  );
}
