"use client";

import * as React from "react";
import { Input as BaseInput } from "@base-ui/react/input";
import { cn } from "@/lib/cn";

const inputSizes = {
  sm: "h-7 px-2 text-button-sm",
  md: "h-8 px-2 text-button-md",
} as const;

export type InputSize = keyof typeof inputSizes;

export type InputProps = Omit<React.ComponentProps<typeof BaseInput>, "size"> & {
  size?: InputSize;
};

export function Input({ className, size = "md", ...props }: InputProps) {
  return (
    <BaseInput
      className={cn(
        "w-full rounded-button border-button border-solid border-border bg-background text-foreground",
        "placeholder:text-muted-foreground",
        "hover:not-data-disabled:border-primary/90",
        "focus-visible:outline-0 focus-visible:border-inherit",
        "data-disabled:pointer-events-none data-disabled:opacity-65",
        "data-invalid:border-destructive",
        inputSizes[size],
        className,
      )}
      {...props}
    />
  );
}
