"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { ArrowDownIcon, ArrowUpIcon, XIcon } from "@/components/icons";
import type { Corner, Frame, Point } from "@/lib/frame";
import { resizeFrame } from "@/lib/frame";
import { clampedRadius, drawScene, type PlacedImage } from "@/lib/scene";

const HANDLES: Array<{
  corner: Corner;
  left: string;
  top: string;
  cursor: string;
  label: string;
}> = [
  { corner: "nw", left: "0%", top: "0%", cursor: "nwse-resize", label: "top left" },
  { corner: "ne", left: "100%", top: "0%", cursor: "nesw-resize", label: "top right" },
  { corner: "sw", left: "0%", top: "100%", cursor: "nesw-resize", label: "bottom left" },
  { corner: "se", left: "100%", top: "100%", cursor: "nwse-resize", label: "bottom right" },
];

const ZOOM_MIN_FACTOR = 0.5;
const ZOOM_MAX_FACTOR = 8;
const ZOOM_STEP = 1.1;
const PAN_MOVE_THRESHOLD = 3;

type Drag =
  | { kind: "move"; imageId: string; startPointer: Point; startFrame: Frame }
  | { kind: "resize"; imageId: string; corner: Corner; startFrame: Frame };

type ViewState = {
  scale: number;
  pan: Point;
  logicalKey: string;
};

type StageProps = {
  sliceCount: number;
  tileWidth: number;
  tileHeight: number;
  background: string;
  radius: number;
  images: PlacedImage[];
  selectedId: string | null;
  dragOver: boolean;
  onSelect: (id: string | null) => void;
  onFrameChange: (id: string, frame: Frame) => void;
  onRemove: (id: string) => void;
  onReorder: (id: string, edge: "front" | "back") => void;
  onPick: () => void;
  onDisplaySize: (size: { viewW: number; viewH: number }) => void;
};

