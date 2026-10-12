import type { CSSProperties } from "react";
import type { BonColorPalette } from "@/lib/palettes";
import {
  bonPalettes,
  getPaletteColors,
  getSemanticColorCssVars,
  isBonColorPalette,
} from "@/lib/palettes";
import {
  bonSpacingDefaults,
  getSpacingCssVars,
  type BonSpacingConfig,
} from "@/lib/spacing";
import {
  bonTypographyDefaults,
  getTypographyCssVars,
  type BonTypographyConfig,
} from "@/lib/typography";

export type BonRadius = "none" | "sm" | "md" | "lg" | "xl" | "2xl";

export type BonBorderWidth = "none" | "sm" | "md" | "lg";

export type BonConfig = {
  /** Kit semver. Compare with SKILL.md `metadata.version`. Not a CSS token. */
  version: string;
  colors: {
    palette: BonColorPalette;
  };
  button: {
    radius: BonRadius;
    borderWidth?: BonBorderWidth;
  };
  panel: {
    radius: BonRadius;
  };
  spacing?: Partial<BonSpacingConfig>;
  typography?: Partial<BonTypographyConfig>;
};

export const bonRadiusValues: Record<BonRadius, string> = {
  none: "0",
  sm: "0.3rem",
  md: "0.5rem",
  lg: "0.7rem",
  xl: "0.875rem",
  "2xl": "1rem",
};

const bonRadiusKeys = Object.keys(bonRadiusValues) as BonRadius[];

export const bonBorderWidthValues: Record<BonBorderWidth, string> = {
  none: "0",
  sm: "1px",
  md: "2px",
  lg: "4px",
};

export const defaultBonButtonBorderWidth: BonBorderWidth = "sm";

function getBonStaticCssVars(config: BonConfig): Record<string, string> {
  const spacing = { ...bonSpacingDefaults, ...config.spacing };
  const typography = { ...bonTypographyDefaults, ...config.typography };

  return {
    "--bon-button-radius": bonRadiusValues[config.button.radius],
    "--bon-button-border-width":
      bonBorderWidthValues[config.button.borderWidth ?? defaultBonButtonBorderWidth],
    "--bon-panel-radius": bonRadiusValues[config.panel.radius],
    ...(getSpacingCssVars(spacing) as Record<string, string>),
    ...(getTypographyCssVars(typography) as Record<string, string>),
  };
}

function cssVarsToBlock(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join("\n");
}

export function getBonConfigCss(config: BonConfig): string {
  // Spacing / typography / default radius are palette-independent. Use `html:root`
  // so these beat `:root` defaults in globals.css (same element, higher specificity)
  // without being reset when `data-palette` changes. Runtime prefs override radius
  // via `data-button-radius` / `data-panel-radius` (same specificity as palette rules).
  const blocks = [
    `html:root {\n${cssVarsToBlock({
      ...getBonStaticCssVars(config),
      "color-scheme": "light",
    })}\n}`,
  ];

  for (const radius of bonRadiusKeys) {
    blocks.push(
      `html[data-button-radius="${radius}"] {\n${cssVarsToBlock({
        "--bon-button-radius": bonRadiusValues[radius],
      })}\n}`,
    );
    blocks.push(
      `html[data-panel-radius="${radius}"] {\n${cssVarsToBlock({
        "--bon-panel-radius": bonRadiusValues[radius],
      })}\n}`,
    );
  }

  for (const palette of Object.keys(bonPalettes) as BonColorPalette[]) {
    const selector = `html[data-palette="${palette}"]`;
    blocks.push(
      `${selector} {\n${cssVarsToBlock(getSemanticColorCssVars(getPaletteColors(palette, "light")))}\n}`,
    );
    blocks.push(
      `${selector}.dark {\n${cssVarsToBlock({
        ...getSemanticColorCssVars(getPaletteColors(palette, "dark")),
        "color-scheme": "dark",
      })}\n}`,
    );
  }

  return blocks.join("\n");
}

export function getBonConfigCssVars(config: BonConfig): CSSProperties {
  const palette = config.colors.palette;

  return {
    ...getSemanticColorCssVars(getPaletteColors(palette, "light")),
    ...getBonStaticCssVars(config),
  } as CSSProperties;
}

export function getConfiguredPalette(): BonColorPalette {
  if (typeof document === "undefined") {
    return "neutral";
  }

  const palette = document.documentElement.dataset.palette;
  if (isBonColorPalette(palette)) {
    return palette;
  }

  return "neutral";
}

export function getThemeBackgroundColor(mode: "light" | "dark") {
  return getPaletteColors(getConfiguredPalette(), mode).background;
}

export { type BonColorPalette } from "@/lib/palettes";
export {
  bonSpacingDefaults,
  bonSpacingSemanticTokens,
  bonSpaceValues,
  type BonSpaceStep,
  type BonSpacingConfig,
  type BonSpacingDensity,
} from "@/lib/spacing";
export {
  bonTextPrimitiveTokens,
  bonTextSteps,
  bonTypographyButtonTokens,
  bonTypographyContentTokens,
  bonTypographyDefaults,
  bonTypographySemanticTokens,
  bonTextValues,
  type BonTextStep,
  type BonTypographyConfig,
  type BonTypographyDensity,
} from "@/lib/typography";
