"use client";

import * as React from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { CloseIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export const dialogBackdropStyles = cn(
  "fixed inset-0 z-50 bg-foreground/15 outline-none",
  "transition-opacity duration-150 ease-out",
  "data-starting-style:opacity-0",
  "data-ending-style:opacity-0",
);

export const dialogViewportStyles = cn(
  "fixed inset-0 z-50 flex items-center justify-center p-page-x outline-none",
);

export const dialogPopupStyles = cn(
  "relative flex w-full max-w-md flex-col gap-section-inner rounded-panel bg-background p-4 text-foreground outline-none",
  "origin-[var(--transform-origin)] transition-[opacity,scale] duration-150 ease-out",
  "data-starting-style:scale-95 data-starting-style:opacity-0",
  "data-ending-style:scale-95 data-ending-style:opacity-0",
);

export const dialogTitleStyles = cn("text-section-title font-medium text-section-title -mt-1");

export const dialogDescriptionStyles = cn("text-body -mt-1 text-muted-foreground");

export const overlayHeadStyles = cn("flex items-start justify-between gap-inline");

export const overlayHeadTitleStyles = cn("text-section-title font-medium text-foreground");

export const overlayHeadDescriptionStyles = cn("mt-1 text-xs text-muted-foreground");

export const buttonBaseStyles = cn("min-w-16");

export const dialogCloseIconPositionStyles = "absolute top-3 right-3 z-10";

export const dialogCloseIconButtonStyles = cn("size-7 min-w-0 rounded-panel p-0");

export function DialogRoot(props: BaseDialog.Root.Props) {
  return <BaseDialog.Root {...props} />;
}

export function DialogTrigger(props: BaseDialog.Trigger.Props) {
  return <BaseDialog.Trigger {...props} />;
}

export function DialogPortal(props: BaseDialog.Portal.Props) {
  return <BaseDialog.Portal {...props} />;
}

export function DialogBackdrop({ className, ...props }: BaseDialog.Backdrop.Props) {
  return (
    <BaseDialog.Backdrop className={cn(dialogBackdropStyles, className)} {...props} />
  );
}

export function DialogViewport({ className, ...props }: BaseDialog.Viewport.Props) {
  return (
    <BaseDialog.Viewport className={cn(dialogViewportStyles, className)} {...props} />
  );
}

export type DialogPopupProps = BaseDialog.Popup.Props & {
  showClose?: boolean;
};

export function DialogPopup({ className, showClose, children, ...props }: DialogPopupProps) {
  return (
    <BaseDialog.Popup className={cn(dialogPopupStyles, className)} {...props}>
      {children}
      {showClose ? <DialogCloseIcon /> : null}
    </BaseDialog.Popup>
  );
}

export function DialogTitle({ className, ...props }: BaseDialog.Title.Props) {
  return <BaseDialog.Title className={cn(dialogTitleStyles, className)} {...props} />;
}

export function DialogDescription({ className, ...props }: BaseDialog.Description.Props) {
  return (
    <BaseDialog.Description className={cn(dialogDescriptionStyles, className)} {...props} />
  );
}

export type DialogHeadProps = React.ComponentProps<"header"> & {
  title?: React.ReactNode;
  description?: React.ReactNode;
  showClose?: boolean;
};

export function DialogHead({
  className,
  title,
  description,
  showClose,
  children,
  ...props
}: DialogHeadProps) {
  return (
    <header className={cn(showClose ? "pr-8" : null, className)} {...props}>
      <div className="flex min-w-0 flex-col">
        {title != null ? (
          <DialogTitle
            className={cn(overlayHeadTitleStyles, description != null ? "-mt-1" : "mt-0")}
          >
            {title}
          </DialogTitle>
        ) : null}
        {description != null ? (
          <DialogDescription className={overlayHeadDescriptionStyles}>
            {description}
          </DialogDescription>
        ) : null}
      </div>
      {children}
      {showClose ? <DialogCloseIcon /> : null}
    </header>
  );
}

export type DialogContentProps = React.ComponentProps<"div"> & {
  maxHeight?: string;
};

export function DialogContent({
  className,
  maxHeight = "60vh",
  style,
  ...props
}: DialogContentProps) {
  return (
    <div
      className={cn(
        "flex min-h-0 -mx-4 px-4 flex-col gap-section-inner overflow-y-auto overscroll-y-contain",
        className,
      )}
      style={{ maxHeight, ...style }}
      {...props}
    />
  );
}

export type DialogFootProps = React.ComponentProps<"footer"> & {
  description?: React.ReactNode;
};

export function DialogFoot({ className, description, children, ...props }: DialogFootProps) {
  return (
    <footer
      className={cn(
        "flex shrink-0 flex-wrap items-center gap-inline rounded-b-panel",
        "-mx-4 -mb-4 -mt-3 px-4 py-4",
        className,
      )}
      {...props}
    >
      {description != null ? (
        <div className="min-w-0 flex-1 text-xs text-muted-foreground">{description}</div>
      ) : null}
      {children != null ? (
        <div className="ml-auto flex flex-wrap items-center justify-end gap-inline">{children}</div>
      ) : null}
    </footer>
  );
}

export function DialogClose({ className, ...props }: BaseDialog.Close.Props) {
  return <BaseDialog.Close className={cn(buttonBaseStyles, className)} {...props} />;
}

export type DialogCloseIconProps = BaseDialog.Close.Props & {
  absolute?: boolean;
};

export function DialogCloseIcon({
  className,
  absolute = true,
  ...props
}: DialogCloseIconProps) {
  return (
    <BaseDialog.Close
      aria-label="Close"
      className={cn(absolute && dialogCloseIconPositionStyles, className)}
      render={
        <Button variant="ghost" size="sm" className={dialogCloseIconButtonStyles} />
      }
      {...props}
    >
      <CloseIcon className="size-4 stroke-[2.5]" />
    </BaseDialog.Close>
  );
}
