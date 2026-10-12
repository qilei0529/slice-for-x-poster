const statusColors = {
  light: {
    info: "#0077ff",
    success: "#22c55e",
    warning: "#f59e0b",
  },
  dark: {
    info: "#0077ff",
    success: "#22c55e",
    warning: "#fbbf24",
  },
} as const;

export type BonSemanticColors = {
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  primary: string;
  primaryForeground: string;
  gray: string;
  grayForeground: string;
  ring: string;
  destructive: string;
  info: string;
  success: string;
  warning: string;
};

export type BonColorPalette = "neutral" | "zinc" | "slate" | "rose" | "green";

export type BonPaletteDefinition = {
  light: BonSemanticColors;
  dark: BonSemanticColors;
};

export const bonPalettes: Record<BonColorPalette, BonPaletteDefinition> = {
  neutral: {
    light: {
      background: "#ffffff",
      foreground: "#171717",
      muted: "#f5f5f5",
      mutedForeground: "#737373",
      border: "#e1e1e1",
      primary: "#0077ff",
      primaryForeground: "#fafafa",
      gray: "#e5e5e5",
      grayForeground: "#171717",
      ring: "#171717",
      destructive: "#dc2626",
      ...statusColors.light,
    },
    dark: {
      background: "#0a0a0a",
      foreground: "#ededed",
      muted: "#171717",
      mutedForeground: "#a3a3a3",
      border: "#404040",
      primary: "#0077ff",
      primaryForeground: "#171717",
      gray: "#404040",
      grayForeground: "#ededed",
      ring: "#fafafa",
      destructive: "#ef4444",
      ...statusColors.dark,
    },
  },
  zinc: {
    light: {
      background: "#fafafa",
      foreground: "#18181b",
      muted: "#f4f4f5",
      mutedForeground: "#71717a",
      border: "#e4e4e7",
      primary: "#18181b",
      primaryForeground: "#fafafa",
      gray: "#e4e4e7",
      grayForeground: "#18181b",
      ring: "#18181b",
      destructive: "#dc2626",
      ...statusColors.light,
    },
    dark: {
      background: "#09090b",
      foreground: "#fafafa",
      muted: "#18181b",
      mutedForeground: "#a1a1aa",
      border: "#3f3f46",
      primary: "#fafafa",
      primaryForeground: "#18181b",
      gray: "#3f3f46",
      grayForeground: "#fafafa",
      ring: "#fafafa",
      destructive: "#ef4444",
      ...statusColors.dark,
    },
  },
  slate: {
    light: {
      background: "#f8fafc",
      foreground: "#0f172a",
      muted: "#f1f5f9",
      mutedForeground: "#64748b",
      border: "#e2e8f0",
      primary: "#0f172a",
      primaryForeground: "#f8fafc",
      gray: "#e2e8f0",
      grayForeground: "#0f172a",
      ring: "#0f172a",
      destructive: "#dc2626",
      ...statusColors.light,
    },
    dark: {
      background: "#020617",
      foreground: "#f8fafc",
      muted: "#0f172a",
      mutedForeground: "#94a3b8",
      border: "#334155",
      primary: "#f8fafc",
      primaryForeground: "#0f172a",
      gray: "#334155",
      grayForeground: "#f8fafc",
      ring: "#f8fafc",
      destructive: "#ef4444",
      ...statusColors.dark,
    },
  },
  rose: {
    light: {
      background: "#fff8fa",
      foreground: "#3f1424",
      muted: "#ffe4eb",
      mutedForeground: "#b76a82",
      border: "#fbcfe0",
      primary: "#f43f5e",
      primaryForeground: "#fffafa",
      gray: "#fce7f0",
      grayForeground: "#3f1424",
      ring: "#f43f5e",
      destructive: "#e23b12",
      ...statusColors.light,
    },
    dark: {
      background: "#1a0b12",
      foreground: "#fde8ef",
      muted: "#34151f",
      mutedForeground: "#e8a4b8",
      border: "#5c2a3c",
      primary: "#fb7185",
      primaryForeground: "#1a0b12",
      gray: "#4a2030",
      grayForeground: "#fde8ef",
      ring: "#fda4af",
      destructive: "#ff5c2e",
      ...statusColors.dark,
    },
  },
  green: {
    light: {
      background: "#ffffff",
      foreground: "#171717",
      muted: "#f5f5f5",
      mutedForeground: "#737373",
      border: "#e1e1e1",
      primary: "#22c55e",
      primaryForeground: "#fafafa",
      gray: "#e5e5e5",
      grayForeground: "#171717",
      ring: "#171717",
      destructive: "#dc2626",
      ...statusColors.light,
    },
    dark: {
      background: "#0a0a0a",
      foreground: "#ededed",
      muted: "#171717",
      mutedForeground: "#a3a3a3",
      border: "#404040",
      primary: "#22c55e",
      primaryForeground: "#171717",
      gray: "#404040",
      grayForeground: "#ededed",
      ring: "#fafafa",
      destructive: "#ef4444",
      ...statusColors.dark,
    },
  },
};

const semanticColorVarNames: Record<keyof BonSemanticColors, string> = {
  background: "--bon-background",
  foreground: "--bon-foreground",
  muted: "--bon-muted",
  mutedForeground: "--bon-muted-foreground",
  border: "--bon-border",
  primary: "--bon-primary",
  primaryForeground: "--bon-primary-foreground",
  gray: "--bon-gray",
  grayForeground: "--bon-gray-foreground",
  ring: "--bon-ring",
  destructive: "--bon-destructive",
  info: "--bon-info",
  success: "--bon-success",
  warning: "--bon-warning",
};

export function getSemanticColorCssVars(
  colors: BonSemanticColors,
): Record<string, string> {
  return Object.fromEntries(
    (Object.entries(colors) as [keyof BonSemanticColors, string][]).map(
      ([token, value]) => [semanticColorVarNames[token], value],
    ),
  );
}

export function getPaletteColors(
  palette: BonColorPalette,
  mode: "light" | "dark",
): BonSemanticColors {
  return bonPalettes[palette][mode];
}

export const bonColorPaletteOptions = Object.keys(bonPalettes) as BonColorPalette[];

export function isBonColorPalette(value: unknown): value is BonColorPalette {
  return typeof value === "string" && value in bonPalettes;
}
