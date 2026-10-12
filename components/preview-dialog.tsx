"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRightIcon } from "@/components/icons";
import { cn } from "@/lib/cn";
import {
  DialogBackdrop,
  DialogContent,
  DialogHead,
  DialogPopup,
  DialogPortal,
  DialogRoot,
  DialogViewport,
} from "@/components/ui/dialog";
import { TILE_HEIGHT, TILE_WIDTH } from "@/lib/constants";
import { renderPreviewSlices, revokePreviewUrls } from "@/lib/preview";
import type { PlacedImage } from "@/lib/scene";

const MEDIA_HEIGHT = 350;
const MEDIA_GAP = 8;

function tileWidth(height: number) {
  return height * (TILE_WIDTH / TILE_HEIGHT);
}

type PreviewDialogProps = {
  open: boolean;
  images: PlacedImage[];
  sliceCount: number;
  background: string;
  radius: number;
  onOpenChange: (open: boolean) => void;
};

export function PreviewDialog({
  open,
  images,
  sliceCount,
  background,
  radius,
  onOpenChange,
}: PreviewDialogProps) {
  const ownedUrls = useRef<string[]>([]);
  const [slices, setSlices] = useState<string[]>([]);
  const [phase, setPhase] = useState<"idle" | "loading" | "ready" | "error">(
    "idle",
  );

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    revokePreviewUrls(ownedUrls.current);
    ownedUrls.current = [];
    setPhase("loading");
    setSlices([]);

    renderPreviewSlices({ images, sliceCount, background, radius })
      .then((urls) => {
        if (cancelled) {
          revokePreviewUrls(urls);
          return;
        }
        revokePreviewUrls(ownedUrls.current);
        ownedUrls.current = urls;
        setSlices(urls);
        setPhase("ready");
      })
      .catch(() => {
        if (!cancelled) setPhase("error");
      });

    return () => {
      cancelled = true;
    };
  }, [open, images, sliceCount, background, radius]);

  useEffect(() => {
    const owned = ownedUrls;
    return () => {
      revokePreviewUrls(owned.current);
      owned.current = [];
    };
  }, []);

  return (
    <DialogRoot
      open={open}
      onOpenChange={onOpenChange}
      onOpenChangeComplete={(nextOpen) => {
        if (nextOpen) return;
        revokePreviewUrls(ownedUrls.current);
        ownedUrls.current = [];
        setSlices([]);
        setPhase("idle");
      }}
    >
      <DialogPortal>
        <DialogBackdrop />
        <DialogViewport>
          <DialogPopup className="min-w-0 max-w-[580px]">
            <DialogHead
              title="Preview"
              description="Tiles arranged the way they appear in an X post."
              showClose
            />
            <DialogContent maxHeight="680px">
              <article className="text-[#0f1419]">
                <header className="flex gap-3">
                  <div
                    aria-hidden
                    className="size-10 shrink-0 rounded-full bg-[#cfd9de]"
                  />
                  <div className="min-w-0">
                    <p className="text-[15px] leading-5 font-bold">Elon Musk</p>
                    <p className="text-[15px] leading-5 text-[#536471]">@x</p>
                  </div>
                </header>

                <div className="mt-3 pl-13">
                  <div className="mb-1 h-4 w-48 bg-[#cfd9de]/50"></div>
                  <div className="mb-4 h-4 w-64 bg-[#cfd9de]/50"></div>
                  {phase === "loading" || phase === "idle" ? (
                    <p className="py-16 text-center text-[15px] text-[#536471]">
                      Preparing preview…
                    </p>
                  ) : null}
                  {phase === "error" ? (
                    <p className="py-16 text-center text-[15px] text-[#536471]">
                      Couldn&apos;t build the preview.
                    </p>
                  ) : null}
                  {phase === "ready" ? <MediaScroller urls={slices} /> : null}
                </div>

                <div className="mt-3 flex items-center justify-between px-1 pb-1 pl-13 text-[#536471]">
                  <ReplyIcon />
                  <RepostIcon />
                  <LikeIcon />
                  <ViewsIcon />
                </div>
              </article>
            </DialogContent>
          </DialogPopup>
        </DialogViewport>
      </DialogPortal>
    </DialogRoot>
  );
}

