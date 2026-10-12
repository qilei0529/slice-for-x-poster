import * as React from "react";
import { cn } from "@/lib/cn";

type IconProps = React.SVGProps<SVGSVGElement>;

const noticeIconAttrs = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
};

/** Notice status — info. Size/stroke owned by Notice `size` map. */
export function NoticeInfoIcon({ className, ...props }: IconProps) {
  return (
    <svg {...noticeIconAttrs} className={cn(className)} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </svg>
  );
}

/** Notice status — success. Size/stroke owned by Notice `size` map. */
export function NoticeSuccessIcon({ className, ...props }: IconProps) {
  return (
    <svg {...noticeIconAttrs} className={cn(className)} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.25 2.25 2.25 4.5-4.75" />
    </svg>
  );
}

/** Notice status — warning. Size/stroke owned by Notice `size` map. */
export function NoticeWarningIcon({ className, ...props }: IconProps) {
  return (
    <svg {...noticeIconAttrs} className={cn(className)} {...props}>
      {/* Scale down so the triangle matches circle icons optically (r=9). */}
      <g transform="translate(12 12) scale(0.88) translate(-12 -12)">
        <path
          d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"
        />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </g>
    </svg>
  );
}

/** Notice status — error. Size/stroke owned by Notice `size` map. */
export function NoticeErrorIcon({ className, ...props }: IconProps) {
  return (
    <svg {...noticeIconAttrs} className={cn(className)} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m9 9 6 6" />
      <path d="m15 9-6 6" />
    </svg>
  );
}
