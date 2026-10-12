"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Logo } from "@/components/logo";
import { PreviewDialog } from "@/components/preview-dialog";
import { WelcomeDialog } from "@/components/welcome-dialog";
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
import type { PlacedImage } from "@/lib/scene";

const PLACE_OFFSET = 48;

export function ClipEditor() {
  const inputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef<PlacedImage[]>([]);
  const nextSlotRef = useRef(0);
  const mountedRef = useRef(true);
  const sliceCountRef = useRef(DEFAULT_SLICES);
  const [sliceCount, setSliceCount] = useState(DEFAULT_SLICES);
  const [background, setBackground] = useState(DEFAULT_BACKGROUND);
  const [radius, setRadius] = useState(DEFAULT_RADIUS);
  const [images, setImages] = useState<PlacedImage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isExporting, startExport] = useTransition();

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      for (const item of imagesRef.current) URL.revokeObjectURL(item.url);
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

  function updateFrame(id: string, frame: Frame) {
    setImages((current) => {
      const next = current.map((item) =>
        item.id === id ? { ...item, frame } : item,
      );
      imagesRef.current = next;
      return next;
    });
  }

  function removeSelected() {
    const id = selectedId;
    if (!id) return;
    const item = imagesRef.current.find((image) => image.id === id);
    if (!item) return;
    URL.revokeObjectURL(item.url);
    const next = imagesRef.current.filter((image) => image.id !== id);
    imagesRef.current = next;
    setImages(next);
    setSelectedId(null);
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Delete" && event.key !== "Backspace") return;
      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement &&
          (target.isContentEditable || target.closest("[role='dialog']")))
      ) {
        return;
      }
      if (!selectedId) return;
      event.preventDefault();
      removeSelected();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedId]);

  function clearImages() {
    for (const item of imagesRef.current) URL.revokeObjectURL(item.url);
    imagesRef.current = [];
    nextSlotRef.current = 0;
    setImages([]);
    setSelectedId(null);
    setPreviewOpen(false);
    setError(null);
  }

  function openPicker() {
    inputRef.current?.click();
  }

  function loadFiles(fileList: FileList | File[]) {
    const files = [...fileList].filter((file) => file.type.startsWith("image/"));
    if (files.length === 0) {
      setError("Choose an image file");
      return;
    }

    setError(null);
    const start = nextSlotRef.current;
    nextSlotRef.current += files.length;
    files.forEach((file, index) => loadFile(file, start + index));
  }

  function loadFile(file: File, slot: number) {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      if (!mountedRef.current) {
        URL.revokeObjectURL(url);
        return;
      }
      if (img.naturalWidth === 0 || img.naturalHeight === 0) {
        URL.revokeObjectURL(url);
        setError("Couldn't read this image");
        return;
      }
      const count = sliceCountRef.current;
      const base = containFrame(
        img.naturalWidth,
        img.naturalHeight,
        TILE_WIDTH * count,
        TILE_HEIGHT,
      );
      const offset = slot * PLACE_OFFSET;
      const dot = file.name.lastIndexOf(".");
      const name = (dot > 0 ? file.name.slice(0, dot) : file.name) || "slice";
      const placed: PlacedImage = {
        id: crypto.randomUUID(),
        name,
        url,
        image: img,
        frame: {
          ...base,
          x: base.x + offset,
          y: base.y + offset,
        },
      };
      setImages((current) => {
        const next = [...current, placed];
        imagesRef.current = next;
        return next;
      });
      setSelectedId(placed.id);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      if (!mountedRef.current) return;
      setError("Couldn't read this image");
    };
    img.src = url;
  }

  function handleExport() {
    const first = images[0];
    if (!first) return;
    setError(null);
    startExport(async () => {
      try {
        await exportSlices({
          images,
          sliceCount,
          background,
          radius,
          fileName: first.name,
        });
      } catch {
        setError("Export failed. Try again.");
      }
    });
  }

  return (
    <div
      className="flex flex-col-reverse md:flex-row h-dvh overflow-hidden bg-background text-foreground select-none"
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
        const fileList = event.dataTransfer.files;
        if (fileList.length > 0) loadFiles(fileList);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(event) => {
          const fileList = event.target.files;
          if (fileList && fileList.length > 0) loadFiles(fileList);
          event.target.value = "";
        }}
      />
      <aside className="md:w-72 p-2 pl-4">
        <SidePanel
          sliceCount={sliceCount}
          background={background}
          radius={radius}
          hasImage={images.length > 0}
          exporting={isExporting}
          error={error}
          onSliceCount={updateSliceCount}
          onBackground={setBackground}
          onRadius={updateRadius}
          onPick={openPicker}
          onNew={clearImages}
          onPreview={() => setPreviewOpen(true)}
          onExport={handleExport}
        />
      </aside>
      <PreviewDialog
        open={previewOpen}
        images={images}
        sliceCount={sliceCount}
        background={background}
        radius={radius}
        onOpenChange={setPreviewOpen}
      />
      <WelcomeDialog />
      <div className="relative min-h-0 min-w-0 flex-1">
        <div className="pointer-events-none absolute inset-x-0 top-4 z-10 flex justify-center">
          <Logo className="size-6" />
        </div>
        <Stage
          sliceCount={sliceCount}
          background={background}
          radius={radius}
          images={images}
          selectedId={selectedId}
          dragOver={dragOver}
          onSelect={setSelectedId}
          onFrameChange={updateFrame}
          onPick={openPicker}
        />
        <div className="absolute right-3 bottom-3 space-x-2 text-right text-xs text-muted-foreground">

          <span className="">
            DESIGN BY <a className="hover:underline text-body hover:text-foreground" href="https://x.com/qilei" target="_blank"> @qilei</a>
          </span>
          <span>
            WITH <a href="https://bon-ui.com" className="hover:underline text-body hover:text-foreground" target="_blank"> bon-ui</a>
          </span>
        </div>
      </div>
    </div>
  );
}
