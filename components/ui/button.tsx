"use client";

import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { cn } from "@/lib/cn";

type ButtonRipple = {
  key: number;
  x: number;
  y: number;
  size: number;
};

function getRippleSize(
  rect: DOMRect,
  x: number,
  y: number,
) {
  const dx = Math.max(x, rect.width - x);
  const dy = Math.max(y, rect.height - y);
  return Math.hypot(dx, dy) * 2;
}

const buttonBaseStyles = cn(
  "relative isolate inline-flex items-center justify-center gap-1 rounded-button border-button border-solid font-medium whitespace-nowrap select-none",
  "active:not-data-disabled:opacity-90",
  "focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-ring",
  "data-disabled:opacity-65 data-disabled:pointer-events-none",
);

const buttonVariants = {
  primary: cn(
    "border-transparent bg-primary text-primary-foreground",
    "hover:not-data-disabled:bg-primary/90 hover:not-data-disabled:text-primary-foreground",
  ),
  outline: cn(
    "border-border bg-background text-foreground",
    "hover:not-data-disabled:border-primary/90 hover:not-data-disabled:text-primary",
    "transition-colors duration-300",
  ),
  destructive: cn(
    "border-transparent bg-destructive text-white",
    "hover:not-data-disabled:bg-destructive/90 hover:not-data-disabled:text-white",
  ),
  "outline-destructive": cn(
    "border-destructive/40 text-destructive",
    "hover:not-data-disabled:border-destructive hover:not-data-disabled:bg-destructive/10 hover:not-data-disabled:text-destructive",
    "transition-colors duration-300",
  ),
  gray: cn(
    "border-transparent bg-gray text-gray-foreground",
    "hover:not-data-disabled:bg-gray/90 hover:not-data-disabled:text-gray-foreground",
  ),
  ghost: cn(
    "border-transparent bg-muted text-muted-foreground",
    "hover:not-data-disabled:bg-border hover:not-data-disabled:text-foreground",
    "transition-colors duration-300",
  ),
} as const;

const buttonSizes = {
  sm: "h-7 px-2 text-button-sm",
  md: "h-8 px-3 text-button-md",
  lg: "h-9 px-3 text-button-lg",
} as const;

const buttonWithLeftIconSizes = {
  sm: "pl-1.5 pr-2 text-button-sm",
  md: "pl-2 pr-3 text-button-md",
  lg: "pl-2 pr-3 text-button-lg",
} as const;

const buttonWithRightIconSizes = {
  sm: "pl-2 pr-1 text-button-sm",
  md: "pl-3 pr-2 text-button-md",
  lg: "pl-3 pr-2 text-button-lg",
} as const;

const buttonIconOnlySizes = {
  sm: "size-7 p-0",
  md: "size-8 p-0",
  lg: "size-9 p-0",
} as const;

const buttonIconSizes = {
  sm: "[&_svg:not([class*='size-'])]:size-3",
  md: "[&_svg:not([class*='size-'])]:size-3.5",
  lg: "[&_svg:not([class*='size-'])]:size-4",
} as const;

export type ButtonVariant = keyof typeof buttonVariants;
export type ButtonSize = keyof typeof buttonSizes;
export type ButtonIconPosition = "left" | "right";

export type ButtonProps = React.ComponentProps<typeof BaseButton> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: ButtonIconPosition;
};

type ButtonPointerDownEvent = Parameters<
  NonNullable<ButtonProps["onPointerDown"]>
>[0];

export function Button({
  className,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  children,
  onPointerDown,
  ...props
}: ButtonProps) {
  const isIconOnly = icon != null && children == null;
  const hasIconWithText = icon != null && children != null;
  const rippleId = React.useRef(0);
  const [ripples, setRipples] = React.useState<ButtonRipple[]>([]);

  const removeRipple = React.useCallback((key: number) => {
    setRipples((current) => current.filter((ripple) => ripple.key !== key));
  }, []);

  const handlePointerDown = (event: ButtonPointerDownEvent) => {
    onPointerDown?.(event);
    if (event.defaultPrevented) return;
    if (props.disabled) return;
    if (event.button !== 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    rippleId.current += 1;
    setRipples((current) => [
      ...current,
      {
        key: rippleId.current,
        x,
        y,
        size: getRippleSize(rect, x, y),
      },
    ]);
  };

  const content = isIconOnly ? (
    icon
  ) : (
    <>
      {icon && iconPosition === "left" ? icon : null}
      {children}
      {icon && iconPosition === "right" ? icon : null}
    </>
  );

  return (
    <BaseButton
      data-slot="button"
      data-variant={variant}
      className={cn(
        buttonBaseStyles,
        buttonVariants[variant],
        buttonSizes[size],
        isIconOnly
          ? buttonIconOnlySizes[size]
          : hasIconWithText
            ? iconPosition === "left"
              ? buttonWithLeftIconSizes[size]
              : buttonWithRightIconSizes[size]
            : "",
        buttonIconSizes[size],
        "[&_svg]:pointer-events-none [&_svg]:shrink-0",
        className,
      )}
      onPointerDown={handlePointerDown}
      {...props}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]"
      >
        {ripples.map((ripple) => (
          <span
            key={ripple.key}
            className={
              cn(
                "absolute rounded-full will-change-transform motion-safe:animate-button-ripple",
                variant === "primary" || variant === "destructive"
                  ? "bg-background/50"
                  : variant === "outline-destructive"
                    ? "bg-destructive/30"
                    : variant === "ghost" || variant === "gray"
                      ? "bg-foreground/20"
                      : "bg-primary/50",
              )
            }
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
            }}
            onAnimationEnd={() => removeRipple(ripple.key)}
          />
        ))}
      </span>
      <span className="relative z-10 inline-flex items-center justify-center gap-1">
        {content}
      </span>
    </BaseButton>
  );
}
