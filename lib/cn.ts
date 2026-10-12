import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const bonSpacingTokens = [
  "page-x",
  "page-y",
  "section-gap",
  "section-inner",
  "panel",
  "inline",
  "stack-tight",
  "text-stack-tight",
  "text-stack",
  "text-block",
  "text-section",
] as const;

const bonTextTokens = [
  "page-title",
  "section-title",
  "body",
  "caption",
  "code",
  "button-sm",
  "button-md",
  "button-lg",
] as const;

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "border-w": [{ border: ["button"] }],
      rounded: [{ rounded: ["control", "button", "panel"] }],
      p: [{ p: bonSpacingTokens }],
      px: [{ px: bonSpacingTokens }],
      py: [{ py: bonSpacingTokens }],
      pt: [{ pt: bonSpacingTokens }],
      pr: [{ pr: bonSpacingTokens }],
      pb: [{ pb: bonSpacingTokens }],
      pl: [{ pl: bonSpacingTokens }],
      m: [{ m: bonSpacingTokens }],
      mx: [{ mx: bonSpacingTokens }],
      my: [{ my: bonSpacingTokens }],
      gap: [{ gap: bonSpacingTokens }],
      "font-size": [{ text: bonTextTokens }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
