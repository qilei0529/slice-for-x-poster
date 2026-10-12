"use client";

import { useMemo, type CSSProperties } from "react";
import {
  Toast as BaseToast,
  type ToastManagerAddOptions,
  type ToastManagerPromiseOptions,
  type ToastManagerUpdateOptions,
} from "@base-ui/react/toast";
import { CloseIcon, LoaderIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  statusAccent,
  statusDismiss,
  statusIconColor,
  statusIcons,
  statusSizes,
  type StatusSize,
  type StatusVariant,
} from "@/components/ui/status-surface";
import { cn } from "@/lib/cn";

export type ToastSize = StatusSize;

export type ToastData = {
  size?: ToastSize;
};

export type ToastAddOptions = Omit<ToastManagerAddOptions<ToastData>, "data"> & {
  size?: ToastSize;
  data?: ToastData;
};

type ToastUpdateOptions = Omit<ToastManagerUpdateOptions<ToastData>, "data"> & {
  size?: ToastSize;
  data?: ToastData;
};

type ToastPromiseEntry<Value> =
  | string
  | ToastUpdateOptions
  | ((value: Value) => string | ToastUpdateOptions);

type ToastPromiseOptions<Value> = {
  loading: string | ToastUpdateOptions;
  success: ToastPromiseEntry<Value>;
  error: ToastPromiseEntry<unknown>;
};

function withToastSize<T extends { size?: ToastSize; data?: ToastData }>(options: T) {
  const { size, data, ...rest } = options;
  if (size == null && data == null) return rest;
  return { ...rest, data: { ...data, ...(size != null ? { size } : null) } };
}

function withPromiseSize<Value>(
  options: ToastPromiseOptions<Value>,
): ToastManagerPromiseOptions<Value, ToastData> {
  const map = (
    entry: ToastPromiseOptions<Value>[keyof ToastPromiseOptions<Value>],
  ) => {
    if (typeof entry === "function") {
      return (value: Value) => {
        const result = entry(value);
        return typeof result === "string" ? result : withToastSize(result);
      };
    }
    if (typeof entry === "string" || entry == null) return entry;
    return withToastSize(entry);
  };

  return {
    loading: map(options.loading),
    success: map(options.success),
    error: map(options.error),
  } as ToastManagerPromiseOptions<Value, ToastData>;
}

export function useToastManager() {
  const manager = BaseToast.useToastManager<ToastData>();

  return useMemo(
    () => ({
      toasts: manager.toasts,
      close: manager.close,
      add: (options: ToastAddOptions) => manager.add(withToastSize(options)),
      update: (toastId: string, options: ToastUpdateOptions) =>
        manager.update(toastId, withToastSize(options)),
      promise: <Value,>(promise: Promise<Value>, options: ToastPromiseOptions<Value>) =>
        manager.promise(promise, withPromiseSize(options)),
    }),
    [manager],
  );
}

function resolveToastSize(size: ToastSize | undefined): ToastSize {
  return size === "lg" ? "lg" : "md";
}

export const toastViewportStyles = cn(
  "fixed right-4 bottom-4 z-50 mx-auto w-[calc(100vw-2rem)] outline-none sm:right-8 sm:bottom-8 sm:w-[22.5rem]",
);

export const toastRootStyles = cn(
  "absolute right-0 bottom-0 left-auto mr-0 w-full origin-bottom select-none",
  "rounded-panel border border-border outline-none bg-background",
  "focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-ring",
  "content-[''] before:absolute before:inset-0 before:rounded-button",
  "data-[type=success]:border-success/50 data-[type=success]:before:bg-success/5",
  "data-[type=warning]:border-warning/50 data-[type=warning]:before:bg-warning/5",
  "data-[type=error]:border-destructive/50 data-[type=error]:before:bg-destructive/5",
  // "data-[type=loading]:border-border data-[type=loading]:before:bg-muted/50",
);

export const toastContentStyles = cn(
  "flex h-full items-start overflow-hidden",
  "transition-opacity duration-[250ms] ease-out",
  "data-behind:opacity-0 data-expanded:opacity-100",
);

export const toastActionStyles = cn("shrink-0");

export const toastCloseStyles = cn("shrink-0");

export const toastCloseButtonStyles = cn("min-w-0 rounded-panel p-0");

export type ToastProviderProps = BaseToast.Provider.Props;

export type ToastStatusType = StatusVariant | "loading";

function toastStatusVariant(type: string | undefined): StatusVariant {
  if (type === "success" || type === "warning" || type === "error") return type;
  return "info";
}

function ToastGlow() {
  const { toasts } = useToastManager();

  return (
    <div
      aria-hidden
      data-slot="toast-glow"
      data-visible={toasts.length > 0 ? "" : undefined}
      className="pointer-events-none"
    />
  );
}

export function ToastProvider({ children, ...props }: ToastProviderProps) {
  return (
    <BaseToast.Provider {...props}>
      {children}
      <ToastPortal>
        <ToastGlow />
        <ToastViewport>
          <ToastClearAll />
          <ToastList />
        </ToastViewport>
      </ToastPortal>
    </BaseToast.Provider>
  );
}

export function ToastPortal(props: BaseToast.Portal.Props) {
  return <BaseToast.Portal {...props} />;
}

export function ToastViewport({ className, ...props }: BaseToast.Viewport.Props) {
  return (
    <BaseToast.Viewport
      className={cn(toastViewportStyles, className)}
      {...props}
    />
  );
}

