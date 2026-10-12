import type { CSSProperties } from "react";

export type BonSpaceStep =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "11"
  | "12"
  | "13"
  | "14"
  | "15"
  | "16";

/** 4px grid primitive scale; mirrors --bon-space-* in globals.css */
export const bonSpaceValues: Record<BonSpaceStep, string> = {
  "0": "0",
  "1": "0.25rem",
  "2": "0.5rem",
  "3": "0.75rem",
  "4": "1rem",
  "5": "1.25rem",
  "6": "1.5rem",
  "7": "1.75rem",
  "8": "2rem",
  "9": "2.25rem",
  "10": "2.5rem",
  "11": "2.75rem",
  "12": "3rem",
  "13": "3.25rem",
  "14": "3.5rem",
  "15": "3.75rem",
  "16": "4rem",
};

export type BonSpacingConfig = {
  pageX: BonSpaceStep;
  pageY: BonSpaceStep;
  pageYMobile: BonSpaceStep;
  sectionGap: BonSpaceStep;
  sectionInner: BonSpaceStep;
  panelPadding: BonSpaceStep;
  inlineGap: BonSpaceStep;
  stackTight: BonSpaceStep;
};

export const bonSpacingDefaults: BonSpacingConfig = {
  pageX: "6",
  pageY: "16",
  pageYMobile: "10",
  sectionGap: "8",
  sectionInner: "2",
  panelPadding: "2",
  inlineGap: "3",
  stackTight: "2",
};

/** Future: density presets that remap semantic keys to different steps */
export type BonSpacingDensity = "default" | "compact" | "comfortable";

const spacingCssVarMap = {
  pageX: "--bon-page-x",
  pageY: "--bon-page-y",
  pageYMobile: "--bon-page-y-mobile",
  sectionGap: "--bon-section-gap",
  sectionInner: "--bon-section-inner",
  panelPadding: "--bon-panel-padding",
  inlineGap: "--bon-inline-gap",
  stackTight: "--bon-stack-tight",
} as const satisfies Record<keyof BonSpacingConfig, string>;

function spaceVar(step: BonSpaceStep): string {
  return `var(--bon-space-${step})`;
}

export function getSpacingCssVars(spacing: BonSpacingConfig): CSSProperties {
  const vars: Record<string, string> = {};

  for (const key of Object.keys(spacingCssVarMap) as (keyof BonSpacingConfig)[]) {
    vars[spacingCssVarMap[key]] = spaceVar(spacing[key]);
  }

  return vars as CSSProperties;
}

export type BonSpacingGroupId =
  | "page"
  | "layout"
  | "surface"
  | "local";

export const bonSpacingGroups = [
  {
    id: "page",
    title: "Page shell",
    description: "Page edge padding relative to the viewport.",
  },
  {
    id: "layout",
    title: "Layout structure",
    description: "Gaps between and inside page sections.",
  },
  {
    id: "surface",
    title: "Surface inset",
    description: "Inner padding for bordered panels and cards.",
  },
  {
    id: "local",
    title: "Local gap",
    description: "Tight gaps inside control groups and small stacks.",
  },
] as const satisfies readonly {
  id: BonSpacingGroupId;
  title: string;
  description: string;
}[];

export const bonSpacingSemanticTokens = [
  {
    name: "pageX",
    var: "--bon-page-x",
    label: "Page horizontal padding",
    group: "page",
  },
  {
    name: "pageY",
    var: "--bon-page-y",
    label: "Page vertical padding (desktop)",
    group: "page",
  },
  {
    name: "pageYMobile",
    var: "--bon-page-y-mobile",
    label: "Page vertical padding (mobile)",
    group: "page",
  },
  {
    name: "sectionGap",
    var: "--bon-section-gap",
    label: "Gap between sections",
    group: "layout",
  },
  {
    name: "sectionInner",
    var: "--bon-section-inner",
    label: "Section inner stack",
    group: "layout",
  },
  {
    name: "panelPadding",
    var: "--bon-panel-padding",
    label: "Panel padding",
    group: "surface",
  },
  {
    name: "inlineGap",
    var: "--bon-inline-gap",
    label: "Inline / button group gap",
    group: "local",
  },
  {
    name: "stackTight",
    var: "--bon-stack-tight",
    label: "Tight vertical stack",
    group: "local",
  },
] as const;
