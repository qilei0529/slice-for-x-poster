import { cn } from "@/lib/cn";

type LogoProps = React.SVGProps<SVGSVGElement>;

/** Two portrait tiles. The right one is the next slice, faded. */
export function Logo({ className, ...props }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={cn("size-8 shrink-0 text-foreground", className)}
      {...props}
    >
      <rect x="1.25" y="3" width="9.5" height="18" rx="2.25" />
      <rect x="13.25" y="3" width="9.5" height="18" rx="2.25" opacity="0.32" />
    </svg>
  );
}
