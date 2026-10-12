"use client";

import * as React from "react";
import {
  circularTransition,
  defaultCircularTransitionConfig,
  getTransitionOrigin,
  type CircularTransitionConfig,
  type CircularTransitionOrigin,
} from "@/lib/circular-transition";

export type ThemeTransitionStartOptions = {
  onUpdate: () => void;
  origin?: CircularTransitionOrigin;
  duration?: number;
};

type ThemeTransitionContextValue = CircularTransitionConfig;

const ThemeTransitionContext =
  React.createContext<ThemeTransitionContextValue | null>(null);

export type ThemeTransitionProviderProps = {
  children: React.ReactNode;
  duration?: number;
};

export function ThemeTransitionProvider({
  children,
  duration = defaultCircularTransitionConfig.duration,
}: ThemeTransitionProviderProps) {
  const value = React.useMemo(
    () => ({ ...defaultCircularTransitionConfig, duration }),
    [duration],
  );

  return (
    <ThemeTransitionContext.Provider value={value}>
      {children}
    </ThemeTransitionContext.Provider>
  );
}

export function useThemeTransition() {
  const config =
    React.useContext(ThemeTransitionContext) ?? defaultCircularTransitionConfig;

  const startTransition = React.useCallback(
    (
      event: Pick<MouseEvent, "clientX" | "clientY"> | null | undefined,
      options: ThemeTransitionStartOptions,
    ) => {
      return circularTransition(
        {
          origin: options.origin ?? getTransitionOrigin(event),
          duration: options.duration,
          onUpdate: options.onUpdate,
        },
        config,
      );
    },
    [config],
  );

  return { startTransition };
}

export type ThemeTransitionTriggerProps = {
  onUpdate: () => void;
  children: (props: {
    onClick: (event: React.MouseEvent) => void;
  }) => React.ReactNode;
  duration?: number;
};

export function ThemeTransitionTrigger({
  onUpdate,
  children,
  duration,
}: ThemeTransitionTriggerProps) {
  const { startTransition } = useThemeTransition();

  return (
    <>
      {children({
        onClick: (event) => {
          void startTransition(event, { onUpdate, duration });
        },
      })}
    </>
  );
}
