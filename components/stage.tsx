"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { TILE_HEIGHT, TILE_WIDTH } from "@/lib/constants";
import type { Corner, Frame, Point } from "@/lib/frame";
import { resizeFrame } from "@/lib/frame";
import { clampedRadius, drawScene } from "@/lib/scene";

const HANDLES: Array<{
  corner: Corner;
  left: string;
  top: string;
  cursor: string;
  label: string;
}> = [
  { corner: "nw", left: "0%", top: "0%", cursor: "nwse-resize", label: "左上角" },
  { corner: "ne", left: "100%", top: "0%", cursor: "nesw-resize", label: "右上角" },
  { corner: "sw", left: "0%", top: "100%", cursor: "nesw-resize", label: "左下角" },
  { corner: "se", left: "100%", top: "100%", cursor: "nwse-resize", label: "右下角" },
];

type Drag =
  | { kind: "move"; startPointer: Point; startFrame: Frame }
  | { kind: "resize"; corner: Corner; startFrame: Frame };

type StageProps = {
  sliceCount: number;
  background: string;
  radius: number;
  image: HTMLImageElement | null;
  frame: Frame | null;
  dragOver: boolean;
  onFrameChange: (frame: Frame) => void;
  onPick: () => void;
};

export function Stage({
  sliceCount,
  background,
  radius,
  image,
  frame,
  dragOver,
  onFrameChange,
  onPick,
}: StageProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<Drag | null>(null);
  const stopDragRef = useRef<(() => void) | null>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  const logicalW = TILE_WIDTH * sliceCount;
  const logicalH = TILE_HEIGHT;
  const fitted = fitCanvas(box.w, box.h, logicalW, logicalH);

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

  useEffect(() => {
    return () => stopDragRef.current?.();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || fitted.viewW < 1 || fitted.viewH < 1) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(fitted.viewW * dpr));
    canvas.height = Math.max(1, Math.round(fitted.viewH * dpr));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(
      (fitted.viewW / logicalW) * dpr,
      0,
      0,
      (fitted.viewH / logicalH) * dpr,
      0,
      0,
    );
    drawScene(ctx, {
      sliceCount,
      background,
      radius,
      image,
      frame,
    });

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawGuides(ctx, {
      sliceCount,
      viewW: fitted.viewW,
      viewH: fitted.viewH,
      logicalW,
    });
  }, [
    background,
    radius,
    fitted.viewH,
    fitted.viewW,
    frame,
    image,
    logicalH,
    logicalW,
    sliceCount,
  ]);

  function pointFromEvent(event: { clientX: number; clientY: number }): Point | null {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return null;
    return {
      x: ((event.clientX - rect.left) / rect.width) * logicalW,
      y: ((event.clientY - rect.top) / rect.height) * logicalH,
    };
  }

  function startDrag(event: ReactPointerEvent, drag: Drag, cursor: string) {
    event.preventDefault();
    event.stopPropagation();
    stopDragRef.current?.();
    dragRef.current = drag;
    document.body.style.cursor = cursor;

    const onMove = (moveEvent: PointerEvent) => {
      const current = dragRef.current;
      const pointer = pointFromEvent(moveEvent);
      if (!current || !pointer) return;

      if (current.kind === "move") {
        onFrameChange({
          ...current.startFrame,
          x: current.startFrame.x + pointer.x - current.startPointer.x,
          y: current.startFrame.y + pointer.y - current.startPointer.y,
        });
        return;
      }

      onFrameChange(resizeFrame(current.startFrame, current.corner, pointer));
    };

    const onUp = () => {
      dragRef.current = null;
      document.body.style.cursor = "";
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
    <div ref={wrapRef} className="flex h-full min-h-0 items-center justify-center">
      {fitted.viewW > 0 ? (
        <div
          ref={stageRef}
          className={`relative shadow-[0_24px_80px_rgba(0,0,0,0.45)] ${
            dragOver ? "ring-2 ring-white" : "ring-1 ring-white/20"
          }`}
          style={{ width: fitted.viewW, height: fitted.viewH }}
        >
          <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
          {image && frame ? (
            <div
              className="absolute"
              style={{
                left: `${(frame.x / logicalW) * 100}%`,
                top: `${(frame.y / logicalH) * 100}%`,
                width: `${(frame.width / logicalW) * 100}%`,
                height: `${(frame.height / logicalH) * 100}%`,
              }}
            >
              <div
                aria-label="拖动图片"
                className="absolute inset-0 cursor-grab touch-none"
                onPointerDown={(event) => {
                  const pointer = pointFromEvent(event);
                  if (!pointer) return;
                  startDrag(
                    event,
                    { kind: "move", startPointer: pointer, startFrame: frame },
                    "grabbing",
                  );
                }}
              />
              <div
                className="pointer-events-none absolute inset-0 shadow-[0_0_0_1px_rgba(0,0,0,0.75)] ring-1 ring-white"
                style={{ borderRadius: frameBorderRadius(radius, frame) }}
              />
              {HANDLES.map((handle) => (
                <button
                  key={handle.corner}
                  type="button"
                  aria-label={`缩放${handle.label}`}
                  className="absolute z-10 size-5 -translate-x-1/2 -translate-y-1/2 touch-none"
                  style={{ left: handle.left, top: handle.top, cursor: handle.cursor }}
                  onPointerDown={(event) => {
                    startDrag(
                      event,
                      { kind: "resize", corner: handle.corner, startFrame: frame },
                      handle.cursor,
                    );
                  }}
                >
                  <span className="absolute inset-[3px] rounded-[2px] border border-black/80 bg-white" />
                </button>
              ))}
            </div>
          ) : (
            <button
              type="button"
              onClick={onPick}
              className="absolute inset-0 flex items-center justify-center"
            >
              <span className="rounded-full bg-black/50 px-4 py-2 text-sm text-white backdrop-blur-sm">
                拖入图片，或点击选择
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

function fitCanvas(boxW: number, boxH: number, logicalW: number, logicalH: number) {
  const availW = Math.max(0, boxW - 16);
  const availH = Math.max(0, boxH - 16);
  if (availW === 0 || availH === 0) {
    return { viewW: 0, viewH: 0 };
  }
  const scale = Math.min(availW / logicalW, availH / logicalH);
  return {
    viewW: logicalW * scale,
    viewH: logicalH * scale,
  };
}

function drawGuides(
  ctx: CanvasRenderingContext2D,
  options: { sliceCount: number; viewW: number; viewH: number; logicalW: number },
) {
  const scaleX = options.viewW / options.logicalW;

  const stroke = (color: string, width: number) => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.setLineDash([7, 6]);
    for (let index = 1; index < options.sliceCount; index += 1) {
      const x = Math.round(index * TILE_WIDTH * scaleX) + 0.5;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, options.viewH);
      ctx.stroke();
    }
    ctx.restore();
  };

  stroke("rgba(0,0,0,0.55)", 3);
  stroke("rgba(255,255,255,0.88)", 1);

  ctx.save();
  ctx.font = "600 12px ui-sans-serif, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(0,0,0,0.55)";
  ctx.fillStyle = "white";
  for (let index = 0; index < options.sliceCount; index += 1) {
    const x = (index + 0.5) * TILE_WIDTH * scaleX;
    const label = String(index + 1);
    ctx.strokeText(label, x, 18);
    ctx.fillText(label, x, 18);
  }
  ctx.restore();
}
