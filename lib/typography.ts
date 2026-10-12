import type { CSSProperties } from "react";
import { bonSpaceValues, type BonSpaceStep } from "@/lib/spacing";

export type BonTextStep = "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";

export type BonTextMetrics = {
  size: string;
  lineHeight: string;
};

/** Primitive type scale; mirrors --bon-text-* in globals.css */
export const bonTextValues: Record<BonTextStep, BonTextMetrics> = {
  xs: { size: "11px", lineHeight: "1rem" },
  sm: { size: "13px", lineHeight: "1.5rem" },
  base: { size: "15px", lineHeight: "1.5rem" },
  lg: { size: "17px", lineHeight: "1.5rem" },
  xl: { size: "20px", lineHeight: "2rem" },
  "2xl": { size: "24px", lineHeight: "2rem" },
  "3xl": { size: "28px", lineHeight: "2.5rem" },
};

export type BonTypographyConfig = {
  pageTitle: BonTextStep;
  sectionTitle: BonTextStep;
  body: BonTextStep;
  caption: BonTextStep;
  code: BonTextStep;
  buttonSm: BonTextStep;
  buttonMd: BonTextStep;
  buttonLg: BonTextStep;
};

export const bonTypographyDefaults: BonTypographyConfig = {
  pageTitle: "3xl",
  sectionTitle: "base",
  body: "base",
  caption: "xs",
  code: "sm",
  buttonSm: "xs",
  buttonMd: "sm",
  buttonLg: "base",
};

/** Future: density presets that remap semantic roles to different steps */
export type BonTypographyDensity = "default" | "compact" | "comfortable";

const typographyCssVarMap = {
  pageTitle: {
    size: "--bon-page-title",
    lineHeight: "--bon-page-title--line-height",
  },
  sectionTitle: {
    size: "--bon-section-title",
    lineHeight: "--bon-section-title--line-height",
  },
  body: {
    size: "--bon-body",
    lineHeight: "--bon-body--line-height",
  },
  caption: {
    size: "--bon-caption",
    lineHeight: "--bon-caption--line-height",
  },
  code: {
    size: "--bon-code",
    lineHeight: "--bon-code--line-height",
  },
  buttonSm: {
    size: "--bon-button-text-sm",
    lineHeight: "--bon-button-text-sm--line-height",
  },
  buttonMd: {
    size: "--bon-button-text-md",
    lineHeight: "--bon-button-text-md--line-height",
  },
  buttonLg: {
    size: "--bon-button-text-lg",
    lineHeight: "--bon-button-text-lg--line-height",
  },
} as const satisfies Record<
  keyof BonTypographyConfig,
  { size: string; lineHeight: string }
>;

function textVar(step: BonTextStep): { size: string; lineHeight: string } {
  return {
    size: `var(--bon-text-${step})`,
    lineHeight: `var(--bon-text-${step}--line-height)`,
  };
}

export function getTypographyCssVars(
  typography: BonTypographyConfig,
): CSSProperties {
  const vars: Record<string, string> = {};

  for (const key of Object.keys(typographyCssVarMap) as (keyof BonTypographyConfig)[]) {
    const { size, lineHeight } = textVar(typography[key]);
    vars[typographyCssVarMap[key].size] = size;
    vars[typographyCssVarMap[key].lineHeight] = lineHeight;
  }

  return vars as CSSProperties;
}

export const bonTextSteps = Object.keys(bonTextValues) as BonTextStep[];

export const bonTextPrimitiveTokens = bonTextSteps.map((step) => ({
  step,
  size: bonTextValues[step].size,
  lineHeight: bonTextValues[step].lineHeight,
  sizeVar: `--bon-text-${step}`,
  lineHeightVar: `--bon-text-${step}--line-height`,
}));

export type BonTextRhythmTokenName =
  | "textStackTight"
  | "textStack"
  | "textBlock"
  | "textSection";

type BonTextRhythmTokenDefinition = {
  name: BonTextRhythmTokenName;
  var: string;
  label: string;
  step: BonSpaceStep;
  className: string;
  usage: string;
};

const bonTextRhythmDefinitions = [
  {
    name: "textStackTight",
    var: "--bon-text-stack-tight",
    label: "Tight text stack",
    step: "2",
    className: "gap-text-stack-tight",
    usage: "Captions, metadata, eyebrow + label groups",
  },
  {
    name: "textStack",
    var: "--bon-text-stack",
    label: "Default text stack",
    step: "4",
    className: "gap-text-stack",
    usage: "Body copy, heading + short supporting text",
  },
  {
    name: "textBlock",
    var: "--bon-text-block",
    label: "Text block gap",
    step: "6",
    className: "gap-text-block",
    usage: "Paragraph groups inside the same content block",
  },
  {
    name: "textSection",
    var: "--bon-text-section",
    label: "Text section gap",
    step: "8",
    className: "gap-text-section",
    usage: "Larger content groups or stacked text sections",
  },
] as const satisfies readonly BonTextRhythmTokenDefinition[];

export const bonTextRhythmTokens = bonTextRhythmDefinitions.map((token) => ({
  ...token,
  value: bonSpaceValues[token.step],
}));

export const bonTypographyContentTokens = [
  { name: "pageTitle", var: "--bon-page-title", label: "Page title (h1)", className: "text-page-title" },
  {
    name: "sectionTitle",
    var: "--bon-section-title",
    label: "Section / panel title",
    className: "text-section-title",
  },
  { name: "body", var: "--bon-body", label: "Body copy", className: "text-body" },
  { name: "caption", var: "--bon-caption", label: "Captions, metadata", className: "text-caption" },
  { name: "code", var: "--bon-code", label: "Inline code", className: "text-code" },
] as const;

export const bonTypographyButtonTokens = [
  { name: "buttonSm", var: "--bon-button-text-sm", label: "Button small", className: "text-button-sm" },
  { name: "buttonMd", var: "--bon-button-text-md", label: "Button medium", className: "text-button-md" },
  { name: "buttonLg", var: "--bon-button-text-lg", label: "Button large", className: "text-button-lg" },
] as const;

export const bonTypographySemanticTokens = [
  ...bonTypographyContentTokens,
  ...bonTypographyButtonTokens,
] as const;
