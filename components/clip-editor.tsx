"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { version } from "@/package.json";
import { Logo } from "@/components/logo";
import { PreviewDialog } from "@/components/preview-dialog";
import { WelcomeDialog } from "@/components/welcome-dialog";
import { SidePanel } from "@/components/side-panel";
import { Stage } from "@/components/stage";
import {
  type AgentApiHandlers,
  type AgentConfigPatch,
  type LoadImageInput,
  mountSliceForX,
  resolveImageSource,
} from "@/lib/agent-api";
import {
  DEFAULT_BACKGROUND,
  DEFAULT_RADIUS,
  DEFAULT_SLICES,
  DEFAULT_TILE_HEIGHT,
  DEFAULT_TILE_WIDTH,
  MAX_RADIUS,
  MAX_SLICES,
  MIN_SLICES,
  clampTileEdge,
} from "@/lib/constants";
import { exportSlices } from "@/lib/export";
import { containFrame, type Frame } from "@/lib/frame";
import type { PlacedImage } from "@/lib/scene";

const PLACE_OFFSET = 48;

function filesFromClipboard(data: DataTransfer | null) {
  if (!data) return [];
  const files: File[] = [];
  const seen = new Set<string>();

  function add(file: File | null) {
    if (!file || !file.type.startsWith("image/")) return;
    const key = `${file.name}:${file.size}:${file.lastModified}:${file.type}`;
    if (seen.has(key)) return;
    seen.add(key);
    files.push(file);
  }

  for (const item of data.items) {
    if (item.kind === "file") add(item.getAsFile());
  }
  for (const file of data.files) add(file);
  return files;
}

function isTypingTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}

function nameFromFile(file: File) {
  const dot = file.name.lastIndexOf(".");
  return (dot > 0 ? file.name.slice(0, dot) : file.name) || "slice";
}

