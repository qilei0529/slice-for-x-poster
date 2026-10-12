"use client";

import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { cn } from "@/lib/cn";

export function TooltipProvider(props: BaseTooltip.Provider.Props) {
  return <BaseTooltip.Provider {...props} />;
}

export function TooltipRoot(props: BaseTooltip.Root.Props) {
  return <BaseTooltip.Root {...props} />;
}

export function TooltipTrigger(props: BaseTooltip.Trigger.Props) {
  return <BaseTooltip.Trigger {...props} />;
}

export function TooltipPortal(props: BaseTooltip.Portal.Props) {
  return <BaseTooltip.Portal {...props} />;
}

export function TooltipPositioner({
  className,
  sideOffset = 4,
  ...props
}: BaseTooltip.Positioner.Props) {
  return (
    <BaseTooltip.Positioner
      className={cn("z-50 outline-none", className)}
      sideOffset={sideOffset}
      {...props}
    />
  );
}

export function TooltipPopup({ className, ...props }: BaseTooltip.Popup.Props) {
  return (
    <BaseTooltip.Popup
      data-slot="tooltip-popup"
      className={cn(
        "relative max-w-xs rounded-button bg-foreground px-2.5 py-1 text-caption text-background shadow-lg outline-none",
        "origin-[var(--transform-origin)] transition-[opacity,scale] duration-100 ease-out",
        "data-starting-style:scale-95 data-starting-style:opacity-0",
        "data-ending-style:scale-95 data-ending-style:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

export function TooltipArrow({ className, ...props }: BaseTooltip.Arrow.Props) {
  return (
    <BaseTooltip.Arrow
      className={cn(
        "z-10 block h-1.5 w-3 overflow-clip",
        "data-[side=bottom]:-top-[4px]",
        "data-[side=top]:-bottom-[4px] data-[side=top]:rotate-180",
        "data-[side=left]:-right-[7px] data-[side=left]:rotate-90",
        "data-[side=right]:-left-[7px] data-[side=right]:-rotate-90",
        "before:absolute before:bottom-0 before:left-1/2 before:size-[calc(6px*sqrt(2))] before:bg-foreground before:content-['']",
        "before:[transform:translate(-50%,50%)_rotate(45deg)]",
        className,
      )}
      {...props}
    />
  );
}
