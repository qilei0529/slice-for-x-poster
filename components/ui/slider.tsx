"use client";

import * as React from "react";
import { Slider as BaseSlider } from "@base-ui/react/slider";
import { cn } from "@/lib/cn";

const sliderTrackSizes = {
  sm: "h-[12px]",
  md: "h-[18px]",
} as const;

/** Idle = thin vertical line; hover / drag / focus = rounded rect handle. */
const sliderThumbSizes = {
  sm: cn(
    "h-[6px] w-1 rounded-button -ml-[6px] bg-muted/60",
    "group-hover/slider:w-1 group-hover/slider:h-[6px] group-hover/slider:bg-muted",
    "group-hover/slider:-ml-[6px]",
    "data-before:ml-[6px]",
  ),
  md: cn(
    "h-[6px] w-1 rounded-button -ml-[7px] bg-muted/60",
    "group-hover/slider:w-1 group-hover/slider:h-[10px] group-hover/slider:bg-muted",
    "group-hover/slider:-ml-[7px]",
    "data-before:ml-[7px]",
  ),
} as const;

export type SliderSize = keyof typeof sliderTrackSizes;

type SliderMarksContextValue = {
  marks: boolean;
  min: number;
  max: number;
  step: number;
};

const SliderMarksContext = React.createContext<SliderMarksContextValue>({
  marks: false,
  min: 0,
  max: 100,
  step: 1,
});

function getMarkValues(min: number, max: number, step: number) {
  if (!(step > 0) || max <= min) {
    return [];
  }

  const count = Math.round((max - min) / step);
  const values: number[] = [];

  for (let index = 0; index <= count; index += 1) {
    values.push(min + index * step);
  }

  const last = values[values.length - 1];
  if (last !== undefined && Math.abs(last - max) > Number.EPSILON) {
    values[values.length - 1] = max;
  }

  return values;
}

export type SliderRootProps = BaseSlider.Root.Props & {
  marks?: boolean;
};

export function SliderRoot({
  className,
  marks = false,
  min = 0,
  max = 100,
  step = 1,
  ...props
}: SliderRootProps) {
  const marksValue = React.useMemo(
    () => ({ marks, min, max, step }),
    [marks, min, max, step],
  );

  return (
    <SliderMarksContext.Provider value={marksValue}>
      <BaseSlider.Root
        className={cn("flex w-full flex-col gap-1", className)}
        min={min}
        max={max}
        step={step}
        {...props}
      />
    </SliderMarksContext.Provider>
  );
}

export function SliderLabel({ className, ...props }: BaseSlider.Label.Props) {
  return (
    <BaseSlider.Label
      className={cn(
        "text-caption font-medium text-foreground",
        "data-disabled:opacity-65",
        className,
      )}
      {...props}
    />
  );
}

export function SliderValue({ className, ...props }: BaseSlider.Value.Props) {
  return (
    <BaseSlider.Value
      className={cn(
        "text-caption text-muted-foreground tabular-nums",
        "data-disabled:opacity-65",
        className,
      )}
      {...props}
    />
  );
}

export function SliderControl({ className, ...props }: BaseSlider.Control.Props) {
  return (
    <BaseSlider.Control
      className={cn(
        "group/slider flex w-full touch-none items-center select-none",
        "data-disabled:pointer-events-none data-disabled:opacity-65",
        className,
      )}
      {...props}
    />
  );
}

export type SliderTrackProps = BaseSlider.Track.Props & {
  size?: SliderSize;
};

export function SliderTrack({
  className,
  size = "md",
  children,
  ...props
}: SliderTrackProps) {
  const { marks, min, max, step } = React.useContext(SliderMarksContext);
  const markValues = marks ? getMarkValues(min, max, step) : [];
  const range = max - min;

  return (
    <BaseSlider.Track
      className={cn(
        "relative w-full grow overflow-visible rounded-button bg-muted select-none",
        sliderTrackSizes[size],
        className,
      )}
      {...props}
    >
      {marks ? (
        <div className="pointer-events-none absolute inset-0 z-[1]" aria-hidden>
          {markValues.map((value, index) => (
            <span
              key={value}
              className={cn(
                "absolute top-1/2 w-1 -ml-[6px] rounded-button -translate-x-1/2 -translate-y-1/2 bg-foreground/20",
                size === "sm" ? "h-1" : "h-1",
                index === 0 ? "hidden" : "",
              )}
              style={{ left: `${range === 0 ? 0 : ((value - min) / range) * 100}%` }}
            />
          ))}
        </div>
      ) : null}
      {children}
    </BaseSlider.Track>
  );
}

export type SliderIndicatorProps = BaseSlider.Indicator.Props & {
  size?: SliderSize;
};

export function SliderIndicator({
  className,
  size = "md",
  style,
  ...props
}: SliderIndicatorProps) {
  const indicatorHeight = size === "sm" ? 12 : 18;
  return (
    <BaseSlider.Indicator
      className={cn("z-0 rounded-button bg-primary select-none", className)}
      {...props}
      style={(state) => {
        const resolved = typeof style === "function" ? style(state) : style;
        // console.log(resolved)
        return {
          ...resolved,
          // Pill ends on the fill itself — not only when flush with track at 0/100.
          // Overrides Base UI inline `position: relative` / `height: inherit`.
          // position: "absolute",
          top: "50%",
          height: indicatorHeight,
          transform: "translateY(-50%)",
        };
      }}
    />
  );
}

export type SliderThumbProps = BaseSlider.Thumb.Props & {
  size?: SliderSize;
};

export function SliderThumb({
  className,
  size = "md",
  ...props
}: SliderThumbProps) {
  return (
    <BaseSlider.Thumb
      className={cn(
        "z-[2] bg-primary select-none",
        "transition-[width,height,border-radius] duration-150 ease-out",
        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-0 has-[:focus-visible]:outline-ring",
        "data-disabled:pointer-events-none",
        sliderThumbSizes[size],
        className,
      )}
      {...props}
    />
  );
}
