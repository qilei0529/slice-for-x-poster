import type { ReactNode } from "react";
import { Fieldset } from "@base-ui/react/fieldset";
import { cn } from "@/lib/cn";

export type FieldGroupProps = {
  label: string;
  className?: string;
  children: ReactNode;
};

export function FieldGroup({ label, className, children }: FieldGroupProps) {
  return (
    <Fieldset.Root
      className={cn(
        "m-0 flex min-w-0 flex-col gap-section-inner border-0 p-0",
        className,
      )}
    >
      <Fieldset.Legend className="text-body font-medium text-foreground">
        {label}
      </Fieldset.Legend>
      {children}
    </Fieldset.Root>
  );
}