export function ToastRoot({ className, ...props }: BaseToast.Root.Props) {
  return (
    <BaseToast.Root
      data-slot="toast-root"
      className={cn(toastRootStyles, className)}
      {...props}
    />
  );
}

export function ToastContent({ className, ...props }: BaseToast.Content.Props) {
  return (
    <BaseToast.Content
      data-slot="toast-content"
      className={cn(toastContentStyles, className)}
      {...props}
    />
  );
}

export function ToastTitle({ className, ...props }: BaseToast.Title.Props) {
  return <BaseToast.Title className={cn(className)} {...props} />;
}

export function ToastDescription({ className, ...props }: BaseToast.Description.Props) {
  return (
    <BaseToast.Description
      className={cn(className)}
      render={<div />}
      {...props}
    />
  );
}

export function ToastAction({ className, ...props }: BaseToast.Action.Props) {
  return (
    <BaseToast.Action className={cn(toastActionStyles, className)} {...props} />
  );
}

export function ToastClose({ className, ...props }: BaseToast.Close.Props) {
  return <BaseToast.Close className={cn(className)} {...props} />;
}

export function ToastCloseIcon({
  className,
  variant = "info",
  size = "md",
  ...props
}: BaseToast.Close.Props & { variant?: StatusVariant; size?: ToastSize }) {
  const sizeStyles = statusSizes[size];

  return (
    <BaseToast.Close
      aria-label="Close"
      className={cn(toastCloseStyles, className)}
      render={
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            toastCloseButtonStyles,
            sizeStyles.dismiss,
            statusDismiss[variant],
          )}
        />
      }
      {...props}
    >
      <CloseIcon className={cn("stroke-[2.5]", sizeStyles.dismissIcon)} />
    </BaseToast.Close>
  );
}

function ToastStatusIcon({
  type,
  size,
}: {
  type: string | undefined;
  size: ToastSize;
}) {
  const sizeStyles = statusSizes[size];

  if (type === "loading") {
    return (
      <LoaderIcon
        className={cn("shrink-0", sizeStyles.icon, statusIconColor.info)}
      />
    );
  }

  const variant = toastStatusVariant(type);
  const Icon = statusIcons[variant];
  return (
    <Icon className={cn("shrink-0", sizeStyles.icon, statusIconColor[variant])} />
  );
}

const toastPeek = "0.75rem";
const toastGap = "0.5rem";
const toastClearGap = "0.5rem";

function ToastClearAll() {
  const { toasts, close } = useToastManager();
  const open = toasts.filter((toast) => toast.transitionStatus !== "ending");
  if (open.length < 2) return null;

  const stacked = open.filter((toast) => !toast.limited);
  const pile = stacked.length > 0 ? stacked : open;
  const behind = pile.length - 1;
  const front = pile[0]?.height ?? 0;
  const total = pile.reduce((sum, toast) => sum + (toast.height ?? 0), 0);
  const style = {
    "--toast-clear-collapsed": `calc(${front}px + ${behind} * ${toastPeek} + ${toastClearGap})`,
    "--toast-clear-expanded": `calc(${total}px + ${behind} * ${toastGap} + ${toastClearGap})`,
  } as CSSProperties;

  const bridgeStyle = {
    "--toast-clear-collapsed": `calc(${front}px + ${behind} * ${toastPeek} - 4px)`,
    "--toast-clear-expanded": `calc(${total}px + ${behind} * ${toastGap} - 4px)`,
  } as CSSProperties;

  return (
    <>
      <div
        aria-hidden
        data-slot="toast-clear-bridge"
        style={bridgeStyle}
        className={cn(
          "absolute left-0 right-0 z-[1001] h-20",
          "bottom-[var(--toast-clear-collapsed)]",
          "invisible pointer-events-none",
          "transition-[bottom] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "in-data-expanded:visible in-data-expanded:pointer-events-auto",
          "in-data-expanded:bottom-[var(--toast-clear-expanded)]",
        )}
      />
      <Button
        variant="outline"
        size="sm"
        data-slot="toast-clear"
        style={style}
        className={cn(
          "absolute right-0.5 z-[1001] bottom-[var(--toast-clear-collapsed)]",
          "invisible",
          "transition-[bottom] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "in-data-expanded:visible in-data-expanded:bottom-[var(--toast-clear-expanded)]",
        )}
        onClick={() => close()}
      >
        Clear all
      </Button>
    </>
  );
}

function ToastList() {
  const { toasts } = useToastManager();

  return toasts.map((toast) => {
    const variant = toastStatusVariant(toast.type);
    const size = resolveToastSize(toast.data?.size);
    const sizeStyles = statusSizes[size];

    return (
      <ToastRoot
        key={toast.id}
        toast={toast}
        swipeDirection="down"
        data-size={size}
      >
        <ToastContent className={sizeStyles.root}>
          <ToastStatusIcon type={toast.type} size={size} />
          <div className="flex min-w-0 flex-1 flex-col">
            <ToastTitle className={cn(sizeStyles.title, statusAccent[variant])} />
            <ToastDescription className={sizeStyles.description} />
          </div>
          {toast.actionProps ? (
            <div className="flex flex-wrap items-center justify-end gap-inline">
              <ToastAction
                {...toast.actionProps}
                render={<Button variant="outline" size="sm" className="h-6" />}
              />
            </div>
          ) : null}
          <ToastCloseIcon variant={variant} size={size} />
        </ToastContent>
      </ToastRoot>
    );
  });
}