export function Stage({
  sliceCount,
  tileWidth,
  tileHeight,
  background,
  radius,
  images,
  selectedId,
  dragOver,
  onSelect,
  onFrameChange,
  onRemove,
  onReorder,
  onPick,
  onDisplaySize,
}: StageProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<Drag | null>(null);
  const stopDragRef = useRef<(() => void) | null>(null);
  const panMovedRef = useRef(false);
  const viewRef = useRef<ViewState>({ scale: 0, pan: { x: 0, y: 0 }, logicalKey: "" });
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [view, setView] = useState<ViewState>({
    scale: 0,
    pan: { x: 0, y: 0 },
    logicalKey: "",
  });
  const [cursor, setCursor] = useState<string | null>(null);
  const onDisplaySizeRef = useRef(onDisplaySize);
  onDisplaySizeRef.current = onDisplaySize;
  viewRef.current = view;

  const logicalW = tileWidth * sliceCount;
  const logicalH = tileHeight;
  const fit = fitCanvas(box.w, box.h, logicalW, logicalH);
  const viewW = view.scale > 0 ? logicalW * view.scale : 0;
  const viewH = view.scale > 0 ? logicalH * view.scale : 0;
  const stageLeft = viewW > 0 ? (box.w - viewW) / 2 + view.pan.x : 0;
  const stageTop = viewH > 0 ? (box.h - viewH) / 2 + view.pan.y : 0;

  useEffect(() => {
    onDisplaySizeRef.current({ viewW, viewH });
  }, [viewW, viewH]);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const measure = () => {
      const rect = wrap.getBoundingClientRect();
      const next = { w: rect.width, h: rect.height };
      setBox((current) =>
        current.w === next.w && current.h === next.h ? current : next,
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (fit.scale <= 0) return;
    const logicalKey = `${logicalW}x${logicalH}`;
    setView((current) => {
      if (current.scale === 0 || current.logicalKey !== logicalKey) {
        return { scale: fit.scale, pan: { x: 0, y: 0 }, logicalKey };
      }
      return current;
    });
  }, [fit.scale, logicalW, logicalH]);

  useEffect(() => {
    return () => stopDragRef.current?.();
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const current = viewRef.current;
      if (current.scale <= 0 || fit.scale <= 0) return;

      const rect = wrap.getBoundingClientRect();
      const cursorX = event.clientX - rect.left;
      const cursorY = event.clientY - rect.top;
      const prevViewW = logicalW * current.scale;
      const prevViewH = logicalH * current.scale;
      const prevLeft = (box.w - prevViewW) / 2 + current.pan.x;
      const prevTop = (box.h - prevViewH) / 2 + current.pan.y;
      const localX = cursorX - prevLeft;
      const localY = cursorY - prevTop;

      const direction = event.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP;
      const nextScale = clamp(
        current.scale * direction,
        fit.scale * ZOOM_MIN_FACTOR,
        fit.scale * ZOOM_MAX_FACTOR,
      );
      if (nextScale === current.scale) return;

      const ratio = nextScale / current.scale;
      const nextViewW = logicalW * nextScale;
      const nextViewH = logicalH * nextScale;
      setView({
        scale: nextScale,
        pan: {
          x: cursorX - (box.w - nextViewW) / 2 - localX * ratio,
          y: cursorY - (box.h - nextViewH) / 2 - localY * ratio,
        },
        logicalKey: current.logicalKey,
      });
    };

    wrap.addEventListener("wheel", onWheel, { passive: false });
    return () => wrap.removeEventListener("wheel", onWheel);
  }, [box.w, box.h, fit.scale, logicalH, logicalW]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || viewW < 1 || viewH < 1) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(viewW * dpr));
    canvas.height = Math.max(1, Math.round(viewH * dpr));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform((viewW / logicalW) * dpr, 0, 0, (viewH / logicalH) * dpr, 0, 0);
    drawScene(ctx, {
      sliceCount,
      tileWidth,
      tileHeight,
      background,
      radius,
      images,
    });

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawGuides(ctx, {
      sliceCount,
      tileWidth,
      viewW,
      viewH,
      logicalW,
    });
  }, [
    background,
    radius,
    viewH,
    viewW,
    images,
    logicalH,
    logicalW,
    sliceCount,
    tileWidth,
    tileHeight,
  ]);

  function pointFromEvent(event: { clientX: number; clientY: number }): Point | null {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return null;
    return {
      x: ((event.clientX - rect.left) / rect.width) * logicalW,
      y: ((event.clientY - rect.top) / rect.height) * logicalH,
    };
  }

  function startPan(event: ReactPointerEvent) {
    if (event.button !== 0) return;
    event.preventDefault();
    stopDragRef.current?.();
    panMovedRef.current = false;
    const startClientX = event.clientX;
    const startClientY = event.clientY;
    const startPanPoint = { ...viewRef.current.pan };

    const onMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startClientX;
      const dy = moveEvent.clientY - startClientY;
      if (Math.hypot(dx, dy) >= PAN_MOVE_THRESHOLD) {
        panMovedRef.current = true;
      }
      setView((current) => ({
        ...current,
        pan: {
          x: startPanPoint.x + dx,
          y: startPanPoint.y + dy,
        },
      }));
    };

    const onUp = () => {
      if (!panMovedRef.current) {
        onSelect(null);
      }
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      stopDragRef.current = null;
    };

    stopDragRef.current = onUp;
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  }

  function startDrag(event: ReactPointerEvent, drag: Drag, nextCursor: string) {
    event.preventDefault();
    event.stopPropagation();
    stopDragRef.current?.();
    dragRef.current = drag;
    setCursor(nextCursor);

    const onMove = (moveEvent: PointerEvent) => {
      const current = dragRef.current;
      const pointer = pointFromEvent(moveEvent);
      if (!current || !pointer) return;

      if (current.kind === "move") {
        onFrameChange(current.imageId, {
          ...current.startFrame,
          x: current.startFrame.x + pointer.x - current.startPointer.x,
          y: current.startFrame.y + pointer.y - current.startPointer.y,
        });
        return;
      }

      onFrameChange(
        current.imageId,
        resizeFrame(current.startFrame, current.corner, pointer),
      );
    };

    const onUp = () => {
      dragRef.current = null;
      setCursor(null);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      stopDragRef.current = null;
    };

    stopDragRef.current = onUp;
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  }

  return (
    <div
      ref={wrapRef}
      className="relative h-full min-h-0 cursor-default overflow-hidden"
      style={cursor ? { cursor } : undefined}
      onPointerDown={startPan}
    >
      {viewW > 0 ? (
        <div
          ref={stageRef}
          className={`absolute cursor-default shadow-[0_4px_24px_-12px_rgba(0,0,0,0.06)] ${
            dragOver ? "" : ""
          }`}
          style={{
            left: stageLeft,
            top: stageTop,
            width: viewW,
            height: viewH,
          }}
        >
          <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
          {images.length > 0 ? (
            images.map((item, index) => {
              const selected = item.id === selectedId;
              return (
                <div
                  key={item.id}
                  className="absolute"
                  style={{
                    zIndex: index + 1,
                    left: `${(item.frame.x / logicalW) * 100}%`,
                    top: `${(item.frame.y / logicalH) * 100}%`,
                    width: `${(item.frame.width / logicalW) * 100}%`,
                    height: `${(item.frame.height / logicalH) * 100}%`,
                  }}
                >
                  <div
                    aria-label="Drag image"
                    data-agent="drag-image"
                    className="absolute inset-0 touch-none"
                    style={{
                      cursor: selected
                        ? cursor ?? "grab"
                        : "default",
                    }}
                    onPointerDown={(event) => {
                      const pointer = pointFromEvent(event);
                      if (!pointer) return;
                      onSelect(item.id);
                      startDrag(
                        event,
                        {
                          kind: "move",
                          imageId: item.id,
                          startPointer: pointer,
                          startFrame: item.frame,
                        },
                        "grabbing",
                      );
                    }}
                  />
                  <div
                    className={
                      selected
                        ? "pointer-events-none absolute inset-0 ring-1 ring-blue-500"
                        : "pointer-events-none absolute inset-0"
                    }
                    style={{ borderRadius: frameBorderRadius(radius, item.frame) }}
                  />
                  {selected ? (
                    <div
                      className="absolute z-20 flex touch-none"
                      style={{
                        left: 0,
                        top: 0,
                        transform: "translate(0px, calc(-100% - 5px))",
                      }}
                    >
                      <button
                        type="button"
                        aria-label="Remove image"
                        data-agent="remove-image"
                        className="group flex size-6 cursor-pointer items-center justify-center"
                        onPointerDown={(event) => {
                          event.stopPropagation();
                        }}
                        onClick={(event) => {
                          event.stopPropagation();
                          onRemove(item.id);
                        }}
                      >
                        <span className="size-4 rounded-full bg-red-500 group-hover:hidden" />
                        <span className="hidden size-4 items-center justify-center rounded-full bg-red-500 text-white group-hover:flex">
                          <XIcon className="size-2.5" />
                        </span>
                      </button>
                      <button
                        type="button"
                        aria-label="Bring to front"
                        data-agent="bring-front"
                        disabled={index === images.length - 1}
                        className="flex size-6 cursor-pointer items-center justify-center text-white disabled:cursor-default disabled:opacity-40"
                        onPointerDown={(event) => {
                          event.stopPropagation();
                        }}
                        onClick={(event) => {
                          event.stopPropagation();
                          onReorder(item.id, "front");
                        }}
                      >
                        <span className="flex size-4 items-center justify-center rounded-full bg-neutral-900">
                          <ArrowUpIcon className="size-2.5" />
                        </span>
                      </button>
                      <button
                        type="button"
                        aria-label="Send to back"
                        data-agent="send-back"
                        disabled={index === 0}
                        className="flex size-6 cursor-pointer items-center justify-center text-white disabled:cursor-default disabled:opacity-40"
                        onPointerDown={(event) => {
                          event.stopPropagation();
                        }}
                        onClick={(event) => {
                          event.stopPropagation();
                          onReorder(item.id, "back");
                        }}
                      >
                        <span className="flex size-4 items-center justify-center rounded-full bg-neutral-900">
                          <ArrowDownIcon className="size-2.5" />
                        </span>
                      </button>
                    </div>
                  ) : null}
                  {selected
                    ? HANDLES.map((handle) => (
                        <button
                          key={handle.corner}
                          type="button"
                          aria-label={`Resize ${handle.label}`}
                          data-agent={`resize-${handle.corner}`}
                          className="absolute z-10 size-3.5 -translate-x-1/2 -translate-y-1/2 touch-none"
                          style={{
                            left: handle.left,
                            top: handle.top,
                            cursor: handle.cursor,
                          }}
                          onPointerDown={(event) => {
                            onSelect(item.id);
                            startDrag(
                              event,
                              {
                                kind: "resize",
                                imageId: item.id,
                                corner: handle.corner,
                                startFrame: item.frame,
                              },
                              handle.cursor,
                            );
                          }}
                        >
                          <span className="absolute inset-[3px] rounded-[0px] border border-blue-500 bg-white" />
                        </button>
                      ))
                    : null}
                </div>
              );
            })
          ) : (
            <button
              type="button"
              data-agent="stage-pick"
              onClick={() => {
                if (panMovedRef.current) return;
                onPick();
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <span className="rounded-full bg-black/50 px-4 py-2 text-sm text-white backdrop-blur-sm">
                Drop, paste, or click to choose an image
              </span>
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}

function frameBorderRadius(radius: number, frame: Frame) {
  const curve = clampedRadius(radius, frame);
  if (curve <= 0) return undefined;
  return `${(curve / frame.width) * 100}% / ${(curve / frame.height) * 100}%`;
}

const CANVAS_INSET = 100;

function fitCanvas(boxW: number, boxH: number, logicalW: number, logicalH: number) {
  const availW = Math.max(0, boxW - CANVAS_INSET * 2);
  const availH = Math.max(0, boxH - CANVAS_INSET * 2);
  if (availW === 0 || availH === 0) {
    return { scale: 0, viewW: 0, viewH: 0 };
  }
  const scale = Math.min(availW / logicalW, availH / logicalH);
  return {
    scale,
    viewW: logicalW * scale,
    viewH: logicalH * scale,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function drawGuides(
  ctx: CanvasRenderingContext2D,
  options: {
    sliceCount: number;
    tileWidth: number;
    viewW: number;
    viewH: number;
    logicalW: number;
  },
) {
  const scaleX = options.viewW / options.logicalW;

  const stroke = (color: string, width: number) => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.setLineDash([4, 4]);
    for (let index = 1; index < options.sliceCount; index += 1) {
      const x = Math.round(index * options.tileWidth * scaleX) + 0.5;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, options.viewH);
      ctx.stroke();
    }
    ctx.restore();
  };

  stroke("rgba(0,0,0,0.3)", 2);
  stroke("rgba(255,255,255,0.6)", 1);

  ctx.save();
  ctx.font = "500 12px ui-sans-serif, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineWidth = 3;
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  for (let index = 0; index < options.sliceCount; index += 1) {
    const x = (index + 0.5) * options.tileWidth * scaleX;
    const label = String(index + 1);
    ctx.fillText(label, x, 18);
  }
  ctx.restore();
}
