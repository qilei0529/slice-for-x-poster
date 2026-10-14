"use client";

import * as React from "react";
import { ThemeDarkIcon, ThemeLightIcon } from "@/components/icons";
import { useThemeTransition } from "@/components/theme-transition";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import {
  getStoredTheme,
  resolveTheme,
  setTheme,
  subscribeTheme,
  type Theme,
} from "@/lib/theme";

function useResolvedTheme() {
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const theme = React.useSyncExternalStore(
    subscribeTheme,
    getStoredTheme,
    () => "system" as Theme,
  );

  return React.useMemo(() => {
    if (!mounted) {
      return "light" as const;
    }

    return resolveTheme(theme);
  }, [mounted, theme]);
}

export function ThemeToggle({ className }: { className?: string }) {
  const resolved = useResolvedTheme();
  const { startTransition } = useThemeTransition();
  const next = resolved === "dark" ? "light" : "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn(className)}
      icon={resolved === "dark" ? <ThemeLightIcon /> : <ThemeDarkIcon />}
      aria-label={next === "dark" ? "Switch to dark" : "Switch to light"}
      onClick={(event) => {
        void startTransition(event, {
          onUpdate: () => setTheme(next),
        });
      }}
    />
  );
}
