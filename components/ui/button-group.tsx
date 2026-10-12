import * as React from "react";
import { cn } from "@/lib/cn";

export type ButtonGroupOrientation = "horizontal" | "vertical";

export type ButtonGroupProps = React.ComponentProps<"div"> & {
  orientation?: ButtonGroupOrientation;
};

export function ButtonGroup({
  className,
  orientation = "horizontal",
  ...props
}: ButtonGroupProps) {
  const isVertical = orientation === "vertical";

  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(
        "inline-flex isolate items-stretch",
        isVertical ? "flex-col" : "flex-row",
        "[&>*]:rounded-none",
        isVertical
          ? "[&>*:first-child]:rounded-t-button [&>*:last-child]:rounded-b-button [&>*:not(:first-child)]:-mt-px"
          : "[&>*:first-child]:rounded-l-button [&>*:last-child]:rounded-r-button [&>*:not(:first-child)]:-ml-px",
        "[&>:is([data-variant=primary],[data-variant=gray]):not(:first-child)]:after:pointer-events-none",
        "[&>:is([data-variant=primary],[data-variant=gray]):not(:first-child)]:after:absolute",
        "[&>:is([data-variant=primary],[data-variant=gray]):not(:first-child)]:after:content-['']",
        "[&>[data-variant=primary]:not(:first-child)]:after:bg-primary-foreground/20",
        "[&>[data-variant=gray]:not(:first-child)]:after:bg-gray-foreground/10",
        isVertical
          ? "[&>:is([data-variant=primary],[data-variant=gray]):not(:first-child)]:after:inset-x-0 [&>:is([data-variant=primary],[data-variant=gray]):not(:first-child)]:after:-top-px [&>:is([data-variant=primary],[data-variant=gray]):not(:first-child)]:after:h-px"
          : "[&>:is([data-variant=primary],[data-variant=gray]):not(:first-child)]:after:inset-y-0 [&>:is([data-variant=primary],[data-variant=gray]):not(:first-child)]:after:-left-px [&>:is([data-variant=primary],[data-variant=gray]):not(:first-child)]:after:w-px",
        "[&>*:hover]:relative [&>*:hover]:z-10 [&>*:focus-visible]:relative [&>*:focus-visible]:z-10",
        className,
      )}
      {...props}
    />
  );
}