function MediaScroller({ urls }: { urls: string[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const update = () => {
      const max = scroller.scrollWidth - scroller.clientWidth;
      setCanScrollLeft(scroller.scrollLeft > 1);
      setCanScrollRight(max > 1 && scroller.scrollLeft < max - 1);
    };

    update();
    scroller.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(scroller);
    const grid = scroller.firstElementChild;
    if (grid) observer.observe(grid);

    return () => {
      scroller.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [urls]);

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="h-[350px] max-w-full overflow-x-auto overflow-y-hidden"
      >
        <MediaGrid urls={urls} />
      </div>
      {canScrollLeft ? (
        <button
          type="button"
          aria-label="Scroll left"
          className="absolute top-1/2 left-3 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#3a3a3a] hover:bg-[#5a5a5a] cursor-pointer text-white"
          onClick={() => scrollMedia(scrollerRef.current, -1)}
        >
          <ArrowRightIcon className="size-5 rotate-180" />
        </button>
      ) : null}
      {canScrollRight ? (
        <button
          type="button"
          aria-label="Scroll right"
          className="absolute top-1/2 right-3 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#3a3a3a] hover:bg-[#5a5a5a] cursor-pointer text-white"
          onClick={() => scrollMedia(scrollerRef.current, 1)}
        >
          <ArrowRightIcon className="size-5" />
        </button>
      ) : null}
    </div>
  );
}

function scrollMedia(scroller: HTMLDivElement | null, direction: -1 | 1) {
  if (!scroller) return;
  scroller.scrollBy({
    left: direction * scroller.clientWidth,
    behavior: "smooth",
  });
}

function MediaGrid({ urls }: { urls: string[] }) {
  if (urls.length === 1) {
    return (
      <div
        className="overflow-hidden rounded-2xl"
        style={{ width: tileWidth(MEDIA_HEIGHT), height: MEDIA_HEIGHT }}
      >
        <TileImage url={urls[0]} index={0} />
      </div>
    );
  }

  const columnWidth = tileWidth(MEDIA_HEIGHT);
  return (
    <div
      className="grid gap-[8px] overflow-hidden rounded-2xl"
      style={{
        width: columnWidth * urls.length + MEDIA_GAP * (urls.length - 1),
        height: MEDIA_HEIGHT,
        gridTemplateColumns: `repeat(${urls.length}, ${columnWidth}px)`,
      }}
    >
      {urls.map((url, index) => (
        <TileImage className="rounded-xl" key={url} url={url} index={index} />
      ))}
    </div>
  );
}

function TileImage({
  url,
  index,
  className,
}: {
  url: string;
  index: number;
  className?: string;
}) {
  return (
    <img
      src={url}
      alt={`Tile ${index + 1}`}
      className={cn("size-full object-cover", className)}
    />
  );
}

function IconSvg({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-[18px]"
    >
      {children}
    </svg>
  );
}

function ReplyIcon() {
  return (
    <IconSvg>
      <path d="M21 12a8.5 8.5 0 0 1-8.5 8.5c-1.4 0-2.7-.3-3.9-.9L3 21l1.5-4.3A8.5 8.5 0 1 1 21 12Z" />
    </IconSvg>
  );
}

function RepostIcon() {
  return (
    <IconSvg>
      <path d="M7 7h11l-2.5-2.5" />
      <path d="M17 17H6l2.5 2.5" />
      <path d="M18 7v4" />
      <path d="M6 17v-4" />
    </IconSvg>
  );
}

function LikeIcon() {
  return (
    <IconSvg>
      <path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9Z" />
    </IconSvg>
  );
}

function ViewsIcon() {
  return (
    <IconSvg>
      <path d="M4 19V10" />
      <path d="M10 19V5" />
      <path d="M16 19v-6" />
      <path d="M22 19H2" />
    </IconSvg>
  );
}
