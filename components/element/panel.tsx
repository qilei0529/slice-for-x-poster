import * as React from "react";
import { cn } from "@/lib/cn";

export type PanelProps = React.ComponentProps<"section">;

export function Panel({ className, children, ...props }: PanelProps) {
  return (
    <section
      className={cn(
        "flex flex-col gap-section-inner rounded-panel text-body border border-border p-panel",
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}

export type PanelHeadProps = React.ComponentProps<"header"> & {
  title?: React.ReactNode;
  version?: React.ReactNode;
  description?: React.ReactNode;
};

export function PanelHead({ className, title, version, description, children, ...props }: PanelHeadProps) {
  return (
    <header
      className={cn(
        "flex items-start justify-between gap-inline rounded-t-panel",
        "-mx-[var(--bon-panel-padding)] -mt-[var(--bon-panel-padding)]",
        "px-[var(--bon-panel-padding)] pt-[var(--bon-panel-padding)]",
        className,
      )}
      {...props}
    >
      <div className="flex flex-col">
        {title != null ? (
          <h2 className={cn(
            "flex items-baseline gap-2 text-section-title font-medium text-foreground",
            description != null ? "-mt-1" : "",
          )}>
            {title}
            {version != null ? (
              <span className="text-caption font-normal text-muted-foreground tabular-nums">
                {version}
              </span>
            ) : null}
          </h2>
        ) : null}
        {description != null ? (
          <div className="text-xs mt-1 text-muted-foreground">{description}</div>
        ) : null}
      </div>
      {children != null ? (
        <div className="flex flex-wrap items-center justify-end gap-inline">{children}</div>
      ) : null}
    </header>
  );
}

export type PanelFootProps = React.ComponentProps<"footer"> & {
  description?: React.ReactNode;
};

export function PanelFoot({ className, description, children, ...props }: PanelFootProps) {
  return (
    <footer
      className={cn(
        "mt-auto flex flex-wrap items-center gap-inline rounded-b-panel bg-muted/60",
        "-mx-[var(--bon-panel-padding)] -mb-[var(--bon-panel-padding)]",
        "px-[var(--bon-panel-padding)] pt-[var(--bon-panel-padding)] pb-[var(--bon-panel-padding)]",
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