export function ClipEditor() {
  const inputRef = useRef<HTMLInputElement>(null);
  const loadFilesRef = useRef<(fileList: FileList | File[]) => void>(() => {});
  const handlersRef = useRef<AgentApiHandlers | null>(null);
  const imagesRef = useRef<PlacedImage[]>([]);
  const nextSlotRef = useRef(0);
  const mountedRef = useRef(true);
  const sliceCountRef = useRef(DEFAULT_SLICES);
  const tileWidthRef = useRef(DEFAULT_TILE_WIDTH);
  const tileHeightRef = useRef(DEFAULT_TILE_HEIGHT);
  const backgroundRef = useRef(DEFAULT_BACKGROUND);
  const radiusRef = useRef(DEFAULT_RADIUS);
  const selectedIdRef = useRef<string | null>(null);
  const previewOpenRef = useRef(false);
  const exportingRef = useRef(false);
  const errorRef = useRef<string | null>(null);
  const [sliceCount, setSliceCount] = useState(DEFAULT_SLICES);
  const [tileWidth, setTileWidth] = useState(DEFAULT_TILE_WIDTH);
  const [tileHeight, setTileHeight] = useState(DEFAULT_TILE_HEIGHT);
  const [background, setBackground] = useState(DEFAULT_BACKGROUND);
  const [radius, setRadius] = useState(DEFAULT_RADIUS);
  const [images, setImages] = useState<PlacedImage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [displaySize, setDisplaySize] = useState({ viewW: 0, viewH: 0 });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isExporting, startExport] = useTransition();

  backgroundRef.current = background;
  radiusRef.current = radius;
  selectedIdRef.current = selectedId;
  previewOpenRef.current = previewOpen;
  exportingRef.current = isExporting;
  errorRef.current = error;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      for (const item of imagesRef.current) URL.revokeObjectURL(item.url);
    };
  }, []);

  useEffect(() => {
    return mountSliceForX(
      {
        getState: () => handlersRef.current!.getState(),
        setConfig: (patch) => handlersRef.current!.setConfig(patch),
        loadImage: (input) => handlersRef.current!.loadImage(input),
        clear: () => handlersRef.current!.clear(),
        select: (id) => handlersRef.current!.select(id),
        remove: (id) => handlersRef.current!.remove(id),
        reorder: (id, edge) => handlersRef.current!.reorder(id, edge),
        setFrame: (id, frame) => handlersRef.current!.setFrame(id, frame),
        preview: (open) => handlersRef.current!.preview(open),
        export: () => handlersRef.current!.export(),
      },
      version,
    );
  }, []);

  function updateSliceCount(count: number) {
    const next = Math.min(MAX_SLICES, Math.max(MIN_SLICES, count));
    sliceCountRef.current = next;
    setSliceCount(next);
  }

  function updateTileWidth(width: number) {
    const next = clampTileEdge(width);
    tileWidthRef.current = next;
    setTileWidth(next);
  }

  function updateTileHeight(height: number) {
    const next = clampTileEdge(height);
    tileHeightRef.current = next;
    setTileHeight(next);
  }

  function updateRadius(next: number) {
    const value = Math.min(MAX_RADIUS, Math.max(0, next));
    radiusRef.current = value;
    setRadius(value);
  }

  function updateBackground(color: string) {
    backgroundRef.current = color;
    setBackground(color);
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

  function removeImage(id: string) {
    const item = imagesRef.current.find((image) => image.id === id);
    if (!item) return;
    URL.revokeObjectURL(item.url);
    const next = imagesRef.current.filter((image) => image.id !== id);
    imagesRef.current = next;
    setImages(next);
    setSelectedId(null);
  }

  function reorderImage(id: string, edge: "front" | "back") {
    const current = imagesRef.current;
    const index = current.findIndex((image) => image.id === id);
    if (index < 0) return;
    if (edge === "front" && index === current.length - 1) return;
    if (edge === "back" && index === 0) return;
    const next = current.filter((image) => image.id !== id);
    const item = current[index];
    if (edge === "front") next.push(item);
    else next.unshift(item);
    imagesRef.current = next;
    setImages(next);
  }

  useEffect(() => {
    function onPaste(event: ClipboardEvent) {
      if (isTypingTarget(event.target)) return;
      const files = filesFromClipboard(event.clipboardData);
      if (files.length === 0) return;
      event.preventDefault();
      loadFilesRef.current(files);
    }

    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Delete" && event.key !== "Backspace") return;
      if (isTypingTarget(event.target)) return;
      if (
        event.target instanceof HTMLElement &&
        event.target.closest("[role='dialog']")
      ) {
        return;
      }
      if (!selectedId) return;
      event.preventDefault();
      removeImage(selectedId);
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

  function placeImageFromSrc(
    src: string,
    name: string,
    slot: number,
    objectUrl: boolean,
  ): Promise<{ id: string }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        if (!mountedRef.current) {
          if (objectUrl) URL.revokeObjectURL(src);
          reject(new Error("Editor unmounted"));
          return;
        }
        if (img.naturalWidth === 0 || img.naturalHeight === 0) {
          if (objectUrl) URL.revokeObjectURL(src);
          setError("Couldn't read this image");
          reject(new Error("Couldn't read this image"));
          return;
        }
        const count = sliceCountRef.current;
        const base = containFrame(
          img.naturalWidth,
          img.naturalHeight,
          tileWidthRef.current * count,
          tileHeightRef.current,
        );
        const offset = slot * PLACE_OFFSET;
        const placed: PlacedImage = {
          id: crypto.randomUUID(),
          name,
          url: src,
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
        setError(null);
        resolve({ id: placed.id });
      };
      img.onerror = () => {
        if (objectUrl) URL.revokeObjectURL(src);
        if (!mountedRef.current) {
          reject(new Error("Editor unmounted"));
          return;
        }
        setError("Couldn't read this image");
        reject(new Error("Couldn't read this image"));
      };
      img.src = src;
    });
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
    files.forEach((file, index) => {
      const src = URL.createObjectURL(file);
      void placeImageFromSrc(src, nameFromFile(file), start + index, true);
    });
  }

  loadFilesRef.current = loadFiles;

  async function loadImageFromAgent(
    input: LoadImageInput,
  ): Promise<{ id: string }> {
    const resolved = await resolveImageSource(input);
    if (!mountedRef.current) {
      if (resolved.objectUrl) URL.revokeObjectURL(resolved.src);
      throw new Error("Editor unmounted");
    }
    const slot = nextSlotRef.current;
    nextSlotRef.current += 1;
    try {
      return await placeImageFromSrc(
        resolved.src,
        resolved.name,
        slot,
        resolved.objectUrl,
      );
    } catch (error) {
      throw error instanceof Error ? error : new Error("Couldn't read this image");
    }
  }

  function setConfigFromAgent(patch: AgentConfigPatch) {
    if (patch.sliceCount != null) updateSliceCount(patch.sliceCount);
    if (patch.tileWidth != null) updateTileWidth(patch.tileWidth);
    if (patch.tileHeight != null) updateTileHeight(patch.tileHeight);
    if (patch.background != null) updateBackground(patch.background);
    if (patch.radius != null) updateRadius(patch.radius);
  }

  function handleExport(): Promise<void> {
    const snapshot = imagesRef.current;
    const first = snapshot[0];
    if (!first) {
      return Promise.reject(new Error("No images to export"));
    }
    setError(null);
    return new Promise((resolve, reject) => {
      startExport(async () => {
        try {
          await exportSlices({
            images: snapshot,
            sliceCount: sliceCountRef.current,
            tileWidth: tileWidthRef.current,
            tileHeight: tileHeightRef.current,
            background: backgroundRef.current,
            radius: radiusRef.current,
            fileName: first.name,
          });
          resolve();
        } catch {
          setError("Export failed. Try again.");
          reject(new Error("Export failed"));
        }
      });
    });
  }

  handlersRef.current = {
    getState: () => ({
      sliceCount: sliceCountRef.current,
      tileWidth: tileWidthRef.current,
      tileHeight: tileHeightRef.current,
      background: backgroundRef.current,
      radius: radiusRef.current,
      selectedId: selectedIdRef.current,
      previewOpen: previewOpenRef.current,
      exporting: exportingRef.current,
      error: errorRef.current,
      images: imagesRef.current.map((item) => ({
        id: item.id,
        name: item.name,
        frame: { ...item.frame },
      })),
    }),
    setConfig: setConfigFromAgent,
    loadImage: loadImageFromAgent,
    clear: clearImages,
    select: setSelectedId,
    remove: removeImage,
    reorder: reorderImage,
    setFrame: (id, frame) => {
      if (!imagesRef.current.some((item) => item.id === id)) {
        throw new Error(`Unknown image id: ${id}`);
      }
      updateFrame(id, frame);
    },
    preview: (open = true) => setPreviewOpen(open),
    export: handleExport,
  };

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
        data-agent="file-input"
        onChange={(event) => {
          const fileList = event.target.files;
          if (fileList && fileList.length > 0) loadFiles(fileList);
          event.target.value = "";
        }}
      />
      <aside className="md:w-72 p-4">
        <SidePanel
          sliceCount={sliceCount}
          tileWidth={tileWidth}
          tileHeight={tileHeight}
          background={background}
          radius={radius}
          hasImage={images.length > 0}
          exporting={isExporting}
          error={error}
          onSliceCount={updateSliceCount}
          onTileWidth={updateTileWidth}
          onTileHeight={updateTileHeight}
          onBackground={updateBackground}
          onRadius={updateRadius}
          onPick={openPicker}
          onNew={clearImages}
          onPreview={() => setPreviewOpen(true)}
          onExport={() => {
            void handleExport();
          }}
          displayWidth={displaySize.viewW}
          displayHeight={displaySize.viewH}
        />
      </aside>
      <PreviewDialog
        open={previewOpen}
        images={images}
        sliceCount={sliceCount}
        tileWidth={tileWidth}
        tileHeight={tileHeight}
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
          tileWidth={tileWidth}
          tileHeight={tileHeight}
          background={background}
          radius={radius}
          images={images}
          selectedId={selectedId}
          dragOver={dragOver}
          onSelect={setSelectedId}
          onFrameChange={updateFrame}
          onRemove={removeImage}
          onReorder={reorderImage}
          onPick={openPicker}
          onDisplaySize={setDisplaySize}
        />
        <div className="absolute right-3 bottom-3 space-x-2 text-right text-xs text-muted-foreground">

          <span className="">
            DESIGN BY <a className="hover:underline text-body hover:text-foreground" href="https://x.com/qilei" target="_blank"> @qilei</a>
          </span>
          <span>
            WITH <a href="https://bon-ui.com" className="hover:underline text-body hover:text-foreground" target="_blank"> @bon-ui</a>
          </span>
        </div>
      </div>
    </div>
  );
}
