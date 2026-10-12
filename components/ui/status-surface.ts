import {
  NoticeErrorIcon,
  NoticeInfoIcon,
  NoticeSuccessIcon,
  NoticeWarningIcon,
} from "@/components/ui/notice-icons";

export const statusVariants = {
  info: "border-border bg-muted/50",
  success: "border-success/50 bg-success/5",
  warning: "border-warning/50 bg-warning/5",
  error: "border-destructive/50 bg-destructive/5",
} as const;

export const statusAccent = {
  info: "text-primary",
  success: "text-success",
  warning: "text-warning",
  error: "text-destructive",
} as const;

export const statusIconColor = {
  info: "text-muted-foreground/50",
  success: "text-success",
  warning: "text-warning",
  error: "text-destructive",
} as const;

export const statusDismiss = {
  info: "bg-primary/10 hover:bg-primary/20 text-primary",
  success: "bg-success/10 hover:bg-success/20 text-success",
  warning: "bg-warning/10 hover:bg-warning/20 text-warning",
  error: "bg-destructive/10 hover:bg-destructive/20 text-destructive",
} as const;

export const statusIcons = {
  info: NoticeInfoIcon,
  success: NoticeSuccessIcon,
  warning: NoticeWarningIcon,
  error: NoticeErrorIcon,
} as const;

export const statusSizes = {
  md: {
    root: "gap-1.5 px-2 py-1 pt-1",
    icon: "size-5 stroke-[1.45] mt-0.5",
    title: "text-body font-medium",
    description: "text-caption text-muted-foreground mb-1",
    dismiss: "size-5 ml-0.5 mt-0.5 -mr-px",
    dismissIcon: "size-3",
  },
  lg: {
    root: "gap-1.5 px-3 py-2.5 pl-2",
    icon: "size-7 stroke-[1.2] -mt-0.5",
    title: "text-section-title font-medium",
    description: "text-body text-muted-foreground",
    dismiss: "size-6 ml-1",
    dismissIcon: "size-4",
  },
} as const;

export type StatusVariant = keyof typeof statusVariants;
export type StatusSize = keyof typeof statusSizes;
